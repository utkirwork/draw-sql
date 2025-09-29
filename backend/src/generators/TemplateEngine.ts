import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

export class TemplateEngine {
    private templatesPath: string;
    private compiledTemplates: Map<string, HandlebarsTemplateDelegate> = new Map();

    constructor(templatesPath: string) {
        this.templatesPath = templatesPath;
        this.registerHelpers();
    }

    /**
     * Register Handlebars helpers
     */
    private registerHelpers(): void {
        Handlebars.registerHelper('unless', function(this: any, conditional: any, options: any) {
            if (!conditional) {
                return options.fn(this);
            }
            return options.inverse(this);
        });

        Handlebars.registerHelper('eq', function(a: any, b: any) {
            return a === b;
        });

        Handlebars.registerHelper('capitalize', function(str: any) {
            if (!str || typeof str !== 'string') return '';
            return str.charAt(0).toUpperCase() + str.slice(1);
        });

        Handlebars.registerHelper('camelCase', function(str: any) {
            if (!str || typeof str !== 'string') return '';
            return str.replace(/_([a-z])/g, (g) => g[1]?.toUpperCase() || '');
        });

        Handlebars.registerHelper('pascalCase', function(str: any) {
            if (!str || typeof str !== 'string') return '';
            const camelCase = str.replace(/_([a-z])/g, (g) => g[1]?.toUpperCase() || '');
            return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
        });

        // Alias for pascalCase - used in templates as properCase
        Handlebars.registerHelper('properCase', function(str: any) {
            if (!str || typeof str !== 'string') return '';
            const camelCase = str.replace(/_([a-z])/g, (g) => g[1]?.toUpperCase() || '');
            return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
        });

        // Additional helper for lowercasing
        Handlebars.registerHelper('lowerCase', function(str: string) {
            if (!str) return '';
            return str.toLowerCase();
        });

        // Helper for checking if string contains substring
        Handlebars.registerHelper('contains', function(str: string, substring: string) {
            if (!str || !substring) return false;
            return str.includes(substring);
        });

        // Helper for pluralization
        Handlebars.registerHelper('pluralize', function(str: any) {
            if (!str || typeof str !== 'string') return '';
            if (str.endsWith('y')) {
                return str.slice(0, -1) + 'ies';
            } else if (str.endsWith('s') || str.endsWith('x') || str.endsWith('z') || str.endsWith('ch') || str.endsWith('sh')) {
                return str + 'es';
            } else {
                return str + 's';
            }
        });

        // Helper for debugging - logs values to console
        Handlebars.registerHelper('debug', function(value: any) {
            console.log('Handlebars Debug:', value);
            return '';
        });
    }

    /**
     * Load and compile template
     */
    public loadTemplate(templateName: string): HandlebarsTemplateDelegate {
        if (this.compiledTemplates.has(templateName)) {
            return this.compiledTemplates.get(templateName)!;
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
    public render(templateName: string, data: any): string {
        const template = this.loadTemplate(templateName);
        return template(data);
    }

    /**
     * Get available templates
     */
    public getAvailableTemplates(): string[] {
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
    public clearCache(): void {
        this.compiledTemplates.clear();
    }
} 