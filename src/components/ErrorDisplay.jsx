"use client";

import { Button } from "@/components/ui/";

export default function ErrorDisplay({ error, refetch, isRefetching }) {
  return (
    <div className="text-center my-8 p-4 bg-red-900 bg-opacity-50 rounded-lg">
      <p className="text-red-200 mb-2">
        {error?.includes("timeout") || error?.includes("too long")
          ? "Server sedang lambat merespons. Ini sering terjadi ketika server baru memulai setelah tidak aktif."
          : error?.includes("offline")
          ? "Anda sedang offline. Hubungkan kembali ke internet untuk memuat data baru."
          : error}
      </p>
      <p className="text-red-200 mb-4 text-sm">
        {error?.includes("timeout") &&
          "Server akan lebih cepat pada permintaan berikutnya setelah aktif."}
      </p>
      <Button
        onClick={refetch}
        variant="outline"
        className="border-red-500 text-red-200 hover:bg-red-900"
        disabled={isRefetching || !navigator.onLine}
      >
        {isRefetching ? "Mencoba ulang..." : "Coba Muat Ulang"}
      </Button>
    </div>
  );
}
