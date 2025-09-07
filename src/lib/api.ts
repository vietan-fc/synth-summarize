// Mock API client functions
// TODO: Replace with actual API calls

export interface UploadRequest {
  type: 'file' | 'url';
  file?: File;
  url?: string;
  options?: {
    lang?: string;
    detail?: 'brief' | 'standard' | 'deep';
    timestamps?: boolean;
  };
}

export interface UploadResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
}

export interface SummaryResponse {
  id: string;
  title: string;
  show: string;
  episode: string;
  duration: number;
  date: string;
  source: string;
  coverUrl?: string;
  summary: {
    keyTakeaways: string[];
    paragraphs: string[];
    timestamps: { time: string; topic: string }[];
    topics: string[];
    people: string[];
    chapters: { title: string; start: string }[];
  };
  metadata: {
    transcriptLength: number;
    processingTime: string;
    model: string;
  };
}

export interface SummariesResponse {
  summaries: SummaryResponse[];
  total: number;
  page: number;
  limit: number;
}

// Mock API functions
export const uploadPodcast = async (request: UploadRequest): Promise<UploadResponse> => {
  // TODO: Implement actual API call to /api/upload
  console.log("uploadPodcast - TODO: Implement API call", request);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    jobId: `job_${Date.now()}`,
    status: 'pending',
    progress: 0,
    message: 'Upload initiated'
  };
};

export const getJobStatus = async (jobId: string): Promise<UploadResponse> => {
  // TODO: Implement actual API call to /api/jobs/:id
  console.log("getJobStatus - TODO: Implement API call", jobId);
  
  // Simulate job progression
  const progress = Math.min(100, (Date.now() % 10000) / 100);
  const status = progress >= 100 ? 'completed' : 'processing';
  
  return {
    jobId,
    status,
    progress,
    message: status === 'completed' ? 'Summary ready' : 'Processing audio...'
  };
};

export const getSummary = async (id: string): Promise<SummaryResponse> => {
  // TODO: Implement actual API call to /api/summaries/:id
  console.log("getSummary - TODO: Implement API call", id);
  
  // Mock summary data
  return {
    id,
    title: "Building Systems for Success",
    show: "The Tim Ferriss Show",
    episode: "Derek Sivers on The Power of Systems",
    duration: 4020,
    date: "2024-01-15",
    source: "spotify",
    coverUrl: "",
    summary: {
      keyTakeaways: [
        "Focus on systems over goals - goals have an end point, systems create lasting change",
        "The importance of saying no to preserve energy for what truly matters",
        "Building wealth through ownership and solving real problems for people"
      ],
      paragraphs: [
        "Derek Sivers emphasizes the transformative power of thinking in systems rather than goals.",
        "The discussion reveals how successful entrepreneurs maintain focus by saying no."
      ],
      timestamps: [
        { time: "00:05:30", topic: "Introduction to systems thinking" },
        { time: "00:18:45", topic: "The art of saying no" }
      ],
      topics: ["entrepreneurship", "systems thinking", "productivity"],
      people: ["Derek Sivers", "Tim Ferriss"],
      chapters: [
        { title: "Systems vs Goals", start: "00:00:00" },
        { title: "The Power of No", start: "00:15:30" }
      ]
    },
    metadata: {
      transcriptLength: 15420,
      processingTime: "2.3 seconds",
      model: "GPT-4 Turbo"
    }
  };
};

export const getSummaries = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<SummariesResponse> => {
  // TODO: Implement actual API call to /api/summaries
  console.log("getSummaries - TODO: Implement API call", params);
  
  // Mock summaries data
  const mockSummaries = [
    {
      id: "1",
      title: "Building Systems for Success",
      show: "The Tim Ferriss Show",
      episode: "Derek Sivers Episode",
      duration: 4020,
      date: "2024-01-15",
      source: "spotify",
      summary: {
        keyTakeaways: ["Systems over goals", "The power of no"],
        paragraphs: ["Systems thinking discussion"],
        timestamps: [],
        topics: ["entrepreneurship"],
        people: ["Derek Sivers"],
        chapters: []
      },
      metadata: {
        transcriptLength: 15420,
        processingTime: "2.3s",
        model: "GPT-4"
      }
    }
  ];
  
  return {
    summaries: mockSummaries,
    total: mockSummaries.length,
    page: params?.page || 1,
    limit: params?.limit || 10
  };
};

// Error handling wrapper
export const apiRequest = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};