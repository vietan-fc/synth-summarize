"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import Input from "./Input";
import Kbd from "./Kbd";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  className?: string;
}

const SearchInput = ({ 
  placeholder = "Search...", 
  onSearch, 
  debounceMs = 300,
  className 
}: SearchInputProps) => {
  const [query, setQuery] = useState("");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, onSearch, debounceMs]);

  // Keyboard shortcut (/) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const searchInput = document.getElementById("search-input");
        searchInput?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <div className={className}>
      <Input
        id="search-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
        rightIcon={
          <div className="flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-ink-400 hover:text-ink-200 focus-ring rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <Kbd>/</Kbd>
          </div>
        }
      />
    </div>
  );
};

export default SearchInput;