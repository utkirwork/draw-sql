import { Router } from 'express';
import { FrameworkManager } from '../generators/FrameworkManager';
import { authMiddleware } from '../middleware/auth';
import { logger } from '../utils/logger';
import { query } from '../database/connection';
import { AuthenticatedRequest } from '../types';

const router = Router();
const frameworkManager = new FrameworkManager();

/**
 * Get available frameworks
 */
router.get('/frameworks', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const frameworks = frameworkManager.getAvailableFrameworks();
        const frameworksInfo = frameworks.map(name => ({
            name,
            info: frameworkManager.getFrameworkInfo(name),
            supportedFiles: frameworkManager.getSupportedFileTypes(name)
        }));

        res.json({
            success: true,
            frameworks: frameworksInfo
        });
    } catch (error) {
        logger.error('Error getting frameworks', { error: error instanceof Error ? error.message : 'Unknown error' });
        res.status(500).json({
            success: false,
            error: 'Failed to get available frameworks'
        });
    }
});

/**
 * Export diagram as code for specific framework
 */
router.post('/:framework/:diagramId', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const { framework, diagramId } = req.params;
        const { namespace, ...config } = req.body;

        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        // Get diagram data from database
        const diagramResult = await query(
            'SELECT * FROM diagrams WHERE id = $1 AND owner_id = $2',
            [diagramId, req.user.id]
        );

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

        // Set response headers for file download
        const filename = `${diagram.name}_${framework}_${Date.now()}.zip`;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', zipBuffer.length);

        // Send the ZIP file
        res.send(zipBuffer);

        logger.info('Code export successful', {
            diagramId,
            framework,
            userId: req.user.id,
            filesCount: generatedFiles.length
        });

    } catch (error) {
        logger.error('Error exporting code', {
            error: error instanceof Error ? error.message : 'Unknown error',
            framework: req.params.framework,
            diagramId: req.params.diagramId
        });

        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to export code'
        });
    }
});

export default router; 