import { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { CodeGenerationService, DiagramData } from '../services/codeGenerationService';
import { query } from '../database/connection';
import { logger } from '../utils/logger';

const router = Router();
const codeGenService = new CodeGenerationService();

// Export diagram as Yii2 code
router.post('/yii2/:diagramId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { diagramId } = req.params;
    const { framework = 'yii2', namespace = 'app' } = req.body;

    // Get diagram data from database
    const diagramQuery = `
      SELECT d.*, dt.id as table_id, dt.name as table_name, dt.x, dt.y
      FROM diagrams d
      LEFT JOIN diagram_tables dt ON d.id = dt.diagram_id
      WHERE d.id = $1 AND d.is_deleted = false
    `;

    const diagramResult = await query(diagramQuery, [diagramId]);
    
    if (diagramResult.rows.length === 0) {
      return res.status(404).json({ error: 'Diagram not found' });
    }

    const diagram = diagramResult.rows[0];
    
    // Get all tables for this diagram
    const tablesQuery = `
      SELECT dt.*, tc.id as column_id, tc.name as column_name, tc.type as column_type,
             tc.nullable, tc.primary_key, tc.foreign_key_table, tc.foreign_key_column,
             tc.default_value, tc.length, tc.comment
      FROM diagram_tables dt
      LEFT JOIN table_columns tc ON dt.id = tc.table_id
      WHERE dt.diagram_id = $1
      ORDER BY dt.name, tc.order_index
    `;

    const tablesResult = await query(tablesQuery, [diagramId]);

    // Group columns by table
    const tablesMap = new Map();
    
    for (const row of tablesResult.rows) {
      if (!tablesMap.has(row.name)) {
        tablesMap.set(row.name, {
          name: row.name,
          columns: [],
          relations: []
        });
      }

      if (row.column_id) {
        tablesMap.get(row.name).columns.push({
          name: row.column_name,
          type: row.column_type,
          nullable: row.nullable,
          primary_key: row.primary_key,
          foreign_key: row.foreign_key_table ? {
            table: row.foreign_key_table,
            column: row.foreign_key_column
          } : undefined,
          default_value: row.default_value,
          length: row.length,
          comment: row.comment || ''
        });
      }
    }

    // Get relationships
    const relationshipsQuery = `
      SELECT * FROM table_relationships 
      WHERE diagram_id = $1
    `;

    const relationshipsResult = await query(relationshipsQuery, [diagramId]);

    // Add relationships to tables
    for (const rel of relationshipsResult.rows) {
      const sourceTable = tablesMap.get(rel.source_table);
      if (sourceTable) {
        sourceTable.relations.push({
          type: rel.relationship_type,
          target_table: rel.target_table,
          foreign_key: rel.foreign_key_column,
          local_key: rel.source_column
        });
      }
    }

    const diagramData: DiagramData = {
      name: diagram.name.replace(/[^a-zA-Z0-9]/g, ''),
      schema: diagram.database_type || 'public',
      tables: Array.from(tablesMap.values())
    };

    // Generate code based on framework
    let zipBuffer: Buffer;
    
    if (framework === 'yii2') {
      zipBuffer = await codeGenService.generateYii2Code(diagramData);
    } else {
      return res.status(400).json({ error: 'Unsupported framework' });
    }

    // Set headers for file download
    const filename = `${diagramData.name}_${framework}_export.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', zipBuffer.length);

    logger.info(`Code exported for diagram: ${diagramId}, framework: ${framework}`);
    
    res.send(zipBuffer);

  } catch (error) {
    logger.error('Export error:', error);
    next(error);
  }
});

// Get supported frameworks
router.get('/frameworks', (req: Request, res: Response) => {
  res.json({
    frameworks: [
      {
        id: 'yii2',
        name: 'Yii2 Framework',
        description: 'PHP Yii2 Framework with Repository pattern',
        supported: true
      },
      {
        id: 'laravel',
        name: 'Laravel Framework', 
        description: 'PHP Laravel Framework with Eloquent',
        supported: false
      },
      {
        id: 'symfony',
        name: 'Symfony Framework',
        description: 'PHP Symfony Framework with Doctrine',
        supported: false
      }
    ]
  });
});

export default router; 