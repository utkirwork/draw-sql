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
exports.TemplateEngine = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Handlebars = __importStar(require("handlebars"));
class TemplateEngine {
    templatesPath;
    compiledTemplates = new Map();
    constructor(templatesPath) {
        this.templatesPath = templatesPath;
        this.registerHelpers();
    }
    /**
     * Register Handlebars helpers
     */
    registerHelpers() {
        Handlebars.registerHelper('unless', function (conditional, options) {
            if (!conditional) {
                return options.fn(this);
            }
            return options.inverse(this);
        });
        Handlebars.registerHelper('eq', function (a, b) {
            return a === b;
        });
        Handlebars.registerHelper('capitalize', function (str) {
            if (!str || typeof str !== 'string')
                return '';
            return str.charAt(0).toUpperCase() + str.slice(1);
        });
        Handlebars.registerHelper('camelCase', function (str) {
            if (!str || typeof str !== 'string')
                return '';
            return str.replace(/_([a-z])/g, (g) => g[1]?.toUpperCase() || '');
        });
        Handlebars.registerHelper('pascalCase', function (str) {
            if (!str || typeof str !== 'string')
                return '';
            const camelCase = str.replace(/_([a-z])/g, (g) => g[1]?.toUpperCase() || '');
            return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
        });
        // Alias for pascalCase - used in templates as properCase
        Handlebars.registerHelper('properCase', function (str) {
            if (!str || typeof str !== 'string')
                return '';
            const camelCase = str.replace(/_([a-z])/g, (g) => g[1]?.toUpperCase() || '');
            return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
        });
        // Additional helper for lowercasing
        Handlebars.registerHelper('lowerCase', function (str) {
            if (!str)
                return '';
            return str.toLowerCase();
        });
        // Helper for checking if string contains substring
        Handlebars.registerHelper('contains', function (str, substring) {
            if (!str || !substring)
                return false;
            return str.includes(substring);
        });
        // Helper for pluralization
        Handlebars.registerHelper('pluralize', function (str) {
            if (!str || typeof str !== 'string')
                return '';
            if (str.endsWith('y')) {
                return str.slice(0, -1) + 'ies';
            }
            else if (str.endsWith('s') || str.endsWith('x') || str.endsWith('z') || str.endsWith('ch') || str.endsWith('sh')) {
                return str + 'es';
            }
            else {
                return str + 's';
            }
        });
        // Helper for debugging - logs values to console
        Handlebars.registerHelper('debug', function (value) {
            console.log('Handlebars Debug:', value);
            return '';
        });
    }
    /**
     * Load and compile template
     */
    loadTemplate(templateName) {
        if (this.compiledTemplates.has(templateName)) {
            return this.compiledTemplates.get(templateName);
        }
        const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found: ${templatePath}`);
        }
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const compiledTemplate = Handlebars.compile(templateContent);
        this.compiledTemplates.set(templateName, compiledTemplate);
        return compiledTemplate;
    }
    /**
     * Render template with data
     */
    render(templateName, data) {
        const template = this.loadTemplate(templateName);
        return template(data);
    }
    /**
     * Get available templates
     */
    getAvailableTemplates() {
        const templatesDir = this.templatesPath;
        if (!fs.existsSync(templatesDir)) {
            return [];
        }
        return fs.readdirSync(templatesDir)
            .filter(file => file.endsWith('.hbs'))
            .map(file => file.replace('.hbs', ''));
    }
    /**
     * Clear compiled templates cache
     */
    clearCache() {
        this.compiledTemplates.clear();
    }
}
exports.TemplateEngine = TemplateEngine;
//# sourceMappingURL=TemplateEngine.js.map