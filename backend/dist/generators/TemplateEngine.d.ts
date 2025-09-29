export declare class TemplateEngine {
    private templatesPath;
    private compiledTemplates;
    constructor(templatesPath: string);
    /**
     * Register Handlebars helpers
     */
    private registerHelpers;
    /**
     * Load and compile template
     */
    loadTemplate(templateName: string): HandlebarsTemplateDelegate;
    /**
     * Render template with data
     */
    render(templateName: string, data: any): string;
    /**
     * Get available templates
     */
    getAvailableTemplates(): string[];
    /**
     * Clear compiled templates cache
     */
    clearCache(): void;
}
//# sourceMappingURL=TemplateEngine.d.ts.map