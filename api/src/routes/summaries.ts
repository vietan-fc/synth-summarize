import { Router, Response } from 'express';
import { AuthRequest, Summary, SummaryListQuery, PaginatedResponse, UpdateSummaryRequest } from '../types';
import { requireAuth } from '../middleware/auth';
import { ValidationMiddleware, commonValidations } from '../middleware/validation';
import { logger } from '../utils/logger';

const router = Router();

// In-memory storage for demo (replace with database in production)
const summaries = new Map<string, Summary>();

/**
 * GET /api/summaries
 * List user summaries with pagination and filtering
 */
router.get('/',
  requireAuth,
  ValidationMiddleware.validateQuery([
    {
      field: 'page',
      type: 'number',
      min: 1
    },
    {
      field: 'limit',
      type: 'number',
      min: 1,
      max: 100
    },
    {
      field: 'search',
      type: 'string',
      maxLength: 200
    },
    {
      field: 'sort',
      type: 'string',
      enum: ['createdAt', 'updatedAt', 'title', 'duration']
    },
    {
      field: 'order',
      type: 'string',
      enum: ['asc', 'desc']
    },
    {
      field: 'language',
      type: 'string',
      minLength: 2,
      maxLength: 5
    },
    {
      field: 'detailLevel',
      type: 'string',
      enum: ['brief', 'standard', 'deep']
    }
  ]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      const query: SummaryListQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string,
        sort: req.query.sort as any || 'createdAt',
        order: req.query.order as any || 'desc',
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        language: req.query.language as string,
        detailLevel: req.query.detailLevel as any
      };

      // Get user's summaries
      let userSummaries = Array.from(summaries.values())
        .filter(summary => summary.userId === user.id);

      // Apply filters
      if (query.search) {
        const searchLower = query.search.toLowerCase();
        userSummaries = userSummaries.filter(summary =>
          summary.title.toLowerCase().includes(searchLower) ||
          summary.description?.toLowerCase().includes(searchLower) ||
          summary.overview.toLowerCase().includes(searchLower) ||
          summary.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      if (query.language) {
        userSummaries = userSummaries.filter(summary => 
          summary.language === query.language
        );
      }

      if (query.detailLevel) {
        userSummaries = userSummaries.filter(summary => 
          summary.detailLevel === query.detailLevel
        );
      }

      if (query.tags && query.tags.length > 0) {
        userSummaries = userSummaries.filter(summary =>
          query.tags!.some(tag => summary.tags.includes(tag))
        );
      }

      // Apply sorting
      userSummaries.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (query.sort) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'duration':
            aValue = a.duration;
            bValue = b.duration;
            break;
          case 'updatedAt':
            aValue = a.updatedAt.getTime();
            bValue = b.updatedAt.getTime();
            break;
          default: // createdAt
            aValue = a.createdAt.getTime();
            bValue = b.createdAt.getTime();
        }

        if (query.order === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });

      // Calculate pagination
      const total = userSummaries.length;
      const totalPages = Math.ceil(total / query.limit!);
      const offset = (query.page! - 1) * query.limit!;
      const paginatedSummaries = userSummaries.slice(offset, offset + query.limit!);

      // Create response
      const response: PaginatedResponse<Summary> = {
        success: true,
        data: paginatedSummaries,
        pagination: {
          page: query.page!,
          limit: query.limit!,
          total,
          totalPages,
          hasNext: query.page! < totalPages,
          hasPrev: query.page! > 1
        },
        timestamp: new Date().toISOString()
      };

      logger.logDatabase('Summaries listed', {
        userId: user.id,
        total,
        page: query.page,
        filters: {
          search: query.search,
          language: query.language,
          detailLevel: query.detailLevel,
          tags: query.tags
        }
      });

      res.json(response);

    } catch (error) {
      logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to list summaries',
        { userId: req.user?.id, query: req.query }
      );

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve summaries',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * GET /api/summaries/:id
 * Get specific summary by ID
 */
router.get('/:id',
  requireAuth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user!;

      const summary = summaries.get(id);

      if (!summary) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Summary not found',
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if user owns the summary
      if (summary.userId !== user.id) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this summary',
          statusCode: 403,
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.logDatabase('Summary retrieved', {
        summaryId: id,
        userId: user.id,
        title: summary.title
      });

      res.json({
        success: true,
        data: summary,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to get summary',
        { summaryId: req.params.id, userId: req.user?.id }
      );

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve summary',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * PUT /api/summaries/:id
 * Update summary metadata
 */
router.put('/:id',
  requireAuth,
  ValidationMiddleware.validateBody([
    {
      field: 'title',
      type: 'string',
      minLength: 1,
      maxLength: 200
    },
    {
      field: 'description',
      type: 'string',
      maxLength: 1000
    },
    {
      field: 'tags',
      type: 'array'
    }
  ]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user!;
      const updates: UpdateSummaryRequest = req.body;

      const summary = summaries.get(id);

      if (!summary) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Summary not found',
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if user owns the summary
      if (summary.userId !== user.id) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to update this summary',
          statusCode: 403,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Apply updates
      const updatedSummary: Summary = {
        ...summary,
        title: updates.title !== undefined ? updates.title : summary.title,
        description: updates.description !== undefined ? updates.description : summary.description,
        tags: updates.tags !== undefined ? updates.tags : summary.tags,
        updatedAt: new Date()
      };

      summaries.set(id, updatedSummary);

      logger.logDatabase('Summary updated', {
        summaryId: id,
        userId: user.id,
        updates: Object.keys(updates)
      });

      res.json({
        success: true,
        data: updatedSummary,
        message: 'Summary updated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to update summary',
        { summaryId: req.params.id, userId: req.user?.id, updates: req.body }
      );

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update summary',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * DELETE /api/summaries/:id
 * Delete a summary
 */
router.delete('/:id',
  requireAuth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user!;

      const summary = summaries.get(id);

      if (!summary) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Summary not found',
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if user owns the summary
      if (summary.userId !== user.id) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to delete this summary',
          statusCode: 403,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Delete the summary
      summaries.delete(id);

      logger.logDatabase('Summary deleted', {
        summaryId: id,
        userId: user.id,
        title: summary.title
      });

      res.json({
        success: true,
        message: 'Summary deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to delete summary',
        { summaryId: req.params.id, userId: req.user?.id }
      );

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete summary',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * POST /api/summaries/:id/regenerate
 * Regenerate summary with different options
 */
router.post('/:id/regenerate',
  requireAuth,
  ValidationMiddleware.validateBody([
    {
      field: 'detailLevel',
      type: 'string',
      enum: ['brief', 'standard', 'deep']
    },
    {
      field: 'timestamps',
      type: 'boolean'
    }
  ]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user!;
      const { detailLevel, timestamps } = req.body;

      const summary = summaries.get(id);

      if (!summary) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Summary not found',
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if user owns the summary
      if (summary.userId !== user.id) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to regenerate this summary',
          statusCode: 403,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // For now, return a placeholder response
      // In a real implementation, you would:
      // 1. Create a new processing job
      // 2. Use the existing transcript
      // 3. Generate new summary with updated options

      logger.logDatabase('Summary regeneration requested', {
        summaryId: id,
        userId: user.id,
        newDetailLevel: detailLevel,
        newTimestamps: timestamps
      });

      res.status(202).json({
        success: true,
        message: 'Summary regeneration started',
        data: {
          summaryId: id,
          status: 'regenerating',
          options: {
            detailLevel: detailLevel || summary.detailLevel,
            timestamps: timestamps !== undefined ? timestamps : (summary.timestamps.length > 0)
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to regenerate summary',
        { summaryId: req.params.id, userId: req.user?.id, options: req.body }
      );

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to regenerate summary',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * GET /api/summaries/:id/export
 * Export summary in various formats
 */
router.get('/:id/export',
  requireAuth,
  ValidationMiddleware.validateQuery([
    {
      field: 'format',
      type: 'string',
      enum: ['json', 'markdown', 'text', 'pdf']
    }
  ]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user!;
      const format = req.query.format as string || 'json';

      const summary = summaries.get(id);

      if (!summary) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Summary not found',
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if user owns the summary
      if (summary.userId !== user.id) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to export this summary',
          statusCode: 403,
          timestamp: new Date().toISOString()
        });
        return;
      }

      let content: string;
      let contentType: string;
      let filename: string;

      switch (format) {
        case 'markdown':
          content = SummaryExporter.toMarkdown(summary);
          contentType = 'text/markdown';
          filename = `${summary.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
          break;
        case 'text':
          content = SummaryExporter.toText(summary);
          contentType = 'text/plain';
          filename = `${summary.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
          break;
        case 'pdf':
          // PDF export would require additional library
          res.status(501).json({
            error: 'Not Implemented',
            message: 'PDF export is not yet implemented',
            statusCode: 501,
            timestamp: new Date().toISOString()
          });
          return;
        default: // json
          content = JSON.stringify(summary, null, 2);
          contentType = 'application/json';
          filename = `${summary.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      }

      logger.logDatabase('Summary exported', {
        summaryId: id,
        userId: user.id,
        format
      });

      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      });

      res.send(content);

    } catch (error) {
      logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to export summary',
        { summaryId: req.params.id, userId: req.user?.id, format: req.query.format }
      );

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to export summary',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Helper class for exporting summaries
class SummaryExporter {
  static toMarkdown(summary: Summary): string {
    let md = `# ${summary.title}\n\n`;
    
    if (summary.description) {
      md += `${summary.description}\n\n`;
    }

    md += `**Duration:** ${Math.round(summary.duration / 60)} minutes\n`;
    md += `**Language:** ${summary.language}\n`;
    md += `**Detail Level:** ${summary.detailLevel}\n`;
    md += `**Created:** ${summary.createdAt.toISOString()}\n\n`;

    md += `## Overview\n\n${summary.overview}\n\n`;

    if (summary.keyTakeaways.length > 0) {
      md += `## Key Takeaways\n\n`;
      summary.keyTakeaways.forEach((takeaway, i) => {
        md += `${i + 1}. ${takeaway}\n`;
      });
      md += '\n';
    }

    if (summary.keyPoints.length > 0) {
      md += `## Key Points\n\n`;
      summary.keyPoints.forEach(point => {
        md += `### ${point.title}\n\n${point.description}\n\n`;
      });
    }

    if (summary.actionItems.length > 0) {
      md += `## Action Items\n\n`;
      summary.actionItems.forEach((item, i) => {
        md += `- [ ] ${item}\n`;
      });
      md += '\n';
    }

    if (summary.quotes.length > 0) {
      md += `## Notable Quotes\n\n`;
      summary.quotes.forEach(quote => {
        md += `> "${quote}"\n\n`;
      });
    }

    return md;
  }

  static toText(summary: Summary): string {
    let text = `${summary.title}\n${'='.repeat(summary.title.length)}\n\n`;
    
    if (summary.description) {
      text += `${summary.description}\n\n`;
    }

    text += `Duration: ${Math.round(summary.duration / 60)} minutes\n`;
    text += `Language: ${summary.language}\n`;
    text += `Detail Level: ${summary.detailLevel}\n`;
    text += `Created: ${summary.createdAt.toISOString()}\n\n`;

    text += `OVERVIEW\n--------\n\n${summary.overview}\n\n`;

    if (summary.keyTakeaways.length > 0) {
      text += `KEY TAKEAWAYS\n-------------\n\n`;
      summary.keyTakeaways.forEach((takeaway, i) => {
        text += `${i + 1}. ${takeaway}\n`;
      });
      text += '\n';
    }

    if (summary.actionItems.length > 0) {
      text += `ACTION ITEMS\n------------\n\n`;
      summary.actionItems.forEach(item => {
        text += `• ${item}\n`;
      });
      text += '\n';
    }

    return text;
  }
}

// Export the summaries storage for other modules to use
export { summaries };
export default router;
