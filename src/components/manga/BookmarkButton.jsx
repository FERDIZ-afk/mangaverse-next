"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BookmarkButton({ mangaSlug, mangaTitle }) {
  const { data: session, status } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Cek status bookmark saat komponen dimuat dan user terautentikasi
    if (status === "authenticated" && mangaSlug) {
      checkBookmarkStatus();
    }
  }, [status, mangaSlug]);

  const checkBookmarkStatus = async () => {
    try {
      console.log("Memeriksa status bookmark untuk:", mangaSlug);
      const response = await fetch(`/api/bookmarks?mangaSlug=${mangaSlug}`, {
        method: "HEAD",
      });

      setIsBookmarked(response.ok);
      setError(null);
    } catch (error) {
      console.error("Error checking bookmark status:", error);
      setError("Gagal memeriksa status bookmark");
    }
  };

  const toggleBookmark = async () => {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log("Mengirim request bookmark untuk:", mangaSlug, mangaTitle);
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mangaSlug,
          mangaTitle,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response error:", response.status, errorText);
        throw new Error("Gagal mengubah status bookmark");
      }

      const data = await response.json();
      console.log("Toggle bookmark response:", data);

      setIsBookmarked(data.action === "added");
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      setError(error.message || "Terjadi kesalahan saat menambahkan bookmark");
    } finally {
      setIsProcessing(false);
    }
  };

  // Render tombol login jika tidak terautentikasi
  if (status === "unauthenticated") {
    return (
      <Button
        onClick={() => router.push("/login")}
        className="flex items-center text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600"
      >
        <Bookmark className="mr-2 h-5 w-5" />
        <span>Bookmark</span>
      </Button>
    );
  }

  return (
    <>
      {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
      <Button
        onClick={toggleBookmark}
        disabled={isProcessing || status === "loading"}
        className={`flex items-center ${
          isBookmarked
            ? "bg-purple-600 hover:bg-purple-700 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
        }`}
      >
        {isProcessing ? (
          <span>Memproses...</span>
        ) : (
          <>
            {isBookmarked ? (
              <BookmarkCheck className="mr-2 h-5 w-5" />
            ) : (
              <Bookmark className="mr-2 h-5 w-5" />
            )}
            <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
          </>
        )}
      </Button>
    </>
  );
}
