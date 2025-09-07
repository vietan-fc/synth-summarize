import { Router, Request, Response } from 'express';
import os from 'os';
import fs from 'fs';
import { HealthStatus } from '../types';
import { logger } from '../utils/logger';
import { openaiService } from '../services/openai';
import config from '../utils/config';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  
  try {
    // Check system resources
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    // Check disk space
    let diskUsage = { used: 0, total: 0, percentage: 0 };
    try {
      const stats = fs.statSync(config.uploadDir);
      // Simple disk usage check (in a real app, you'd use a proper disk usage library)
      diskUsage = {
        used: 0, // Would calculate actual usage
        total: 100 * 1024 * 1024 * 1024, // 100GB placeholder
        percentage: 0
      };
    } catch (error) {
      logger.warn('Could not check disk usage', { error: error instanceof Error ? error.message : 'Unknown' });
    }

    // Check services
    const services = {
      database: 'connected' as const, // Would check actual database connection
      openai: 'available' as const,
      storage: 'accessible' as const
    };

    // Test OpenAI connection
    try {
      const openaiConnected = await Promise.race([
        openaiService.testConnection(),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]);
      services.openai = openaiConnected ? 'available' : 'unavailable';
    } catch (error) {
      services.openai = 'error';
      logger.warn('OpenAI health check failed', { 
        error: error instanceof Error ? error.message : 'Unknown' 
      });
    }

    // Test storage access
    try {
      fs.accessSync(config.uploadDir, fs.constants.R_OK | fs.constants.W_OK);
      services.storage = 'accessible';
    } catch (error) {
      services.storage = 'inaccessible';
      logger.warn('Storage health check failed', { 
        error: error instanceof Error ? error.message : 'Unknown' 
      });
    }

    // Calculate overall status
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (services.openai === 'error' || services.storage === 'inaccessible') {
      status = 'unhealthy';
    } else if (services.openai === 'unavailable' || services.database === 'disconnected') {
      status = 'degraded';
    }

    // CPU usage (simplified)
    const cpuUsage = os.loadavg()[0]; // 1-minute load average

    const healthStatus: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      services,
      system: {
        memory: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
          percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
        },
        cpu: {
          usage: Math.round(cpuUsage * 100) / 100
        },
        disk: diskUsage
      }
    };

    const responseTime = Date.now() - startTime;
    
    // Log health check
    logger.logHealth(status, services);
    
    // Set appropriate status code
    const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json({
      ...healthStatus,
      responseTime: `${responseTime}ms`
    });

  } catch (error) {
    logger.logError(
      error instanceof Error ? error : new Error(String(error)),
      'Health check failed'
    );

    const unhealthyStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      services: {
        database: 'error',
        openai: 'error',
        storage: 'error'
      },
      system: {
        memory: { used: 0, total: 0, percentage: 0 },
        cpu: { usage: 0 },
        disk: { used: 0, total: 0, percentage: 0 }
      }
    };

    res.status(503).json({
      ...unhealthyStatus,
      error: 'Health check failed',
      responseTime: `${Date.now() - startTime}ms`
    });
  }
});

/**
 * GET /api/health/detailed
 * Detailed health check with additional diagnostics
 */
router.get('/detailed', async (req: Request, res: Response): Promise<void> => {
  try {
    // Get basic health status
    const basicHealthResponse = await new Promise<any>((resolve) => {
      const mockReq = {} as Request;
      const mockRes = {
        status: (code: number) => mockRes,
        json: (data: any) => resolve(data)
      } as any;
      
      router.stack[0].route.stack[0].handle(mockReq, mockRes, () => {});
    });

    // Additional detailed checks
    const additionalInfo = {
      environment: config.nodeEnv,
      configuration: {
        uploadDir: config.uploadDir,
        maxFileSize: `${config.maxFileSizeMB}MB`,
        allowedFileTypes: config.allowedFileTypes,
        corsOrigins: config.corsOrigins
      },
      nodejs: {
        version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      openai: {
        model: config.openai.model,
        maxTokens: config.openai.maxTokens,
        temperature: config.openai.temperature
      }
    };

    res.json({
      ...basicHealthResponse,
      detailed: additionalInfo
    });

  } catch (error) {
    logger.logError(
      error instanceof Error ? error : new Error(String(error)),
      'Detailed health check failed'
    );

    res.status(503).json({
      error: 'Detailed health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health/ping
 * Simple ping endpoint for basic availability check
 */
router.get('/ping', (req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
