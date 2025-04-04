"use client";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function SearchComponent() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Navigate to search results page with query parameter
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <form
        onSubmit={handleSearch}
        className="flex items-center border border-gray-700 rounded-lg overflow-hidden bg-gray-900"
      >
        <Input
          type="text"
          placeholder="Search manga..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-900 text-white focus:outline-none"
        />
        {query && (
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-white"
            onClick={() => setQuery("")}
          >
            <X size={18} />
          </button>
        )}
        <Button type="submit" className="px-4">
          <Search size={18} />
        </Button>
      </form>
    </div>
  );
}
