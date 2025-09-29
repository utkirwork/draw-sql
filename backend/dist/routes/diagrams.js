"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("@/database/connection");
const auth_1 = require("@/middleware/auth");
const logger_1 = require("@/utils/logger");
const router = (0, express_1.Router)();
// Get all diagrams for the authenticated user
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.id;
        const result = await (0, connection_1.query)(`SELECT id, title, description, canvas_data, visibility = 'public' as is_public, created_at, updated_at
       FROM diagrams 
       WHERE owner_id = $1 
       ORDER BY updated_at DESC`, [userId]);
        res.json({
            success: true,
            data: result.rows
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching diagrams:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch diagrams'
        });
    }
});
// Get a specific diagram
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const result = await (0, connection_1.query)(`SELECT id, title, description, canvas_data, visibility = 'public' as is_public, created_at, updated_at
       FROM diagrams 
       WHERE id = $1 AND (owner_id = $2 OR visibility = 'public')`, [id, userId]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Diagram not found'
            });
            return;
        }
        res.json({
            success: true,
            data: result.rows[0]
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching diagram:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch diagram'
        });
    }
});
// Create a new diagram
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { title, description, canvas_data, isPublic = false } = req.body;
        if (!title || !canvas_data) {
            res.status(400).json({
                success: false,
                error: 'Title and canvas_data are required'
            });
            return;
        }
        const result = await (0, connection_1.query)(`INSERT INTO diagrams (owner_id, title, description, canvas_data, visibility, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, title, description, canvas_data, visibility, created_at, updated_at`, [userId, title, description, canvas_data, isPublic ? 'public' : 'private']);
        logger_1.logger.info(`Diagram created: ${result.rows[0].id} by user ${userId}`);
        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating diagram:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create diagram'
        });
    }
});
// Update a diagram
router.put('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { title, canvas_data, description, isPublic } = req.body;
        // Check if diagram exists and user owns it
        const existingResult = await (0, connection_1.query)('SELECT id FROM diagrams WHERE id = $1 AND owner_id = $2', [id, userId]);
        if (existingResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Diagram not found or access denied'
            });
            return;
        }
        const result = await (0, connection_1.query)(`UPDATE diagrams 
       SET title = $1, description = $2, canvas_data = $3, visibility = $4, updated_at = NOW()
       WHERE id = $5 AND owner_id = $6
       RETURNING id, title, description, canvas_data, visibility, created_at, updated_at`, [title, description, canvas_data, isPublic ? 'public' : 'private', id, userId]);
        logger_1.logger.info(`Diagram updated: ${id} by user ${userId}`);
        res.json({
            success: true,
            data: result.rows[0]
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating diagram:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update diagram'
        });
    }
});
// Delete a diagram
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const result = await (0, connection_1.query)('DELETE FROM diagrams WHERE id = $1 AND owner_id = $2 RETURNING id', [id, userId]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Diagram not found or access denied'
            });
            return;
        }
        logger_1.logger.info(`Diagram deleted: ${id} by user ${userId}`);
        res.json({
            success: true,
            message: 'Diagram deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error deleting diagram:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete diagram'
        });
    }
});
exports.default = router;
//# sourceMappingURL=diagrams.js.map