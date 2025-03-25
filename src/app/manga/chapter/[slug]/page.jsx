"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";

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

  useEffect(() => {
    async function fetchChapterData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/manga/chapter/${slug}`);
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
  }, [slug, session]);

  const recordReadingHistory = async (chapterData) => {
    try {
      // Cek apakah user login
      if (!session?.user) {
        console.log("User tidak login, tidak mencatat riwayat baca");
        return;
      }

      // Pastikan data yang diperlukan tersedia
      if (!chapterData || !chapterData.manga_param) {
        console.error("Data chapter tidak valid untuk riwayat baca");
        return;
      }

      const mangaTitle = chapterData.title
        ? chapterData.title.split(" Chapter")[0]
        : "Unknown Manga";

      console.log("Mencatat riwayat baca untuk:", {
        mangaTitle,
        chapterSlug: slug,
        mangaParam: chapterData.manga_param,
      });

      // Kirim data ke API untuk mendapatkan entri riwayat terformat
      const response = await fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mangaSlug: chapterData.manga_param,
          mangaTitle: mangaTitle,
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
            const localHistory = localStorage.getItem("mangaReadingHistory");
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

          // Hapus entri yang sama jika sudah ada (berdasarkan mangaSlug dan chapterSlug)
          const oldLength = historyData.length;
          historyData = historyData.filter(
            (item) =>
              !(
                item.mangaSlug === result.data.mangaSlug &&
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
          localStorage.setItem("mangaReadingHistory", dataToSave);

          // Verifikasi data tersimpan
          const savedData = localStorage.getItem("mangaReadingHistory");
          if (savedData) {
            console.log(
              "Data berhasil disimpan ke localStorage, panjang:",
              savedData.length
            );
            // Simpan juga ke sessionStorage sebagai backup
            sessionStorage.setItem("mangaReadingHistory_backup", dataToSave);
          } else {
            console.error("Gagal menyimpan data ke localStorage");
          }
        } catch (storageError) {
          console.error("Error saat menyimpan ke localStorage:", storageError);
          // Coba simpan ke sessionStorage sebagai fallback
          try {
            sessionStorage.setItem(
              "mangaReadingHistory_fallback",
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
      <text x="400" y="1000" font-family="Arial" font-size="18" fill="#FFFFFF" text-anchor="middle">MangaVerse Fallback Image</text>
    </svg>`;

    const base64Image = btoa(svgContent);
    return `data:image/svg+xml;base64,${base64Image}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <Navbar />
        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-500 bg-opacity-20 text-white p-4 rounded-lg">
            <p>{error}</p>
            <Link
              href="/"
              className="mt-4 inline-block bg-purple-600 px-4 py-2 rounded-md"
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
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-500 bg-opacity-20 text-white p-4 rounded-lg">
            <p>Tidak ada gambar tersedia untuk chapter ini.</p>
            <Link
              href="/"
              className="mt-4 inline-block bg-purple-600 px-4 py-2 rounded-md"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const mangaTitle = chapter.title.split(" Chapter")[0];
  const chapterNum = chapter.chapter_number;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {mangaTitle} - Chapter {chapterNum}
          </h1>

          <div className="flex justify-between items-center mb-8">
            <Link
              href={`/manga/${chapter.manga_param}`}
              className="text-purple-400 hover:text-purple-300 flex items-center"
            >
              <ArrowLeft size={20} className="mr-2" />
              Kembali ke Detail Manga
            </Link>

            <div className="flex space-x-3">
              {chapter.prev_chapter && (
                <Link
                  href={`/manga/chapter/${chapter.prev_chapter}`}
                  className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md flex items-center"
                >
                  <ChevronLeft size={18} className="mr-1" />
                  Chapter Sebelumnya
                </Link>
              )}

              {chapter.next_chapter && (
                <Link
                  href={`/manga/chapter/${chapter.next_chapter}`}
                  className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-md flex items-center"
                >
                  Chapter Selanjutnya
                  <ChevronRight size={18} className="ml-1" />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl mb-8">
          <div className="flex flex-col items-center space-y-4">
            {chapter.images.map((imageUrl, index) => (
              <div key={index} className="w-full">
                <Image
                  src={
                    failedImages[index]
                      ? generatePlaceholderImageUrl(
                          index,
                          mangaTitle,
                          chapterNum
                        )
                      : imageUrl
                  }
                  alt={`Halaman ${index + 1}`}
                  width={800}
                  height={1200}
                  className="rounded-lg w-full h-auto"
                  priority={index < 3} // Prioritaskan 3 gambar pertama
                  onError={() => handleImageError(index)}
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEyMDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzM0MTU1Ii8+PC9zdmc+"
                  placeholder="blur"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          {chapter.prev_chapter && (
            <Link
              href={`/manga/chapter/${chapter.prev_chapter}`}
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md flex items-center"
            >
              <ChevronLeft size={18} className="mr-1" />
              Chapter Sebelumnya
            </Link>
          )}

          {chapter.next_chapter ? (
            <Link
              href={`/manga/chapter/${chapter.next_chapter}`}
              className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-md flex items-center ml-auto"
            >
              Chapter Selanjutnya
              <ChevronRight size={18} className="ml-1" />
            </Link>
          ) : (
            <div className="ml-auto">
              <Link
                href={`/manga/${chapter.manga_param}`}
                className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-md flex items-center"
              >
                Kembali ke Detail Manga
                <ChevronRight size={18} className="ml-1" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
