import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ValidationError, ApiError, ErrorResponse } from '../types';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
  custom?: (value: any) => boolean | string;
}

export class ValidationMiddleware {
  
  /**
   * Validate request body against rules
   */
  static validateBody(rules: ValidationRule[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const errors = ValidationMiddleware.validateObject(req.body, rules);
      
      if (errors.length > 0) {
        const errorResponse: ErrorResponse = {
          error: 'Validation Error',
          message: 'Request validation failed',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.path,
          validation: errors
        };

        logger.warn('Request validation failed', {
          path: req.path,
          method: req.method,
          errors,
          body: req.body
        });

        res.status(400).json(errorResponse);
        return;
      }

      next();
    };
  }

  /**
   * Validate query parameters
   */
  static validateQuery(rules: ValidationRule[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const errors = ValidationMiddleware.validateObject(req.query, rules);
      
      if (errors.length > 0) {
        const errorResponse: ErrorResponse = {
          error: 'Validation Error',
          message: 'Query parameter validation failed',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.path,
          validation: errors
        };

        res.status(400).json(errorResponse);
        return;
      }

      next();
    };
  }

  /**
   * Validate an object against rules
   */
  static validateObject(obj: any, rules: ValidationRule[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const rule of rules) {
      const value = obj[rule.field];
      const error = ValidationMiddleware.validateField(value, rule);
      
      if (error) {
        errors.push(error);
      }
    }

    return errors;
  }

  /**
   * Validate a single field
   */
  static validateField(value: any, rule: ValidationRule): ValidationError | null {
    const { field, required, type, minLength, maxLength, min, max, pattern, enum: enumValues, custom } = rule;

    // Check if required
    if (required && (value === undefined || value === null || value === '')) {
      return {
        field,
        message: `${field} is required`,
        value
      };
    }

    // Skip validation if value is not provided and not required
    if (value === undefined || value === null || value === '') {
      return null;
    }

    // Type validation
    if (type) {
      const typeError = ValidationMiddleware.validateType(value, type, field);
      if (typeError) return typeError;
    }

    // String validations
    if (typeof value === 'string') {
      if (minLength !== undefined && value.length < minLength) {
        return {
          field,
          message: `${field} must be at least ${minLength} characters long`,
          value
        };
      }

      if (maxLength !== undefined && value.length > maxLength) {
        return {
          field,
          message: `${field} must be no more than ${maxLength} characters long`,
          value
        };
      }

      if (pattern && !pattern.test(value)) {
        return {
          field,
          message: `${field} format is invalid`,
          value
        };
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (min !== undefined && value < min) {
        return {
          field,
          message: `${field} must be at least ${min}`,
          value
        };
      }

      if (max !== undefined && value > max) {
        return {
          field,
          message: `${field} must be no more than ${max}`,
          value
        };
      }
    }

    // Enum validation
    if (enumValues && !enumValues.includes(value)) {
      return {
        field,
        message: `${field} must be one of: ${enumValues.join(', ')}`,
        value
      };
    }

    // Custom validation
    if (custom) {
      const customResult = custom(value);
      if (customResult !== true) {
        return {
          field,
          message: typeof customResult === 'string' ? customResult : `${field} is invalid`,
          value
        };
      }
    }

    return null;
  }

  /**
   * Validate value type
   */
  static validateType(value: any, type: string, field: string): ValidationError | null {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return { field, message: `${field} must be a string`, value };
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return { field, message: `${field} must be a number`, value };
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          return { field, message: `${field} must be a boolean`, value };
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          return { field, message: `${field} must be an array`, value };
        }
        break;

      case 'object':
        if (typeof value !== 'object' || Array.isArray(value) || value === null) {
          return { field, message: `${field} must be an object`, value };
        }
        break;

      case 'email':
        if (typeof value !== 'string' || !ValidationMiddleware.isValidEmail(value)) {
          return { field, message: `${field} must be a valid email address`, value };
        }
        break;

      case 'url':
        if (typeof value !== 'string' || !ValidationMiddleware.isValidUrl(value)) {
          return { field, message: `${field} must be a valid URL`, value };
        }
        break;

      default:
        break;
    }

    return null;
  }

  /**
   * Email validation
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * URL validation
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize object by removing undefined fields
   */
  static sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => ValidationMiddleware.sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          sanitized[key] = ValidationMiddleware.sanitizeObject(value);
        }
      }
      return sanitized;
    }
    
    return obj;
  }
}

/**
 * Global error handler
 */
export function errorHandler(
  error: ApiError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logger.logError(error, 'Global error handler', {
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
    user: (req as any).user?.id
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorType = 'Internal Server Error';

  // Handle known error types
  if ('statusCode' in error && error.statusCode) {
    statusCode = error.statusCode;
  }

  if (error.message) {
    message = error.message;
  }

  if ('code' in error && error.code) {
    errorType = error.code;
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorType = 'Validation Error';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    errorType = 'Unauthorized';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    errorType = 'Forbidden';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    errorType = 'Not Found';
  } else if (error.name === 'ConflictError') {
    statusCode = 409;
    errorType = 'Conflict';
  } else if (error.name === 'TooManyRequestsError') {
    statusCode = 429;
    errorType = 'Too Many Requests';
  }

  const errorResponse: ErrorResponse = {
    error: errorType,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path
  };

  // Add additional error details in development
  if (process.env.NODE_ENV === 'development' && 'details' in error) {
    (errorResponse as any).details = error.details;
  }

  res.status(statusCode).json(errorResponse);
}

// Common validation rule sets
export const commonValidations = {
  uploadOptions: [
    {
      field: 'type',
      required: true,
      type: 'string' as const,
      enum: ['file', 'url']
    },
    {
      field: 'url',
      type: 'url' as const,
      custom: (value: any, data: any) => {
        if (data.type === 'url' && !value) {
          return 'URL is required when type is url';
        }
        return true;
      }
    },
    {
      field: 'options',
      type: 'object' as const
    },
    {
      field: 'options.detail',
      type: 'string' as const,
      enum: ['brief', 'standard', 'deep']
    },
    {
      field: 'options.timestamps',
      type: 'boolean' as const
    },
    {
      field: 'options.lang',
      type: 'string' as const,
      minLength: 2,
      maxLength: 5
    }
  ],

  summaryQuery: [
    {
      field: 'page',
      type: 'number' as const,
      min: 1
    },
    {
      field: 'limit',
      type: 'number' as const,
      min: 1,
      max: 100
    },
    {
      field: 'search',
      type: 'string' as const,
      maxLength: 200
    },
    {
      field: 'sort',
      type: 'string' as const,
      enum: ['createdAt', 'updatedAt', 'title', 'duration']
    },
    {
      field: 'order',
      type: 'string' as const,
      enum: ['asc', 'desc']
    }
  ],

  updateSummary: [
    {
      field: 'title',
      type: 'string' as const,
      minLength: 1,
      maxLength: 200
    },
    {
      field: 'description',
      type: 'string' as const,
      maxLength: 1000
    },
    {
      field: 'tags',
      type: 'array' as const
    }
  ]
};

export default ValidationMiddleware;
