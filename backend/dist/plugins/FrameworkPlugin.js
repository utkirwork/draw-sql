"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameworkPlugin = void 0;
const TemplateEngine_1 = require("../generators/TemplateEngine");
class FrameworkPlugin {
    name;
    templateEngine;
    config;
    constructor(name, templatesPath, config) {
        this.name = name;
        this.templateEngine = new TemplateEngine_1.TemplateEngine(templatesPath);
        this.config = config;
    }
    /**
     * Get plugin name
     */
    getName() {
        return this.name;
    }
    /**
     * Get plugin configuration
     */
    getConfig() {
        return this.config;
    }
    /**
     * Generate filename for given template and table
     */
    generateFilename(template, tableName) {
        const pascalCase = this.toPascalCase(tableName);
        switch (template) {
            case 'migration':
                return `M${this.getTimestamp()}Create${pascalCase}Table.php`;
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
    toPascalCase(str) {
        return str.replace(/(^|_)([a-z])/g, (_, __, char) => char.toUpperCase());
    }
    /**
     * Capitalize first letter
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    /**
     * Get timestamp for migrations
     */
    getTimestamp() {
        const now = new Date();
        return now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0') +
            now.getSeconds().toString().padStart(2, '0');
    }
}
exports.FrameworkPlugin = FrameworkPlugin;
//# sourceMappingURL=FrameworkPlugin.js.map