"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFExportService = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
class PDFExportService {
    /**
     * Generate PDF documentation from diagram data
     */
    async generatePDFDocumentation(diagramName, diagramDescription, tables, relationships, databaseType = 'postgresql', schemaName = 'public') {
        const html = this.generateHTMLDocumentation(diagramName, diagramDescription, tables, relationships, databaseType, schemaName);
        const browser = await puppeteer_1.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        try {
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20mm',
                    right: '15mm',
                    bottom: '20mm',
                    left: '15mm'
                }
            });
            return Buffer.from(pdf);
        }
        finally {
            await browser.close();
        }
    }
    /**
     * Generate HTML documentation
     */
    generateHTMLDocumentation(diagramName, diagramDescription, tables, relationships, databaseType, schemaName) {
        const timestamp = new Date().toLocaleString();
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Schema Documentation - ${diagramName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }
        
        .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
        }
        
        .header h1 {
            color: #2563eb;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            color: #6b7280;
            font-size: 1.2em;
            margin-bottom: 20px;
        }
        
        .header .meta {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            display: inline-block;
        }
        
        .meta-item {
            margin: 5px 0;
            font-size: 0.9em;
        }
        
        .meta-label {
            font-weight: bold;
            color: #374151;
        }
        
        .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        
        .section h2 {
            color: #1f2937;
            font-size: 1.8em;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .section h3 {
            color: #374151;
            font-size: 1.4em;
            margin: 25px 0 15px 0;
        }
        
        .table-container {
            margin: 20px 0;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .table-header {
            background: #2563eb;
            color: white;
            padding: 15px 20px;
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .table-description {
            background: #f8fafc;
            padding: 10px 20px;
            font-style: italic;
            color: #6b7280;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .columns-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .columns-table th {
            background: #f3f4f6;
            padding: 12px 15px;
            text-align: left;
            font-weight: bold;
            color: #374151;
            border-bottom: 2px solid #d1d5db;
        }
        
        .columns-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
        }
        
        .columns-table tr:nth-child(even) {
            background: #f9fafb;
        }
        
        .column-name {
            font-weight: bold;
            color: #1f2937;
        }
        
        .data-type {
            font-family: 'Courier New', monospace;
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.9em;
        }
        
        .constraints {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        
        .constraint {
            background: #dbeafe;
            color: #1e40af;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
        }
        
        .constraint.primary {
            background: #dcfce7;
            color: #166534;
        }
        
        .constraint.foreign {
            background: #fef3c7;
            color: #92400e;
        }
        
        .constraint.unique {
            background: #e0e7ff;
            color: #3730a3;
        }
        
        .constraint.not-null {
            background: #fce7f3;
            color: #be185d;
        }
        
        .diagram-container {
            margin: 40px 0;
            padding: 40px;
            background: #ffffff;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            text-align: center;
            overflow: visible;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            min-height: 400px;
        }
        
        .schema-diagram {
            display: inline-block;
            width: 100%;
            max-width: 100%;
            background: #ffffff;
            overflow: visible;
        }
        
        .table-box {
            fill: #ffffff;
            stroke: #374151;
            stroke-width: 2;
            rx: 8;
            ry: 8;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        
        .table-header {
            fill: #1f2937;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 16px;
            font-weight: bold;
            text-anchor: middle;
            dominant-baseline: middle;
        }
        
        .table-name {
            fill: #ffffff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 16px;
            font-weight: bold;
            text-anchor: middle;
            dominant-baseline: middle;
        }
        
        .column-text {
            fill: #374151;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            text-anchor: start;
            dominant-baseline: middle;
        }
        
        .pk-text {
            fill: #166534;
            font-weight: bold;
        }
        
        .fk-text {
            fill: #92400e;
            font-style: italic;
        }
        
        .relationship-line {
            stroke: #6b7280;
            stroke-width: 2;
            fill: none;
            marker-end: url(#arrowhead);
        }
        
        .relationship-label {
            fill: #6b7280;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 10px;
            text-anchor: middle;
            dominant-baseline: middle;
        }
        
        .relationships-section {
            margin: 30px 0;
        }
        
        .relationship-diagram-section {
            margin: 40px 0;
            page-break-inside: avoid;
        }
        
        .relationship-details {
            font-size: 0.9em;
            line-height: 1.5;
        }
        
        .relationship-details p {
            margin: 5px 0;
        }
        
        .relationship-item {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
        }
        
        .relationship-header {
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
        }
        
        .relationship-details {
            color: #6b7280;
            font-size: 0.9em;
        }
        
        .sql-section {
            background: #1f2937;
            color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .sql-section h3 {
            color: #f9fafb;
            margin-bottom: 15px;
        }
        
        .sql-code {
            background: #111827;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            line-height: 1.4;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 0.9em;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        @media print {
            .page-break {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${diagramName}</h1>
            <div class="subtitle">Database Schema Documentation</div>
            ${diagramDescription ? `<p style="margin: 20px 0; color: #6b7280;">${diagramDescription}</p>` : ''}
            <div class="meta">
                <div class="meta-item">
                    <span class="meta-label">Generated:</span> ${timestamp}
                </div>
                <div class="meta-item">
                    <span class="meta-label">Database Type:</span> ${databaseType.toUpperCase()}
                </div>
                <div class="meta-item">
                    <span class="meta-label">Schema:</span> ${schemaName}
                </div>
                <div class="meta-item">
                    <span class="meta-label">Tables:</span> ${tables.length}
                </div>
                <div class="meta-item">
                    <span class="meta-label">Relationships:</span> ${relationships.length}
                </div>
            </div>
        </div>

        <div class="section">
            <h2>📊 Overview</h2>
            <p>This document provides comprehensive documentation for the database schema "${diagramName}". The schema contains ${tables.length} tables with ${relationships.length} relationships defined between them.</p>
            
            <h3>Schema Summary</h3>
            <ul style="margin: 15px 0; padding-left: 20px;">
                <li><strong>Total Tables:</strong> ${tables.length}</li>
                <li><strong>Total Columns:</strong> ${tables.reduce((sum, table) => sum + (table.columns?.length || 0), 0)}</li>
                <li><strong>Primary Keys:</strong> ${tables.filter(table => table.columns?.some(col => col.is_primary_key)).length}</li>
                <li><strong>Foreign Keys:</strong> ${tables.filter(table => table.columns?.some(col => col.is_foreign_key)).length}</li>
                <li><strong>Relationships:</strong> ${relationships.length}</li>
            </ul>
        </div>

        ${relationships.length > 0 ? `
        <div class="section">
            <h2>🔗 Table Relationships</h2>
            <p>Detailed view of how each pair of tables are connected through their relationships.</p>
            ${this.generateRelationshipDiagrams(tables, relationships)}
        </div>
        ` : ''}

        <div class="section">
            <h2>🗂️ Tables</h2>
            ${tables.map((table, index) => this.generateTableDocumentation(table, index)).join('')}
        </div>

        ${relationships.length > 0 ? `
        <div class="section relationships-section">
            <h2>🔗 Relationships</h2>
            <p>The following relationships are defined between tables in this schema:</p>
            ${relationships.map(rel => this.generateRelationshipDocumentation(rel)).join('')}
        </div>
        ` : ''}

        <div class="section sql-section">
            <h2>💾 SQL Schema</h2>
            <p>Below is the complete SQL schema for creating this database:</p>
            <div class="sql-code">
${this.generateSQLPreview(tables, relationships, databaseType, schemaName)}
            </div>
        </div>

        <div class="footer">
            <p>Generated by DrawSQL - Professional Database Schema Designer</p>
            <p>Document generated on ${timestamp}</p>
        </div>
    </div>
</body>
</html>`;
    }
    /**
     * Generate table documentation
     */
    generateTableDocumentation(table, index) {
        const columns = table.columns || [];
        const primaryKeys = columns.filter(col => col.is_primary_key);
        const foreignKeys = columns.filter(col => col.is_foreign_key);
        const uniqueColumns = columns.filter(col => col.is_unique && !col.is_primary_key);
        return `
        <div class="table-container ${index > 0 ? 'page-break' : ''}">
            <div class="table-header">
                📋 ${table.name}
            </div>
            ${table.description ? `<div class="table-description">${table.description}</div>` : ''}
            <table class="columns-table">
                <thead>
                    <tr>
                        <th>Column Name</th>
                        <th>Data Type</th>
                        <th>Constraints</th>
                        <th>Default Value</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${columns.map(col => `
                        <tr>
                            <td class="column-name">${col.name}</td>
                            <td><span class="data-type">${this.formatDataType(col)}</span></td>
                            <td>
                                <div class="constraints">
                                    ${col.is_primary_key ? '<span class="constraint primary">PK</span>' : ''}
                                    ${col.is_foreign_key ? '<span class="constraint foreign">FK</span>' : ''}
                                    ${col.is_unique && !col.is_primary_key ? '<span class="constraint unique">UNIQUE</span>' : ''}
                                    ${!col.is_nullable ? '<span class="constraint not-null">NOT NULL</span>' : ''}
                                </div>
                            </td>
                            <td>${col.default_value || '-'}</td>
                            <td>${col.description || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
    }
    /**
     * Generate relationship documentation
     */
    generateRelationshipDocumentation(rel) {
        const typeLabels = {
            'one_to_one': 'One-to-One',
            'one_to_many': 'One-to-Many',
            'many_to_many': 'Many-to-Many'
        };
        return `
        <div class="relationship-item">
            <div class="relationship-header">
                ${rel.from_table_id} → ${rel.to_table_id}
            </div>
            <div class="relationship-details">
                <strong>Type:</strong> ${typeLabels[rel.relationship_type] || rel.relationship_type}<br>
                <strong>From Column:</strong> ${rel.from_column_id}<br>
                <strong>To Column:</strong> ${rel.to_column_id}<br>
                <strong>On Delete:</strong> ${rel.on_delete || 'RESTRICT'}<br>
                <strong>On Update:</strong> ${rel.on_update || 'RESTRICT'}
                ${rel.constraint_name ? `<br><strong>Constraint:</strong> ${rel.constraint_name}` : ''}
            </div>
        </div>`;
    }
    /**
     * Generate SQL preview
     */
    generateSQLPreview(tables, relationships, databaseType, schemaName) {
        // This is a simplified version - in practice, you'd use the SQLExportService
        let sql = `-- Database Schema: ${tables.length} tables\n\n`;
        tables.forEach(table => {
            sql += `-- Table: ${table.name}\n`;
            sql += `CREATE TABLE ${table.name} (\n`;
            if (table.columns) {
                const columnDefs = table.columns.map(col => {
                    let def = `  ${col.name} ${col.data_type}`;
                    if (!col.is_nullable)
                        def += ' NOT NULL';
                    if (col.default_value)
                        def += ` DEFAULT ${col.default_value}`;
                    if (col.is_primary_key)
                        def += ' PRIMARY KEY';
                    return def;
                });
                sql += columnDefs.join(',\n');
            }
            sql += '\n);\n\n';
        });
        return sql;
    }
    /**
     * Format data type for display
     */
    formatDataType(column) {
        let type = column.data_type;
        if (column.length) {
            type += `(${column.length})`;
        }
        else if (column.precision && column.scale) {
            type += `(${column.precision},${column.scale})`;
        }
        else if (column.precision) {
            type += `(${column.precision})`;
        }
        return type;
    }
    /**
     * Generate individual relationship diagrams for each pair of connected tables
     */
    generateRelationshipDiagrams(tables, relationships) {
        if (relationships.length === 0) {
            return '<p style="text-align: center; color: #6b7280; font-style: italic;">No relationships found between tables.</p>';
        }
        let diagramsHtml = '';
        relationships.forEach((rel, index) => {
            const fromTable = tables.find(t => t.name === rel.from_table_id);
            const toTable = tables.find(t => t.name === rel.to_table_id);
            if (!fromTable || !toTable)
                return;
            // Add page break before each diagram (except the first one)
            if (index > 0) {
                diagramsHtml += '<div style="page-break-before: always;"></div>';
            }
            diagramsHtml += `
            <div class="relationship-diagram-section">
                <h3 style="color: #1f2937; font-size: 1.4em; margin-bottom: 15px; text-align: center;">
                    ${rel.from_table_id} ↔ ${rel.to_table_id}
                </h3>
                <div class="diagram-container">
                    ${this.generateTwoTableDiagram(fromTable, toTable, rel)}
                </div>
                <div class="relationship-details" style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">
                    <h4 style="color: #374151; margin-bottom: 10px;">Relationship Details:</h4>
                    <p><strong>Type:</strong> ${rel.relationship_type.replace('_', '-').toUpperCase()}</p>
                    <p><strong>From:</strong> ${rel.from_table_id}.${rel.from_column_id}</p>
                    <p><strong>To:</strong> ${rel.to_table_id}.${rel.to_column_id}</p>
                    <p><strong>On Delete:</strong> ${rel.on_delete || 'RESTRICT'}</p>
                    <p><strong>On Update:</strong> ${rel.on_update || 'RESTRICT'}</p>
                    ${rel.constraint_name ? `<p><strong>Constraint:</strong> ${rel.constraint_name}</p>` : ''}
                </div>
            </div>
            `;
        });
        return diagramsHtml;
    }
    /**
     * Generate SVG diagram showing relationship between two specific tables
     */
    generateTwoTableDiagram(fromTable, toTable, relationship) {
        const tableWidth = 280;
        const tableHeight = 220;
        const padding = 150;
        const margin = 80;
        // Calculate positions - side by side
        const fromX = margin;
        const fromY = margin;
        const toX = margin + tableWidth + padding;
        const toY = margin;
        const totalWidth = margin + tableWidth + padding + tableWidth + margin;
        const totalHeight = margin + tableHeight + margin;
        // Generate SVG
        let svg = `
        <svg width="${totalWidth}" height="${totalHeight}" class="schema-diagram">
            <defs>
                <marker id="arrowhead" markerWidth="12" markerHeight="8" 
                        refX="11" refY="4" orient="auto">
                    <polygon points="0 0, 12 4, 0 8" fill="#374151" />
                </marker>
                <marker id="crowfoot" markerWidth="15" markerHeight="12" 
                        refX="15" refY="6" orient="auto">
                    <path d="M 0 0 L 0 12 M 0 6 L 15 6 M 12 3 L 15 6 L 12 9" 
                          stroke="#374151" stroke-width="2" fill="none" />
                </marker>
            </defs>
        `;
        // Draw relationship line
        const fromXEnd = fromX + tableWidth;
        const fromYCenter = fromY + tableHeight / 2;
        const toYCenter = toY + tableHeight / 2;
        const midX = (fromXEnd + toX) / 2;
        const controlY = Math.min(fromYCenter, toYCenter) - 60;
        // Draw the main relationship line
        svg += `
        <path d="M ${fromXEnd} ${fromYCenter} Q ${midX} ${controlY} ${toX} ${toYCenter}" 
              style="stroke: #374151; stroke-width: 3; fill: none;" />
        `;
        // Add relationship type label
        const typeLabel = relationship.relationship_type.replace('_', '-').toUpperCase();
        svg += `
        <rect x="${midX - 50}" y="${controlY - 30}" width="100" height="25" 
              fill="#f8fafc" stroke="#374151" stroke-width="2" rx="6" />
        <text x="${midX}" y="${controlY - 12}" text-anchor="middle" 
              style="font-size: 14px; font-weight: bold; fill: #374151;">
            ${typeLabel}
        </text>
        `;
        // Add cardinality indicators with proper symbols
        const fromCardinality = relationship.relationship_type === 'one_to_one' ? '1' :
            relationship.relationship_type === 'one_to_many' ? '1' : 'M';
        const toCardinality = relationship.relationship_type === 'one_to_one' ? '1' :
            relationship.relationship_type === 'one_to_many' ? 'M' : 'M';
        // FROM side cardinality
        svg += `
        <circle cx="${fromXEnd + 20}" cy="${fromYCenter - 10}" r="12" 
                fill="#ffffff" stroke="#374151" stroke-width="3" />
        <text x="${fromXEnd + 20}" y="${fromYCenter - 4}" text-anchor="middle" 
              style="font-size: 16px; font-weight: bold; fill: #374151;">
            ${fromCardinality}
        </text>
        `;
        // TO side cardinality
        if (toCardinality === 'M') {
            // Draw crow's foot for many
            svg += `
            <path d="M ${toX - 30} ${toYCenter - 12} L ${toX - 30} ${toYCenter + 12} M ${toX - 30} ${toYCenter} L ${toX - 15} ${toYCenter} M ${toX - 18} ${toYCenter - 4} L ${toX - 15} ${toYCenter} L ${toX - 18} ${toYCenter + 4}" 
                  style="stroke: #374151; stroke-width: 3; fill: none;" />
            `;
        }
        else {
            // Draw circle for one
            svg += `
            <circle cx="${toX - 20}" cy="${toYCenter - 10}" r="12" 
                    fill="#ffffff" stroke="#374151" stroke-width="3" />
            <text x="${toX - 20}" y="${toYCenter - 4}" text-anchor="middle" 
                  style="font-size: 16px; font-weight: bold; fill: #374151;">
                ${toCardinality}
            </text>
            `;
        }
        // Draw FROM table
        svg += this.generateTableSVG(fromTable, fromX, fromY, tableWidth, tableHeight, relationship, 'from');
        // Draw TO table
        svg += this.generateTableSVG(toTable, toX, toY, tableWidth, tableHeight, relationship, 'to');
        svg += '</svg>';
        return svg;
    }
    /**
     * Generate SVG for a single table in the two-table diagram
     */
    generateTableSVG(table, x, y, width, height, relationship, direction) {
        const headerHeight = 40;
        const columnHeight = 24;
        const padding = 12;
        // Get relevant columns for this relationship
        const relevantColumns = this.getRelevantColumnsForRelationship(table, relationship, direction);
        // Calculate actual height based on content
        const actualHeight = headerHeight + (relevantColumns.length * columnHeight) + padding * 2;
        const finalHeight = Math.max(height, actualHeight);
        // Table box with shadow
        let svg = `
        <!-- Table shadow -->
        <rect x="${x + 4}" y="${y + 4}" width="${width}" height="${finalHeight}" 
              fill="#e5e7eb" rx="8" />
        
        <!-- Table box -->
        <rect x="${x}" y="${y}" width="${width}" height="${finalHeight}" 
              fill="#ffffff" stroke="#374151" stroke-width="3" rx="8" />
        
        <!-- Table header -->
        <rect x="${x}" y="${y}" width="${width}" height="${headerHeight}" 
              fill="#1f2937" rx="8" />
        <rect x="${x}" y="${y + headerHeight - 2}" width="${width}" height="2" 
              fill="#374151" />
        
        <!-- Table name -->
        <text x="${x + width / 2}" y="${y + headerHeight / 2 + 3}" text-anchor="middle" 
              style="font-size: 18px; font-weight: bold; fill: #ffffff; font-family: 'Segoe UI', sans-serif;">
            ${table.name}
        </text>
        `;
        // Show relevant columns
        if (relevantColumns.length > 0) {
            relevantColumns.forEach((column, index) => {
                const columnY = y + headerHeight + 15 + (index * columnHeight);
                const columnX = x + padding;
                // Highlight the specific column involved in this relationship
                const isRelationshipColumn = (direction === 'from' && column.name === relationship.from_column_id) ||
                    (direction === 'to' && column.name === relationship.to_column_id);
                // Column background for highlighted column
                if (isRelationshipColumn) {
                    svg += `
                    <rect x="${x + 6}" y="${columnY - 10}" width="${width - 12}" height="${columnHeight - 6}" 
                          fill="#dbeafe" stroke="#3b82f6" stroke-width="2" rx="4" />
                    `;
                }
                // Column name with proper icons
                let icon = '';
                let columnStyle = 'font-size: 15px; fill: #374151; font-family: "Courier New", monospace;';
                if (column.is_primary_key) {
                    icon = '🔑';
                    columnStyle = 'font-size: 15px; fill: #059669; font-weight: bold; font-family: "Courier New", monospace;';
                }
                else if (column.is_foreign_key) {
                    icon = '🔗';
                    columnStyle = 'font-size: 15px; fill: #d97706; font-weight: bold; font-family: "Courier New", monospace;';
                }
                else {
                    icon = '•';
                }
                if (isRelationshipColumn) {
                    columnStyle += ' font-weight: bold;';
                }
                svg += `
                <text x="${columnX + 25}" y="${columnY}" style="${columnStyle}">
                    ${column.name}
                </text>
                <text x="${columnX + 8}" y="${columnY}" style="font-size: 14px;">
                    ${icon}
                </text>
                `;
            });
        }
        else {
            // No columns message
            svg += `
            <text x="${x + width / 2}" y="${y + headerHeight + 30}" text-anchor="middle" 
                  style="font-size: 14px; fill: #9ca3af; font-style: italic;">
                No relevant columns
            </text>
            `;
        }
        return svg;
    }
    /**
     * Get columns relevant to a specific relationship
     */
    getRelevantColumnsForRelationship(table, relationship, direction) {
        if (!table.columns)
            return [];
        const targetColumn = direction === 'from' ? relationship.from_column_id : relationship.to_column_id;
        // Include the specific column involved in the relationship, plus all PKs and FKs
        return table.columns.filter(column => column.name === targetColumn ||
            column.is_primary_key ||
            column.is_foreign_key);
    }
    /**
     * Get columns that are involved in relationships (PK, FK, or referenced)
     */
    getLinkedColumns(table, relationships) {
        if (!table.columns)
            return [];
        // Get all column names that are involved in relationships
        const linkedColumnNames = new Set();
        relationships.forEach(rel => {
            if (rel.from_table_id === table.name) {
                linkedColumnNames.add(rel.from_column_id);
            }
            if (rel.to_table_id === table.name) {
                linkedColumnNames.add(rel.to_column_id);
            }
        });
        // Filter columns to only include those involved in relationships
        // Also include all primary keys and foreign keys
        return table.columns.filter(column => linkedColumnNames.has(column.name) ||
            column.is_primary_key ||
            column.is_foreign_key);
    }
}
exports.PDFExportService = PDFExportService;
//# sourceMappingURL=pdfExportService.js.map