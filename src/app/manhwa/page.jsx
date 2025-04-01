"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Book } from "lucide-react";
import PageTitle from "@/components/PageTitle";

export default function ManhwaPage() {
  const [manhwaList, setmanhwaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchmanhwa();
  }, []);

  const fetchmanhwa = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/proxy?type=manhwa");
      const data = await response.json();

      console.log("API Response:", data);

      if (data.success && data.data) {
        // Map param to slug for consistency
        const validmanhwa = data.data.map((item) => ({
          ...item,
          slug: item.param || item.id?.toString(), // Use param as slug
        }));

        console.log("Processed manhwa Data:", validmanhwa);
        setmanhwaList(validmanhwa);
      } else {
        throw new Error(data.message || "Failed to fetch manhwa");
      }
    } catch (error) {
      setError("Gagal memuat data manhwa");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-8">
      <div className="container mx-auto px-4">
        <PageTitle
          title="manhwa"
          icon={<Book className="h-6 w-6 text-purple-500" />}
        />

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 bg-red-500/10 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {manhwaList.map((manhwa, index) => (
              <ManhwaCard key={index} manhwa={manhwa} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ManhwaCard({ manhwa }) {
  // For debugging
  console.log("Data manhwa:", manhwa);

  return (
    <Link href={`/manhwa/${manhwa.slug}`}>
      <div className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg h-[320px] flex flex-col cursor-pointer">
        <div className="relative w-full h-[220px]">
          <img
            src={manhwa.thumbnail || "/placeholder.jpg"}
            alt={manhwa.title || "Unknown Title"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs px-2 py-1 rounded-full">
            {manhwa.rating || "N/A"}
          </div>
          {manhwa.status && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-xs px-2 py-1 rounded-full text-gray-200">
              {manhwa.status}
            </div>
          )}
        </div>
        <div className="p-3 flex-1 flex flex-col justify-between">
          <h3 className="font-semibold text-sm line-clamp-2 text-gray-100 mb-2">
            {manhwa.title || "Unknown Title"}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {manhwa.type || "manhwa"}
            </span>
            {manhwa.latest_chapter && (
              <span className="text-xs text-purple-400">
                Ch. {manhwa.latest_chapter}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
