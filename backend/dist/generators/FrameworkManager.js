"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameworkManager = void 0;
const Yii2Plugin_1 = require("../plugins/Yii2Plugin");
const archiver = __importStar(require("archiver"));
class FrameworkManager {
    plugins = new Map();
    constructor() {
        this.registerDefaultPlugins();
    }
    /**
     * Register default framework plugins
     */
    registerDefaultPlugins() {
        // Register Yii2 plugin
        const yii2Config = {
            name: 'Yii2',
            version: '2.0',
            description: 'Yii2 Framework Code Generator',
            namespace: 'app'
        };
        this.registerPlugin('yii2', new Yii2Plugin_1.Yii2Plugin(yii2Config));
    }
    /**
     * Register a framework plugin
     */
    registerPlugin(name, plugin) {
        this.plugins.set(name.toLowerCase(), plugin);
    }
    /**
     * Get available frameworks
     */
    getAvailableFrameworks() {
        return Array.from(this.plugins.keys());
    }
    /**
     * Get framework plugin
     */
    getPlugin(framework) {
        return this.plugins.get(framework.toLowerCase()) || null;
    }
    /**
     * Generate code for specific framework
     */
    async generateCode(framework, tables, config) {
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
        return await plugin.generateFiles(tables, config);
    }
    /**
     * Create ZIP archive from generated files
     */
    async createZipArchive(files) {
        return new Promise((resolve, reject) => {
            const archive = archiver.create('zip', { zlib: { level: 9 } });
            const chunks = [];
            archive.on('data', (chunk) => chunks.push(chunk));
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
    getFrameworkInfo(framework) {
        const plugin = this.getPlugin(framework);
        return plugin ? plugin.getConfig() : null;
    }
    /**
     * Get supported file types for framework
     */
    getSupportedFileTypes(framework) {
        const plugin = this.getPlugin(framework);
        return plugin ? plugin.getSupportedFiles() : [];
    }
    /**
     * Transform diagram data to internal format
     */
    transformDiagramData(diagramData) {
        if (!diagramData.tables || !Array.isArray(diagramData.tables)) {
            throw new Error('Invalid diagram data: tables array is required');
        }
        return diagramData.tables.map((table) => ({
            id: table.id || '',
            name: table.name || '',
            columns: (table.columns || []).map((col) => ({
                id: col.id || '',
                name: col.name || '',
                type: col.type || 'varchar',
                nullable: col.isNullable !== false,
                primaryKey: col.isPrimaryKey === true,
                foreignKey: col.isForeignKey === true,
                comment: col.comment || '',
                defaultValue: col.defaultValue || ''
            })),
            relationships: (table.relationships || []).map((rel) => ({
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
exports.FrameworkManager = FrameworkManager;
//# sourceMappingURL=FrameworkManager.js.map