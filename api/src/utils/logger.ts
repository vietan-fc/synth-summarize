import { Request, Response } from 'express';
import config from './config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: any;
  service: string;
  environment: string;
}

class Logger {
  private serviceName = 'podsum-api';
  private environment = config.nodeEnv;

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): LogEntry {
    return {
      timestamp: this.formatTimestamp(),
      level,
      message,
      meta,
      service: this.serviceName,
      environment: this.environment
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(config.nodeEnv === 'development' ? 'debug' : 'info');
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private output(logEntry: LogEntry): void {
    if (!this.shouldLog(logEntry.level)) return;

    const { timestamp, level, message, meta } = logEntry;
    
    if (config.nodeEnv === 'development') {
      // Pretty formatting for development
      const emoji = {
        debug: '🐛',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌'
      }[level];

      console.log(`${emoji} [${timestamp}] ${level.toUpperCase()}: ${message}`);
      
      if (meta && Object.keys(meta).length > 0) {
        console.log(JSON.stringify(meta, null, 2));
      }
    } else {
      // JSON formatting for production
      console.log(JSON.stringify(logEntry));
    }
  }

  debug(message: string, meta?: any): void {
    this.output(this.formatMessage('debug', message, meta));
  }

  info(message: string, meta?: any): void {
    this.output(this.formatMessage('info', message, meta));
  }

  warn(message: string, meta?: any): void {
    this.output(this.formatMessage('warn', message, meta));
  }

  error(message: string, meta?: any): void {
    this.output(this.formatMessage('error', message, meta));
  }

  // Specialized logging methods
  logRequest(req: Request, res: Response, duration: number): void {
    const { method, url, ip } = req;
    const { statusCode } = res;
    
    const level: LogLevel = statusCode >= 400 ? 'warn' : 'info';
    const message = `${method} ${url} - ${statusCode}`;
    
    this.output(this.formatMessage(level, message, {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id
    }));
  }

  logAuth(event: string, userId?: string, meta?: any): void {
    this.info(`Auth: ${event}`, {
      userId,
      ...meta
    });
  }

  logUpload(event: string, meta?: any): void {
    this.info(`Upload: ${event}`, meta);
  }

  logProcessing(event: string, jobId: string, meta?: any): void {
    this.info(`Processing: ${event}`, {
      jobId,
      ...meta
    });
  }

  logOpenAI(event: string, meta?: any): void {
    this.info(`OpenAI: ${event}`, meta);
  }

  logDatabase(event: string, meta?: any): void {
    this.info(`Database: ${event}`, meta);
  }

  logSecurity(event: string, meta?: any): void {
    this.warn(`Security: ${event}`, meta);
  }

  logPerformance(operation: string, duration: number, meta?: any): void {
    const level: LogLevel = duration > 5000 ? 'warn' : 'info';
    this.output(this.formatMessage(level, `Performance: ${operation}`, {
      duration: `${duration}ms`,
      ...meta
    }));
  }

  // Error logging with stack traces
  logError(error: Error, context?: string, meta?: any): void {
    this.error(`${context ? `${context}: ` : ''}${error.message}`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...meta
    });
  }

  // Health check logging
  logHealth(status: 'healthy' | 'unhealthy' | 'degraded', services: any): void {
    const level: LogLevel = status === 'healthy' ? 'info' : 'warn';
    this.output(this.formatMessage(level, `Health check: ${status}`, {
      status,
      services
    }));
  }

  // Startup logging
  logStartup(config: any): void {
    this.info('🚀 PodSum API starting up', {
      ...config,
      // Remove sensitive information
      openaiApiKey: config.openai?.apiKey ? '[REDACTED]' : undefined,
      jwtSecret: config.jwt?.secret ? '[REDACTED]' : undefined,
      firebasePrivateKey: config.firebase?.privateKey ? '[REDACTED]' : undefined
    });
  }

  // Shutdown logging
  logShutdown(signal?: string): void {
    this.info(`🛑 PodSum API shutting down`, { signal });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export performance measurement decorator
export function measurePerformance(operationName: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - start;
        
        logger.logPerformance(operationName, duration, {
          method: propertyName,
          success: true
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        
        logger.logPerformance(operationName, duration, {
          method: propertyName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        throw error;
      }
    };

    return descriptor;
  };
}

// Export error wrapper
export function logErrors(context: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await method.apply(this, args);
      } catch (error) {
        logger.logError(error instanceof Error ? error : new Error(String(error)), context, {
          method: propertyName
        });
        throw error;
      }
    };

    return descriptor;
  };
}

export default logger;
