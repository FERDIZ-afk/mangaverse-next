import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/";
import { Badge } from "@/components/ui/";
import { StarIcon, BookIcon, ChevronRightIcon } from "lucide-react";
import {
  shimmer,
  toBase64,
  getTypeColor,
  getColorForRating,
} from "@/utils/cache-helpers";

export default function ComicCard({ comic, type = "manga" }) {
  // Determine the correct link path based on type
  const linkPath = `/${type.toLowerCase()}/${comic.slug || comic.param}`;

  return (
    <Link href={linkPath}>
      <Card className="bg-gray-800 border-gray-700 hover:scale-105 transition-transform duration-300 cursor-pointer h-full overflow-hidden group shadow-lg hover:shadow-xl">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Image
            src={comic.thumbnail || "/placeholder.jpg"}
            alt={comic.title || "Unknown Title"}
            width={300}
            height={400}
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
            quality={50} // Lower quality for thumbnails improves load time
            loading="lazy"
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(
              shimmer(300, 400)
            )}`}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg"; // Fallback image
            }}
          />
          {/* Rating badge with improved styling */}
          <Badge
            className={`absolute top-2 right-2 z-20 ${getColorForRating(
              comic.rating
            )} px-2 py-1 font-medium shadow-md`}
          >
            <StarIcon className="h-4 w-4 mr-1 inline" />
            {comic.rating || "N/A"}
          </Badge>

          {/* Status badge */}
          {comic.status && (
            <div className="absolute bottom-2 right-2 z-20 bg-black/80 text-white text-xs px-2 py-1 rounded-md">
              {comic.status}
            </div>
          )}

          {/* Chapter count badge */}
          <div className="absolute bottom-2 left-2 z-20 bg-black/80 text-white text-xs px-2 py-1 rounded-md flex items-center">
            <BookIcon className="h-3 w-3 mr-1" />
            {/* Show latest chapter if available */}
            {comic.latest_chapter ? `Ch. ${comic.latest_chapter}` : "New"}
          </div>
        </div>
        <CardContent className="p-3 relative">
          <h3 className="text-sm font-bold line-clamp-2 text-white mb-2 group-hover:text-orange-400 transition-colors">
            {comic.title || "Unknown Title"}
          </h3>
          <div className="flex justify-between items-center">
            <Badge
              variant="secondary"
              className={`${getTypeColor(comic.type || type)} text-xs`}
            >
              {comic.type || type}
            </Badge>

            {/* Read button that appears on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ChevronRightIcon className="h-5 w-5 text-orange-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
