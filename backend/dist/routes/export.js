"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FrameworkManager_1 = require("../generators/FrameworkManager");
const sqlExportService_1 = require("../services/sqlExportService");
const pdfExportService_1 = require("../services/pdfExportService");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const connection_1 = require("../database/connection");
const router = (0, express_1.Router)();
const frameworkManager = new FrameworkManager_1.FrameworkManager();
const sqlExportService = new sqlExportService_1.SQLExportService();
const pdfExportService = new pdfExportService_1.PDFExportService();
/**
 * Get available frameworks
 */
router.get('/frameworks', auth_1.authMiddleware, async (req, res) => {
    try {
        const frameworks = frameworkManager.getAvailableFrameworks();
        const frameworksInfo = frameworks.map(name => ({
            name,
            info: frameworkManager.getFrameworkInfo(name),
            supportedFiles: frameworkManager.getSupportedFileTypes(name)
        }));
        return res.json({
            success: true,
            frameworks: frameworksInfo
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting frameworks', { error: error instanceof Error ? error.message : 'Unknown error' });
        return res.status(500).json({
            success: false,
            error: 'Failed to get available frameworks'
        });
    }
});
/**
 * Export diagram as SQL schema
 */
router.post('/sql/:diagramId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { diagramId } = req.params;
        const { databaseType = 'postgresql', schemaName = 'public' } = req.body;
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        // Get diagram data from database
        const diagramResult = await (0, connection_1.query)('SELECT * FROM diagrams WHERE id = $1 AND owner_id = $2', [diagramId, req.user.id]);
        if (diagramResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Diagram not found'
            });
        }
        const diagram = diagramResult.rows[0];
        const diagramData = diagram.canvas_data;
        // Transform diagram data
        const transformedTables = frameworkManager.transformDiagramData(diagramData);
        // Convert to the expected type for SQL export
        const tables = transformedTables.map(table => ({
            id: table.id,
            diagram_id: diagramId,
            name: table.name,
            display_name: table.name,
            description: '',
            position_x: 0,
            position_y: 0,
            width: 200,
            height: 100,
            color: '#ffffff',
            created_at: new Date(),
            updated_at: new Date(),
            columns: table.columns.map(col => {
                const column = {
                    id: col.id,
                    table_id: table.id,
                    name: col.name,
                    data_type: col.type,
                    is_primary_key: col.primaryKey,
                    is_foreign_key: col.foreignKey || false,
                    is_unique: false,
                    is_nullable: col.nullable,
                    is_auto_increment: false,
                    order_index: 0,
                    created_at: new Date(),
                    updated_at: new Date()
                };
                if (col.defaultValue)
                    column.default_value = col.defaultValue;
                if (col.comment)
                    column.description = col.comment;
                return column;
            })
        }));
        // Get relationships from diagram data
        const relationships = (diagramData.relationships || []).map((rel) => ({
            id: rel.id || '',
            diagram_id: diagramId,
            from_table_id: rel.fromTable || '',
            to_table_id: rel.toTable || '',
            from_column_id: rel.fromColumn || '',
            to_column_id: rel.toColumn || '',
            relationship_type: rel.type || 'one_to_many',
            constraint_name: rel.constraintName,
            on_delete: rel.onDelete || 'RESTRICT',
            on_update: rel.onUpdate || 'RESTRICT',
            created_at: new Date(),
            updated_at: new Date()
        }));
        // Generate SQL schema
        const sqlSchema = sqlExportService.generateSQLSchema(tables, relationships, databaseType, schemaName);
        // Set response headers for file download
        const filename = `${diagram.name}_schema_${Date.now()}.sql`;
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', Buffer.byteLength(sqlSchema, 'utf8'));
        logger_1.logger.info('SQL export successful', {
            diagramId,
            databaseType,
            userId: req.user.id,
            tablesCount: tables.length
        });
        // Send the SQL file
        return res.send(sqlSchema);
    }
    catch (error) {
        logger_1.logger.error('Error exporting SQL', {
            error: error instanceof Error ? error.message : 'Unknown error',
            diagramId: req.params.diagramId
        });
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to export SQL'
        });
    }
});
/**
 * Export diagram as PDF documentation
 */
router.post('/pdf/:diagramId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { diagramId } = req.params;
        const { databaseType = 'postgresql', schemaName = 'public', documentTitle } = req.body;
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        // Get diagram data from database
        const diagramResult = await (0, connection_1.query)('SELECT * FROM diagrams WHERE id = $1 AND owner_id = $2', [diagramId, req.user.id]);
        if (diagramResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Diagram not found'
            });
        }
        const diagram = diagramResult.rows[0];
        const diagramData = diagram.canvas_data;
        // Transform diagram data
        const transformedTables = frameworkManager.transformDiagramData(diagramData);
        // Convert to the expected type for PDF export
        const tables = transformedTables.map(table => ({
            id: table.id,
            diagram_id: diagramId,
            name: table.name,
            display_name: table.name,
            description: '',
            position_x: 0,
            position_y: 0,
            width: 200,
            height: 100,
            color: '#ffffff',
            created_at: new Date(),
            updated_at: new Date(),
            columns: table.columns.map(col => {
                const column = {
                    id: col.id,
                    table_id: table.id,
                    name: col.name,
                    data_type: col.type,
                    is_primary_key: col.primaryKey,
                    is_foreign_key: col.foreignKey || false,
                    is_unique: false,
                    is_nullable: col.nullable,
                    is_auto_increment: false,
                    order_index: 0,
                    created_at: new Date(),
                    updated_at: new Date()
                };
                if (col.defaultValue)
                    column.default_value = col.defaultValue;
                if (col.comment)
                    column.description = col.comment;
                return column;
            })
        }));
        // Get relationships from diagram data
        const relationships = (diagramData.relationships || []).map((rel) => ({
            id: rel.id || '',
            diagram_id: diagramId,
            from_table_id: rel.fromTable || '',
            to_table_id: rel.toTable || '',
            from_column_id: rel.fromColumn || '',
            to_column_id: rel.toColumn || '',
            relationship_type: rel.type || 'one_to_many',
            constraint_name: rel.constraintName,
            on_delete: rel.onDelete || 'RESTRICT',
            on_update: rel.onUpdate || 'RESTRICT',
            created_at: new Date(),
            updated_at: new Date()
        }));
        // Generate PDF documentation
        const pdfBuffer = await pdfExportService.generatePDFDocumentation(documentTitle || diagram.name || 'Database Schema Documentation', diagram.description || '', tables, relationships, databaseType, schemaName);
        // Set response headers for file download
        const titleForFilename = documentTitle || diagram.name || 'Database_Schema_Documentation';
        const filename = `${titleForFilename.replace(/[^a-zA-Z0-9_-]/g, '_')}_documentation_${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        logger_1.logger.info('PDF export successful', {
            diagramId,
            databaseType,
            userId: req.user.id,
            tablesCount: tables.length
        });
        // Send the PDF file
        return res.send(pdfBuffer);
    }
    catch (error) {
        logger_1.logger.error('Error exporting PDF', {
            error: error instanceof Error ? error.message : 'Unknown error',
            diagramId: req.params.diagramId
        });
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to export PDF'
        });
    }
});
/**
 * Export diagram as code for specific framework
 */
router.post('/:framework/:diagramId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { framework, diagramId } = req.params;
        const { namespace, schemaName, ...config } = req.body;
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        // Get diagram data from database
        const diagramResult = await (0, connection_1.query)('SELECT * FROM diagrams WHERE id = $1 AND owner_id = $2', [diagramId, req.user.id]);
        if (diagramResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Diagram not found'
            });
        }
        const diagram = diagramResult.rows[0];
        const diagramData = diagram.canvas_data;
        // Transform diagram data
        const tables = frameworkManager.transformDiagramData(diagramData);
        // Generate code
        const frameworkConfig = {
            namespace: namespace || 'app',
            schemaName: schemaName || 'public',
            ...config
        };
        const generatedFiles = await frameworkManager.generateCode(framework || 'yii2', tables, frameworkConfig);
        if (generatedFiles.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files generated'
            });
        }
        // Create ZIP archive
        const zipBuffer = await frameworkManager.createZipArchive(generatedFiles);
        // Generate module name for filename
        const moduleName = (() => {
            const ns = namespace || 'app';
            const parts = ns.split('\\');
            const modulePart = parts[parts.length - 1] || 'app';
            // Convert to kebab-case
            return modulePart.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
        })();
        // Set response headers for file download
        const filename = `${moduleName}_${framework}_${Date.now()}.zip`;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', zipBuffer.length);
        logger_1.logger.info('Code export successful', {
            diagramId,
            framework,
            userId: req.user.id,
            filesCount: generatedFiles.length
        });
        // Send the ZIP file
        return res.send(zipBuffer);
    }
    catch (error) {
        logger_1.logger.error('Error exporting code', {
            error: error instanceof Error ? error.message : 'Unknown error',
            framework: req.params.framework,
            diagramId: req.params.diagramId
        });
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to export code'
        });
    }
});
exports.default = router;
//# sourceMappingURL=export.js.map