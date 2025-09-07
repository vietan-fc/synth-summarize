import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

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

// Firestore collections
const SUMMARIES_COLLECTION = 'summaries';
const USERS_COLLECTION = 'users';

// Firestore functions
export const saveSummary = async (summary: Omit<Summary, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const summaryData = {
      ...summary,
      createdAt: Timestamp.now().toDate().toISOString()
    };
    
    const docRef = await addDoc(collection(db, SUMMARIES_COLLECTION), summaryData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving summary:', error);
    throw error;
  }
};

export const getSummary = async (id: string): Promise<Summary | null> => {
  try {
    const docRef = doc(db, SUMMARIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Summary;
    }
    return null;
  } catch (error) {
    console.error('Error getting summary:', error);
    // Fallback to mock data in case of Firebase errors
    return mockSummaries.find(s => s.id === id) || null;
  }
};

export const listSummaries = async (uid: string, options?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ summaries: Summary[]; total: number }> => {
  try {
    const summariesRef = collection(db, SUMMARIES_COLLECTION);
    let q = query(
      summariesRef,
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    );

    if (options?.limit) {
      q = query(q, limit(options.limit));
    }

    const querySnapshot = await getDocs(q);
    let summaries = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Summary[];

    // Client-side search filtering (for simplicity)
    if (options?.search) {
      const search = options.search.toLowerCase();
      summaries = summaries.filter(s => 
        s.title.toLowerCase().includes(search) ||
        s.show.toLowerCase().includes(search) ||
        s.topics.some(topic => topic.toLowerCase().includes(search))
      );
    }

    return {
      summaries,
      total: summaries.length
    };
  } catch (error) {
    console.error('Error listing summaries:', error);
    // Fallback to mock data
    let filtered = mockSummaries.filter(s => s.uid === uid);
    
    if (options?.search) {
      const search = options.search.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(search) ||
        s.show.toLowerCase().includes(search) ||
        s.topics.some(topic => topic.toLowerCase().includes(search))
      );
    }
    
    return {
      summaries: filtered,
      total: filtered.length
    };
  }
};

export const deleteSummary = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, SUMMARIES_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting summary:', error);
    throw error;
  }
};

export const saveUser = async (user: Omit<User, 'createdAt'>): Promise<void> => {
  try {
    const userData = {
      ...user,
      createdAt: Timestamp.now().toDate().toISOString()
    };
    
    await setDoc(doc(db, USERS_COLLECTION, user.uid), userData);
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

export const getUser = async (uid: string): Promise<User | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    // Fallback to mock data
    return {
      uid,
      email: "user@example.com",
      displayName: "Mock User",
      createdAt: "2024-01-01T00:00:00Z",
      summaryCount: mockSummaries.length,
      storageUsed: 1024 * 1024 * 50 // 50MB
    };
  }
};