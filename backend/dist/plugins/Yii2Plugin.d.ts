import { FrameworkPlugin, DiagramTable, GeneratedFile, FrameworkConfig } from './FrameworkPlugin';
export declare class Yii2Plugin extends FrameworkPlugin {
    constructor(config: FrameworkConfig);
    /**
     * Generate files from diagram data
     */
    generateFiles(tables: DiagramTable[], config?: any): Promise<GeneratedFile[]>;
    /**
     * Get supported file types
     */
    getSupportedFiles(): string[];
    /**
     * Validate diagram data for this framework
     */
    validateDiagram(tables: DiagramTable[]): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Transform column type to Yii2-specific type
     */
    protected transformColumnType(dbType: string): {
        frameworkType: string;
        phpType?: string;
        validationRules?: string[];
    };
    /**
     * Prepare migration data
     */
    private prepareMigrationData;
    /**
     * Prepare model data
     */
    private prepareModelData;
    /**
     * Prepare repository data
     */
    private prepareRepositoryData;
    /**
     * Check if column name is valid
     */
    private isValidColumnName;
    /**
     * Check if table name is valid
     */
    private isValidTableName;
    /**
     * Extract length from varchar type
     */
    private extractVarcharLength;
    /**
     * Generate human-readable label from column name
     */
    private generateLabel;
    /**
     * Convert to PascalCase (override to handle kebab-case)
     */
    protected toPascalCase(str: string): string;
    /**
     * Convert to camelCase
     */
    private toCamelCase;
    /**
     * Convert to plural form (simple implementation)
     */
    private toPlural;
    /**
     * Prepare query data
     */
    private prepareQueryData;
    /**
     * Prepare getter trait data
     */
    private prepareGetterData;
    /**
     * Prepare setter trait data
     */
    private prepareSetterData;
    /**
     * Prepare scope trait data
     */
    private prepareScopeData;
    /**
     * Prepare relation trait data
     */
    private prepareRelationData;
    /**
     * Prepare service data
     */
    private prepareServiceData;
    /**
     * Prepare create DTO data
     */
    private prepareCreateDtoData;
    /**
     * Prepare update DTO data
     */
    private prepareUpdateDtoData;
    /**
     * Prepare search model data
     */
    private prepareSearchData;
    /**
     * Generate module name from namespace or config
     */
    private generateModuleName;
    /**
     * Generate module class name from namespace or config
     */
    private generateModuleClassName;
    /**
     * Convert string to kebab-case
     */
    private toKebabCase;
    /**
     * Prepare API module data
     */
    private prepareApiModuleData;
    /**
     * Prepare config data
     */
    private prepareConfigData;
    /**
     * Prepare routes data
     */
    private prepareRoutesData;
    /**
     * Determine if a table name should be pluralized in routes
     */
    private shouldPluralize;
    /**
     * Prepare controller data
     */
    private prepareControllerData;
    /**
     * Prepare form data
     */
    private prepareFormData;
    /**
     * Prepare action data
     */
    private prepareActionData;
}
//# sourceMappingURL=Yii2Plugin.d.ts.map