import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';

import config from './utils/config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/validation';

// Routes
import healthRouter from './routes/health';
import uploadRouter from './routes/upload';
import summariesRouter from './routes/summaries';

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (config.corsOrigins.includes(origin) || config.nodeEnv === 'development') {
      return callback(null, true);
    }
    
    logger.warn('CORS blocked request', { origin });
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    }
  }
}));

// Request timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
  });
  next();
});

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
  logger.info(`Created upload directory: ${config.uploadDir}`);
}

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/summaries', summariesRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'PodSum API',
    version: '1.0.0',
    description: 'AI-powered podcast summarization service',
    endpoints: {
      health: '/api/health',
      upload: '/api/upload',
      summaries: '/api/summaries'
    },
    documentation: '/api/docs'
  });
});

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'PodSum API Documentation',
    version: '1.0.0',
    endpoints: {
      'POST /api/upload': {
        description: 'Upload audio file or podcast URL for processing',
        authentication: 'required',
        parameters: {
          type: 'file|url',
          file: 'audio file (if type=file)',
          url: 'podcast URL (if type=url)',
          options: {
            lang: 'language code (optional)',
            detail: 'brief|standard|deep',
            timestamps: 'boolean'
          }
        }
      },
      'GET /api/upload/status/:jobId': {
        description: 'Get processing job status',
        authentication: 'required'
      },
      'GET /api/summaries': {
        description: 'List user summaries with pagination',
        authentication: 'required',
        parameters: {
          page: 'page number (optional)',
          limit: 'items per page (optional)',
          search: 'search query (optional)'
        }
      },
      'GET /api/summaries/:id': {
        description: 'Get specific summary by ID',
        authentication: 'required'
      },
      'DELETE /api/summaries/:id': {
        description: 'Delete a summary',
        authentication: 'required'
      },
      'GET /api/health': {
        description: 'API health check',
        authentication: 'none'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'POST /api/upload',
      'GET /api/upload/status/:jobId',
      'GET /api/summaries',
      'GET /api/summaries/:id'
    ]
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown handlers
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Start server
const server = app.listen(config.port, () => {
  logger.info(`PodSum API server started`, {
    port: config.port,
    environment: config.nodeEnv,
    cors: config.corsOrigins,
    uploadDir: config.uploadDir
  });
});

export default app;
