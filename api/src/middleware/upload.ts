import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import config from '../utils/config';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types';

export class UploadMiddleware {
  
  /**
   * Configure multer storage
   */
  private static createStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = config.uploadDir;
        
        // Ensure upload directory exists
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
      },
      filename: (req: AuthRequest, file, cb) => {
        // Generate unique filename
        const timestamp = Date.now();
        const userId = req.user?.id || 'anonymous';
        const randomSuffix = Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        
        const filename = `${userId}_${timestamp}_${randomSuffix}${ext}`;
        
        logger.logUpload('File upload started', {
          originalName: file.originalname,
          filename,
          mimetype: file.mimetype,
          userId
        });
        
        cb(null, filename);
      }
    });
  }

  /**
   * File filter function
   */
  private static fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    // Check if file type is allowed
    if (config.allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      logger.logUpload('File type rejected', {
        mimetype: file.mimetype,
        originalName: file.originalname,
        allowedTypes: config.allowedFileTypes
      });
      
      cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${config.allowedFileTypes.join(', ')}`));
    }
  }

  /**
   * Create multer upload middleware
   */
  static createUploadMiddleware() {
    return multer({
      storage: UploadMiddleware.createStorage(),
      fileFilter: UploadMiddleware.fileFilter,
      limits: {
        fileSize: config.maxFileSize,
        files: 1, // Only allow one file at a time
        fields: 10, // Limit number of form fields
        fieldSize: 1024 * 1024 // 1MB per field
      }
    });
  }

  /**
   * Single file upload middleware
   */
  static singleFileUpload(fieldName: string = 'file') {
    const upload = UploadMiddleware.createUploadMiddleware();
    
    return (req: Request, res: Response, next: NextFunction) => {
      const uploadSingle = upload.single(fieldName);
      
      uploadSingle(req, res, (error) => {
        if (error) {
          let statusCode = 400;
          let message = error.message;
          
          if (error instanceof multer.MulterError) {
            switch (error.code) {
              case 'LIMIT_FILE_SIZE':
                message = `File too large. Maximum size is ${config.maxFileSizeMB}MB`;
                break;
              case 'LIMIT_FILE_COUNT':
                message = 'Too many files. Only one file is allowed';
                break;
              case 'LIMIT_UNEXPECTED_FILE':
                message = `Unexpected field name. Expected '${fieldName}'`;
                break;
              case 'LIMIT_FIELD_COUNT':
                message = 'Too many form fields';
                break;
              case 'LIMIT_FIELD_KEY':
                message = 'Field name too long';
                break;
              case 'LIMIT_FIELD_VALUE':
                message = 'Field value too long';
                break;
              default:
                message = `Upload error: ${error.message}`;
            }
          }
          
          logger.logUpload('Upload failed', {
            error: message,
            code: error instanceof multer.MulterError ? error.code : 'UNKNOWN',
            fieldName
          });
          
          res.status(statusCode).json({
            error: 'Upload Error',
            message,
            statusCode,
            timestamp: new Date().toISOString()
          });
          return;
        }
        
        // Log successful upload
        if (req.file) {
          logger.logUpload('File uploaded successfully', {
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            destination: req.file.destination
          });
        }
        
        next();
      });
    };
  }

  /**
   * Validate uploaded file
   */
  static validateUploadedFile() {
    return (req: Request, res: Response, next: NextFunction) => {
      const file = req.file;
      
      if (!file) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'No file uploaded',
          statusCode: 400,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Additional file validation
      const errors: string[] = [];

      // Check file size
      if (file.size > config.maxFileSize) {
        errors.push(`File size ${Math.round(file.size / 1024 / 1024)}MB exceeds maximum of ${config.maxFileSizeMB}MB`);
      }

      // Check file exists on disk
      if (!fs.existsSync(file.path)) {
        errors.push('Uploaded file not found on server');
      }

      // Validate file content (basic check)
      try {
        const stats = fs.statSync(file.path);
        if (stats.size === 0) {
          errors.push('Uploaded file is empty');
        }
      } catch (error) {
        errors.push('Cannot validate uploaded file');
      }

      if (errors.length > 0) {
        // Clean up invalid file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        logger.logUpload('File validation failed', {
          filename: file.filename,
          errors
        });

        res.status(400).json({
          error: 'Validation Error',
          message: 'File validation failed',
          details: errors,
          statusCode: 400,
          timestamp: new Date().toISOString()
        });
        return;
      }

      next();
    };
  }

  /**
   * Clean up uploaded files on error
   */
  static cleanupOnError() {
    return (error: any, req: Request, res: Response, next: NextFunction) => {
      // Clean up uploaded file if there was an error
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
          logger.logUpload('Cleaned up file after error', {
            filename: req.file.filename,
            error: error.message
          });
        } catch (cleanupError) {
          logger.logError(
            cleanupError instanceof Error ? cleanupError : new Error(String(cleanupError)), 
            'File cleanup failed'
          );
        }
      }

      next(error);
    };
  }

  /**
   * Get file metadata
   */
  static getFileMetadata(filePath: string) {
    try {
      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      return {
        size: stats.size,
        extension: ext,
        mimeType: UploadMiddleware.getMimeTypeFromExtension(ext),
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      logger.logError(
        error instanceof Error ? error : new Error(String(error)), 
        'Failed to get file metadata',
        { filePath }
      );
      return null;
    }
  }

  /**
   * Get MIME type from file extension
   */
  private static getMimeTypeFromExtension(ext: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.mp4': 'audio/mp4',
      '.webm': 'audio/webm',
      '.ogg': 'audio/ogg',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska'
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Delete uploaded file
   */
  static deleteFile(filePath: string): boolean {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.logUpload('File deleted', { filePath });
        return true;
      }
      return false;
    } catch (error) {
      logger.logError(
        error instanceof Error ? error : new Error(String(error)), 
        'Failed to delete file',
        { filePath }
      );
      return false;
    }
  }

  /**
   * Clean up old files (should be run periodically)
   */
  static cleanupOldFiles(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    let deletedCount = 0;
    
    try {
      const files = fs.readdirSync(config.uploadDir);
      const now = Date.now();
      
      for (const file of files) {
        const filePath = path.join(config.uploadDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAgeMs) {
          if (UploadMiddleware.deleteFile(filePath)) {
            deletedCount++;
          }
        }
      }
      
      logger.logUpload('Cleanup completed', {
        deletedCount,
        maxAgeHours: maxAgeMs / (60 * 60 * 1000)
      });
    } catch (error) {
      logger.logError(
        error instanceof Error ? error : new Error(String(error)), 
        'File cleanup failed'
      );
    }
    
    return deletedCount;
  }
}

// Export commonly used middleware
export const uploadSingle = UploadMiddleware.singleFileUpload();
export const validateFile = UploadMiddleware.validateUploadedFile();
export const cleanupOnError = UploadMiddleware.cleanupOnError();

export default UploadMiddleware;
