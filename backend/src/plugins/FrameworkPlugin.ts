import { TemplateEngine } from '../generators/TemplateEngine';

export interface DiagramTable {
    id: string;
    name: string;
    columns: DiagramColumn[];
    relationships: TableRelationship[];
}

export interface DiagramColumn {
    id: string;
    name: string;
    type: string;
    nullable: boolean;
    primaryKey: boolean;
    foreignKey?: boolean;
    comment?: string;
    defaultValue?: string;
}

export interface TableRelationship {
    id: string;
    fromTable: string;
    toTable: string;
    fromColumn: string;
    toColumn: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export interface GeneratedFile {
    filename: string;
    content: string;
    path: string;
}

export interface FrameworkConfig {
    name: string;
    version: string;
    namespace?: string;
    schemaName?: string;
    description?: string;
    fileStructure?: any;
}

export abstract class FrameworkPlugin {
    protected name: string;
    protected templateEngine: TemplateEngine;
    protected config: FrameworkConfig;

    constructor(name: string, templatesPath: string, config: FrameworkConfig) {
        this.name = name;
        this.templateEngine = new TemplateEngine(templatesPath);
        this.config = config;
    }

    /**
     * Get plugin name
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Get plugin configuration
     */
    public getConfig(): FrameworkConfig {
        return this.config;
    }

    /**
     * Generate files from diagram data
     */
    public abstract generateFiles(tables: DiagramTable[], config?: any): Promise<GeneratedFile[]>;

    /**
     * Get supported file types
     */
    public abstract getSupportedFiles(): string[];

    /**
     * Validate diagram data for this framework
     */
    public abstract validateDiagram(tables: DiagramTable[]): { isValid: boolean; errors: string[] };

    /**
     * Transform column type to framework-specific type
     */
    protected abstract transformColumnType(dbType: string): { frameworkType: string; phpType?: string; validationRules?: string[] };

    /**
     * Generate filename for given template and table
     */
    protected generateFilename(template: string, tableName: string, priority?: number): string {
        const pascalCase = this.toPascalCase(tableName);
        
        switch (template) {
            case 'migration':
                // Include priority in migration filename for proper ordering
                const priorityStr = priority !== undefined ? priority.toString().padStart(2, '0') : '99';
                return `M${this.getTimestamp()}${priorityStr}Create${pascalCase}Table.php`;
            case 'model':
                return `${pascalCase}.php`;
            case 'repository':
                return `${pascalCase}Repository.php`;
            case 'service':
                return `${pascalCase}Service.php`;
            default:
                return `${pascalCase}${this.capitalize(template)}.php`;
        }
    }

    /**
     * Convert string to PascalCase
     */
    protected toPascalCase(str: string): string {
        return str.replace(/(^|_)([a-z])/g, (_, __, char) => char.toUpperCase());
    }

    /**
     * Capitalize first letter
     */
    protected capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Get timestamp for migrations
     */
    protected getTimestamp(): string {
        const now = new Date();
        return now.getFullYear().toString() +
               (now.getMonth() + 1).toString().padStart(2, '0') +
               now.getDate().toString().padStart(2, '0') +
               now.getHours().toString().padStart(2, '0') +
               now.getMinutes().toString().padStart(2, '0') +
               now.getSeconds().toString().padStart(2, '0');
    }
} 