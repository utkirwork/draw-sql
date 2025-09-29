import { DiagramTable, TableRelationship, DatabaseType } from '../types';
export declare class PDFExportService {
    /**
     * Generate PDF documentation from diagram data
     */
    generatePDFDocumentation(diagramName: string, diagramDescription: string, tables: DiagramTable[], relationships: TableRelationship[], databaseType?: DatabaseType, schemaName?: string): Promise<Buffer>;
    /**
     * Generate HTML documentation
     */
    private generateHTMLDocumentation;
    /**
     * Generate table documentation
     */
    private generateTableDocumentation;
    /**
     * Generate relationship documentation
     */
    private generateRelationshipDocumentation;
    /**
     * Generate SQL preview
     */
    private generateSQLPreview;
    /**
     * Format data type for display
     */
    private formatDataType;
    /**
     * Generate individual relationship diagrams for each pair of connected tables
     */
    private generateRelationshipDiagrams;
    /**
     * Generate SVG diagram showing relationship between two specific tables
     */
    private generateTwoTableDiagram;
    /**
     * Generate SVG for a single table in the two-table diagram
     */
    private generateTableSVG;
    /**
     * Get columns relevant to a specific relationship
     */
    private getRelevantColumnsForRelationship;
    /**
     * Get columns that are involved in relationships (PK, FK, or referenced)
     */
    private getLinkedColumns;
}
//# sourceMappingURL=pdfExportService.d.ts.map