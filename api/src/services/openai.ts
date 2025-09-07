import OpenAI from 'openai';
import fs from 'fs';
import { 
  TranscriptionRequest, 
  TranscriptionResponse, 
  SummarizationRequest, 
  SummarizationResponse,
  DetailLevel,
  KeyPoint,
  Chapter 
} from '../types';
import config from '../utils/config';
import { logger, measurePerformance, logErrors } from '../utils/logger';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey
    });
  }

  /**
   * Transcribe audio file using Whisper
   */
  @measurePerformance('OpenAI Transcription')
  @logErrors('OpenAI Service')
  async transcribeAudio(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    const { audioFile, language, prompt } = request;

    try {
      logger.logOpenAI('Starting transcription', {
        audioSize: audioFile.length,
        language,
        hasPrompt: !!prompt
      });

      // Create a temporary file for the audio
      const tempFilePath = `/tmp/audio_${Date.now()}.wav`;
      fs.writeFileSync(tempFilePath, audioFile);

      try {
        const transcription = await this.client.audio.transcriptions.create({
          file: fs.createReadStream(tempFilePath),
          model: 'whisper-1',
          language: language || undefined,
          prompt: prompt || undefined,
          response_format: 'verbose_json',
          timestamp_granularities: ['segment']
        });

        // Clean up temp file
        fs.unlinkSync(tempFilePath);

        // Process the response
        const segments = transcription.segments?.map(segment => ({
          start: segment.start,
          end: segment.end,
          text: segment.text.trim(),
          confidence: segment.avg_logprob ? Math.exp(segment.avg_logprob) : undefined
        })) || [];

        const response: TranscriptionResponse = {
          text: transcription.text,
          language: transcription.language || language || 'en',
          duration: transcription.duration || 0,
          segments,
          confidence: this.calculateOverallConfidence(segments)
        };

        logger.logOpenAI('Transcription completed', {
          textLength: response.text.length,
          segmentsCount: segments.length,
          duration: response.duration,
          confidence: response.confidence
        });

        return response;
      } catch (apiError) {
        // Clean up temp file on error
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        throw apiError;
      }
    } catch (error) {
      logger.logOpenAI('Transcription failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate summary using GPT
   */
  @measurePerformance('OpenAI Summarization')
  @logErrors('OpenAI Service')
  async generateSummary(request: SummarizationRequest): Promise<SummarizationResponse> {
    const { transcript, detailLevel, options, metadata } = request;

    try {
      logger.logOpenAI('Starting summarization', {
        transcriptLength: transcript.length,
        detailLevel,
        language: options.lang,
        timestamps: options.timestamps
      });

      const systemPrompt = this.buildSystemPrompt(detailLevel, options);
      const userPrompt = this.buildUserPrompt(transcript, metadata);

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: config.openai.maxTokens,
        temperature: config.openai.temperature,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(content);
      } catch (parseError) {
        throw new Error('Invalid JSON response from OpenAI');
      }

      const response: SummarizationResponse = {
        overview: parsedResponse.overview || '',
        keyTakeaways: parsedResponse.keyTakeaways || [],
        keyPoints: this.processKeyPoints(parsedResponse.keyPoints || []),
        actionItems: parsedResponse.actionItems || [],
        quotes: parsedResponse.quotes || [],
        chapters: options.timestamps ? this.processChapters(parsedResponse.chapters || []) : undefined,
        tags: parsedResponse.tags || [],
        confidence: this.calculateSummaryConfidence(completion.choices[0])
      };

      logger.logOpenAI('Summarization completed', {
        overviewLength: response.overview.length,
        keyTakeawaysCount: response.keyTakeaways.length,
        keyPointsCount: response.keyPoints.length,
        actionItemsCount: response.actionItems.length,
        quotesCount: response.quotes.length,
        chaptersCount: response.chapters?.length || 0,
        tagsCount: response.tags.length,
        confidence: response.confidence,
        tokensUsed: completion.usage?.total_tokens
      });

      return response;
    } catch (error) {
      logger.logOpenAI('Summarization failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`Summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build system prompt based on detail level and options
   */
  private buildSystemPrompt(detailLevel: DetailLevel, options: any): string {
    const basePrompt = `You are an expert podcast summarizer. Your task is to analyze podcast transcripts and create comprehensive, actionable summaries.

Response format: Return a valid JSON object with the following structure:
{
  "overview": "A comprehensive overview of the podcast content",
  "keyTakeaways": ["Array of 3-7 main takeaways"],
  "keyPoints": [{"title": "Point title", "description": "Detailed description", "importance": "high|medium|low", "timestamp": 123}],
  "actionItems": ["Array of actionable items listeners can implement"],
  "quotes": ["Array of notable quotes from the podcast"],
  "chapters": [{"title": "Chapter title", "start": 0, "end": 300, "summary": "Chapter summary", "keyPoints": ["key point 1", "key point 2"]}],
  "tags": ["Array of relevant tags/topics"]
}`;

    const detailInstructions = {
      brief: `Keep the summary concise and focused on the most important points. Limit keyTakeaways to 3-5 items, keyPoints to 5-8 items, and actionItems to 3-5 items.`,
      standard: `Provide a balanced summary with good coverage of the content. Include 5-7 keyTakeaways, 8-12 keyPoints, and 5-8 actionItems.`,
      deep: `Create a comprehensive, detailed summary. Include 7-10 keyTakeaways, 12-20 keyPoints, 8-12 actionItems, and detailed chapter breakdowns.`
    };

    let prompt = `${basePrompt}\n\nDetail Level: ${detailLevel.toUpperCase()}\n${detailInstructions[detailLevel]}`;

    if (options.timestamps) {
      prompt += `\n\nInclude timestamp information where available. Use the timestamp data to create meaningful chapters and link key points to specific moments in the podcast.`;
    }

    if (options.lang && options.lang !== 'en') {
      prompt += `\n\nThe podcast language is ${options.lang}. Ensure your summary captures cultural context and language-specific nuances.`;
    }

    return prompt;
  }

  /**
   * Build user prompt with transcript and metadata
   */
  private buildUserPrompt(transcript: string, metadata?: any): string {
    let prompt = `Please analyze the following podcast transcript and create a summary:\n\n`;

    if (metadata?.title) {
      prompt += `Podcast Title: ${metadata.title}\n`;
    }

    if (metadata?.duration) {
      prompt += `Duration: ${Math.round(metadata.duration / 60)} minutes\n`;
    }

    if (metadata?.language) {
      prompt += `Language: ${metadata.language}\n`;
    }

    prompt += `\nTranscript:\n${transcript}`;

    return prompt;
  }

  /**
   * Process key points from OpenAI response
   */
  private processKeyPoints(keyPoints: any[]): KeyPoint[] {
    return keyPoints.map(point => ({
      title: point.title || '',
      description: point.description || '',
      timestamp: point.timestamp || undefined,
      importance: (point.importance as 'high' | 'medium' | 'low') || 'medium'
    }));
  }

  /**
   * Process chapters from OpenAI response
   */
  private processChapters(chapters: any[]): Chapter[] {
    return chapters.map(chapter => ({
      title: chapter.title || '',
      start: chapter.start || 0,
      end: chapter.end || 0,
      summary: chapter.summary || '',
      keyPoints: chapter.keyPoints || []
    }));
  }

  /**
   * Calculate overall confidence from segments
   */
  private calculateOverallConfidence(segments: any[]): number {
    if (!segments || segments.length === 0) return 0.8; // Default confidence

    const confidences = segments
      .map(segment => segment.confidence)
      .filter(confidence => confidence !== undefined);

    if (confidences.length === 0) return 0.8;

    const average = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    return Math.round(average * 100) / 100;
  }

  /**
   * Calculate summary confidence based on completion quality
   */
  private calculateSummaryConfidence(choice: any): number {
    // Basic confidence calculation based on finish reason and presence of content
    if (choice.finish_reason === 'stop') return 0.95;
    if (choice.finish_reason === 'length') return 0.8;
    return 0.7;
  }

  /**
   * Test OpenAI API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.models.list();
      return response.data.length > 0;
    } catch (error) {
      logger.logOpenAI('Connection test failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.client.models.list();
      return response.data
        .filter(model => model.id.includes('whisper') || model.id.includes('gpt'))
        .map(model => model.id);
    } catch (error) {
      logger.logOpenAI('Failed to get models', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  /**
   * Estimate token count for text
   */
  estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if text would exceed token limits
   */
  validateTokenLimits(transcript: string): { valid: boolean; estimatedTokens: number; maxTokens: number } {
    const estimatedTokens = this.estimateTokenCount(transcript);
    const maxTokens = 32000; // Conservative limit for GPT-4
    
    return {
      valid: estimatedTokens < maxTokens,
      estimatedTokens,
      maxTokens
    };
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();
export default openaiService;
