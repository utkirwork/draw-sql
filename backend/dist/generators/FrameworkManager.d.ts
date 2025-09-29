import { FrameworkPlugin, DiagramTable, GeneratedFile, FrameworkConfig } from '../plugins/FrameworkPlugin';
export declare class FrameworkManager {
    private plugins;
    constructor();
    /**
     * Register default framework plugins
     */
    private registerDefaultPlugins;
    /**
     * Register a framework plugin
     */
    registerPlugin(name: string, plugin: FrameworkPlugin): void;
    /**
     * Get available frameworks
     */
    getAvailableFrameworks(): string[];
    /**
     * Get framework plugin
     */
    getPlugin(framework: string): FrameworkPlugin | null;
    /**
     * Generate code for specific framework
     */
    generateCode(framework: string, tables: DiagramTable[], config?: Partial<FrameworkConfig>): Promise<GeneratedFile[]>;
    /**
     * Create ZIP archive from generated files
     */
    createZipArchive(files: GeneratedFile[]): Promise<Buffer>;
    /**
     * Get framework information
     */
    getFrameworkInfo(framework: string): FrameworkConfig | null;
    /**
     * Get supported file types for framework
     */
    getSupportedFileTypes(framework: string): string[];
    /**
     * Transform diagram data to internal format
     */
    transformDiagramData(diagramData: any): DiagramTable[];
}
//# sourceMappingURL=FrameworkManager.d.ts.map