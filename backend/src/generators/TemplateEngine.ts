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

        Handlebars.registerHelper('capitalize', function(str: string) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        });

        Handlebars.registerHelper('camelCase', function(str: string) {
            return str.replace(/_([a-z])/g, (g) => g[1]?.toUpperCase() || '');
        });

        Handlebars.registerHelper('pascalCase', function(str: string) {
            const camelCase = str.replace(/_([a-z])/g, (g) => g[1]?.toUpperCase() || '');
            return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
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