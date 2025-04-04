"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MangaCard from "@/components/KomikCard";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [query, setQuery] = useState(queryParam);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSearchResults = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?s=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        const results = data.data.map((item) => ({
          ...item,
          slug: item.param || item.id?.toString(),
        }));
        setSearchResults(results);
      } else {
        throw new Error(data.message || "No results found");
      }
    } catch (err) {
      setError("Failed to fetch search results");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when page loads with query param
  useEffect(() => {
    if (queryParam) {
      fetchSearchResults(queryParam);
    }
  }, [queryParam]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSearchResults(query);

    // Update the URL without refreshing the page
    const url = new URL(window.location);
    url.searchParams.set("q", query);
    window.history.pushState({}, "", url);
  };

  return (
    <>
      {/* <Navbar /> */}
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Search Results</h1>

        <div className="max-w-lg mx-auto mb-8">
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
            <Button type="submit" disabled={loading} className="px-4">
              {loading ? "Searching..." : <Search size={18} />}
            </Button>
          </form>
        </div>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        {searchResults.length === 0 && !loading && !error && queryParam && (
          <div className="text-center text-gray-400">
            No results found for "{queryParam}"
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-400">Searching...</div>
        )}

        {searchResults.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {searchResults.map((manga) => (
              <MangaCard key={manga.slug} manga={manga} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
