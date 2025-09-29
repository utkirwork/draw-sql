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
export declare abstract class FrameworkPlugin {
    protected name: string;
    protected templateEngine: TemplateEngine;
    protected config: FrameworkConfig;
    constructor(name: string, templatesPath: string, config: FrameworkConfig);
    /**
     * Get plugin name
     */
    getName(): string;
    /**
     * Get plugin configuration
     */
    getConfig(): FrameworkConfig;
    /**
     * Generate files from diagram data
     */
    abstract generateFiles(tables: DiagramTable[], config?: any): Promise<GeneratedFile[]>;
    /**
     * Get supported file types
     */
    abstract getSupportedFiles(): string[];
    /**
     * Validate diagram data for this framework
     */
    abstract validateDiagram(tables: DiagramTable[]): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Transform column type to framework-specific type
     */
    protected abstract transformColumnType(dbType: string): {
        frameworkType: string;
        phpType?: string;
        validationRules?: string[];
    };
    /**
     * Generate filename for given template and table
     */
    protected generateFilename(template: string, tableName: string): string;
    /**
     * Convert string to PascalCase
     */
    protected toPascalCase(str: string): string;
    /**
     * Capitalize first letter
     */
    protected capitalize(str: string): string;
    /**
     * Get timestamp for migrations
     */
    protected getTimestamp(): string;
}
//# sourceMappingURL=FrameworkPlugin.d.ts.map