"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Share2,
  Heart,
} from "lucide-react";

export default function ChapterPage({ params }) {
  // Gunakan use() untuk membuka Promise params
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { data: session } = useSession();
  const router = useRouter();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [failedImages, setFailedImages] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    async function fetchChapterData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/proxy/chapter/${slug}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Gagal mengambil data chapter");
        }

        console.log("Chapter data received:", data);

        // Periksa apakah data memiliki gambar
        if (
          !data ||
          !data.images ||
          !Array.isArray(data.images) ||
          data.images.length === 0
        ) {
          console.error("Data chapter tidak memiliki gambar yang valid:", data);
          setError("Data chapter tidak memiliki gambar yang valid");
          setLoading(false);
          return;
        }

        setChapter(data);

        // Jika user login, catat riwayat baca (tetapi jangan biarkan error mempengaruhi tampilan)
        if (session?.user) {
          try {
            recordReadingHistory(data);
          } catch (historyError) {
            console.error("Error recording reading history:", historyError);
            // Lanjutkan menampilkan chapter meskipun ada error riwayat baca
          }
        }
      } catch (err) {
        console.error("Error fetching chapter data:", err);
        setError("Gagal memuat chapter. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    }

    fetchChapterData();

    // Menambahkan event listener untuk menghitung progress membaca
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setReadingProgress(Math.min(Math.round(scrolled), 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [slug, session]);

  const recordReadingHistory = async (chapterData) => {
    try {
      // Cek apakah user login
      if (!session?.user) {
        console.log("User tidak login, tidak mencatat riwayat baca");
        return;
      }

      // Pastikan data yang diperlukan tersedia
      if (!chapterData || !chapterData.manhwa_param) {
        console.error("Data chapter tidak valid untuk riwayat baca");
        return;
      }

      const manhwaTitle = chapterData.title
        ? chapterData.title.split(" Chapter")[0]
        : "Unknown manhwa";

      console.log("Mencatat riwayat baca untuk:", {
        manhwaTitle,
        chapterSlug: slug,
        manhwaParam: chapterData.manhwa_param,
      });

      // Kirim data ke API untuk mendapatkan entri riwayat terformat
      const response = await fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          manhwaSlug: chapterData.manhwa_param,
          manhwaTitle: manhwaTitle,
          chapterSlug: slug,
          chapterTitle: `Chapter ${chapterData.chapter_number || "?"}`,
        }),
      });

      const result = await response.json();
      console.log("Response API history:", result);

      if (result.success && result.data) {
        try {
          // Simpan langsung ke localStorage
          // Baca data saat ini dari localStorage
          let historyData = [];
          try {
            const localHistory = localStorage.getItem("manhwaReadingHistory");
            console.log("Data riwayat saat ini:", localHistory);
            historyData = localHistory ? JSON.parse(localHistory) : [];

            // Validasi data adalah array
            if (!Array.isArray(historyData)) {
              console.warn("Data riwayat bukan array, mereset ke array kosong");
              historyData = [];
            }
          } catch (parseError) {
            console.error("Error parsing data riwayat:", parseError);
            historyData = [];
          }

          // Hapus entri yang sama jika sudah ada (berdasarkan manhwaSlug dan chapterSlug)
          const oldLength = historyData.length;
          historyData = historyData.filter(
            (item) =>
              !(
                item.manhwaSlug === result.data.manhwaSlug &&
                item.chapterSlug === result.data.chapterSlug
              )
          );

          if (oldLength !== historyData.length) {
            console.log("Menghapus entri duplikat dari riwayat");
          }

          // Tambahkan entri baru
          historyData.push(result.data);
          console.log("Entri baru ditambahkan:", result.data);

          // Batasi jumlah riwayat yang disimpan (misalnya 100 item terakhir)
          if (historyData.length > 100) {
            historyData = historyData.slice(-100);
            console.log("Membatasi riwayat ke 100 item terakhir");
          }

          // Simpan kembali ke localStorage
          const dataToSave = JSON.stringify(historyData);
          console.log(
            "Menyimpan data ke localStorage:",
            dataToSave.substring(0, 100) + "..."
          );
          localStorage.setItem("manhwaReadingHistory", dataToSave);

          // Verifikasi data tersimpan
          const savedData = localStorage.getItem("manhwaReadingHistory");
          if (savedData) {
            console.log(
              "Data berhasil disimpan ke localStorage, panjang:",
              savedData.length
            );
            // Simpan juga ke sessionStorage sebagai backup
            sessionStorage.setItem("manhwaReadingHistory_backup", dataToSave);
          } else {
            console.error("Gagal menyimpan data ke localStorage");
          }
        } catch (storageError) {
          console.error("Error saat menyimpan ke localStorage:", storageError);
          // Coba simpan ke sessionStorage sebagai fallback
          try {
            sessionStorage.setItem(
              "manhwaReadingHistory_fallback",
              JSON.stringify([result.data])
            );
            console.log("Data disimpan ke sessionStorage sebagai fallback");
          } catch (sessionError) {
            console.error(
              "Juga gagal menyimpan ke sessionStorage:",
              sessionError
            );
          }
        }
      }
    } catch (error) {
      console.error("Failed to record reading history:", error);
      // Jangan lempar error - biarkan pengguna tetap bisa membaca chapter
    }
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
    // Buat gambar SVG langsung sebagai data URL
    const svgContent = `<svg width="800" height="1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="1200" fill="#333333"/>
      <text x="400" y="200" font-family="Arial" font-size="36" fill="#FFFFFF" text-anchor="middle">Image Failed to Load</text>
      <text x="400" y="300" font-family="Arial" font-size="24" fill="#FFFFFF" text-anchor="middle">${title} - Ch ${chapterNumber}</text>
      <text x="400" y="600" font-family="Arial" font-size="72" fill="#FFFFFF" text-anchor="middle">Page ${
        index + 1
      }</text>
      <text x="400" y="1000" font-family="Arial" font-size="18" fill="#FFFFFF" text-anchor="middle">manhwaVerse Fallback Image</text>
    </svg>`;

    const base64Image = btoa(svgContent);
    return `data:image/svg+xml;base64,${base64Image}`;
  };

  // Fungsi untuk bookmark dan like
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Implementasi penyimpanan bookmark
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    // Implementasi penyimpanan like
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        {/* <Navbar /> */}
        <div className="flex flex-col justify-center items-center min-h-[80vh]">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-purple-300 animate-pulse">Memuat chapter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        {/* <Navbar /> */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-500 bg-opacity-20 text-white p-8 rounded-lg shadow-lg backdrop-blur-sm border border-red-500/30">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p className="mb-6">{error}</p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!chapter || !chapter.images || chapter.images.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        {/* <Navbar /> */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-500 bg-opacity-20 text-white p-8 rounded-lg shadow-lg backdrop-blur-sm border border-yellow-500/30">
            <h2 className="text-xl font-bold mb-4">Tidak Ada Konten</h2>
            <p className="mb-6">Tidak ada gambar tersedia untuk chapter ini.</p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const manhwaTitle = chapter.title.split(" Chapter")[0];
  const chapterNum = chapter.chapter_number;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* <Navbar /> */}

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
          style={{ width: `${readingProgress}%` }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            {manhwaTitle} - Chapter {chapterNum}
          </h1>

          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 mb-8 shadow-xl border border-gray-700/50">
            <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
              <Link
                href={`/manhwa/${chapter.manhwa_param}`}
                className="text-purple-400 hover:text-purple-300 flex items-center transition-colors duration-300"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span>Detail manhwa</span>
              </Link>

              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleLike}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all duration-300 ${
                    isLiked
                      ? "bg-red-500/20 text-red-400"
                      : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  <Heart size={16} className={isLiked ? "fill-red-400" : ""} />
                  <span className="text-sm">Like</span>
                </button>

                <button
                  onClick={toggleBookmark}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all duration-300 ${
                    isBookmarked
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  <Bookmark
                    size={16}
                    className={isBookmarked ? "fill-blue-400" : ""}
                  />
                  <span className="text-sm">Bookmark</span>
                </button>

                <button className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-700/50 text-gray-400 hover:bg-gray-700 transition-all duration-300">
                  <Share2 size={16} />
                  <span className="text-sm">Share</span>
                </button>
              </div>

              <div className="flex space-x-3 w-full md:w-auto">
                {chapter.prev_chapter && (
                  <Link
                    href={`/manhwa/chapter/${chapter.prev_chapter}`}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center transition-all duration-300 shadow-md hover:shadow-lg flex-1 md:flex-auto justify-center md:justify-start"
                  >
                    <ChevronLeft size={18} className="mr-1" />
                    <span className="hidden md:inline">Chapter Sebelumnya</span>
                    <span className="md:hidden">Prev</span>
                  </Link>
                )}

                {chapter.next_chapter && (
                  <Link
                    href={`/manhwa/chapter/${chapter.next_chapter}`}
                    className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 px-4 py-2 rounded-lg flex items-center transition-all duration-300 shadow-md hover:shadow-lg flex-1 md:flex-auto justify-center md:justify-start"
                  >
                    <span className="hidden md:inline">
                      Chapter Selanjutnya
                    </span>
                    <span className="md:hidden">Next</span>
                    <ChevronRight size={18} className="ml-1" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl mb-8">
          <div className="flex flex-col items-center">
            {chapter.images.map((imageUrl, index) => (
              <div key={index} className="w-full">
                <Image
                  src={
                    failedImages[index]
                      ? generatePlaceholderImageUrl(
                          index,
                          manhwaTitle,
                          chapterNum
                        )
                      : imageUrl
                  }
                  alt={`Halaman ${index + 1}`}
                  width={800}
                  height={1200}
                  className="w-full h-auto"
                  priority={index < 3} // Prioritaskan 3 gambar pertama
                  onError={() => handleImageError(index)}
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEyMDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzM0MTU1Ii8+PC9zdmc+"
                  placeholder="blur"
                  unoptimized={true}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 mb-8 shadow-xl border border-gray-700/50">
          <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
            {chapter.prev_chapter && (
              <Link
                href={`/manhwa/chapter/${chapter.prev_chapter}`}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center transition-all duration-300 shadow-md hover:shadow-lg flex-1 md:flex-auto justify-center md:justify-start"
              >
                <ChevronLeft size={18} className="mr-1" />
                <span className="hidden md:inline">Chapter Sebelumnya</span>
                <span className="md:hidden">Prev</span>
              </Link>
            )}

            <Link
              href={`/manhwa/${chapter.manhwa_param}`}
              className="text-purple-400 hover:text-purple-300 flex items-center transition-colors duration-300"
            >
              <ArrowLeft size={20} className="mr-2" />
              <span>Detail manhwa</span>
            </Link>

            {chapter.next_chapter ? (
              <Link
                href={`/manhwa/chapter/${chapter.next_chapter}`}
                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 px-4 py-2 rounded-lg flex items-center transition-all duration-300 shadow-md hover:shadow-lg flex-1 md:flex-auto justify-center md:justify-start"
              >
                <span className="hidden md:inline">Chapter Selanjutnya</span>
                <span className="md:hidden">Next</span>
                <ChevronRight size={18} className="ml-1" />
              </Link>
            ) : (
              <div className="ml-auto flex-1 md:flex-auto text-right">
                <Link
                  href={`/manhwa/${chapter.manhwa_param}`}
                  className="inline-block bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Kembali ke Detail manhwa
                  <ChevronRight size={18} className="ml-1 inline" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
