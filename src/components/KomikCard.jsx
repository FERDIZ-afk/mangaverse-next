import Link from "next/link";

export default function MangaCard({ manga }) {
  return (
    <Link href={`/manga/${manga.slug}`}>
      <div className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg h-full flex flex-col cursor-pointer">
        <div className="relative w-full h-[220px]">
          <img
            src={manga.thumbnail || "/placeholder.svg"}
            alt={manga.title || "Unknown Title"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs px-2 py-1 rounded-full">
            {manga.rating || "N/A"}
          </div>
        </div>
        <div className="p-3 flex-1 flex flex-col justify-between">
          <h3 className="font-semibold text-sm line-clamp-2 text-gray-100 mb-2">
            {manga.title || "Unknown Title"}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {manga.type || "manga"}
            </span>
            {manga.latest_chapter && (
              <span className="text-xs text-purple-400">
                Ch. {manga.latest_chapter}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
