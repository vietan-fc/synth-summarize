"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Mic, User, Home, BarChart3, LogOut } from "lucide-react";
import Container from "./Container";
import Button from "./Button";
import Avatar from "./Avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Upload", href: "/upload", icon: Mic },
  { name: "Profile", href: "/profile", icon: User },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const { user, signIn, signOut } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-ink-700/50">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 focus-ring rounded-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 glow-brand">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">PodSum</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-ring",
                    isActive
                      ? "text-brand-400 bg-brand-900/20"
                      : "text-ink-300 hover:text-brand-400 hover:bg-ink-800/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-brand-600/10 border border-brand-600/20"
                      layoutId="activeTab"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile">
                  <Avatar
                    src={user.photoURL}
                    fallback={user.displayName || user.email}
                    size="sm"
                    className="cursor-pointer hover:ring-2 hover:ring-brand-600 transition-all"
                  />
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleSignIn}>
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
                <Link to="/upload">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-ink-300 hover:text-brand-400 hover:bg-ink-800/50 focus-ring"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-ink-700/50"
          >
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium focus-ring",
                      isActive
                        ? "text-brand-400 bg-brand-900/20"
                        : "text-ink-300 hover:text-brand-400 hover:bg-ink-800/50"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 pt-4 border-t border-ink-700/50 space-y-2">
              {user ? (
                <div className="space-y-2">
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Avatar
                        src={user.photoURL}
                        fallback={user.displayName || user.email}
                        size="xs"
                      />
                      Profile
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignIn}>
                    <User className="h-4 w-4" />
                    Sign In
                  </Button>
                  <Link to="/upload" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </Container>
    </header>
  );
};

export default Header;