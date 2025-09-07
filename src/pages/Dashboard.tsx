"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Filter, Calendar, BarChart3, Mic, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "@/components/Container";
import Button from "@/components/Button";
import SearchInput from "@/components/SearchInput";
import SummaryCard from "@/components/SummaryCard";
import EmptyState from "@/components/EmptyState";
import Badge from "@/components/Badge";

// Mock data
const mockSummaries = [
  {
    id: "1",
    title: "Building Systems for Success",
    show: "The Tim Ferriss Show",
    duration: 4020, // 67 minutes
    date: "2024-01-15",
    excerpt: "Derek Sivers shares insights on building systems over goals, the power of saying no, and creating sustainable wealth through ownership and problem-solving.",
    tags: ["entrepreneurship", "systems", "productivity"],
    source: "spotify" as const,
    coverUrl: "",
  },
  {
    id: "2", 
    title: "The Future of AI in Healthcare",
    show: "a16z Podcast",
    duration: 2700, // 45 minutes
    date: "2024-01-12",
    excerpt: "Discussion on how artificial intelligence is transforming healthcare, from diagnostic tools to personalized treatment plans and drug discovery.",
    tags: ["AI", "healthcare", "technology"],
    source: "apple" as const,
    coverUrl: "",
  },
  {
    id: "3",
    title: "Scaling Engineering Teams",
    show: "Software Engineering Daily",
    duration: 1980, // 33 minutes  
    date: "2024-01-10",
    excerpt: "Best practices for growing engineering organizations, managing technical debt, and maintaining code quality at scale.",
    tags: ["engineering", "leadership", "scaling"],
    source: "rss" as const,
    coverUrl: "",
  },
];

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search logic
  };

  const filteredSummaries = mockSummaries.filter((summary) => {
    const matchesSearch = summary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         summary.show.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         summary.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // TODO: Add filter logic for selectedFilter
    return matchesSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-12">
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Your Summaries
            </h1>
            <p className="text-lg text-ink-300">
              {mockSummaries.length} podcasts summarized
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/upload">
              <Button variant="hero" className="w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                New Summary
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-600/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-ink-100">{mockSummaries.length}</p>
                <p className="text-sm text-ink-400">Total Summaries</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-ink-100">24h</p>
                <p className="text-sm text-ink-400">Time Saved</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-ink-100">12</p>
                <p className="text-sm text-ink-400">Shows Tracked</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col lg:flex-row gap-4 mb-8"
        >
          <div className="flex-1">
            <SearchInput
              placeholder="Search summaries..."
              onSearch={handleSearch}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="whitespace-nowrap"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              Date Range
            </Button>
          </div>
        </motion.div>

        {/* Filter Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {["all", "recent", "favorites", "technology", "business", "health"].map((filter) => (
            <Badge
              key={filter}
              variant={selectedFilter === filter ? "primary" : "outline"}
              className="cursor-pointer hover:border-brand-500 transition-colors"
              onClick={() => setSelectedFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Badge>
          ))}
        </motion.div>

        {/* Summaries Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {filteredSummaries.length > 0 ? (
            filteredSummaries.map((summary, index) => (
              <motion.div
                key={summary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <SummaryCard
                  {...summary}
                  onClick={() => {
                    // TODO: Navigate to summary detail page
                    console.log("View summary:", summary.id);
                  }}
                />
              </motion.div>
            ))
          ) : (
            <EmptyState
              icon={<Mic className="w-8 h-8" />}
              title="No summaries found"
              description={
                searchQuery
                  ? `No summaries match "${searchQuery}". Try adjusting your search terms.`
                  : "You haven't created any podcast summaries yet. Upload your first podcast to get started."
              }
              action={
                <Link to="/upload">
                  <Button variant="hero">
                    <Plus className="w-4 h-4" />
                    Create First Summary
                  </Button>
                </Link>
              }
            />
          )}
        </motion.div>
      </Container>
    </div>
  );
};

export default Dashboard;