"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  HomeIcon,
  BookOpenIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ChapterPage({ params }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [chapterData, setChapterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [failedImages, setFailedImages] = useState({});

  const slug = params.slug;

  // Ekstrak mangaSlug dan chapterSlug dari path parameter
  const extractSlugParts = () => {
    // Contoh: bouken-ni-iku-fuku-ga-nai-chapter-59-bahasa-indonesia
    const parts = slug.split("-chapter-");
    if (parts.length === 2) {
      const mangaSlug = parts[0]; // bouken-ni-iku-fuku-ga-nai
      const chapterPart = parts[1]; // 59-bahasa-indonesia
      return { mangaSlug, chapterSlug: `chapter-${chapterPart}` };
    }
    return { mangaSlug: slug, chapterSlug: "" };
  };

  const { mangaSlug, chapterSlug } = extractSlugParts();

  // URL API untuk mendapatkan data chapter
  const fetchChapterData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        `Fetching chapter data for manga: ${mangaSlug}, chapter: ${chapterSlug}`
      );
      const response = await fetch(`/api/manga/${mangaSlug}/${chapterSlug}`);

      if (!response.ok) {
        throw new Error(
          `Terjadi kesalahan saat mengambil data chapter (${response.status})`
        );
      }

      const data = await response.json();
      console.log("Chapter data:", data);

      if (!data || !data.images || !Array.isArray(data.images)) {
        throw new Error("Format data chapter tidak valid");
      }

      setChapterData(data);

      // Simpan ke riwayat baca jika user logged in
      if (session?.user) {
        try {
          recordReadingHistory(data);
        } catch (historyError) {
          console.error("Error recording reading history:", historyError);
        }
      }
    } catch (error) {
      console.error("Error fetching chapter data:", error);
      setError("Gagal memuat chapter. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchChapterData();
    }
  }, [slug]);

  const recordReadingHistory = async (chapterData) => {
    try {
      // Cek apakah user login
      if (!session?.user) {
        console.log("User tidak login, tidak mencatat riwayat baca");
        return;
      }

      // Pastikan data yang diperlukan tersedia
      if (!chapterData || !mangaSlug) {
        console.error("Data chapter tidak valid untuk riwayat baca");
        return;
      }

      const mangaTitle = chapterData.title
        ? chapterData.title.split(" Chapter")[0]
        : "Unknown Manga";

      console.log("Mencatat riwayat baca untuk:", {
        mangaTitle,
        chapterSlug: slug,
        mangaParam: mangaSlug,
      });

      // Kirim data ke API untuk mendapatkan entri riwayat terformat
      const response = await fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mangaSlug: mangaSlug,
          mangaTitle: mangaTitle,
          chapterSlug: slug,
          chapterTitle: `Chapter ${chapterData.chapter_number || "?"}`,
        }),
      });

      const result = await response.json();
      console.log("Response API history:", result);

      if (result.success && result.data) {
        // Simpan ke localStorage
        let historyData = [];
        try {
          const localHistory = localStorage.getItem("mangaReadingHistory");
          historyData = localHistory ? JSON.parse(localHistory) : [];
          if (!Array.isArray(historyData)) historyData = [];
        } catch (error) {
          console.error("Error parsing history data:", error);
        }

        // Hapus entri yang sama jika sudah ada
        historyData = historyData.filter(
          (item) =>
            !(
              item.mangaSlug === result.data.mangaSlug &&
              item.chapterSlug === result.data.chapterSlug
            )
        );

        // Tambahkan entri baru
        historyData.push(result.data);

        // Batasi jumlah riwayat
        if (historyData.length > 100) {
          historyData = historyData.slice(-100);
        }

        // Simpan kembali ke localStorage
        localStorage.setItem(
          "mangaReadingHistory",
          JSON.stringify(historyData)
        );
      }
    } catch (error) {
      console.error("Failed to record reading history:", error);
    }
  };

  const navigateToChapter = (chapterPath) => {
    if (!chapterPath) return;

    router.push(`/manga/chapter/${chapterPath}`);
  };

  // Handler untuk error loading gambar
  const handleImageError = (index) => {
    setFailedImages((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  // Fungsi untuk menghasilkan fallback URL gambar
  const generatePlaceholderImageUrl = (index, title, chapterNumber) => {
    const svgContent = `<svg width="800" height="1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="1200" fill="#333333"/>
      <text x="400" y="200" font-family="Arial" font-size="36" fill="#FFFFFF" text-anchor="middle">Image Failed to Load</text>
      <text x="400" y="300" font-family="Arial" font-size="24" fill="#FFFFFF" text-anchor="middle">${title} - Ch ${chapterNumber}</text>
      <text x="400" y="600" font-family="Arial" font-size="72" fill="#FFFFFF" text-anchor="middle">Page ${
        index + 1
      }</text>
      <text x="400" y="1000" font-family="Arial" font-size="18" fill="#FFFFFF" text-anchor="middle">MangaVerse Fallback Image</text>
    </svg>`;

    const base64Image = btoa(svgContent);
    return `data:image/svg+xml;base64,${base64Image}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl">Memuat chapter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <div className="flex gap-4">
            <Button
              onClick={() => router.push(`/manga/${mangaSlug}`)}
              className="bg-gray-700 hover:bg-gray-600"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Kembali ke Manga
            </Button>
            <Button
              onClick={fetchChapterData}
              className="bg-purple-600 hover:bg-purple-500"
            >
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!chapterData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <p className="text-xl text-red-400 mb-4">Chapter tidak ditemukan</p>
          <Button
            onClick={() => router.push(`/manga/${mangaSlug}`)}
            className="bg-gray-700 hover:bg-gray-600"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Kembali ke Manga
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white dark-reader">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="flex gap-2 mb-4 md:mb-0">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700"
            >
              <HomeIcon className="h-4 w-4 mr-2" />
              Beranda
            </Button>
            <Button
              onClick={() => router.push(`/manga/${mangaSlug}`)}
              variant="outline"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700"
            >
              <BookOpenIcon className="h-4 w-4 mr-2" />
              Detail Manga
            </Button>
          </div>

          <h1 className="text-xl font-bold text-center w-full md:w-auto mb-4 md:mb-0">
            {chapterData.title}
          </h1>

          <div className="flex gap-2">
            <Button
              onClick={() => navigateToChapter(chapterData.prev_chapter)}
              disabled={!chapterData.prev_chapter}
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Prev
            </Button>
            <Button
              onClick={() => navigateToChapter(chapterData.next_chapter)}
              disabled={!chapterData.next_chapter}
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Chapter Reader */}
        <div className="manga-reader-container">
          {chapterData.images.map((image, index) => (
            <div key={index} className="mb-4">
              <img
                src={
                  failedImages[index]
                    ? generatePlaceholderImageUrl(
                        index,
                        chapterData.title,
                        chapterData.chapter_number || "?"
                      )
                    : image
                }
                alt={`Page ${index + 1}`}
                className="manga-page"
                loading="lazy"
                onError={() => handleImageError(index)}
              />
            </div>
          ))}
        </div>

        {/* Navigation Bottom */}
        <div className="flex justify-center gap-2 mt-8 mb-12">
          <Button
            onClick={() => navigateToChapter(chapterData.prev_chapter)}
            disabled={!chapterData.prev_chapter}
            className="bg-gray-800 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Chapter Sebelumnya
          </Button>
          <Button
            onClick={() => navigateToChapter(chapterData.next_chapter)}
            disabled={!chapterData.next_chapter}
            className="bg-gray-800 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
          >
            Chapter Selanjutnya
            <ChevronRightIcon className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
