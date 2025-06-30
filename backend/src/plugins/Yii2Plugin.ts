import { FrameworkPlugin, DiagramTable, DiagramColumn, GeneratedFile, FrameworkConfig } from './FrameworkPlugin';
import * as path from 'path';

export class Yii2Plugin extends FrameworkPlugin {
    constructor(config: FrameworkConfig) {
        const templatesPath = path.join(__dirname, '../templates/yii2');
        super('yii2', templatesPath, config);
    }

    /**
     * Generate files from diagram data
     */
    public async generateFiles(tables: DiagramTable[]): Promise<GeneratedFile[]> {
        const files: GeneratedFile[] = [];

        for (const table of tables) {
            // Generate Migration
            const migrationData = this.prepareMigrationData(table);
            const migrationContent = this.templateEngine.render('migration', migrationData);
            files.push({
                filename: this.generateFilename('migration', table.name),
                content: migrationContent,
                path: 'migrations/'
            });

            // Generate Model
            const modelData = this.prepareModelData(table);
            const modelContent = this.templateEngine.render('model', modelData);
            files.push({
                filename: this.generateFilename('model', table.name),
                content: modelContent,
                path: 'models/'
            });

            // Generate Repository
            const repositoryData = this.prepareRepositoryData(table);
            const repositoryContent = this.templateEngine.render('repository', repositoryData);
            files.push({
                filename: this.generateFilename('repository', table.name),
                content: repositoryContent,
                path: 'repository/'
            });
        }

        return files;
    }

    /**
     * Get supported file types
     */
    public getSupportedFiles(): string[] {
        return ['migration', 'model', 'repository', 'service', 'dto', 'query', 'search'];
    }

    /**
     * Validate diagram data for this framework
     */
    public validateDiagram(tables: DiagramTable[]): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        for (const table of tables) {
            // Check if table has primary key
            const hasPrimaryKey = table.columns.some(col => col.primaryKey);
            if (!hasPrimaryKey) {
                errors.push(`Table "${table.name}" must have a primary key`);
            }

            // Check for valid column names
            for (const column of table.columns) {
                if (!this.isValidColumnName(column.name)) {
                    errors.push(`Invalid column name "${column.name}" in table "${table.name}"`);
                }
            }

            // Check for valid table name
            if (!this.isValidTableName(table.name)) {
                errors.push(`Invalid table name "${table.name}"`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Transform column type to Yii2-specific type
     */
    protected transformColumnType(dbType: string): { frameworkType: string; phpType?: string; validationRules?: string[] } {
        const typeMapping: Record<string, { frameworkType: string; phpType: string; validationRules: string[] }> = {
            'varchar': { frameworkType: 'string', phpType: 'string', validationRules: ['string'] },
            'text': { frameworkType: 'text', phpType: 'string', validationRules: ['string'] },
            'int': { frameworkType: 'integer', phpType: 'int', validationRules: ['integer'] },
            'bigint': { frameworkType: 'bigInteger', phpType: 'int', validationRules: ['integer'] },
            'decimal': { frameworkType: 'decimal', phpType: 'float', validationRules: ['number'] },
            'float': { frameworkType: 'float', phpType: 'float', validationRules: ['number'] },
            'double': { frameworkType: 'double', phpType: 'float', validationRules: ['number'] },
            'boolean': { frameworkType: 'boolean', phpType: 'bool', validationRules: ['boolean'] },
            'timestamp': { frameworkType: 'timestamp', phpType: 'string', validationRules: ['datetime'] },
            'datetime': { frameworkType: 'dateTime', phpType: 'string', validationRules: ['datetime'] },
            'date': { frameworkType: 'date', phpType: 'string', validationRules: ['date'] },
            'time': { frameworkType: 'time', phpType: 'string', validationRules: ['time'] },
            'json': { frameworkType: 'json', phpType: 'array', validationRules: ['safe'] },
            'uuid': { frameworkType: 'string', phpType: 'string', validationRules: ['string'] }
        };

        return typeMapping[dbType.toLowerCase()] || { frameworkType: 'string', phpType: 'string', validationRules: ['safe'] };
    }

    /**
     * Prepare migration data
     */
    private prepareMigrationData(table: DiagramTable) {
        const columns = table.columns.map(col => {
            const typeInfo = this.transformColumnType(col.type);
            return {
                name: col.name,
                yiiType: typeInfo.frameworkType,
                nullable: col.nullable,
                comment: col.comment || '',
                primaryKey: col.primaryKey
            };
        });

        const foreignKeys = table.relationships.map(rel => ({
            column: rel.fromColumn,
            refTable: rel.toTable,
            refColumn: rel.toColumn
        }));

        return {
            namespace: this.config.namespace || 'app',
            migrationClassName: `M${this.getTimestamp()}Create${this.toPascalCase(table.name)}Table`,
            tableName: table.name,
            schemaName: 'public', // Default schema
            columns,
            foreignKeys,
            indexes: [] // Can be extended
        };
    }

    /**
     * Prepare model data
     */
    private prepareModelData(table: DiagramTable) {
        const columns = table.columns.map(col => {
            const typeInfo = this.transformColumnType(col.type);
            return {
                name: col.name,
                                 phpType: typeInfo.phpType || 'string',
                comment: col.comment || '',
                required: !col.nullable && !col.primaryKey,
                isString: typeInfo.phpType === 'string',
                isInteger: typeInfo.phpType === 'int',
                isBoolean: typeInfo.phpType === 'bool',
                isEmail: col.name.toLowerCase().includes('email'),
                maxLength: col.type.includes('varchar') ? this.extractVarcharLength(col.type) : null,
                label: this.generateLabel(col.name)
            };
        });

        return {
            namespace: this.config.namespace || 'app',
            modelName: this.toPascalCase(table.name),
            tableName: table.name,
            columns
        };
    }

    /**
     * Prepare repository data
     */
    private prepareRepositoryData(table: DiagramTable) {
        return {
            namespace: this.config.namespace || 'app',
            modelName: this.toPascalCase(table.name)
        };
    }

    /**
     * Check if column name is valid
     */
    private isValidColumnName(name: string): boolean {
        return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
    }

    /**
     * Check if table name is valid
     */
    private isValidTableName(name: string): boolean {
        return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
    }

    /**
     * Extract length from varchar type
     */
    private extractVarcharLength(type: string): number | null {
        const match = type.match(/varchar\((\d+)\)/i);
        return match ? parseInt(match[1]) : null;
    }

    /**
     * Generate human-readable label from column name
     */
    private generateLabel(columnName: string): string {
        return columnName
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    }
} 