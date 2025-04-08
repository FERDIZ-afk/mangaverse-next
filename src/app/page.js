"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useInfiniteQuery,
} from "react-query";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/";
import { Skeleton } from "@/components/ui/skeleton";
import { StarIcon, BookOpenIcon, SearchIcon } from "lucide-react";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry if we got a 4xx response
        if (error?.status >= 400 && error?.status < 500) return false;
        // Otherwise retry up to 3 times
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Wrapper component
export default function MangaVerseWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <MangaVerse />
    </QueryClientProvider>
  );
}

function MangaVerse() {
  const [typeFilter, setTypeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Intersection observer for infinite loading
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Debounce search input to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update the fetchKomiksPage function with better error handling
  const fetchKomiksPage = useCallback(
    async ({ pageParam = null }) => {
      let apiUrl = "/api/komiks";

      // Handle search queries
      if (debouncedQuery) {
        apiUrl += `?search=${encodeURIComponent(debouncedQuery)}`;
        if (pageParam) {
          apiUrl += `&url=${encodeURIComponent(pageParam)}`;
        }
      }
      // Handle regular pagination
      else if (pageParam) {
        apiUrl += `?url=${encodeURIComponent(pageParam)}`;
      }

      try {
        const res = await fetch(apiUrl);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || `API responded with status: ${res.status}`
          );
        }

        const data = await res.json();

        // Check if this is fallback data and show a notification
        if (data.fallback) {
          // You can use a toast notification library here or set state to show a banner
          console.warn("Using fallback/cached data due to API issues");
          setShowFallbackNotice(true); // Add this state variable
        } else {
          setShowFallbackNotice(false);
        }

        return data;
      } catch (err) {
        console.error("Error fetching manga:", err);
        throw err;
      }
    },
    [debouncedQuery]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
    refetch,
    isRefetching,
  } = useInfiniteQuery(
    ["komiks", debouncedQuery, typeFilter],
    fetchKomiksPage,
    {
      getNextPageParam: (lastPage) => lastPage.next_page || undefined,
      refetchOnMount: false,
      refetchOnReconnect: true,
      // Add better error handling with retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) return false;
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Add onError handler
      onError: (error) => {
        console.error("Error fetching manga:", error);
      },
    }
  );

  const [showFallbackNotice, setShowFallbackNotice] = useState(false);

  // Load more when scrolling to the bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleTypeChange = (type) => {
    setSelectedType(type);

    if (type === "all") {
      setTypeFilter("All");
    } else if (type === "manga") {
      setTypeFilter("Manga");
    } else if (type === "manhwa") {
      setTypeFilter("Manhwa");
    } else if (type === "manhua") {
      setTypeFilter("Manhua");
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter komiks based on type
  const filteredKomiks =
    data?.pages.flatMap(
      (page) =>
        page.data?.filter(
          (komik) => typeFilter === "All" || komik.type === typeFilter
        ) || []
    ) || [];

  const getColorForRating = (rating) => {
    const parsedRating = parseFloat(rating);
    if (parsedRating >= 8) return "bg-green-500";
    if (parsedRating >= 7) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Progressive image loading with blur placeholder
  const shimmer = (w, h) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="${h}" fill="#2D3748" />
    </svg>
  `;

  const toBase64 = (str) =>
    typeof window === "undefined"
      ? Buffer.from(str).toString("base64")
      : window.btoa(str);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="w-[90%] sm:w-95% m-auto">
            <section id="carousel" className="sm:px-10 px-3 mt-12 sm:mt-20 ">
              {/* Featured Manga Section */}
              <div className="sm:grid sm:grid-cols-4 gap-10">
                <div className="info sm:col-span-3 py-3 sm:mt-5">
                  <div className="title">
                    <h1 className="text-white font-noto-sans text-2xl sm:text-4xl ">
                      Ore no Ie ga Maryoku Spot Datta Ken: Sundeiru dake de
                      Sekai Saikyou
                    </h1>
                    <p className="mt-5 text-white font-medium font-open-sans w-full text-sm sm:text-base sm:w-[80%]">
                      Hidup riang di rumah adalah cara pintas terbesar — rumah
                      saya adalah Tempat Daya Ajaib terbesar di dunia. Itulah
                      yang terjadi, baik rumah saya dan saya dipanggil ke dunia
                      lain oleh beberapa orang yang membidiknya. Namun, saya
                      telah tinggal di tempat ini selama bertahun-tahun dan
                      tubuh saya, tampaknya, terlalu meluap dengan sihir. Karena
                      keadaan yang tak terduga oleh orang-orang yang
                      memanggilku, mereka dengan cepat melarikan diri. Meskipun
                      begitu, masih ada beberapa orang yang tidak sopan yang
                      mengingini sihir yang bocor keluar dari rumahku. Saya
                      tidak akan menyerahkan rumah saya kepada orang-orang itu!
                      Saya akan menggunakan kekuatan saya sesuka saya!
                    </p>

                    <Link href="/manga/ore-no-ie-ga-maryoku-spot-datta-ken-sundeiru-dake-de-sekai-saikyou">
                      <button className="text-white px-4 py-2 text-sm rounded-sm ring-1 ring-[#FF7F57] mt-8 flex items-center gap-3 font-montserrat font-medium sm:text-base">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                          />
                        </svg>

                        <span className="dark:text-white text-zinc-950">
                          Read Now
                        </span>
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="sm:col-span-1 hidden sm:block">
                  <div className="images ">
                    <Image
                      src="https://i0.wp.com/www.maid.my.id/wp-content/uploads/2018/07/e1d0db35-b6fb-4a5f-bf6b-127cd8758324.jpg"
                      alt="test"
                      width={150}
                      height={150}
                      referrerPolicy="no-referrer"
                      className="w-full rounded-lg rotate-3 h-full object-cover"
                      priority={true} // Load this prominently displayed image early
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
            <div className="title">
              <h1 className="text-lg font-noto-sans sm:text-2xl text-white">
                Latest Updated
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                {/* <Input */}
                {/* type="text" */}
                {/* placeholder="Search manga..." */}
                {/* value={searchQuery} */}
                {/* onChange={handleSearch} */}
                {/* className="bg-gray-800 border-gray-700 pl-9" */}
                {/* /> */}
                {/* <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /> */}
              </div>
              {/* 
              <Select value={selectedType} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-full sm:w-32 bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="manga">Manga</SelectItem>
                  <SelectItem value="manhwa">Manhwa</SelectItem>
                  <SelectItem value="manhua">Manhua</SelectItem>
                </SelectContent>
              </Select> */}
            </div>
          </div>
        </header>

        {/* Error Display */}
        {status === "error" && (
          <div className="text-center my-8 p-4 bg-red-900 bg-opacity-50 rounded-lg">
            <p className="text-red-200 mb-2">
              {error?.message?.includes("timeout") ||
              error?.message?.includes("too long")
                ? "The manga server is taking too long to respond. This often happens when the server is starting up after being inactive."
                : `Failed to load manga: ${error.message}`}
            </p>
            <p className="text-red-200 mb-4 text-sm">
              {error?.message?.includes("timeout") &&
                "The server will be faster on subsequent requests once it's active."}
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-red-500 text-red-200 hover:bg-red-900"
              disabled={isRefetching}
            >
              {isRefetching ? "Retrying..." : "Retry Loading Manga"}
            </Button>
          </div>
        )}

        {/* Manga Grid with Loading States */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {status === "loading"
            ? // Loading skeletons
              Array(12)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={`skeleton-${idx}`}
                    className="bg-gray-800 rounded-lg overflow-hidden"
                  >
                    <Skeleton className="h-64 w-full bg-gray-700" />
                    <div className="p-3">
                      <Skeleton className="h-5 w-4/5 bg-gray-700 mb-2" />
                      <Skeleton className="h-4 w-1/3 bg-gray-700" />
                    </div>
                  </div>
                ))
            : filteredKomiks.map((komik) => (
                <Link href={`/manga/${komik.param}`} key={komik.param}>
                  <Card className="bg-gray-800 border-gray-700 hover:scale-105 transition-transform cursor-pointer h-full">
                    <div className="relative">
                      <Image
                        src={komik.thumbnail}
                        alt={komik.title}
                        width={300}
                        height={400}
                        className="w-full h-64 object-cover rounded-t-lg"
                        quality={60} // Lower quality for thumbnails improves load time
                        loading="lazy" // Lazy loading for images
                        placeholder="blur"
                        blurDataURL={`data:image/svg+xml;base64,${toBase64(
                          shimmer(300, 400)
                        )}`}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-manga.jpg"; // Fallback image
                        }}
                      />
                      <Badge
                        className={`absolute top-2 right-2 ${getColorForRating(
                          komik.rating
                        )}`}
                      >
                        <StarIcon className="h-4 w-4 mr-1" />
                        {komik.rating}
                      </Badge>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="text-sm font-bold truncate text-white mb-1">
                        {komik.title}
                      </h3>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary" className="bg-gray-700">
                          <BookOpenIcon className="h-3 w-3 mr-1" />
                          {komik.type}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>

        {/* Loading more indicator and ref for intersection observer */}
        <div ref={loadMoreRef} className="text-center my-8">
          {isFetchingNextPage && (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-gray-400">Loading more manga...</p>
            </div>
          )}

          {!hasNextPage &&
            status !== "loading" &&
            filteredKomiks.length > 0 && (
              <p className="text-gray-400 mt-4">You've reached the end!</p>
            )}

          {status !== "loading" && filteredKomiks.length === 0 && (
            <div className="text-center my-12">
              <p className="text-xl text-gray-400">
                No manga found matching your criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
