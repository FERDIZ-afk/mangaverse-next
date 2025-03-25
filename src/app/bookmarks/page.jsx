"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/";
import { BookmarkIcon, Calendar, ArrowLeft } from "lucide-react";

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Jika tidak terautentikasi, arahkan ke halaman login
    if (status === "unauthenticated") {
      router.push("/login");
    }

    // Ambil data bookmark jika sudah terautentikasi
    if (status === "authenticated") {
      fetchBookmarks();
    }
  }, [status, router]);

  const fetchBookmarks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/bookmarks");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil bookmarks");
      }

      setBookmarks(data);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      setError("Gagal memuat bookmark");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Loading state
  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl">Memuat bookmarks...</p>
          </div>
        </div>
      </div>
    );
  }

  // Pastikan sudah login
  if (status === "unauthenticated") {
    return null; // Akan di-redirect ke login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center text-gray-400 hover:text-white mr-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              <span>Kembali</span>
            </Link>
            <h1 className="text-3xl font-bold text-white">Bookmarks</h1>
          </div>
        </div>

        {error ? (
          <div className="bg-red-500 bg-opacity-20 text-red-300 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <BookmarkIcon className="h-16 w-16 mx-auto text-gray-500 mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">
              Belum ada bookmark
            </h2>
            <p className="text-gray-400 mb-6">
              Bookmark manga favorit Anda untuk akses cepat.
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Jelajahi Manga
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-gray-800 rounded-lg p-5 hover:bg-gray-700 transition-colors"
              >
                <Link href={`/manga/${bookmark.mangaSlug}`}>
                  <h3 className="text-lg font-bold text-white mb-2 hover:text-purple-400 transition-colors">
                    {bookmark.mangaTitle}
                  </h3>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <BookmarkIcon className="h-4 w-4 text-purple-400" />
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(bookmark.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
