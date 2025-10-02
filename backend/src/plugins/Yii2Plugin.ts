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
    public async generateFiles(tables: DiagramTable[], config?: any): Promise<GeneratedFile[]> {
        const files: GeneratedFile[] = [];

        // Use tables with priority from frontend if available, otherwise use original tables
        let tablesToProcess = config?.tablesWithPriority || tables;
        
        // Debug: Log received tables with priority
        console.log('🔍 Backend Received Tables:', {
            hasTablesWithPriority: !!config?.tablesWithPriority,
            tablesCount: tablesToProcess.length,
            tablesWithPriority: tablesToProcess.map((t: any) => `${t.name} (P${t.priority || 'no priority'})`)
        });
        
        // Filter tables based on selected tables
        if (config?.selectedTables && Array.isArray(config.selectedTables)) {
            tablesToProcess = tablesToProcess.filter((table: any) => config.selectedTables.includes(table.name));
        }

        // If no tables selected, return empty array
        if (tablesToProcess.length === 0) {
            return files;
        }

        // Sort tables based on foreign key dependencies (only if not already sorted by frontend)
        if (!config?.tablesWithPriority) {
            tablesToProcess = this.sortTablesByDependencies(tablesToProcess);
        }
        
        // Sort tables based on provided order if available (after dependency sorting)
        if (config?.tableOrder && Array.isArray(config.tableOrder)) {
            tablesToProcess.sort((a: any, b: any) => {
                const aIndex = config.tableOrder.indexOf(a.name);
                const bIndex = config.tableOrder.indexOf(b.name);
                
                // If both tables are in the order array, sort by their position
                if (aIndex !== -1 && bIndex !== -1) {
                    return aIndex - bIndex;
                }
                
                // If only one table is in the order array, prioritize it
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                
                // If neither table is in the order array, maintain dependency order
                return 0;
            });
        }

        // Sort tables by priority before processing
        const prioritySortedTables = [...tablesToProcess].sort((a: any, b: any) => {
            const priorityA = a.priority || 999;
            const priorityB = b.priority || 999;
            return priorityA - priorityB; // Ascending order (P1, P2, P3...)
        });
        
        // Debug: Log final processing order
        console.log('🔍 Final Processing Order:', prioritySortedTables.map((t: any) => `${t.name} (P${t.priority || 'no priority'})`));
        
        for (const table of prioritySortedTables) {
            const modelName = this.toPascalCase(table.name);
            const modelNameLower = this.toCamelCase(table.name);

            // Generate Migration
            if (config?.generateMigration !== false) {
                const migrationData = this.prepareMigrationData(table);
                const migrationContent = this.templateEngine.render('migration', migrationData);
                files.push({
                    filename: this.generateFilename('migration', table.name, (table as any).priority),
                    content: migrationContent,
                    path: 'migrations/'
                });
            }

            // Generate Model
            if (config?.generateModel !== false) {
                const modelData = this.prepareModelData(table);
                const modelContent = this.templateEngine.render('model', modelData);
                files.push({
                    filename: `${modelName}.php`,
                    content: modelContent,
                    path: 'models/'
                });
            }

            // Generate Query
            const queryData = this.prepareQueryData(table);
            const queryContent = this.templateEngine.render('query', queryData);
            files.push({
                filename: `${modelName}Query.php`,
                content: queryContent,
                path: 'models/query/'
            });

            // Generate Getter Trait
            const getterData = this.prepareGetterData(table);
            const getterContent = this.templateEngine.render('getter', getterData);
            files.push({
                filename: `${modelName}GetterTrait.php`,
                content: getterContent,
                path: 'models/getter/'
            });

            // Generate Setter Trait
            const setterData = this.prepareSetterData(table);
            const setterContent = this.templateEngine.render('setter', setterData);
            files.push({
                filename: `${modelName}SetterTrait.php`,
                content: setterContent,
                path: 'models/setter/'
            });

            // Generate Scope Trait
            const scopeData = this.prepareScopeData(table);
            const scopeContent = this.templateEngine.render('scope', scopeData);
            files.push({
                filename: `${modelName}ScopeTrait.php`,
                content: scopeContent,
                path: 'models/scope/'
            });

            // Generate Relation Trait
            const relationData = this.prepareRelationData(table, tables);
            const relationContent = this.templateEngine.render('relation', relationData);
            files.push({
                filename: `${modelName}RelationTrait.php`,
                content: relationContent,
                path: 'models/relation/'
            });

            // Generate Service
            const serviceData = this.prepareServiceData(table);
            const serviceContent = this.templateEngine.render('service', serviceData);
            files.push({
                filename: `${modelName}Service.php`,
                content: serviceContent,
                path: 'service/'
            });

            // Generate Repository
            if (config?.generateRepository !== false) {
                const repositoryData = this.prepareRepositoryData(table);
                const repositoryContent = this.templateEngine.render('repository', repositoryData);
                files.push({
                    filename: `${modelName}Repository.php`,
                    content: repositoryContent,
                    path: 'repository/'
                });
            }

            // Generate CreateDTO
            const createDtoData = this.prepareCreateDtoData(table);
            const createDtoContent = this.templateEngine.render('create-dto', createDtoData);
            files.push({
                filename: `${modelName}CreateDTO.php`,
                content: createDtoContent,
                path: `dto/${modelNameLower}/`
            });

            // Generate UpdateDTO
            const updateDtoData = this.prepareUpdateDtoData(table);
            const updateDtoContent = this.templateEngine.render('update-dto', updateDtoData);
            files.push({
                filename: `${modelName}UpdateDTO.php`,
                content: updateDtoContent,
                path: `dto/${modelNameLower}/`
            });

            // Generate Search Model
            const searchData = this.prepareSearchData(table);
            const searchContent = this.templateEngine.render('search', searchData);
            files.push({
                filename: `${modelName}Search.php`,
                content: searchContent,
                path: 'models/search/'
            });

            // Generate Forms
            const createFormData = this.prepareFormData(table, 'create');
            const createFormContent = this.templateEngine.render('create-form', createFormData);
            files.push({
                filename: `Create${modelName}Form.php`,
                content: createFormContent,
                path: `forms/${modelNameLower}/`
            });

            const updateFormData = this.prepareFormData(table, 'update');
            const updateFormContent = this.templateEngine.render('update-form', updateFormData);
            files.push({
                filename: `Update${modelName}Form.php`,
                content: updateFormContent,
                path: `forms/${modelNameLower}/`
            });

            // Generate Actions
            const createActionData = this.prepareActionData(table, 'create');
            const createActionContent = this.templateEngine.render('create-action', createActionData);
            files.push({
                filename: `Create${modelName}Action.php`,
                content: createActionContent,
                path: `actions/${modelNameLower}/`
            });

            const updateActionData = this.prepareActionData(table, 'update');
            const updateActionContent = this.templateEngine.render('update-action', updateActionData);
            files.push({
                filename: `Update${modelName}Action.php`,
                content: updateActionContent,
                path: `actions/${modelNameLower}/`
            });

            const deleteActionData = this.prepareActionData(table, 'delete');
            const deleteActionContent = this.templateEngine.render('delete-action', deleteActionData);
            files.push({
                filename: `Delete${modelName}Action.php`,
                content: deleteActionContent,
                path: `actions/${modelNameLower}/`
            });

            // Generate Controller
            const controllerData = this.prepareControllerData(table);
            const controllerContent = this.templateEngine.render('controller', controllerData);
            files.push({
                filename: `${modelName}Controller.php`,
                content: controllerContent,
                path: 'modules/api/controllers/'
            });
        }

        // Generate API Module files (only once, not per table)
        if (tablesToProcess.length > 0) {
            const moduleName = this.generateModuleName();
            const moduleClassName = this.generateModuleClassName();
            const apiModuleData = this.prepareApiModuleData(moduleName, moduleClassName);
            
            // Generate API Module class
            const apiModuleContent = this.templateEngine.render('api-module', apiModuleData);
            files.push({
                filename: `${moduleClassName}.php`,
                content: apiModuleContent,
                path: 'modules/api/'
            });

            // Generate config files
            const configData = this.prepareConfigData(moduleName);
            
            // Generate authenticator.php
            const authenticatorContent = this.templateEngine.render('authenticator', configData);
            files.push({
                filename: 'authenticator.php',
                content: authenticatorContent,
                path: 'modules/api/config/'
            });

            // Generate authenticator-root.php
            const authenticatorRootContent = this.templateEngine.render('authenticator-root', configData);
            files.push({
                filename: 'authenticator-root.php',
                content: authenticatorRootContent,
                path: 'modules/api/config/'
            });

            // Generate routes.php
            const routesData = this.prepareRoutesData(tablesToProcess, moduleName);
            const routesContent = this.templateEngine.render('routes', routesData);
            files.push({
                filename: 'routes.php',
                content: routesContent,
                path: 'modules/api/config/'
            });
        }

        return files;
    }

    /**
     * Get supported file types
     */
    public getSupportedFiles(): string[] {
        return [
            'migration', 'model', 'query', 'getter', 'setter', 'scope', 
            'relation', 'service', 'repository', 'create-dto', 'update-dto', 
            'search', 'controller', 'create-form', 'update-form', 'create-action', 
            'update-action', 'delete-action', 'api-module', 'authenticator', 'authenticator-root', 'routes'
        ];
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
     * Sort tables by priority first, then by foreign key dependencies
     */
    private sortTablesByDependencies(tables: DiagramTable[]): DiagramTable[] {
        // First, sort by priority (if priority property exists)
        const tablesWithPriority = tables.map(table => {
            const priority = (table as any).priority || 999;
            return { table, priority };
        });
        
        // Sort by priority (lower number = higher priority)
        tablesWithPriority.sort((a, b) => a.priority - b.priority);
        
        const sortedTables = tablesWithPriority.map(item => item.table);
        
        // Debug: Log priority sorting
        console.log('🔍 Backend Priority Sorting:', {
            original: tables.map(t => `${t.name} (P${(t as any).priority || 'no priority'})`),
            prioritySorted: sortedTables.map(t => `${t.name} (P${(t as any).priority || 'no priority'})`)
        });
        
        // Then apply dependency sorting within same priority groups
        const sorted: DiagramTable[] = [];
        const visited = new Set<string>();
        const visiting = new Set<string>();
        
        // First, add all independent tables (tables with no foreign keys)
        const independentTables = sortedTables.filter(table => 
            !table.relationships || table.relationships.length === 0
        );
        
        // Add independent tables first
        for (const table of independentTables) {
            if (!visited.has(table.name)) {
                visited.add(table.name);
                sorted.push(table);
            }
        }
        
        const visit = (table: DiagramTable) => {
            if (visiting.has(table.name)) {
                // Circular dependency detected, add table anyway
                return;
            }
            if (visited.has(table.name)) {
                return;
            }
            
            visiting.add(table.name);
            
            // Find tables that this table depends on (foreign keys)
            const dependencies = (table.relationships || [])
                .map(rel => rel.toTable)
                .filter(depTable => tables.some(t => t.name === depTable))
                .map(depTable => tables.find(t => t.name === depTable))
                .filter((dep): dep is DiagramTable => dep !== undefined);
            
            // Visit dependencies first
            for (const dep of dependencies) {
                visit(dep);
            }
            
            visiting.delete(table.name);
            visited.add(table.name);
            sorted.push(table);
        };
        
        // Visit dependent tables (tables with foreign keys)
        const dependentTables = tables.filter(table => 
            table.relationships && table.relationships.length > 0
        );
        
        for (const table of dependentTables) {
            visit(table);
        }
        
        return sorted;
    }

    /**
     * Transform column type to Yii2-specific type
     */
    protected transformColumnType(dbType: string): { frameworkType: string; phpType?: string; validationRules?: string[] } {
        const typeMapping: Record<string, { frameworkType: string; phpType: string; validationRules: string[] }> = {
            // String types
            'varchar': { frameworkType: 'string', phpType: 'string', validationRules: ['string'] },
            'char': { frameworkType: 'char', phpType: 'string', validationRules: ['string'] },
            'text': { frameworkType: 'text', phpType: 'string', validationRules: ['string'] },
            'longtext': { frameworkType: 'longText', phpType: 'string', validationRules: ['string'] },
            'mediumtext': { frameworkType: 'mediumText', phpType: 'string', validationRules: ['string'] },
            'tinytext': { frameworkType: 'tinyText', phpType: 'string', validationRules: ['string'] },
            
            // Integer types
            'int': { frameworkType: 'integer', phpType: 'int', validationRules: ['integer'] },
            'integer': { frameworkType: 'integer', phpType: 'int', validationRules: ['integer'] },
            'bigint': { frameworkType: 'bigInteger', phpType: 'int', validationRules: ['integer'] },
            'smallint': { frameworkType: 'smallInteger', phpType: 'int', validationRules: ['integer'] },
            'tinyint': { frameworkType: 'tinyInteger', phpType: 'int', validationRules: ['integer'] },
            
            // Decimal types
            'decimal': { frameworkType: 'decimal', phpType: 'float', validationRules: ['number'] },
            'numeric': { frameworkType: 'decimal', phpType: 'float', validationRules: ['number'] },
            'float': { frameworkType: 'float', phpType: 'float', validationRules: ['number'] },
            'double': { frameworkType: 'double', phpType: 'float', validationRules: ['number'] },
            'real': { frameworkType: 'float', phpType: 'float', validationRules: ['number'] },
            
            // Boolean
            'boolean': { frameworkType: 'boolean', phpType: 'bool', validationRules: ['boolean'] },
            'bool': { frameworkType: 'boolean', phpType: 'bool', validationRules: ['boolean'] },
            
            // Date/Time types
            'timestamp': { frameworkType: 'timestamp', phpType: 'string', validationRules: ['datetime'] },
            'datetime': { frameworkType: 'dateTime', phpType: 'string', validationRules: ['datetime'] },
            'date': { frameworkType: 'date', phpType: 'string', validationRules: ['date'] },
            'time': { frameworkType: 'time', phpType: 'string', validationRules: ['time'] },
            'year': { frameworkType: 'year', phpType: 'int', validationRules: ['integer'] },
            
            // Binary types
            'binary': { frameworkType: 'binary', phpType: 'string', validationRules: ['safe'] },
            'varbinary': { frameworkType: 'binary', phpType: 'string', validationRules: ['safe'] },
            'blob': { frameworkType: 'binary', phpType: 'string', validationRules: ['safe'] },
            'longblob': { frameworkType: 'longBinary', phpType: 'string', validationRules: ['safe'] },
            'mediumblob': { frameworkType: 'mediumBinary', phpType: 'string', validationRules: ['safe'] },
            'tinyblob': { frameworkType: 'tinyBinary', phpType: 'string', validationRules: ['safe'] },
            
            // JSON
            'json': { frameworkType: 'json', phpType: 'array', validationRules: ['safe'] },
            
            // UUID
            'uuid': { frameworkType: 'string', phpType: 'string', validationRules: ['string'] },
            
            // Enum
            'enum': { frameworkType: 'string', phpType: 'string', validationRules: ['string'] },
            'set': { frameworkType: 'string', phpType: 'string', validationRules: ['string'] }
        };

        // Extract base type (remove length/precision)
        const baseType = dbType.toLowerCase().split('(')[0]?.trim() || dbType.toLowerCase();
        
        return typeMapping[baseType] || { frameworkType: 'string', phpType: 'string', validationRules: ['safe'] };
    }

    /**
     * Prepare migration data
     */
    private prepareMigrationData(table: DiagramTable) {
        // Specific audit columns that are automatically added by BaseMigrate.getDefaultColumns()
        // These should not be written separately in migration
        const defaultAuditColumns = [
            'created_by', 'updated_by', 'created_at', 'updated_at', 
            'deleted_by', 'deleted_at', 'is_deleted', 'status'
        ];

        // Filter out only these specific audit columns from diagram data since they're added automatically
        const filteredColumns = table.columns.filter(col => !defaultAuditColumns.includes(col.name));

        const columns = filteredColumns.map(col => {
            const typeInfo = this.transformColumnType(col.type);
            return {
                name: col.name,
                yiiType: typeInfo.frameworkType,
                nullable: col.nullable,
                comment: col.comment || '',
                primaryKey: col.primaryKey
            };
        });

        // Standard audit columns will be added automatically by BaseMigrate.getDefaultColumns()
        const allColumns = columns;

        const foreignKeys = (table.relationships || []).map(rel => ({
            column: rel.fromColumn,
            refTable: `${this.config.schemaName || 'public'}.${rel.toTable}`,
            refColumn: rel.toColumn
        }));

        // Debug: Log foreign keys for this table
        console.log(`🔍 Foreign Keys for ${table.name}:`, {
            relationshipsCount: (table.relationships || []).length,
            relationships: table.relationships,
            foreignKeys: foreignKeys
        });

        return {
            namespace: this.config.namespace || 'app',
            modelName: this.toPascalCase(table.name),
            modelNameLower: this.toCamelCase(table.name),
            migrationClassName: `M${this.getTimestamp()}Create${this.toPascalCase(table.name)}Table`,
            tableName: table.name,
            schemaName: this.config.schemaName || 'public', // Use schema from config
            columns: allColumns,
            foreignKeys,
            indexes: [] // Can be extended
        };
    }

    /**
     * Prepare model data
     */
    private prepareModelData(table: DiagramTable) {
        let columns = table.columns.map(col => {
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
                label: this.generateLabel(col.name),
                primaryKey: col.primaryKey,
                isTimestamp: ['created_at', 'updated_at', 'deleted_at'].includes(col.name)
            };
        });

        // Only use columns explicitly defined in the diagram
        // Standard columns like created_at, updated_at, etc. are handled by behaviors

        return {
            namespace: this.config.namespace || 'app',
            modelName: this.toPascalCase(table.name),
            modelNameLower: this.toCamelCase(table.name),
            tableName: table.name,
            schemaName: this.config.schemaName || 'public',
            columns
        };
    }

    /**
     * Prepare repository data
     */
    private prepareRepositoryData(table: DiagramTable) {
        // Find unique columns for special methods
        const uniqueColumns = table.columns
            .filter(col => col.name && (col.name.includes('title') || col.name.includes('name') || col.name.includes('email')))
            .map(col => ({
                name: col.name,
                properCase: this.toPascalCase(col.name!)
            }));

        return {
            namespace: this.config.namespace || 'app',
            modelName: this.toPascalCase(table.name),
            modelNameLower: this.toCamelCase(table.name),
            uniqueColumns
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
        return match && match[1] ? parseInt(match[1]) : null;
    }

    /**
     * Generate human-readable label from column name
     */
    private generateLabel(columnName: string): string {
        return columnName
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    }

    /**
     * Convert to PascalCase (override to handle kebab-case)
     */
    protected toPascalCase(str: string): string {
        // Handle both snake_case and kebab-case
        return str
            .replace(/[-_]([a-z])/g, (g) => g[1]?.toUpperCase() || '')
            .replace(/^([a-z])/, (g) => g.toUpperCase());
    }

    /**
     * Convert to camelCase
     */
    private toCamelCase(str: string): string {
        return str.charAt(0).toLowerCase() + this.toPascalCase(str).slice(1);
    }

    /**
     * Convert to plural form (simple implementation)
     */
    private toPlural(str: string): string {
        if (str.endsWith('y')) {
            return str.slice(0, -1) + 'ies';
        } else if (str.endsWith('s') || str.endsWith('x') || str.endsWith('z') || str.endsWith('ch') || str.endsWith('sh')) {
            return str + 'es';
        } else {
            return str + 's';
        }
    }

    /**
     * Prepare query data
     */
    private prepareQueryData(table: DiagramTable) {
        const columns = table.columns.filter(col => !col.primaryKey).map(col => ({
            name: col.name,
            phpType: this.transformColumnType(col.type).phpType || 'string'
        }));

        return {
            namespace: this.config.namespace || 'app',
            modelName: this.toPascalCase(table.name),
            modelNameLower: this.toCamelCase(table.name),
            columns
        };
    }

    /**
     * Prepare getter trait data
     */
    private prepareGetterData(table: DiagramTable) {
        const columns = table.columns.map(col => {
            const typeInfo = this.transformColumnType(col.type);
            return {
                name: col.name,
                phpType: typeInfo.phpType || 'string',
                primaryKey: col.primaryKey,
                properCase: this.toPascalCase(col.name)
            };
        });

        const hasStatus = table.columns.some(col => col.name === 'status');

        return {
            namespace: this.config.namespace || 'app',
            modelName: this.toPascalCase(table.name),
            modelNameLower: this.toCamelCase(table.name),
            columns,
            hasStatus
        };
    }

    /**
     * Prepare setter trait data
     */
    private prepareSetterData(table: DiagramTable) {
        const columns = table.columns.map(col => ({
            name: col.name,
            primaryKey: col.primaryKey,
            properCase: this.toPascalCase(col.name)
        }));

        const hasStatus = table.columns.some(col => col.name === 'status');

        return {
            namespace: this.config.namespace || 'app',
            modelName: this.toPascalCase(table.name),
            modelNameLower: this.toCamelCase(table.name),
            columns,
            hasStatus
        };
    }

    /**
     * Prepare scope trait data
     */
    private prepareScopeData(table: DiagramTable) {
        // Check if standard behavior columns exist in diagram
        const hasStatus = table.columns.some(col => col.name === 'status');
        const hasTimestamps = table.columns.some(col => ['created_at', 'updated_at'].includes(col.name));
        const hasSoftDelete = table.columns.some(col => ['is_deleted', 'deleted_at'].includes(col.name));
        const hasBlameableBehavior = table.columns.some(col => ['created_by', 'updated_by'].includes(col.name));

        // Prepare all columns including default ones
        let allColumns = [...table.columns];

        // Add default columns if not present in diagram
        const defaultColumns = [
            { id: 'default-id', name: 'id', type: 'uuid', primaryKey: true, nullable: false, comment: 'Primary key' },
            { id: 'default-created_at', name: 'created_at', type: 'timestamp', primaryKey: false, nullable: true, comment: 'Created timestamp' },
            { id: 'default-updated_at', name: 'updated_at', type: 'timestamp', primaryKey: false, nullable: true, comment: 'Updated timestamp' },
            { id: 'default-created_by', name: 'created_by', type: 'uuid', primaryKey: false, nullable: true, comment: 'Created by user ID' },
            { id: 'default-updated_by', name: 'updated_by', type: 'uuid', primaryKey: false, nullable: true, comment: 'Updated by user ID' },
            { id: 'default-is_deleted', name: 'is_deleted', type: 'boolean', primaryKey: false, nullable: false, comment: 'Soft delete flag' },
            { id: 'default-deleted_at', name: 'deleted_at', type: 'timestamp', primaryKey: false, nullable: true, comment: 'Deleted timestamp' },
            { id: 'default-deleted_by', name: 'deleted_by', type: 'uuid', primaryKey: false, nullable: true, comment: 'Deleted by user ID' }
        ];

        // Add missing default columns
        for (const defaultCol of defaultColumns) {
            if (!allColumns.some(col => col.name === defaultCol.name)) {
                allColumns.push(defaultCol);
            }
        }

        // Transform columns for template
        const columns = allColumns.map(col => {
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
                label: this.generateLabel(col.name),
                primaryKey: col.primaryKey,
                isTimestamp: ['created_at', 'updated_at', 'deleted_at'].includes(col.name),
                isUserField: ['created_by', 'updated_by', 'deleted_by'].includes(col.name),
                isSoftDelete: ['is_deleted', 'deleted_at', 'deleted_by'].includes(col.name)
            };
        });

        return {
            namespace: this.config.namespace || 'app',
            modelName: this.toPascalCase(table.name),
            modelNameLower: this.toCamelCase(table.name),
            tableName: table.name,
            columns,
            hasStatus,
            hasTimestamps,
            hasSoftDelete,
            hasBlameableBehavior
        };
    }

    /**
     * Prepare relation trait data
     */
    private prepareRelationData(table: DiagramTable, allTables: DiagramTable[]) {
        const relationships = (table.relationships || []).map(rel => {
            const relatedTable = allTables.find(t => t.name === rel.toTable);
            const relatedModelName = relatedTable ? this.toPascalCase(relatedTable.name) : this.toPascalCase(rel.toTable);
            
            return {
                relatedModel: relatedModelName,
                relatedModelPlural: this.toPlural(relatedModelName),
                relationMethod: rel.type === 'one-to-many' ? 'hasMany' : 'hasOne',
                foreignKey: rel.fromColumn,
                localKey: rel.toColumn
            };
        });

        const relatedModels = [...new Set(relationships.map(rel => rel.relatedModel))].map(className => ({
            className
        }));

        return {
            namespace: this.config.namespace || 'app',
            modelName: this.toPascalCase(table.name),
            modelNameLower: this.toCamelCase(table.name),
            relationships,
            relatedModels
        };
    }

    /**
     * Prepare service data
     */
    private prepareServiceData(table: DiagramTable) {
        // System fields managed by Yii2 behaviors (should not be set manually in Service)
        const systemFields = ['created_at', 'updated_at', 'deleted_at', 'created_by', 'updated_by', 'deleted_by', 'is_deleted'];
        
        const columns = table.columns.map(col => ({
            name: col.name,
            primaryKey: col.primaryKey,
            isTimestamp: systemFields.includes(col.name),  // ← is_deleted ham qo'shildi
            properCase: this.toPascalCase(col.name)
        }));

        // Check if status column exists in diagram
        const hasStatus = table.columns.some(col => col.name === 'status');

        return {
            namespace: this.config.namespace || 'app',
            modelName: this.toPascalCase(table.name),
            modelNameLower: this.toCamelCase(table.name),
            columns,
            hasStatus
        };
    }

    /**
     * Prepare create DTO data
     */
    private prepareCreateDtoData(table: DiagramTable) {
        let columns = table.columns.map(col => {
            const typeInfo = this.transformColumnType(col.type);
            return {
                name: col.name,
                required: !col.nullable && !col.primaryKey,
                isString: typeInfo.phpType === 'string',
                isInteger: typeInfo.phpType === 'int',
                isBoolean: typeInfo.phpType === 'bool',
                isEmail: col.name.toLowerCase().includes('email'),
                isTimestamp: ['created_at', 'updated_at', 'deleted_at', 'created_by', 'updated_by', 'deleted_by', 'is_deleted'].includes(col.name),
                maxLength: col.type.includes('varchar') ? this.extractVarcharLength(col.type) : null,
                label: this.generateLabel(col.name),
                primaryKey: col.primaryKey
            };
        });

        // Filter out auto-managed columns (timestamps and user tracking columns)
        columns = columns.filter(col => !col.isTimestamp);

        // Check if status column exists in diagram
        const hasStatus = table.columns.some(col => col.name === 'status');

        return {
            namespace: this.config.namespace || 'app',
            modelName: this.toPascalCase(table.name),
            modelNameLower: this.toCamelCase(table.name),
            columns,
            hasStatus
        };
    }

    /**
     * Prepare update DTO data
     */
    private prepareUpdateDtoData(table: DiagramTable) {
        return this.prepareCreateDtoData(table); // Same structure for now
    }

    /**
     * Prepare search model data
     */
    private prepareSearchData(table: DiagramTable) {
        const integerColumns = table.columns
            .filter(col => this.transformColumnType(col.type).phpType === 'int')
            .map(col => ({ name: col.name }));

        const booleanColumns = table.columns
            .filter(col => this.transformColumnType(col.type).phpType === 'bool')
            .map(col => ({ name: col.name }));

        const stringColumns = table.columns
            .filter(col => this.transformColumnType(col.type).phpType === 'string')
            .map(col => ({ name: col.name }));

        return {
            namespace: this.config.namespace || 'app',
            modelName: this.toPascalCase(table.name),
            modelNameLower: this.toCamelCase(table.name),
            integerColumns,
            booleanColumns,
            stringColumns
        };
    }

    /**
     * Generate module name from namespace or config
     */
    private generateModuleName(): string {
        const namespace = this.config.namespace || 'app';
        // Extract module name from namespace (e.g., 'xbsoft\collateralMonitoring' -> 'collateral-monitoring')
        const parts = namespace.split('\\');
        const modulePart = parts[parts.length - 1] || 'app';
        return this.toKebabCase(modulePart);
    }

    /**
     * Generate module class name from namespace or config
     */
    private generateModuleClassName(): string {
        const namespace = this.config.namespace || 'app';
        // Extract module name from namespace (e.g., 'xbsoft\collateralMonitoring' -> 'CollateralMonitoring')
        const parts = namespace.split('\\');
        const modulePart = parts[parts.length - 1] || 'app';
        return this.toPascalCase(modulePart);
    }

    /**
     * Convert string to kebab-case
     */
    private toKebabCase(str: string): string {
        return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .toLowerCase();
    }

    /**
     * Prepare API module data
     */
    private prepareApiModuleData(moduleName: string, moduleClassName: string) {
        const namespace = this.config.namespace || 'app';
        const namespacePath = namespace.replace(/\\/g, '/');
        
        return {
            namespace,
            moduleName,
            moduleClassName,
            namespacePath
        };
    }

    /**
     * Prepare config data
     */
    private prepareConfigData(moduleName: string) {
        const namespace = this.config.namespace || 'app';
        const moduleClassName = this.generateModuleClassName();
        
        return {
            namespace,
            moduleName,
            moduleClassName
        };
    }

    /**
     * Prepare routes data
     */
    private prepareRoutesData(tables: DiagramTable[], moduleName: string) {
        const controllers = tables.map(table => {
            const modelName = this.toPascalCase(table.name);
            const controllerName = this.toKebabCase(table.name);
            
            // Determine if controller should be pluralized based on common patterns
            const shouldPluralize = this.shouldPluralize(table.name);
            
            // Add some common extra patterns for each controller
            const extraPatterns = [
                { method: 'GET', pattern: 'search', action: 'search' },
                { method: 'GET', pattern: 'export', action: 'export' }
            ];

            return {
                modelName,
                controllerName,
                pluralize: shouldPluralize,
                extraPatterns
            };
        });

        return {
            moduleName,
            controllers
        };
    }

    /**
     * Determine if a table name should be pluralized in routes
     */
    private shouldPluralize(tableName: string): boolean {
        // Common patterns that should be pluralized
        const pluralPatterns = ['user', 'category', 'product', 'order', 'item', 'comment', 'post'];
        return pluralPatterns.some(pattern => tableName.toLowerCase().includes(pattern));
    }

    /**
     * Prepare controller data
     */
    private prepareControllerData(table: DiagramTable) {
        return {
            namespace: this.config.namespace || 'app',
            modelName: this.toPascalCase(table.name),
            modelNameLower: this.toCamelCase(table.name)
        };
    }

    /**
     * Prepare form data
     */
    private prepareFormData(table: DiagramTable, type: 'create' | 'update') {
        const modelName = this.toPascalCase(table.name);
        const modelNameLower = this.toCamelCase(table.name);
        
        // Standard columns that should be excluded from forms (auto-managed by behaviors)
        const standardColumns = ['created_at', 'updated_at', 'deleted_at', 'created_by', 'updated_by', 'deleted_by', 'is_deleted'];
        
        const columns = table.columns
            .filter(col => !standardColumns.includes(col.name)) // Filter out standard columns
            .map(col => {
                const transformed = this.transformColumnType(col.type);
                return {
                    name: col.name,
                    label: this.toPascalCase(col.name),
                    properCase: this.toPascalCase(col.name),
                    isString: transformed.phpType === 'string',
                    isInteger: transformed.phpType === 'int',
                    isBoolean: transformed.phpType === 'bool',
                    isEmail: col.name.toLowerCase().includes('email'),
                    maxLength: undefined,
                    required: !col.nullable && !col.primaryKey,
                    primaryKey: col.primaryKey  // ← QO'SHILDI!
                };
            });

        const requiredFields = type === 'create' 
            ? columns.filter(col => col.required && !col.primaryKey)  // ← primaryKey exclude
            : [];

        return {
            namespace: this.config.namespace || 'app',
            modelName,
            modelNameLower,
            columns,
            requiredFields
        };
    }

    /**
     * Prepare action data
     */
    private prepareActionData(table: DiagramTable, type: 'create' | 'update' | 'delete') {
        const modelName = this.toPascalCase(table.name);
        const modelNameLower = this.toCamelCase(table.name);
        const moduleName = this.generateModuleName();
        
        return {
            namespace: this.config.namespace || 'app',
            modelName,
            modelNameLower,
            moduleName,
            type
        };
    }
} 