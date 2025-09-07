import { Router, Response } from 'express';
import { AuthRequest, UploadRequest, UploadResponse, JobStatusResponse } from '../types';
import { requireAuth } from '../middleware/auth';
import { uploadSingle, validateFile, cleanupOnError } from '../middleware/upload';
import { ValidationMiddleware, commonValidations } from '../middleware/validation';
import { processorService } from '../services/processor';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/upload
 * Upload and process audio file or URL
 */
router.post('/',
  requireAuth,
  uploadSingle,
  validateFile,
  ValidationMiddleware.validateBody([
    {
      field: 'type',
      required: true,
      type: 'string',
      enum: ['file', 'url']
    },
    {
      field: 'url',
      type: 'url',
      custom: (value: any) => {
        const body = value as any;
        if (body.type === 'url' && !value) {
          return 'URL is required when type is url';
        }
        return true;
      }
    },
    {
      field: 'options',
      type: 'object'
    },
    {
      field: 'options.detail',
      type: 'string',
      enum: ['brief', 'standard', 'deep']
    },
    {
      field: 'options.timestamps',
      type: 'boolean'
    },
    {
      field: 'options.lang',
      type: 'string',
      minLength: 2,
      maxLength: 5
    }
  ]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user!; // Auth middleware ensures user exists
      const { type, url, options = {} } = req.body;

      // Validate request based on type
      if (type === 'file' && !req.file) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'File is required when type is file',
          statusCode: 400,
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (type === 'url' && !url) {
        res.status(400).json({
          error: 'Validation Error', 
          message: 'URL is required when type is url',
          statusCode: 400,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Set default options
      const uploadOptions = {
        detail: options.detail || 'standard',
        timestamps: options.timestamps !== false, // Default to true
        lang: options.lang || undefined
      };

      // Create upload request
      const uploadRequest: UploadRequest = {
        type,
        file: req.file,
        url,
        options: uploadOptions
      };

      // Create processing job
      const job = await processorService.createJob(user, uploadRequest);

      logger.logUpload('Processing job created', {
        jobId: job.id,
        userId: user.id,
        type,
        options: uploadOptions,
        filename: req.file?.filename,
        url: type === 'url' ? url : undefined
      });

      // Return job information
      const response: UploadResponse = {
        jobId: job.id,
        status: job.status,
        message: 'Upload received and processing started',
        estimatedTime: ProcessorService.estimateProcessingTime(uploadRequest)
      };

      res.status(202).json({
        success: true,
        data: response,
        message: 'File uploaded successfully and processing started',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        'Upload processing failed',
        {
          userId: req.user?.id,
          hasFile: !!req.file,
          body: req.body
        }
      );

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to process upload',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  },
  cleanupOnError
);

/**
 * GET /api/upload/status/:jobId
 * Get processing job status
 */
router.get('/status/:jobId',
  requireAuth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { jobId } = req.params;
      const user = req.user!;

      const job = processorService.getJob(jobId);

      if (!job) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Processing job not found',
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if user owns the job
      if (job.userId !== user.id) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this job',
          statusCode: 403,
          timestamp: new Date().toISOString()
        });
        return;
      }

      const response: JobStatusResponse = {
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        message: ProcessorService.getStatusMessage(job),
        error: job.error
      };

      // If job is completed, include the result
      if (job.status === 'completed') {
        // In a real app, you'd fetch the summary from database
        // For now, we'll indicate where to get it
        response.message = 'Processing completed. Use /api/summaries to get results.';
      }

      res.json({
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        'Status check failed',
        {
          jobId: req.params.jobId,
          userId: req.user?.id
        }
      );

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get job status',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * DELETE /api/upload/cancel/:jobId
 * Cancel a processing job
 */
router.delete('/cancel/:jobId',
  requireAuth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { jobId } = req.params;
      const user = req.user!;

      const job = processorService.getJob(jobId);

      if (!job) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Processing job not found',
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if user owns the job
      if (job.userId !== user.id) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to cancel this job',
          statusCode: 403,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Try to cancel the job
      const cancelled = processorService.cancelJob(jobId);

      if (!cancelled) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Job cannot be cancelled (already completed or failed)',
          statusCode: 400,
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.logUpload('Job cancelled', {
        jobId,
        userId: user.id
      });

      res.json({
        success: true,
        message: 'Job cancelled successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        'Job cancellation failed',
        {
          jobId: req.params.jobId,
          userId: req.user?.id
        }
      );

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to cancel job',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * GET /api/upload/queue
 * Get processing queue status (admin only - simplified for now)
 */
router.get('/queue',
  requireAuth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const queueStatus = processorService.getQueueStatus();

      res.json({
        success: true,
        data: queueStatus,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        'Queue status check failed'
      );

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get queue status',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Helper class for processing estimates and messages
class ProcessorService {
  /**
   * Estimate processing time based on request
   */
  static estimateProcessingTime(request: UploadRequest): number {
    // Base time estimates in seconds
    let baseTime = 60; // 1 minute base

    // Adjust based on detail level
    switch (request.options.detail) {
      case 'brief':
        baseTime *= 0.7;
        break;
      case 'deep':
        baseTime *= 1.5;
        break;
      default: // standard
        break;
    }

    // Add time for timestamp processing
    if (request.options.timestamps) {
      baseTime *= 1.2;
    }

    // Add time for URL downloads
    if (request.type === 'url') {
      baseTime += 30;
    }

    return Math.round(baseTime);
  }

  /**
   * Get human-readable status message
   */
  static getStatusMessage(job: any): string {
    switch (job.status) {
      case 'queued':
        return 'Your request is in the processing queue';
      case 'processing':
        if (job.progress < 30) {
          return 'Preparing audio file for processing';
        } else if (job.progress < 70) {
          return 'Transcribing audio using AI';
        } else if (job.progress < 90) {
          return 'Generating summary and insights';
        } else {
          return 'Finalizing results';
        }
      case 'completed':
        return 'Processing completed successfully';
      case 'failed':
        return job.error || 'Processing failed due to an unknown error';
      default:
        return 'Unknown status';
    }
  }
}

export default router;
