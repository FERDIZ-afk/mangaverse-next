import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/";

export default function MangaInfo({ manga }) {
  const { title, thumbnail, meta_info, genre, synopsis } = manga;

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
      <div className="md:flex">
        {/* Thumbnail */}
        <div className="md:w-1/3 relative">
          <div className="aspect-[3/4] relative">
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Info */}
        <div className="md:w-2/3 p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {title}
          </h1>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">
                <span className="font-semibold">Penulis:</span>{" "}
                {meta_info.author}
              </p>
              <p className="text-gray-400 text-sm">
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`${
                    meta_info.status === "ongoing"
                      ? "text-green-400"
                      : "text-blue-400"
                  }`}
                >
                  {meta_info.status.toUpperCase()}
                </span>
              </p>
              <p className="text-gray-400 text-sm">
                <span className="font-semibold">Tipe:</span> {meta_info.type}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">
                <span className="font-semibold">Tahun Rilis:</span>{" "}
                {meta_info.released}
              </p>
              <p className="text-gray-400 text-sm">
                <span className="font-semibold">Total Chapter:</span>{" "}
                {meta_info.total_chapter}
              </p>
              <p className="text-gray-400 text-sm">
                <span className="font-semibold">Terakhir Update:</span>{" "}
                {meta_info.updated_on}
              </p>
            </div>
          </div>

          {/* Genre */}
          <div className="mb-4">
            <p className="text-gray-300 font-semibold mb-2">Genre:</p>
            <div className="flex flex-wrap gap-2">
              {genre.map((g) => (
                <Badge key={g} className="bg-gray-700 hover:bg-gray-600">
                  {g}
                </Badge>
              ))}
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <p className="text-gray-300 font-semibold mb-2">Sinopsis:</p>
            <p className="text-gray-400 text-sm leading-relaxed">{synopsis}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
