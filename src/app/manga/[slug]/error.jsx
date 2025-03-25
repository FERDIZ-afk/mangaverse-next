"use client";

import { Button } from "@/components/ui/";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log error ke layanan monitoring
    console.error("Error in manga detail page:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
      <div className="text-center p-8 max-w-lg">
        <h2 className="text-3xl font-bold text-red-400 mb-4">
          Oops! Terjadi kesalahan
        </h2>
        <p className="text-gray-300 mb-2">
          Kami mengalami masalah dalam menampilkan detail manga.
        </p>
        <p className="text-gray-400 mb-6">
          {error?.message || "Mohon coba lagi nanti."}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={reset} className="bg-blue-600 hover:bg-blue-700">
            Coba Lagi
          </Button>

          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
