// Mock Firestore operations
// TODO: Replace with actual Firestore implementation

export interface Summary {
  id: string;
  uid: string;
  title: string;
  show: string;
  durationSec: number;
  source: string;
  url: string;
  createdAt: string;
  detailLevel: 'brief' | 'standard' | 'deep';
  bullets: string[];
  paragraphs: string[];
  chapters: { title: string; start: string }[];
  topics: string[];
  people: string[];
  transcriptChars: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  summaryCount: number;
  storageUsed: number;
}

// Mock data
const mockSummaries: Summary[] = [
  {
    id: "1",
    uid: "mock-uid",
    title: "Building Systems for Success",
    show: "The Tim Ferriss Show",
    durationSec: 4020,
    source: "spotify",
    url: "https://spotify.com/mock",
    createdAt: "2024-01-15T10:00:00Z",
    detailLevel: "standard",
    bullets: [
      "Focus on systems over goals",
      "The importance of saying no",
      "Building wealth through ownership"
    ],
    paragraphs: [
      "Derek Sivers emphasizes the transformative power of thinking in systems rather than goals.",
      "The discussion reveals how successful entrepreneurs maintain focus by saying no."
    ],
    chapters: [
      { title: "Introduction", start: "00:00:00" },
      { title: "Systems vs Goals", start: "00:15:30" }
    ],
    topics: ["entrepreneurship", "systems", "productivity"],
    people: ["Derek Sivers", "Tim Ferriss"],
    transcriptChars: 15420
  }
];

// Mock Firestore functions
export const saveSummary = async (summary: Omit<Summary, 'id' | 'createdAt'>): Promise<string> => {
  // TODO: Implement Firestore saveSummary
  console.log("saveSummary - TODO: Implement Firestore operation", summary);
  return Promise.resolve("mock-summary-id");
};

export const getSummary = async (id: string): Promise<Summary | null> => {
  // TODO: Implement Firestore getSummary
  console.log("getSummary - TODO: Implement Firestore operation", id);
  return Promise.resolve(mockSummaries.find(s => s.id === id) || null);
};

export const listSummaries = async (uid: string, options?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ summaries: Summary[]; total: number }> => {
  // TODO: Implement Firestore listSummaries with pagination and search
  console.log("listSummaries - TODO: Implement Firestore operation", uid, options);
  
  let filtered = mockSummaries.filter(s => s.uid === uid);
  
  if (options?.search) {
    const search = options.search.toLowerCase();
    filtered = filtered.filter(s => 
      s.title.toLowerCase().includes(search) ||
      s.show.toLowerCase().includes(search) ||
      s.topics.some(topic => topic.toLowerCase().includes(search))
    );
  }
  
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return Promise.resolve({
    summaries: filtered.slice(start, end),
    total: filtered.length
  });
};

export const deleteSummary = async (id: string): Promise<void> => {
  // TODO: Implement Firestore deleteSummary
  console.log("deleteSummary - TODO: Implement Firestore operation", id);
  return Promise.resolve();
};

export const saveUser = async (user: Omit<User, 'createdAt'>): Promise<void> => {
  // TODO: Implement Firestore saveUser
  console.log("saveUser - TODO: Implement Firestore operation", user);
  return Promise.resolve();
};

export const getUser = async (uid: string): Promise<User | null> => {
  // TODO: Implement Firestore getUser
  console.log("getUser - TODO: Implement Firestore operation", uid);
  return Promise.resolve({
    uid,
    email: "user@example.com",
    displayName: "Mock User",
    createdAt: "2024-01-01T00:00:00Z",
    summaryCount: mockSummaries.length,
    storageUsed: 1024 * 1024 * 50 // 50MB
  });
};