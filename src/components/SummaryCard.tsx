import { motion } from "framer-motion";
import { Clock, Calendar, ExternalLink, Copy, Download, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./Button";

interface SummaryCardProps {
  id: string;
  title: string;
  show: string;
  duration: number; // in seconds
  date: string;
  excerpt: string;
  tags: string[];
  source: "spotify" | "apple" | "rss" | "upload";
  coverUrl?: string;
  className?: string;
  onClick?: () => void;
}

const SummaryCard = ({
  id,
  title,
  show,
  duration,
  date,
  excerpt,
  tags,
  source,
  coverUrl,
  className,
  onClick,
}: SummaryCardProps) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSourceIcon = () => {
    switch (source) {
      case "spotify":
        return <div className="w-4 h-4 bg-green-500 rounded-full" />;
      case "apple":
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
      case "rss":
        return <ExternalLink className="w-4 h-4 text-ink-400" />;
      default:
        return <div className="w-4 h-4 bg-brand-500 rounded-full" />;
    }
  };

  return (
    <motion.div
      className={cn(
        "glass-panel rounded-xl p-6 cursor-pointer group hover:border-ink-600 transition-all duration-200",
        className
      )}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="flex gap-4">
        {/* Cover Image */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-ink-700 rounded-lg overflow-hidden">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={`${show} cover`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-600 to-brand-700">
                <span className="text-white text-lg font-bold">
                  {show.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-ink-100 truncate group-hover:text-brand-400 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-ink-400 truncate">{show}</p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle copy
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle download
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle menu
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Excerpt */}
          <p className="text-sm text-ink-300 mb-3 line-clamp-2">{excerpt}</p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-ink-400 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(duration)}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(date)}
            </div>
            <div className="flex items-center gap-1">
              {getSourceIcon()}
              <span className="capitalize">{source}</span>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-ink-800 text-ink-300"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-ink-800 text-ink-300">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SummaryCard;