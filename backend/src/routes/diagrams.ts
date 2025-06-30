import { Router, Request, Response } from 'express';
import { query } from '@/database/connection';
import { authMiddleware } from '@/middleware/auth';
import { logger } from '@/utils/logger';
import { AuthenticatedRequest } from '@/types';

const router = Router();

// Get all diagrams for the authenticated user
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const result = await query(
      `SELECT id, title, description, canvas_data, visibility = 'public' as is_public, created_at, updated_at
       FROM diagrams 
       WHERE owner_id = $1 
       ORDER BY updated_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching diagrams:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch diagrams'
    });
  }
});

// Get a specific diagram
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user?.id;

    const result = await query(
      `SELECT id, title, description, canvas_data, visibility = 'public' as is_public, created_at, updated_at
       FROM diagrams 
       WHERE id = $1 AND (owner_id = $2 OR visibility = 'public')`,
      [id, userId]
    );

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
  } catch (error) {
    logger.error('Error fetching diagram:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch diagram'
    });
  }
});

// Create a new diagram
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, description, canvas_data, isPublic = false } = req.body as {
      title: string;
      description?: string;
      canvas_data: string;
      isPublic?: boolean;
    };

    if (!title || !canvas_data) {
      res.status(400).json({
        success: false,
        error: 'Title and canvas_data are required'
      });
      return;
    }

    const result = await query(
      `INSERT INTO diagrams (owner_id, title, description, canvas_data, visibility, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, title, description, canvas_data, visibility, created_at, updated_at`,
      [userId, title, description, canvas_data, isPublic ? 'public' : 'private']
    );

    logger.info(`Diagram created: ${result.rows[0].id} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error creating diagram:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create diagram'
    });
  }
});

// Update a diagram
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user?.id;
    const { title, canvas_data, description, isPublic } = req.body as {
      title?: string;
      canvas_data?: string;
      description?: string;
      isPublic?: boolean;
    };

    // Check if diagram exists and user owns it
    const existingResult = await query(
      'SELECT id FROM diagrams WHERE id = $1 AND owner_id = $2',
      [id, userId]
    );

    if (existingResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Diagram not found or access denied'
      });
      return;
    }

    const result = await query(
      `UPDATE diagrams 
       SET title = $1, description = $2, canvas_data = $3, visibility = $4, updated_at = NOW()
       WHERE id = $5 AND owner_id = $6
       RETURNING id, title, description, canvas_data, visibility, created_at, updated_at`,
      [title, description, canvas_data, isPublic ? 'public' : 'private', id, userId]
    );

    logger.info(`Diagram updated: ${id} by user ${userId}`);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating diagram:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update diagram'
    });
  }
});

// Delete a diagram
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const userId = req.user?.id;

    const result = await query(
      'DELETE FROM diagrams WHERE id = $1 AND owner_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Diagram not found or access denied'
      });
      return;
    }

    logger.info(`Diagram deleted: ${id} by user ${userId}`);

    res.json({
      success: true,
      message: 'Diagram deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting diagram:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete diagram'
    });
  }
});

export default router; 