"use client";

import { motion } from "framer-motion";
import { User, Settings, BarChart3, Download, Trash2, LogOut } from "lucide-react";
import Container from "@/components/Container";
import Button from "@/components/Button";
import Avatar from "@/components/Avatar";
import Badge from "@/components/Badge";
import AuthGate from "@/components/AuthGate";
import SummaryCard from "@/components/SummaryCard";
import { formatFileSize, formatNumber } from "@/lib/formatting";

// Mock user data
const mockUser = {
  uid: "mock-uid",
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "",
  joinedDate: "2024-01-01",
  plan: "Pro",
  stats: {
    summariesCreated: 42,
    totalListeningTime: 25 * 60 * 60, // 25 hours in seconds
    storageUsed: 1024 * 1024 * 150, // 150MB
    storageLimit: 1024 * 1024 * 1024, // 1GB
  },
};

const recentSummaries = [
  {
    id: "1",
    title: "Building Systems for Success",
    show: "The Tim Ferriss Show",
    duration: 4020,
    date: "2024-01-15",
    excerpt: "Derek Sivers shares insights on building systems over goals...",
    tags: ["entrepreneurship", "systems"],
    source: "spotify" as const,
  },
  {
    id: "2",
    title: "The Future of AI",
    show: "a16z Podcast",
    duration: 2700,
    date: "2024-01-12",
    excerpt: "Discussion on AI transforming various industries...",
    tags: ["AI", "technology"],
    source: "apple" as const,
  },
];

const Profile = () => {
  const handleExportData = () => {
    // TODO: Implement data export
    console.log("Export user data");
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion with confirmation
    console.log("Delete account");
  };

  const handleSignOut = () => {
    // TODO: Implement sign out
    console.log("Sign out");
  };

  return (
    <AuthGate>
      <div className="min-h-screen pt-24 pb-12">
        <Container>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Profile & Settings
            </h1>
            <p className="text-lg text-ink-300">
              Manage your account and view your usage statistics
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel rounded-xl p-6 mb-6"
              >
                <div className="text-center mb-6">
                  <Avatar
                    src={mockUser.avatar}
                    fallback={mockUser.name}
                    size="xl"
                    className="mx-auto mb-4"
                  />
                  <h2 className="text-xl font-semibold text-ink-100 mb-1">
                    {mockUser.name}
                  </h2>
                  <p className="text-ink-400 mb-3">{mockUser.email}</p>
                  <Badge variant="primary">{mockUser.plan} Plan</Badge>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-400">Member since</span>
                    <span className="text-ink-200">
                      {new Date(mockUser.joinedDate).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Usage Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-ink-100 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Usage Statistics
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-ink-400 text-sm">Summaries Created</span>
                      <span className="text-ink-100 font-medium">
                        {formatNumber(mockUser.stats.summariesCreated)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-ink-400 text-sm">Time Saved</span>
                      <span className="text-ink-100 font-medium">
                        {Math.round(mockUser.stats.totalListeningTime / 3600)}h
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-ink-400 text-sm">Storage Used</span>
                      <span className="text-ink-100 font-medium">
                        {formatFileSize(mockUser.stats.storageUsed)} / {formatFileSize(mockUser.stats.storageLimit)}
                      </span>
                    </div>
                    <div className="w-full bg-ink-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-brand-500 to-brand-600 h-2 rounded-full"
                        style={{
                          width: `${(mockUser.stats.storageUsed / mockUser.stats.storageLimit) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Account Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-ink-100 mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-ink-800/30">
                    <div>
                      <h4 className="font-medium text-ink-100">Email Notifications</h4>
                      <p className="text-sm text-ink-400">Receive updates about your summaries</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-brand-600 bg-ink-800 border-ink-600 rounded focus:ring-brand-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-ink-800/30">
                    <div>
                      <h4 className="font-medium text-ink-100">Auto-save Summaries</h4>
                      <p className="text-sm text-ink-400">Automatically save summaries to your account</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-brand-600 bg-ink-800 border-ink-600 rounded focus:ring-brand-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-ink-800/30">
                    <div>
                      <h4 className="font-medium text-ink-100">Default Summary Detail</h4>
                      <p className="text-sm text-ink-400">Choose your preferred summary length</p>
                    </div>
                    <select className="bg-ink-800 border border-ink-600 text-ink-100 text-sm rounded-lg px-3 py-1">
                      <option value="brief">Brief</option>
                      <option value="standard" selected>Standard</option>
                      <option value="deep">Deep</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Recent Summaries */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-panel rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-ink-100">
                    Recent Summaries
                  </h3>
                  <a href="/dashboard">
                    <Button variant="secondary" size="sm">
                      View All
                    </Button>
                  </a>
                </div>

                <div className="space-y-4">
                  {recentSummaries.map((summary) => (
                    <SummaryCard key={summary.id} {...summary} />
                  ))}
                </div>
              </motion.div>

              {/* Data & Privacy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-panel rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-ink-100 mb-6">
                  Data & Privacy
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-ink-800/30">
                    <div>
                      <h4 className="font-medium text-ink-100">Export Data</h4>
                      <p className="text-sm text-ink-400">Download all your summaries and data</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleExportData}>
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-error/5 border border-error/20">
                    <div>
                      <h4 className="font-medium text-ink-100">Delete Account</h4>
                      <p className="text-sm text-ink-400">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Sign Out */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </motion.div>
            </div>
          </div>
        </Container>
      </div>
    </AuthGate>
  );
};

export default Profile;