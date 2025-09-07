"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPrevNext?: boolean;
  className?: string;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showPrevNext = true,
  className,
}: PaginationProps) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    // Calculate range
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <nav
      className={cn("flex items-center justify-center space-x-1", className)}
      aria-label="Pagination"
    >
      {/* Previous Button */}
      {showPrevNext && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="mr-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
      )}

      {/* Page Numbers */}
      <div className="flex space-x-1">
        {visiblePages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`dots-${index}`}
                className="flex items-center justify-center w-9 h-9 text-ink-400"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <Button
              key={pageNumber}
              variant={isActive ? "primary" : "ghost"}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
              className={cn(
                "w-9 h-9 p-0",
                isActive && "bg-brand-600 text-white"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNumber}
            </Button>
          );
        })}
      </div>

      {/* Next Button */}
      {showPrevNext && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </nav>
  );
};

export default Pagination;