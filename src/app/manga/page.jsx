"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Book } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/";

export default function MangaPage() {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    fetchManga();
  }, []);

  const fetchManga = async (pageUrl = null) => {
    setLoading(true);
    try {
      const url = pageUrl || "/api/proxy?type=manga";

      console.log("Fetching from URL:", url);
      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.data) {
        const validManga = data.data.map((item) => ({
          ...item,
          slug: item.param || item.id?.toString(),
        }));

        if (!pageUrl) {
          setMangaList(validManga);
        } else {
          setMangaList((prevList) => [...prevList, ...validManga]);
        }

        setNextPage(data.pagination?.nextPage || null);
      } else {
        throw new Error(data.message || "Failed to fetch manga");
      }
    } catch (error) {
      setError("Gagal memuat data manga");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreManga = () => {
    if (nextPage) {
      fetchManga(nextPage);
    }
  };

  // Debug output for rendering conditions
  console.log("Current state - nextPage:", nextPage, "loading:", loading);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-8">
      <div className="container mx-auto px-4">
        <PageTitle
          title="Manga"
          icon={<Book className="h-6 w-6 text-purple-500" />}
        />

        {loading && initialLoad ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 bg-red-500/10 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mangaList.map((manga, index) => (
                <MangaCard key={`${manga.slug}-${index}`} manga={manga} />
              ))}
            </div>

            {/* Always show button during development for testing */}
            <div className="text-center mt-8">
              {nextPage ? (
                <Button
                  onClick={loadMoreManga}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-t-white border-r-transparent border-b-white border-l-transparent rounded-full animate-spin mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    "Load More Manga"
                  )}
                </Button>
              ) : (
                <p className="text-gray-400 text-sm">No more manga to load</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MangaCard({ manga }) {
  return (
    <Link href={`/manga/${manga.slug}`}>
      <div className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg h-[320px] flex flex-col cursor-pointer">
        <div className="relative w-full h-[220px]">
          <img
            src={manga.thumbnail || "/placeholder.jpg"}
            alt={manga.title || "Unknown Title"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs px-2 py-1 rounded-full">
            {manga.rating || "N/A"}
          </div>
          {manga.status && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-xs px-2 py-1 rounded-full text-gray-200">
              {manga.status}
            </div>
          )}
        </div>
        <div className="p-3 flex-1 flex flex-col justify-between">
          <h3 className="font-semibold text-sm line-clamp-2 text-gray-100 mb-2">
            {manga.title || "Unknown Title"}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {manga.type || "manga"}
            </span>
            {manga.latest_chapter && (
              <span className="text-xs text-purple-400">
                Ch. {manga.latest_chapter}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
