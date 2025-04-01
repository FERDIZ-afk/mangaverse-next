"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  SortAsc,
  SortDesc,
  BookOpen,
  Clock,
  RefreshCw,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/";

export default function ChapterList({ chapters = [], manhwaSlug }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleChapters, setVisibleChapters] = useState(50);
  const [sortAscending, setSortAscending] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);

  // Filter and sort chapters
  const filteredAndSortedChapters = chapters
    .filter((chapter) =>
      chapter.chapter.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const numA = parseFloat(a.chapter);
      const numB = parseFloat(b.chapter);
      return sortAscending ? numA - numB : numB - numA;
    });

  // Toggle sort direction
  const toggleSort = () => {
    setSortAscending(!sortAscending);
    setVisibleChapters(50); // Reset visible count when sorting
  };

  // Load more chapters
  const loadMoreChapters = () => {
    setVisibleChapters((prev) => prev + 50);
  };

  // Reset search
  const clearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="bg-[#1a202c] rounded-lg overflow-hidden shadow-lg border border-gray-800">
      {/* Chapter List Header */}
      <div className="bg-[#161b26] p-3 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="text-white font-bold">
              Chapters
              <span className="ml-2 text-sm bg-gray-700 px-2 py-0.5 rounded-md">
                {chapters.length}
              </span>
            </h3>
          </div>

          <Button
            onClick={toggleSort}
            variant="ghost"
            size="sm"
            className="p-1.5 h-8 w-8 rounded-full bg-gray-800 hover:bg-gray-700"
            title={
              sortAscending ? "Urutkan Terbaru Dulu" : "Urutkan Terlama Dulu"
            }
          >
            {sortAscending ? (
              <SortAsc className="h-4 w-4 text-blue-400" />
            ) : (
              <SortDesc className="h-4 w-4 text-blue-400" />
            )}
          </Button>
        </div>
      </div>

      {/* Search Box */}
      <div
        className={`bg-[#161b26] px-3 py-2 border-b border-gray-800 transition-all ${
          isSearchFocused ? "border-purple-500/50" : ""
        }`}
      >
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Cari chapter..."
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-1.5 pl-8 pr-8 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />

          {searchQuery && (
            <button
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 hover:text-gray-300"
              onClick={clearSearch}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Chapter List Scrollable */}
      <div
        className="chapter-list max-h-[50vh] md:max-h-[60vh] overflow-y-auto overscroll-contain"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#4B5563 #1F2937",
        }}
      >
        {filteredAndSortedChapters.length > 0 ? (
          filteredAndSortedChapters
            .slice(0, visibleChapters)
            .map((chapter, index) => (
              <Link
                key={chapter.slug || index}
                href={`/manhwa/chapter/${chapter.slug}`}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-blue-400 shrink-0" />
                  <span className="text-white text-sm md:text-base">
                    Chapter {chapter.chapter}
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-400 shrink-0">
                  <Clock className="h-3 w-3 mr-1 opacity-70" />
                  <span>{chapter.release}</span>
                </div>
              </Link>
            ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <Search className="h-10 w-10 mb-2 opacity-50" />
            <p>Tidak ada chapter yang ditemukan</p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="mt-2 text-sm text-purple-400 hover:text-purple-300"
              >
                Reset pencarian
              </button>
            )}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {filteredAndSortedChapters.length > visibleChapters && (
        <div className="bg-[#161b26] p-3 border-t border-gray-800 flex justify-center">
          <Button
            onClick={loadMoreChapters}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 border-0 text-sm py-1.5"
          >
            <RotateCw className="h-3.5 w-3.5 mr-2" />
            Muat{" "}
            {Math.min(
              50,
              filteredAndSortedChapters.length - visibleChapters
            )}{" "}
            Chapter Lagi
          </Button>
        </div>
      )}
    </div>
  );
}
