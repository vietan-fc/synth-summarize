"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, LogIn } from "lucide-react";
import Button from "./Button";

interface AuthGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Mock auth hook - replace with real Firebase auth
const useAuth = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check
    const timer = setTimeout(() => {
      // For demo purposes, simulate no user logged in
      setUser(null);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const signIn = async () => {
    // TODO: Implement Firebase Google Sign-In
    setLoading(true);
    setTimeout(() => {
      setUser({ name: "John Doe", email: "john@example.com" });
      setLoading(false);
    }, 1000);
  };

  const signOut = () => {
    // TODO: Implement Firebase sign out
    setUser(null);
  };

  return { user, loading, signIn, signOut };
};

const AuthGate = ({ children, fallback }: AuthGateProps) => {
  const { user, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-xl p-8 max-w-md w-full mx-4"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-brand-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-ink-100 mb-2">
              Sign In Required
            </h2>
            
            <p className="text-ink-400 mb-6">
              Please sign in to access this feature. We use Google Sign-In for secure, 
              hassle-free authentication.
            </p>
            
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={signIn}
            >
              <LogIn className="w-5 h-5" />
              Sign in with Google
            </Button>
            
            <p className="text-xs text-ink-500 mt-4">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGate;
export { useAuth };