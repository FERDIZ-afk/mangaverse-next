"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchComponent({
  initialQuery = "",
  onSearch = null,
  showButton = true,
}) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (onSearch) {
      // If onSearch prop is provided, call it instead of navigating
      onSearch(query);
    } else {
      // Navigate to search results page with query parameter
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center w-full">
      <div className="relative flex-1 flex items-center bg-gray-800/80 rounded-l-md">
        <Search size={18} className="absolute left-3 text-gray-400" />
        <Input
          type="text"
          placeholder="Search manga, manhwa, manhua..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 pl-10 pr-3 py-2 bg-transparent border-0 text-white focus:outline-none focus:ring-0"
        />
      </div>
      {showButton && (
        <Button
          type="submit"
          className="rounded-l-none bg-orange-600 hover:bg-orange-700 border-0 px-4 py-2 h-full"
        >
          Search
        </Button>
      )}
    </form>
  );
}
