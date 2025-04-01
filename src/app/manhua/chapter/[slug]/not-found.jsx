"use client";

import { Button } from "@/components/ui/";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function NotFound() {
  const [imgSrc, setImgSrc] = useState("/images/404.manga.png");

  const handleImageError = () => {
    setImgSrc(
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyMTIxMzgiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC1zaXplPSI0OHB4IiBmb250LXdlaWdodD0iNzAwIj40MDQ8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI3MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiIGZvbnQtc2l6ZT0iMjBweCI+Q2hhcHRlciBub3QgZm91bmQ8L3RleHQ+PC9zdmc+"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
      <div className="text-center p-8 max-w-lg">
        <div className="mb-6 mx-auto relative w-48 h-48">
          <Image
            src={imgSrc}
            alt="404 Chapter Not Found"
            width={200}
            height={200}
            className="object-contain"
            onError={handleImageError}
          />
        </div>
        <h2 className="text-3xl font-bold text-yellow-400 mb-4">
          Chapter Tidak Ditemukan
        </h2>
        <p className="text-gray-300 mb-6">
          Chapter yang Anda cari tidak tersedia atau belum dirilis.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Kembali ke Beranda
            </Button>
          </Link>
          <Link href="/manhwa">
            <Button className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600">
              Lihat Semua manhwa
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
