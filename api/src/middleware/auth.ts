import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import { AuthRequest, JWTPayload, User } from '../types';
import { logger } from '../utils/logger';
import config from '../utils/config';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey
    }),
    databaseURL: config.firebase.databaseURL,
    storageBucket: config.firebase.storageBucket
  });
}

export class AuthMiddleware {
  
  /**
   * Verify Firebase ID token
   */
  static async verifyFirebaseToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Missing or invalid authorization header'
        });
        return;
      }

      const token = authHeader.substring(7);
      
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Get user from Firebase Auth
        const userRecord = await admin.auth().getUser(decodedToken.uid);
        
        // Create user object
        const user: User = {
          id: userRecord.uid,
          email: userRecord.email || '',
          displayName: userRecord.displayName || undefined,
          photoURL: userRecord.photoURL || undefined,
          createdAt: new Date(userRecord.metadata.creationTime),
          updatedAt: new Date(userRecord.metadata.lastSignInTime || userRecord.metadata.creationTime)
        };

        req.user = user;
        
        logger.logAuth('Token verified', user.id, {
          email: user.email,
          displayName: user.displayName
        });
        
        next();
      } catch (tokenError) {
        logger.logAuth('Token verification failed', undefined, {
          error: tokenError instanceof Error ? tokenError.message : 'Unknown error'
        });
        
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        });
      }
    } catch (error) {
      logger.logError(error instanceof Error ? error : new Error(String(error)), 'Auth middleware');
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication service error'
      });
    }
  }

  /**
   * Verify JWT token (alternative auth method)
   */
  static async verifyJWT(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Missing or invalid authorization header'
        });
        return;
      }

      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
        
        // Get user from Firebase Auth using UID
        const userRecord = await admin.auth().getUser(decoded.uid);
        
        const user: User = {
          id: userRecord.uid,
          email: userRecord.email || '',
          displayName: userRecord.displayName || undefined,
          photoURL: userRecord.photoURL || undefined,
          createdAt: new Date(userRecord.metadata.creationTime),
          updatedAt: new Date(userRecord.metadata.lastSignInTime || userRecord.metadata.creationTime)
        };

        req.user = user;
        next();
      } catch (jwtError) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired JWT token'
        });
      }
    } catch (error) {
      logger.logError(error instanceof Error ? error : new Error(String(error)), 'JWT middleware');
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication service error'
      });
    }
  }

  /**
   * Optional authentication - doesn't fail if no token provided
   */
  static async optionalAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No auth provided, continue without user
      next();
      return;
    }

    // Try to authenticate, but don't fail if it doesn't work
    try {
      await AuthMiddleware.verifyFirebaseToken(req, res, () => {});
    } catch (error) {
      // Log the error but continue
      logger.warn('Optional auth failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    next();
  }

  /**
   * Generate JWT token for a user
   */
  static generateJWT(user: User): string {
    const payload: JWTPayload = {
      uid: user.id,
      email: user.email
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'podsum-api',
      audience: 'podsum-app'
    });
  }

  /**
   * Check if user has required permissions (extensible for future use)
   */
  static hasPermission(permission: string) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      // For now, all authenticated users have all permissions
      // This can be extended with role-based access control
      logger.logAuth('Permission check', req.user.id, { permission });
      next();
    };
  }

  /**
   * Rate limiting based on user
   */
  static userRateLimit() {
    const userRequests = new Map<string, { count: number; resetTime: number }>();

    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        next();
        return;
      }

      const userId = req.user.id;
      const now = Date.now();
      const windowMs = config.rateLimit.windowMs;
      const maxRequests = config.rateLimit.max;

      const userLimit = userRequests.get(userId);
      
      if (!userLimit || now > userLimit.resetTime) {
        // Reset or initialize user limit
        userRequests.set(userId, {
          count: 1,
          resetTime: now + windowMs
        });
        next();
        return;
      }

      if (userLimit.count >= maxRequests) {
        logger.logSecurity('Rate limit exceeded', {
          userId,
          count: userLimit.count,
          maxRequests
        });

        res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
        });
        return;
      }

      userLimit.count++;
      next();
    };
  }
}

// Export commonly used middleware
export const requireAuth = AuthMiddleware.verifyFirebaseToken;
export const optionalAuth = AuthMiddleware.optionalAuth;
export const requirePermission = AuthMiddleware.hasPermission;
export const userRateLimit = AuthMiddleware.userRateLimit();

export default AuthMiddleware;
