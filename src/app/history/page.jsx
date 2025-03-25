"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { BookOpen, Calendar, ArrowLeft, Trash2 } from "lucide-react";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [histories, setHistories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Jika tidak terautentikasi, arahkan ke halaman login
    if (status === "unauthenticated") {
      router.push("/login");
    }

    // Ambil data riwayat baca jika sudah terautentikasi
    if (status === "authenticated") {
      fetchHistory();
    }
  }, [status, router]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      // Mengambil riwayat baca dari localStorage
      const localHistory = localStorage.getItem("mangaReadingHistory");
      console.log("Raw localStorage data:", localHistory);

      let historyData = [];

      if (localHistory) {
        try {
          historyData = JSON.parse(localHistory);
          console.log("Parsed history data:", historyData);
        } catch (parseError) {
          console.error("Error parsing localStorage data:", parseError);
          setError(
            "Data riwayat baca rusak. Mungkin perlu dihapus dan dibuat ulang."
          );
        }
      } else {
        console.log("Tidak ada data riwayat di localStorage");
      }

      // Pastikan data adalah array
      if (!Array.isArray(historyData)) {
        console.error("History data bukan array:", historyData);
        historyData = [];
      }

      // Urutkan berdasarkan tanggal terbaru
      historyData.sort((a, b) => new Date(b.readAt) - new Date(a.readAt));

      console.log("Final sorted history data:", historyData);
      setHistories(historyData);
    } catch (error) {
      console.error("Error fetching reading history:", error);
      setError("Gagal memuat riwayat baca");
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllHistory = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus semua riwayat baca?")) {
      return;
    }

    try {
      // Hapus riwayat baca dari localStorage
      localStorage.removeItem("mangaReadingHistory");
      setHistories([]);
    } catch (error) {
      console.error("Error clearing history:", error);
      setError("Gagal menghapus riwayat baca");
    }
  };

  const deleteHistoryItem = async (id) => {
    try {
      // Filter riwayat baca dan simpan kembali ke localStorage
      const updatedHistories = histories.filter((history) => history.id !== id);
      localStorage.setItem(
        "mangaReadingHistory",
        JSON.stringify(updatedHistories)
      );
      setHistories(updatedHistories);
    } catch (error) {
      console.error("Error deleting history item:", error);
      setError("Gagal menghapus item riwayat");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
            <p className="text-xl">Memuat riwayat baca...</p>
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
            <h1 className="text-3xl font-bold text-white">Riwayat Baca</h1>
          </div>
          <div>
            <button
              onClick={fetchHistory}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md mr-2"
            >
              Refresh
            </button>
            {histories.length > 0 && (
              <button
                onClick={clearAllHistory}
                className="flex items-center bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
              >
                <Trash2 size={16} className="mr-2" />
                <span>Hapus Semua</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-300 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {histories.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-gray-500 mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">
              Belum ada riwayat baca
            </h2>
            <p className="text-gray-400 mb-6">
              Mulai baca manga untuk melihat riwayat baca Anda di sini.
            </p>
            <Link href="/">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-2 rounded-md">
                Jelajahi Manga
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {histories.map((history) => (
              <div
                key={history.id}
                className="bg-gray-800 rounded-lg p-5 hover:bg-gray-700 transition-colors relative"
              >
                <button
                  onClick={() => deleteHistoryItem(history.id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-400"
                  title="Hapus dari riwayat"
                >
                  <Trash2 size={16} />
                </button>
                <Link href={`/manga/${history.mangaSlug}`}>
                  <h3 className="text-lg font-bold text-white mb-1 hover:text-purple-400 transition-colors">
                    {history.mangaTitle}
                  </h3>
                </Link>
                <Link href={`/manga/chapter/${history.chapterSlug}`}>
                  <p className="text-purple-400 mb-3 hover:underline">
                    {history.chapterTitle}
                  </p>
                </Link>
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(history.readAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
