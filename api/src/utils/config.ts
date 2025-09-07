import dotenv from 'dotenv';
import path from 'path';
import { Config } from '../types';

// Load environment variables
dotenv.config();

const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
};

const getEnvNumber = (name: string, defaultValue: number): number => {
  const value = process.env[name];
  if (!value) return defaultValue;
  
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }
  return parsed;
};

const getEnvBoolean = (name: string, defaultValue: boolean): boolean => {
  const value = process.env[name];
  if (!value) return defaultValue;
  
  return value.toLowerCase() === 'true';
};

const getEnvArray = (name: string, defaultValue: string[] = []): string[] => {
  const value = process.env[name];
  if (!value) return defaultValue;
  
  return value.split(',').map(item => item.trim());
};

// Validate required environment variables
const validateConfig = (): void => {
  const required = [
    'OPENAI_API_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'JWT_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Validate configuration
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}

const config: Config = {
  // Server configuration
  port: getEnvNumber('PORT', 3000),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  
  // CORS configuration
  corsOrigins: getEnvArray('CORS_ORIGINS', [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:5173'
  ]),
  
  // Upload configuration
  uploadDir: getEnvVar('UPLOAD_DIR', path.join(process.cwd(), 'uploads')),
  maxFileSize: getEnvNumber('MAX_FILE_SIZE', 100 * 1024 * 1024), // 100MB in bytes
  maxFileSizeMB: getEnvNumber('MAX_FILE_SIZE_MB', 100),
  allowedFileTypes: getEnvArray('ALLOWED_FILE_TYPES', [
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'audio/m4a',
    'audio/webm',
    'audio/ogg',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]),
  
  // OpenAI configuration
  openai: {
    apiKey: getEnvVar('OPENAI_API_KEY'),
    model: getEnvVar('OPENAI_MODEL', 'whisper-1'),
    maxTokens: getEnvNumber('OPENAI_MAX_TOKENS', 4000),
    temperature: parseFloat(getEnvVar('OPENAI_TEMPERATURE', '0.3'))
  },
  
  // Firebase configuration
  firebase: {
    projectId: getEnvVar('FIREBASE_PROJECT_ID'),
    clientEmail: getEnvVar('FIREBASE_CLIENT_EMAIL'),
    privateKey: getEnvVar('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    databaseURL: getEnvVar('FIREBASE_DATABASE_URL', `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`),
    storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET', `${process.env.FIREBASE_PROJECT_ID}.appspot.com`)
  },
  
  // JWT configuration
  jwt: {
    secret: getEnvVar('JWT_SECRET'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '7d')
  },
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 minutes
    max: getEnvNumber('RATE_LIMIT_MAX', 100) // 100 requests per window
  }
};

// Log configuration in development
if (config.nodeEnv === 'development') {
  console.log('🔧 Configuration loaded:', {
    port: config.port,
    nodeEnv: config.nodeEnv,
    corsOrigins: config.corsOrigins,
    uploadDir: config.uploadDir,
    maxFileSizeMB: config.maxFileSizeMB,
    openaiModel: config.openai.model,
    firebaseProjectId: config.firebase.projectId,
    jwtExpiresIn: config.jwt.expiresIn
  });
}

export default config;
