import React, { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui/";
import { SearchIcon, BookOpenIcon, ClockIcon } from "lucide-react";

export default function ChapterList({ chapters }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleChapters, setVisibleChapters] = useState(20);

  // Filter chapters berdasarkan pencarian
  const filteredChapters = chapters.filter((chapter) =>
    chapter.chapter.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load more chapters
  const loadMoreChapters = () => {
    setVisibleChapters((prev) => prev + 20);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Chapters</h2>
        <div className="relative w-64">
          <Input
            icon={<SearchIcon size={18} className="text-gray-500" />}
            placeholder="Cari chapter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white pr-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filteredChapters.slice(0, visibleChapters).map((chapter) => (
          <Link
            href={`/manga/chapter/${chapter.slug}`}
            key={chapter.slug}
            className="flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
          >
            <div className="flex items-center space-x-3">
              <BookOpenIcon size={18} className="text-blue-400" />
              <span className="text-white font-medium">
                Chapter {chapter.chapter}
              </span>
            </div>

            <div className="flex items-center text-gray-400 text-sm">
              <ClockIcon size={14} className="mr-1" />
              <span>{chapter.release}</span>
            </div>
          </Link>
        ))}
      </div>

      {filteredChapters.length > visibleChapters && (
        <div className="text-center mt-6">
          <Button
            onClick={loadMoreChapters}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Muat Lebih Banyak
          </Button>
        </div>
      )}

      {filteredChapters.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">Tidak ada chapter yang ditemukan</p>
        </div>
      )}
    </div>
  );
}
