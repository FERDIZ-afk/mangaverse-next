import { Button } from "@/components/ui/";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
      <div className="text-center p-8 max-w-lg">
        <h2 className="text-3xl font-bold text-yellow-400 mb-4">
          manhwa Tidak Ditemukan
        </h2>
        <p className="text-gray-300 mb-6">
          manhwa yang Anda cari tidak tersedia atau telah dihapus.
        </p>

        <Link href="/">
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
}
