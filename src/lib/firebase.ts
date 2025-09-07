// Mock Firebase configuration
// TODO: Replace with actual Firebase config

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "podsum-mock.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "podsum-mock",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "podsum-mock.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:mock"
};

// Mock Firebase app initialization
class MockFirebaseApp {
  name = "default";
  options = firebaseConfig;
}

// Mock auth functions
export const signInWithGoogle = async () => {
  // TODO: Implement Firebase Google Sign-In
  console.log("Sign in with Google - TODO: Implement Firebase auth");
  return Promise.resolve({
    user: {
      uid: "mock-uid",
      email: "user@example.com",
      displayName: "Mock User",
      photoURL: null
    }
  });
};

export const signOut = async () => {
  // TODO: Implement Firebase sign out
  console.log("Sign out - TODO: Implement Firebase auth");
  return Promise.resolve();
};

export const useAuth = () => {
  // TODO: Implement Firebase auth state listener
  console.log("useAuth - TODO: Implement Firebase auth hook");
  return {
    user: null,
    loading: false,
    signIn: signInWithGoogle,
    signOut
  };
};

// Export mock app
export const app = new MockFirebaseApp();

export default firebaseConfig;