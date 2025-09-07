import { Request } from 'express';

// User types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication
export interface AuthRequest extends Request {
  user?: User;
}

export interface JWTPayload {
  uid: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Upload types
export type UploadType = 'file' | 'url';
export type DetailLevel = 'brief' | 'standard' | 'deep';

export interface UploadOptions {
  lang?: string;
  detail: DetailLevel;
  timestamps: boolean;
}

export interface UploadRequest {
  type: UploadType;
  file?: Express.Multer.File;
  url?: string;
  options: UploadOptions;
}

export interface UploadResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  message: string;
  estimatedTime?: number;
}

// Processing job types
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface ProcessingJob {
  id: string;
  userId: string;
  type: UploadType;
  status: JobStatus;
  progress: number;
  originalFile?: string;
  url?: string;
  options: UploadOptions;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  progress: number;
  message?: string;
  error?: string;
  result?: Summary;
}

// Summary types
export interface Timestamp {
  start: number;
  end: number;
  text: string;
  confidence?: number;
}

export interface KeyPoint {
  title: string;
  description: string;
  timestamp?: number;
  importance: 'high' | 'medium' | 'low';
}

export interface Speaker {
  id: string;
  name?: string;
  speakingTime: number;
  segments: Timestamp[];
}

export interface Chapter {
  title: string;
  start: number;
  end: number;
  summary: string;
  keyPoints: string[];
}

export interface Summary {
  id: string;
  userId: string;
  jobId: string;
  title: string;
  description?: string;
  originalUrl?: string;
  originalFileName?: string;
  duration: number;
  language: string;
  detailLevel: DetailLevel;
  
  // Summary content
  overview: string;
  keyTakeaways: string[];
  keyPoints: KeyPoint[];
  actionItems: string[];
  quotes: string[];
  
  // Transcription data
  transcript: string;
  timestamps: Timestamp[];
  speakers?: Speaker[];
  chapters?: Chapter[];
  
  // Metadata
  processingTime: number;
  wordCount: number;
  confidence: number;
  tags: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSummaryRequest {
  title: string;
  description?: string;
  tags?: string[];
}

export interface UpdateSummaryRequest {
  title?: string;
  description?: string;
  tags?: string[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SummaryListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'createdAt' | 'updatedAt' | 'title' | 'duration';
  order?: 'asc' | 'desc';
  tags?: string[];
  language?: string;
  detailLevel?: DetailLevel;
}

// Error types
export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  validation?: ValidationError[];
}

// OpenAI types
export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface TranscriptionRequest {
  audioFile: Buffer;
  language?: string;
  prompt?: string;
}

export interface TranscriptionResponse {
  text: string;
  language: string;
  duration: number;
  segments?: Timestamp[];
  confidence: number;
}

export interface SummarizationRequest {
  transcript: string;
  detailLevel: DetailLevel;
  options: UploadOptions;
  metadata?: {
    title?: string;
    duration?: number;
    language?: string;
  };
}

export interface SummarizationResponse {
  overview: string;
  keyTakeaways: string[];
  keyPoints: KeyPoint[];
  actionItems: string[];
  quotes: string[];
  chapters?: Chapter[];
  tags: string[];
  confidence: number;
}

// File processing types
export interface AudioMetadata {
  format: string;
  duration: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  size: number;
}

export interface ProcessingOptions {
  convertToWav?: boolean;
  normalizeAudio?: boolean;
  removeNoise?: boolean;
  maxSize?: number;
}

// Health check types
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: 'connected' | 'disconnected' | 'error';
    openai: 'available' | 'unavailable' | 'error';
    storage: 'accessible' | 'inaccessible' | 'error';
  };
  system: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

// Configuration types
export interface Config {
  port: number;
  nodeEnv: string;
  corsOrigins: string[];
  uploadDir: string;
  maxFileSize: number;
  maxFileSizeMB: number;
  allowedFileTypes: string[];
  
  // OpenAI configuration
  openai: OpenAIConfig;
  
  // Firebase configuration
  firebase: {
    projectId: string;
    clientEmail: string;
    privateKey: string;
    databaseURL: string;
    storageBucket: string;
  };
  
  // JWT configuration
  jwt: {
    secret: string;
    expiresIn: string;
  };
  
  // Rate limiting
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

export default {
  User,
  AuthRequest,
  JWTPayload,
  UploadType,
  DetailLevel,
  UploadOptions,
  UploadRequest,
  UploadResponse,
  ProcessingJob,
  JobStatus,
  JobStatusResponse,
  Summary,
  CreateSummaryRequest,
  UpdateSummaryRequest,
  ApiResponse,
  PaginatedResponse,
  SummaryListQuery,
  ApiError,
  ValidationError,
  ErrorResponse,
  OpenAIConfig,
  TranscriptionRequest,
  TranscriptionResponse,
  SummarizationRequest,
  SummarizationResponse,
  AudioMetadata,
  ProcessingOptions,
  HealthStatus,
  Config
};
