import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import ffmpeg from 'ffmpeg-static';
import {
  ProcessingJob,
  JobStatus,
  AudioMetadata,
  ProcessingOptions,
  UploadRequest,
  Summary,
  User
} from '../types';
import { openaiService } from './openai';
import { logger, measurePerformance, logErrors } from '../utils/logger';
import config from '../utils/config';

const execAsync = promisify(exec);

export class ProcessorService {
  private jobs = new Map<string, ProcessingJob>();
  private jobQueue: string[] = [];
  private isProcessing = false;

  /**
   * Create a new processing job
   */
  async createJob(user: User, request: UploadRequest): Promise<ProcessingJob> {
    const jobId = this.generateJobId();
    
    const job: ProcessingJob = {
      id: jobId,
      userId: user.id,
      type: request.type,
      status: 'queued',
      progress: 0,
      originalFile: request.file?.filename,
      url: request.url,
      options: request.options,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.jobs.set(jobId, job);
    this.jobQueue.push(jobId);

    logger.logProcessing('Job created', jobId, {
      userId: user.id,
      type: request.type,
      hasFile: !!request.file,
      hasUrl: !!request.url,
      options: request.options
    });

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    return job;
  }

  /**
   * Get job status
   */
  getJob(jobId: string): ProcessingJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Update job status
   */
  private updateJob(jobId: string, updates: Partial<ProcessingJob>): void {
    const job = this.jobs.get(jobId);
    if (job) {
      Object.assign(job, updates, { updatedAt: new Date() });
      this.jobs.set(jobId, job);
    }
  }

  /**
   * Process job queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.jobQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.jobQueue.length > 0) {
        const jobId = this.jobQueue.shift();
        if (jobId) {
          await this.processJob(jobId);
        }
      }
    } catch (error) {
      logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        'Queue processing failed'
      );
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single job
   */
  @measurePerformance('Job Processing')
  @logErrors('Processor Service')
  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      logger.logProcessing('Job not found', jobId);
      return;
    }

    try {
      this.updateJob(jobId, { status: 'processing', progress: 0 });
      logger.logProcessing('Job started', jobId);

      let audioFilePath: string;
      let shouldCleanup = false;

      // Step 1: Get audio file
      if (job.type === 'file' && job.originalFile) {
        audioFilePath = path.join(config.uploadDir, job.originalFile);
        this.updateJob(jobId, { progress: 10 });
      } else if (job.type === 'url' && job.url) {
        audioFilePath = await this.downloadAudioFromUrl(job.url, jobId);
        shouldCleanup = true;
        this.updateJob(jobId, { progress: 20 });
      } else {
        throw new Error('No valid audio source provided');
      }

      // Step 2: Validate and get metadata
      const metadata = await this.getAudioMetadata(audioFilePath);
      if (!metadata) {
        throw new Error('Unable to read audio metadata');
      }
      this.updateJob(jobId, { progress: 30 });

      // Step 3: Process audio if needed
      const processedAudioPath = await this.processAudio(audioFilePath, {
        convertToWav: true,
        normalizeAudio: true
      });
      this.updateJob(jobId, { progress: 50 });

      // Step 4: Transcribe audio
      const audioBuffer = fs.readFileSync(processedAudioPath);
      const transcription = await openaiService.transcribeAudio({
        audioFile: audioBuffer,
        language: job.options.lang
      });
      this.updateJob(jobId, { progress: 70 });

      // Step 5: Generate summary
      const summary = await openaiService.generateSummary({
        transcript: transcription.text,
        detailLevel: job.options.detail,
        options: job.options,
        metadata: {
          duration: transcription.duration,
          language: transcription.language
        }
      });
      this.updateJob(jobId, { progress: 90 });

      // Step 6: Create final summary object
      const finalSummary: Summary = {
        id: this.generateSummaryId(),
        userId: job.userId,
        jobId: job.id,
        title: this.generateTitle(summary.overview),
        originalUrl: job.url,
        originalFileName: job.originalFile,
        duration: transcription.duration,
        language: transcription.language,
        detailLevel: job.options.detail,
        
        overview: summary.overview,
        keyTakeaways: summary.keyTakeaways,
        keyPoints: summary.keyPoints,
        actionItems: summary.actionItems,
        quotes: summary.quotes,
        
        transcript: transcription.text,
        timestamps: transcription.segments || [],
        chapters: summary.chapters,
        
        processingTime: Date.now() - job.createdAt.getTime(),
        wordCount: transcription.text.split(/\s+/).length,
        confidence: Math.min(transcription.confidence, summary.confidence),
        tags: summary.tags,
        
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Step 7: Store summary (in a real app, this would go to a database)
      await this.storeSummary(finalSummary);

      // Clean up temporary files
      if (shouldCleanup && fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }
      if (processedAudioPath !== audioFilePath && fs.existsSync(processedAudioPath)) {
        fs.unlinkSync(processedAudioPath);
      }

      // Mark job as completed
      this.updateJob(jobId, { 
        status: 'completed', 
        progress: 100,
        completedAt: new Date()
      });

      logger.logProcessing('Job completed', jobId, {
        duration: Date.now() - job.createdAt.getTime(),
        summaryId: finalSummary.id,
        transcriptLength: transcription.text.length,
        confidence: finalSummary.confidence
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.updateJob(jobId, {
        status: 'failed',
        error: errorMessage
      });

      logger.logProcessing('Job failed', jobId, {
        error: errorMessage,
        duration: Date.now() - job.createdAt.getTime()
      });
    }
  }

  /**
   * Download audio from URL
   */
  @measurePerformance('Audio Download')
  private async downloadAudioFromUrl(url: string, jobId: string): Promise<string> {
    // For now, this is a placeholder implementation
    // In a real app, you would implement audio download from various sources
    throw new Error('URL download not implemented yet');
  }

  /**
   * Get audio metadata using FFprobe
   */
  @measurePerformance('Audio Metadata')
  private async getAudioMetadata(filePath: string): Promise<AudioMetadata | null> {
    try {
      const command = `"${ffmpeg}" -i "${filePath}" -f ffmetadata -`;
      const { stdout, stderr } = await execAsync(command);
      
      // Parse FFprobe output (simplified implementation)
      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      // Extract duration from stderr (FFmpeg outputs metadata to stderr)
      const durationMatch = stderr.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
      let duration = 0;
      if (durationMatch) {
        const hours = parseInt(durationMatch[1]);
        const minutes = parseInt(durationMatch[2]);
        const seconds = parseFloat(durationMatch[3]);
        duration = hours * 3600 + minutes * 60 + seconds;
      }

      return {
        format: ext.substring(1),
        duration,
        size: stats.size
      };
    } catch (error) {
      logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to get audio metadata',
        { filePath }
      );
      return null;
    }
  }

  /**
   * Process audio file (convert, normalize, etc.)
   */
  @measurePerformance('Audio Processing')
  private async processAudio(inputPath: string, options: ProcessingOptions = {}): Promise<string> {
    const { convertToWav = false, normalizeAudio = false } = options;
    
    // If no processing needed, return original path
    if (!convertToWav && !normalizeAudio) {
      return inputPath;
    }

    const outputPath = inputPath.replace(path.extname(inputPath), '_processed.wav');
    
    try {
      let command = `"${ffmpeg}" -i "${inputPath}"`;
      
      // Add audio processing filters
      if (normalizeAudio) {
        command += ' -af "loudnorm"';
      }
      
      // Convert to WAV with specific settings for Whisper
      if (convertToWav) {
        command += ' -acodec pcm_s16le -ac 1 -ar 16000';
      }
      
      command += ` "${outputPath}"`;
      
      logger.logProcessing('Processing audio', '', {
        inputPath,
        outputPath,
        command: command.replace(ffmpeg || '', 'ffmpeg')
      });

      await execAsync(command);
      
      return outputPath;
    } catch (error) {
      logger.logError(
        error instanceof Error ? error : new Error(String(error)),
        'Audio processing failed',
        { inputPath, outputPath }
      );
      
      // Return original path if processing fails
      return inputPath;
    }
  }

  /**
   * Store summary (placeholder - would use database in real app)
   */
  private async storeSummary(summary: Summary): Promise<void> {
    // In a real app, this would store to Firebase/database
    // For now, we'll just log it
    logger.logProcessing('Summary stored', summary.jobId, {
      summaryId: summary.id,
      userId: summary.userId,
      title: summary.title
    });
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate unique summary ID
   */
  private generateSummaryId(): string {
    return `summary_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate title from overview
   */
  private generateTitle(overview: string): string {
    // Extract first sentence or first 60 characters
    const firstSentence = overview.split('.')[0];
    if (firstSentence.length > 60) {
      return firstSentence.substring(0, 57) + '...';
    }
    return firstSentence + (overview.includes('.') ? '' : '...');
  }

  /**
   * Clean up old jobs
   */
  cleanupOldJobs(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      if (now - job.createdAt.getTime() > maxAgeMs) {
        this.jobs.delete(jobId);
        cleanedCount++;
      }
    }

    logger.logProcessing('Cleaned up old jobs', '', {
      cleanedCount,
      remainingJobs: this.jobs.size
    });

    return cleanedCount;
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      queueLength: this.jobQueue.length,
      totalJobs: this.jobs.size,
      isProcessing: this.isProcessing,
      jobs: Array.from(this.jobs.values()).map(job => ({
        id: job.id,
        status: job.status,
        progress: job.progress,
        createdAt: job.createdAt
      }))
    };
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'completed' || job.status === 'failed') {
      return false;
    }

    if (job.status === 'queued') {
      // Remove from queue
      const queueIndex = this.jobQueue.indexOf(jobId);
      if (queueIndex > -1) {
        this.jobQueue.splice(queueIndex, 1);
      }
    }

    this.updateJob(jobId, { status: 'failed', error: 'Cancelled by user' });
    
    logger.logProcessing('Job cancelled', jobId);
    return true;
  }
}

// Export singleton instance
export const processorService = new ProcessorService();
export default processorService;
