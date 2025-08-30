"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { dataService, type FileDetail } from "../lib/data-service";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";
import Image from "next/image";

interface SearchBarProps {
  onSearchToggle?: () => void;
}

export default function SearchBar({ onSearchToggle }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FileDetail[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [allFiles, setAllFiles] = useState<FileDetail[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut to focus search (Cmd+K or Ctrl+K)
  useKeyboardShortcut({
    key: "k",
    modifiers: { meta: true }, // Cmd on Mac
    onKeyDown: () => inputRef.current?.focus(),
  });

  useKeyboardShortcut({
    key: "k",
    modifiers: { ctrl: true }, // Ctrl on Windows/Linux
    onKeyDown: () => inputRef.current?.focus(),
  });

  // Load all files on component mount
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const fileDetails = await dataService.getFileDetails();
        const filesArray = Object.values(fileDetails);
        setAllFiles(filesArray);
      } catch (error) {
        console.error("Error loading files:", error);
      }
    };
    loadFiles();
  }, []);

  // Search functionality
  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    const performSearch = async () => {
      try {
        const searchResults = await dataService.searchFiles(query.trim(), 8);
        setResults(searchResults);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Error searching files:", error);
        setResults([]);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300); // Debounce search
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileClick = (fileId: string) => {
    router.push(`/file/${fileId}`);
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(-1);
    onSearchToggle?.();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (query.trim() !== "" || results.length > 0) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleFileClick(results[selectedIndex].id);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-[#827989] w-3 sm:w-4 h-3 sm:h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="pl-8 sm:pl-10 pr-2 sm:pr-4 h-8 sm:h-10 bg-[#333333] border-[#444444] text-white placeholder-[#827989] focus:border-[#5865f2] focus:ring-[#5865f2] w-full text-sm sm:text-base"
        />
        {/* Desktop keyboard hint */}
        <div className="hidden sm:block absolute right-2 top-1/2 transform -translate-y-1/2 text-[#827989] text-xs px-1.5 py-0.5 bg-[#444444] rounded border border-[#555555]">
          ⌘K
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#222222] border border-[#333333] rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {results.map((file, index) => (
            <button
              key={file.id}
              onClick={() => handleFileClick(file.id)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-[#333333] transition-colors border-b border-[#333333] last:border-b-0 focus:outline-none focus:bg-[#333333] ${
                selectedIndex === index ? "bg-[#333333]" : ""
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={file.image}
                    alt={file.title}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-xs sm:text-sm truncate">
                    {file.title}
                  </h4>
                  <p className="text-[#827989] text-xs truncate hidden sm:block">
                    {file.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[#827989] text-xs">
                      {file.author.name}
                    </span>
                    <span className="text-[#827989] text-xs">•</span>
                    <span className="text-[#827989] text-xs">
                      {file.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#827989] text-xs">
                  <span className="hidden sm:inline">
                    {file.stats.likes} likes
                  </span>
                  <span className="sm:hidden">{file.stats.likes}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim() !== "" && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#222222] border border-[#333333] rounded-lg shadow-lg z-50">
          <div className="px-3 sm:px-4 py-2 sm:py-3 text-[#827989] text-xs sm:text-sm">
            No files found matching "{query}"
          </div>
        </div>
      )}
    </div>
  );
}
