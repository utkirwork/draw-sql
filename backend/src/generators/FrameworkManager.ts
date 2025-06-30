import { FrameworkPlugin, DiagramTable, GeneratedFile, FrameworkConfig } from '../plugins/FrameworkPlugin';
import { Yii2Plugin } from '../plugins/Yii2Plugin';
import * as archiver from 'archiver';
import { Readable } from 'stream';

export class FrameworkManager {
    private plugins: Map<string, FrameworkPlugin> = new Map();

    constructor() {
        this.registerDefaultPlugins();
    }

    /**
     * Register default framework plugins
     */
    private registerDefaultPlugins(): void {
        // Register Yii2 plugin
        const yii2Config: FrameworkConfig = {
            name: 'Yii2',
            version: '2.0',
            description: 'Yii2 Framework Code Generator',
            namespace: 'app'
        };
        
        this.registerPlugin('yii2', new Yii2Plugin(yii2Config));
    }

    /**
     * Register a framework plugin
     */
    public registerPlugin(name: string, plugin: FrameworkPlugin): void {
        this.plugins.set(name.toLowerCase(), plugin);
    }

    /**
     * Get available frameworks
     */
    public getAvailableFrameworks(): string[] {
        return Array.from(this.plugins.keys());
    }

    /**
     * Get framework plugin
     */
    public getPlugin(framework: string): FrameworkPlugin | null {
        return this.plugins.get(framework.toLowerCase()) || null;
    }

    /**
     * Generate code for specific framework
     */
    public async generateCode(framework: string, tables: DiagramTable[], config?: Partial<FrameworkConfig>): Promise<GeneratedFile[]> {
        const plugin = this.getPlugin(framework);
        if (!plugin) {
            throw new Error(`Framework "${framework}" is not supported`);
        }

        // Update plugin configuration if provided
        if (config) {
            const currentConfig = plugin.getConfig();
            Object.assign(currentConfig, config);
        }

        // Validate diagram data
        const validation = plugin.validateDiagram(tables);
        if (!validation.isValid) {
            throw new Error(`Diagram validation failed: ${validation.errors.join(', ')}`);
        }

        return await plugin.generateFiles(tables);
    }

    /**
     * Create ZIP archive from generated files
     */
    public async createZipArchive(files: GeneratedFile[]): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const archive = archiver.create('zip', { zlib: { level: 9 } });
            const chunks: Buffer[] = [];

            archive.on('data', (chunk: Buffer) => chunks.push(chunk));
            archive.on('end', () => resolve(Buffer.concat(chunks)));
            archive.on('error', reject);

            // Add files to archive
            for (const file of files) {
                const fullPath = file.path + file.filename;
                archive.append(file.content, { name: fullPath });
            }

            archive.finalize();
        });
    }

    /**
     * Get framework information
     */
    public getFrameworkInfo(framework: string): FrameworkConfig | null {
        const plugin = this.getPlugin(framework);
        return plugin ? plugin.getConfig() : null;
    }

    /**
     * Get supported file types for framework
     */
    public getSupportedFileTypes(framework: string): string[] {
        const plugin = this.getPlugin(framework);
        return plugin ? plugin.getSupportedFiles() : [];
    }

    /**
     * Transform diagram data to internal format
     */
    public transformDiagramData(diagramData: any): DiagramTable[] {
        if (!diagramData.tables || !Array.isArray(diagramData.tables)) {
            throw new Error('Invalid diagram data: tables array is required');
        }

        return diagramData.tables.map((table: any) => ({
            id: table.id || '',
            name: table.name || '',
            columns: (table.columns || []).map((col: any) => ({
                id: col.id || '',
                name: col.name || '',
                type: col.type || 'varchar',
                nullable: col.isNullable !== false,
                primaryKey: col.isPrimaryKey === true,
                foreignKey: col.isForeignKey === true,
                comment: col.comment || '',
                defaultValue: col.defaultValue || ''
            })),
            relationships: (table.relationships || []).map((rel: any) => ({
                id: rel.id || '',
                fromTable: rel.fromTable || '',
                toTable: rel.toTable || '',
                fromColumn: rel.fromColumn || '',
                toColumn: rel.toColumn || '',
                type: rel.type || 'one-to-many'
            }))
        }));
    }
} 