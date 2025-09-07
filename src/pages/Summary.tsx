"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Copy, Download, Share2, RotateCcw, Clock, Calendar, ExternalLink, CheckCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Container from "@/components/Container";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import { useCopyShortcut, useDownloadShortcut } from "@/hooks/use-keyboard-shortcuts";
import { toast } from "@/hooks/use-toast";

// Mock data for a summary
const mockSummary = {
  id: "1",
  title: "Building Systems for Success",
  show: "The Tim Ferriss Show",
  episode: "Derek Sivers on The Power of Systems",
  duration: 4020, // 67 minutes
  date: "2024-01-15",
  source: "spotify",
  coverUrl: "",
  transcriptLength: 15420,
  processingTime: "2.3 seconds",
  model: "GPT-4 Turbo",
  summary: {
    keyTakeaways: [
      "Focus on systems over goals - goals have an end point, systems create lasting change",
      "The importance of saying no to preserve energy for what truly matters",
      "Building wealth through ownership and solving real problems for people",
      "Start with extreme constraints to force creative solutions",
      "Question assumptions and conventional wisdom regularly"
    ],
    paragraphs: [
      "Derek Sivers emphasizes the transformative power of thinking in systems rather than goals. While goals provide direction, systems provide the sustainable framework for continuous improvement and long-term success.",
      "The discussion reveals how successful entrepreneurs and creators maintain focus by aggressively saying no to opportunities that don't align with their core mission. This selective approach preserves energy and resources for what matters most.",
      "Building real wealth comes from creating genuine value for others through ownership of assets, intellectual property, or businesses that solve meaningful problems. The key is finding the intersection of personal passion and market demand."
    ],
    timestamps: [
      { time: "00:05:30", topic: "Introduction to systems thinking" },
      { time: "00:18:45", topic: "The art of saying no" },
      { time: "00:32:10", topic: "Building sustainable wealth" },
      { time: "00:45:20", topic: "Creative constraints" },
      { time: "00:58:15", topic: "Questioning assumptions" }
    ],
    topics: ["entrepreneurship", "systems thinking", "wealth building", "productivity", "decision making"],
    people: ["Derek Sivers", "Tim Ferriss"],
    chapters: [
      { title: "Systems vs Goals", start: "00:00:00" },
      { title: "The Power of No", start: "00:15:30" },
      { title: "Creating Value", start: "00:30:00" },
      { title: "Constraints and Creativity", start: "00:42:00" },
      { title: "Final Thoughts", start: "00:55:00" }
    ]
  }
};

const Summary = () => {
  const { id } = useParams();
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCopy = async () => {
    try {
      const summaryText = [
        `# ${mockSummary.title}`,
        `**Show**: ${mockSummary.show}`,
        `**Episode**: ${mockSummary.episode}`,
        `**Duration**: ${formatDuration(mockSummary.duration)}`,
        '',
        '## Key Takeaways',
        ...mockSummary.summary.keyTakeaways.map(item => `• ${item}`),
        '',
        '## Summary',
        ...mockSummary.summary.paragraphs,
      ].join('\n');
      
      await navigator.clipboard.writeText(summaryText);
      toast({
        title: "Summary copied!",
        description: "The summary has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy summary to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    // TODO: Download as PDF
    toast({
      title: "Download starting...",
      description: "Your PDF will be ready shortly.",
    });
    console.log("Download PDF");
  };

  const handleShare = () => {
    // TODO: Share summary
    console.log("Share summary");
  };

  const handleRegenerate = () => {
    // TODO: Regenerate summary
    console.log("Regenerate summary");
  };

  // Add keyboard shortcuts
  useCopyShortcut(handleCopy);
  useDownloadShortcut(handleDownload);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <Container>
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-xl p-6 mb-8"
        >
          <div className="flex gap-6">
            {/* Cover */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {mockSummary.show.charAt(0)}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl font-bold text-ink-100 mb-2">
                    {mockSummary.title}
                  </h1>
                  <p className="text-lg text-ink-300 mb-2">{mockSummary.show}</p>
                  <p className="text-ink-400">{mockSummary.episode}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handleCopy}>
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-ink-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(mockSummary.duration)}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(mockSummary.date)}
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-green-500 rounded-full" />
                  Spotify
                </div>
                <Badge variant="primary">
                  5 min read
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Takeaways */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-ink-100 mb-4">
                Key Takeaways
              </h2>
              <ul className="space-y-3">
                {mockSummary.summary.keyTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
                    <span className="text-ink-200 leading-relaxed">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            {/* Summary Paragraphs */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-ink-100 mb-4">
                Detailed Summary
              </h2>
              <div className="space-y-4">
                {mockSummary.summary.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-ink-200 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.section>

            {/* Timestamps */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-ink-100 mb-4">
                Key Timestamps
              </h2>
              <div className="space-y-3">
                {mockSummary.summary.timestamps.map((timestamp, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-ink-800/30 hover:bg-ink-700/30 transition-colors cursor-pointer">
                    <Badge variant="outline" className="font-mono">
                      {timestamp.time}
                    </Badge>
                    <span className="text-ink-200">{timestamp.topic}</span>
                    <ExternalLink className="w-4 h-4 text-ink-400 ml-auto" />
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Regenerate Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-ink-100 mb-4">
                Regenerate Summary
              </h2>
              <p className="text-ink-400 mb-4">
                Want a different level of detail or focus? Regenerate with custom options.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm">Brief</Button>
                <Button variant="outline" size="sm">Standard</Button>
                <Button variant="outline" size="sm">Detailed</Button>
                <Button variant="secondary" onClick={handleRegenerate}>
                  <RotateCcw className="w-4 h-4" />
                  Regenerate
                </Button>
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-ink-100 mb-4">
                Metadata
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-400">Duration</span>
                  <span className="text-ink-200">{formatDuration(mockSummary.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-400">Transcript</span>
                  <span className="text-ink-200">{mockSummary.transcriptLength.toLocaleString()} chars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-400">Model</span>
                  <span className="text-ink-200">{mockSummary.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-400">Processing</span>
                  <span className="text-ink-200">{mockSummary.processingTime}</span>
                </div>
              </div>
            </motion.div>

            {/* Topics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-ink-100 mb-4">
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {mockSummary.summary.topics.map((topic, index) => (
                  <Badge key={index} variant="primary">
                    {topic}
                  </Badge>
                ))}
              </div>
            </motion.div>

            {/* People Mentioned */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-ink-100 mb-4">
                People Mentioned
              </h3>
              <div className="space-y-2">
                {mockSummary.summary.people.map((person, index) => (
                  <div key={index} className="text-ink-200">{person}</div>
                ))}
              </div>
            </motion.div>

            {/* Chapters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-ink-100 mb-4">
                Chapters
              </h3>
              <div className="space-y-3">
                {mockSummary.summary.chapters.map((chapter, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-ink-200">{chapter.title}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {chapter.start}
                    </Badge>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Summary;