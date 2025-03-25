"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import MangaInfo from "@/components/manga/MangaInfo";
import ChapterList from "@/components/manga/ChapterList";
import { Button } from "@/components/ui/";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CommentSection from "@/components/manga/CommentSection";
import BookmarkButton from "@/components/manga/BookmarkButton";

export default function MangaDetailPage() {
  const { slug } = useParams();
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);

  useEffect(() => {
    const fetchMangaDetail = async () => {
      setLoading(true);
      setError(null);
      setErrorDetail(null);

      try {
        console.log(`Fetching manga detail for slug: ${slug}`);
        const response = await fetch(`/api/manga/${slug}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(
            `Failed to fetch manga detail: ${
              errorData.error || response.statusText
            }`
          );
        }

        const data = await response.json();
        console.log("Manga data received:", data);

        if (!data || !data.data) {
          throw new Error("Invalid data format received from API");
        }

        setManga(data.data);
      } catch (error) {
        console.error("Error fetching manga detail:", error);
        setError("Gagal memuat detail manga. Silakan coba lagi nanti.");
        setErrorDetail(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchMangaDetail();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Memuat detail manga...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-400 mb-4">{error}</p>
          {errorDetail && (
            <p className="text-sm text-red-300 mb-6">{errorDetail}</p>
          )}
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-400 mb-4">Manga tidak ditemukan</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Kembali ke Beranda</span>
          </Link>

          <BookmarkButton mangaSlug={slug} mangaTitle={manga.title} />
        </div>

        <MangaInfo manga={manga} />

        <ChapterList chapters={manga.chapters} />

        <CommentSection mangaSlug={slug} />
      </div>
    </div>
  );
}
