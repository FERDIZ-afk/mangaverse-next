"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, RefreshCw, AlertCircle } from "lucide-react";
import SearchComponent from "@/components/SearchKomik";
import { saveToLocalCache, getFromLocalCache } from "@/utils/cache-helpers";
import ComicCard from "@/components/ComicCard";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  // Add this near the top of the component
  console.log("Query parameter:", queryParam);

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [showFallbackNotice, setShowFallbackNotice] = useState(false);

  // Generate cache key for search results
  const generateCacheKey = useCallback((searchQuery) => {
    return `search_${searchQuery}`;
  }, []);

  const fetchSearchResults = useCallback(
    async (searchQuery) => {
      if (!searchQuery.trim()) return;

      setLoading(true);
      setError(null);

      const cacheKey = generateCacheKey(searchQuery);

      // Check online status
      const isOnline = navigator.onLine;
      if (!isOnline) {
        const cachedData = getFromLocalCache(cacheKey);
        if (cachedData) {
          setShowFallbackNotice(true);
          setOfflineMode(true);
          setSearchResults(cachedData);
          setLoading(false);
          return;
        }

        setError("Anda sedang offline dan tidak ada data cache yang tersedia");
        setLoading(false);
        return;
      }

      try {
        // Set a timeout for the fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

        // Check cache for fresher data
        const cachedData = getFromLocalCache(cacheKey, 5 * 60 * 1000); // 5 min for normal operation

        const fetchPromise = fetch(
          `/api/search?s=${encodeURIComponent(searchQuery)}`,
          {
            signal: controller.signal,
            headers: {
              "Cache-Control": "max-age=300", // Tell CDN to cache for 5 minutes
              Pragma: "no-cache", // For older HTTP/1.0 caches
            },
          }
        );

        const res = await Promise.race([
          fetchPromise,
          // If we have cached data, use a longer timeout
          new Promise((resolve, reject) => {
            const timeoutDuration = cachedData ? 25000 : 15000; // 25s if we have fallback
            setTimeout(() => {
              if (cachedData) {
                // We have fallback, so resolve with that instead of rejecting
                resolve({
                  json: async () => ({
                    success: true,
                    data: cachedData,
                    fallback: true,
                  }),
                  ok: true,
                });
              } else {
                reject(new Error("Request timed out"));
              }
            }, timeoutDuration);
          }),
        ]);

        clearTimeout(timeoutId);

        if (!res.ok) {
          // For server errors, check cache
          if (res.status >= 500 && cachedData) {
            setShowFallbackNotice(true);
            setSearchResults(cachedData);
            setLoading(false);
            return;
          }

          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.message || `API responded with status: ${res.status}`
          );
        }

        const data = await res.json();

        if (data.success && data.data) {
          // Map param to slug for consistency
          const results = data.data.map((item) => ({
            ...item,
            slug: item.param || item.id?.toString(),
          }));

          // Cache successful responses
          if (!data.fallback) {
            saveToLocalCache(cacheKey, results);
            setShowFallbackNotice(false);
          } else {
            setShowFallbackNotice(true);
          }

          setSearchResults(results);
        } else {
          throw new Error(data.message || "No results found");
        }
      } catch (err) {
        console.error("Search error:", err);

        // For timeouts or network errors, try to get cached data
        if (
          err.name === "AbortError" ||
          err.message.includes("timed out") ||
          err.message.includes("network") ||
          !navigator.onLine
        ) {
          const cachedData = getFromLocalCache(cacheKey, 24 * 60 * 60 * 1000); // Allow 1-day old cache for errors
          if (cachedData) {
            setShowFallbackNotice(true);
            setSearchResults(cachedData);
            setLoading(false);
            return;
          }
        }

        setError("Failed to fetch search results: " + err.message);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    },
    [generateCacheKey]
  );

  // Initial fetch when page loads with query param
  useEffect(() => {
    if (queryParam) {
      fetchSearchResults(queryParam);
    }
  }, [queryParam, fetchSearchResults]);

  // Add this effect to handle URL changes
  useEffect(() => {
    console.log("URL query parameter changed:", queryParam);
    if (queryParam) {
      fetchSearchResults(queryParam);
    }
  }, [queryParam, fetchSearchResults]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log("App is back online");
      setOfflineMode(false);
      // Refetch data if we've been offline
      if (queryParam) {
        fetchSearchResults(queryParam);
      }
    };

    const handleOffline = () => {
      console.log("App is offline");
      setOfflineMode(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    setOfflineMode(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [queryParam, fetchSearchResults]);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-8">
          <Search className="h-6 w-6 mr-3 text-orange-500" />
          <h1 className="text-2xl font-bold">Search Results</h1>
        </div>

        {/* Search form - using the SearchComponent */}
        <div className="max-w-3xl mx-auto mb-8">
          <SearchComponent
            initialQuery={queryParam}
            onSearch={fetchSearchResults}
          />
        </div>

        {/* Offline notice */}
        {offlineMode && (
          <div className="text-center my-4 p-3 bg-blue-900 bg-opacity-50 rounded-lg flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-200" />
            <p className="text-blue-200">
              Anda sedang offline. Menampilkan hasil pencarian dari cache lokal.
            </p>
          </div>
        )}

        {/* Fallback notice */}
        {showFallbackNotice && !offlineMode && (
          <div className="text-center my-4 p-3 bg-yellow-900 bg-opacity-50 rounded-lg">
            <p className="text-yellow-200 flex items-center justify-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>
                Server sedang lambat. Menampilkan data cache sementara...
              </span>
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="text-center my-4 p-3 bg-red-900 bg-opacity-50 rounded-lg flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-200" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Search results count */}
        {searchResults.length > 0 && !loading && (
          <p className="text-gray-400 mb-4">
            Found {searchResults.length} results for "{queryParam}"
          </p>
        )}

        {/* No results message */}
        {searchResults.length === 0 && !loading && !error && queryParam && (
          <div className="text-center py-10 bg-gray-800/30 rounded-lg">
            <Search size={48} className="mx-auto mb-4 text-gray-500" />
            <p className="text-gray-300 text-lg">
              No results found for "{queryParam}"
            </p>
            <p className="text-gray-400 mt-2">
              Try different keywords or check your spelling
            </p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-t-orange-500 border-r-transparent border-b-orange-500 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">
              Searching for "{queryParam}"...
            </p>
          </div>
        )}

        {/* Search results */}
        {searchResults.length > 0 && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {searchResults.map((comic) => (
              <ComicCard
                key={comic.slug}
                comic={comic}
                type={comic.type?.toLowerCase() || "manga"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
