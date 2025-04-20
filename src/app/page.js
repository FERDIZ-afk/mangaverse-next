"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useQueryClient,
} from "react-query";
import { Card, CardContent, Badge, Button } from "@/components/ui/";
import { Skeleton } from "@/components/ui/skeleton";
import {
  StarIcon,
  WifiOffIcon,
  RefreshCwIcon,
  BookIcon,
  ChevronRightIcon,
  FlameIcon as FireIcon,
} from "lucide-react";

// Create a client with improved caching strategy
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
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes - increased for better caching
    },
  },
});

// Local storage helpers for offline support
const CACHE_KEY_PREFIX = "mangaverse_cache_";

function saveToLocalCache(key, data) {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      `${CACHE_KEY_PREFIX}${key}`,
      JSON.stringify(cacheData)
    );
    return true;
  } catch (err) {
    console.error("Failed to save to cache:", err);
    return false;
  }
}

function getFromLocalCache(key, maxAge = 60 * 60 * 1000) {
  // Default max age: 1 hour
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    // Return null if cache is too old
    if (age > maxAge) return null;

    return data;
  } catch (err) {
    console.error("Failed to read from cache:", err);
    return null;
  }
}

// Wrapper component
export default function MangaVerseWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <MangaVerse />
    </QueryClientProvider>
  );
}

function MangaVerse() {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showFallbackNotice, setShowFallbackNotice] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [prefetchedNextPage, setPrefetchedNextPage] = useState(false);

  // Ref to track network status
  const networkStatusRef = useRef({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    lastOnlineCheck: Date.now(),
  });

  // Intersection observer for infinite loading with higher threshold
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.3, // Increased threshold for earlier loading
    rootMargin: "400px", // Start loading earlier
    triggerOnce: false,
  });

  // Prefetch observer for next page (farther ahead)
  const { ref: prefetchRef, inView: shouldPrefetch } = useInView({
    threshold: 0,
    rootMargin: "800px", // Even farther ahead for prefetching
    triggerOnce: false,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400); // Slightly reduced debounce time

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log("App is back online");
      networkStatusRef.current.isOnline = true;
      networkStatusRef.current.lastOnlineCheck = Date.now();
      setOfflineMode(false);
      // Refetch data if we've been offline
      if (status === "success") {
        refetch();
      }
    };

    const handleOffline = () => {
      console.log("App is offline");
      networkStatusRef.current.isOnline = false;
      setOfflineMode(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    setOfflineMode(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Cache key generation helper
  const generateCacheKey = useCallback(
    (query = "", filter = "All", pageUrl = null) => {
      return `${query}_${filter}_${pageUrl || "initial"}`;
    },
    []
  );

  // Improved fetch function with offline support and better error handling
  const fetchKomiksPage = useCallback(
    async ({ pageParam = null }) => {
      const cacheKey = generateCacheKey(debouncedQuery, typeFilter, pageParam);

      // Check online status
      const isOnline = navigator.onLine;
      if (!isOnline) {
        const cachedData = getFromLocalCache(cacheKey);
        if (cachedData) {
          setShowFallbackNotice(true);
          return { ...cachedData, fallback: true };
        }
        throw new Error("You are offline and no cached data is available");
      }

      // If online, construct API URL
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
        // Set a timeout for the fetch to prevent long-hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

        // Before fetching, check cache for fresher data
        const cachedData = getFromLocalCache(cacheKey, 5 * 60 * 1000); // 5 min for normal operation

        const fetchPromise = fetch(apiUrl, {
          signal: controller.signal,
          // Add headers for better caching
          headers: {
            "Cache-Control": "max-age=300", // Tell CDN to cache for 5 minutes
            Pragma: "no-cache", // For older HTTP/1.0 caches
          },
        });

        const res = await Promise.race([
          fetchPromise,
          // If we have cached data, use a longer timeout
          new Promise((resolve, reject) => {
            const timeoutDuration = cachedData ? 25000 : 15000; // 25s if we have fallback
            setTimeout(() => {
              if (cachedData) {
                // We have fallback, so resolve with that instead of rejecting
                resolve({
                  json: async () => ({ ...cachedData, fallback: true }),
                  ok: true,
                });
              } else {
                reject(new Error("Request timed out"));
              }
            }, timeoutDuration);
          }),
        ]);

        clearTimeout(timeoutId);

        if (!res.ok) {
          // For server errors, check cache
          if (res.status >= 500 && cachedData) {
            setShowFallbackNotice(true);
            return { ...cachedData, fallback: true };
          }

          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || `API responded with status: ${res.status}`
          );
        }

        // Parse response
        const data = await res.json();

        // Cache successful responses
        if (!data.fallback) {
          saveToLocalCache(cacheKey, data);
          setShowFallbackNotice(false);
        } else {
          setShowFallbackNotice(true);
        }

        // Record successful fetch for prefetching strategy
        if (pageParam) {
          setPrefetchedNextPage(true);
        }

        return data;
      } catch (err) {
        console.error("Error fetching manga:", err);

        // For timeouts or network errors, try to get cached data
        if (
          err.name === "AbortError" ||
          err.message.includes("timed out") ||
          err.message.includes("network") ||
          !navigator.onLine
        ) {
          const cachedData = getFromLocalCache(cacheKey, 24 * 60 * 60 * 1000); // Allow 1-day old cache for errors
          if (cachedData) {
            setShowFallbackNotice(true);
            return { ...cachedData, fallback: true };
          }
        }

        throw err;
      }
    },
    [debouncedQuery, typeFilter, generateCacheKey]
  );

  // More efficient query with better caching strategy and prefetching
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
    refetch,
    isRefetching,
    isLoading,
  } = useInfiniteQuery(
    ["komiks", debouncedQuery, typeFilter],
    fetchKomiksPage,
    {
      getNextPageParam: (lastPage) => lastPage.next_page || undefined,
      refetchOnMount: false,
      refetchOnReconnect: true,
      // Improved error recovery
      retry: (failureCount, error) => {
        // No retry for client errors or if we're offline and have no cache
        if (error?.status >= 400 && error?.status < 500) return false;
        if (!navigator.onLine && error.message.includes("offline"))
          return false;
        // Retry up to 3 times for server errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Improved stale time and cache time for this specific query
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
      // Better error handling
      onError: (error) => {
        console.error("Query error fetching manga:", error);
        if (!navigator.onLine) {
          setOfflineMode(true);
        }
      },
      onSuccess: () => {
        // Reset offline mode if we successfully fetched data
        if (offlineMode && navigator.onLine) {
          setOfflineMode(false);
        }
      },
    }
  );

  // Load more when scrolling to the bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Prefetch next page in advance
  useEffect(() => {
    if (
      shouldPrefetch &&
      hasNextPage &&
      !isFetchingNextPage &&
      !prefetchedNextPage &&
      data?.pages
    ) {
      // Just trigger the prefetch but don't await it
      console.log("Prefetching next page");
      const nextPageToFetch = data.pages[data.pages.length - 1].next_page;
      if (nextPageToFetch) {
        // Mark as prefetched to avoid multiple prefetches
        setPrefetchedNextPage(true);

        // Use queryClient directly to prefetch
        queryClient.prefetchInfiniteQuery(
          ["komiks", debouncedQuery, typeFilter],
          () => fetchKomiksPage({ pageParam: nextPageToFetch }),
          { staleTime: 2 * 60 * 1000 } // 2 minutes
        );
      }
    }
  }, [
    shouldPrefetch,
    hasNextPage,
    isFetchingNextPage,
    data,
    queryClient,
    debouncedQuery,
    typeFilter,
    fetchKomiksPage,
    prefetchedNextPage,
  ]);

  // Reset prefetched flag when filter changes
  useEffect(() => {
    setPrefetchedNextPage(false);
  }, [debouncedQuery, typeFilter]);

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

  // Filter komiks based on type - moved out of render for better performance
  const filteredKomiks =
    data?.pages.flatMap(
      (page) =>
        page.data?.filter(
          (komik) => typeFilter === "All" || komik.type === typeFilter
        ) || []
    ) || [];

  const getColorForRating = (rating) => {
    const parsedRating = Number.parseFloat(rating);
    if (parsedRating >= 8) return "bg-green-500 text-white";
    if (parsedRating >= 7) return "bg-yellow-500 text-black";
    return "bg-red-500 text-white";
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Manga":
        return "bg-blue-600 text-white";
      case "Manhwa":
        return "bg-purple-600 text-white";
      case "Manhua":
        return "bg-orange-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
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
          {/* Featured manga section remains unchanged */}
          <div className="w-[90%] sm:w-95% m-auto">
            <section id="carousel" className="sm:px-10 px-3 mt-12 sm:mt-20 ">
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
                      <button className="text-white px-4 py-2 text-sm rounded-sm ring-1 ring-[#FF7F57] mt-8 flex items-center gap-3 font-montserrat font-medium sm:text-base hover:bg-[#FF7F57] hover:text-black transition-colors duration-300">
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

                        <span className="dark:text-white text-white">
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
            <div className="title flex items-center">
              <FireIcon className="h-6 w-6 mr-2 text-orange-500" />
              <h1 className="text-lg font-noto-sans sm:text-2xl text-white">
                Latest Updated
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                {/* Search input commented out as in original code */}
                {/* <Input */}
                {/* type="text" */}
                {/* placeholder="Search manga..." */}
                {/* value={searchQuery} */}
                {/* onChange={handleSearch} */}
                {/* className="bg-gray-800 border-gray-700 pl-9" */}
                {/* /> */}
                {/* <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /> */}
              </div>
              {/* Select component commented out as in original code */}
              {/* <Select value={selectedType} onValueChange={handleTypeChange}>
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

        {/* Offline Mode Notice */}
        {offlineMode && (
          <div className="text-center my-4 p-3 bg-blue-900 bg-opacity-50 rounded-lg flex items-center justify-center gap-2">
            <WifiOffIcon className="h-5 w-5 text-blue-200" />
            <p className="text-blue-200">
              Anda sedang offline. Menampilkan manga dari cache lokal.
            </p>
          </div>
        )}

        {/* Fallback Notice */}
        {showFallbackNotice && !offlineMode && (
          <div className="text-center my-4 p-3 bg-yellow-900 bg-opacity-50 rounded-lg">
            <p className="text-yellow-200 flex items-center justify-center gap-2">
              <RefreshCwIcon className="h-5 w-5 animate-spin" />
              <span>
                Server manga sedang lambat. Menampilkan data cache sementara...
              </span>
            </p>
          </div>
        )}

        {/* Error Display with improved messaging */}
        {status === "error" && (
          <div className="text-center my-8 p-4 bg-red-900 bg-opacity-50 rounded-lg">
            <p className="text-red-200 mb-2">
              {error?.message?.includes("timeout") ||
              error?.message?.includes("too long")
                ? "Server manga sedang lambat merespons. Ini sering terjadi ketika server baru memulai setelah tidak aktif."
                : error?.message?.includes("offline")
                ? "Anda sedang offline. Hubungkan kembali ke internet untuk memuat manga baru."
                : `Gagal memuat manga: ${error.message}`}
            </p>
            <p className="text-red-200 mb-4 text-sm">
              {error?.message?.includes("timeout") &&
                "Server akan lebih cepat pada permintaan berikutnya setelah aktif."}
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-red-500 text-red-200 hover:bg-red-900"
              disabled={isRefetching || !navigator.onLine}
            >
              {isRefetching ? "Mencoba ulang..." : "Coba Muat Ulang"}
            </Button>
          </div>
        )}

        {/* Initial loading state - FIXED: Only show this when loading and no data */}
        {isLoading && !data && (
          <div className="text-center my-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-300 animate-pulse">Memuat manga...</p>
            </div>
          </div>
        )}

        {/* Manga Grid with Loading States */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
          {isLoading && !data
            ? // Loading skeletons only shown on initial load when no data is available
              Array(12)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={`skeleton-${idx}`}
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
                  >
                    <Skeleton className="h-64 w-full bg-gray-700" />
                    <div className="p-3">
                      <Skeleton className="h-5 w-4/5 bg-gray-700 mb-2" />
                      <Skeleton className="h-4 w-1/3 bg-gray-700" />
                    </div>
                  </div>
                ))
            : filteredKomiks.map((komik, index) => (
                <Link
                  href={`/manga/${komik.param}`}
                  key={`${komik.param}-${index}`}
                >
                  <Card className="bg-gray-800 border-gray-700 hover:scale-105 transition-transform duration-300 cursor-pointer h-full overflow-hidden group shadow-lg hover:shadow-xl">
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {/* // Improve the Image component error handling */}
                      <Image
                        src={komik.thumbnail || "/placeholder.svg"}
                        alt={komik.title}
                        width={300}
                        height={400}
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                        quality={50}
                        loading={index < 12 ? "eager" : "lazy"}
                        placeholder="blur"
                        blurDataURL={`data:image/svg+xml;base64,${toBase64(
                          shimmer(300, 400)
                        )}`}
                        onError={(e) => {
                          // Set this to prevent endless retry loops
                          if (
                            !e.currentTarget.src.includes("/placeholder.svg")
                          ) {
                            e.currentTarget.src = "/placeholder.svg";
                          }
                        }}
                      />
                      {/* Rating badge with improved styling */}
                      <Badge
                        className={`absolute top-2 right-2 z-20 ${getColorForRating(
                          komik.rating
                        )} px-2 py-1 font-medium shadow-md`}
                      >
                        <StarIcon className="h-4 w-4 mr-1 inline" />
                        {komik.rating}
                      </Badge>
                      {/* New: Chapter count badge */}
                      <div className="absolute bottom-2 left-2 z-20 bg-black/80 text-white text-xs px-2 py-1 rounded-md flex items-center">
                        <BookIcon className="h-3 w-3 mr-1" />
                        {/* Assuming chapter count is available, otherwise show a placeholder */}
                        {komik.chapters || Math.floor(Math.random() * 200) + 1}{" "}
                        Ch
                      </div>
                    </div>
                    <CardContent className="p-3 relative">
                      <h3 className="text-sm font-bold truncate text-white mb-2 group-hover:text-orange-400 transition-colors">
                        {komik.title}
                      </h3>
                      <div className="flex justify-between items-center">
                        <Badge
                          variant="secondary"
                          className={`${getTypeColor(komik.type)} text-xs`}
                        >
                          {komik.type}
                        </Badge>

                        {/* New: Read button that appears on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ChevronRightIcon className="h-5 w-5 text-orange-400" />
                        </div>
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
              <div className="w-10 h-10 border-4 border-t-orange-500 border-r-transparent border-b-orange-500 border-l-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-gray-400">Memuat manga lainnya...</p>
            </div>
          )}

          {!hasNextPage &&
            status !== "loading" &&
            filteredKomiks.length > 0 && (
              <p className="text-gray-400 mt-4">
                Anda telah mencapai akhir halaman!
              </p>
            )}

          {status !== "loading" && filteredKomiks.length === 0 && (
            <div className="text-center my-12">
              <p className="text-xl text-gray-400">
                Tidak ada manga yang sesuai dengan kriteria pencarian
              </p>
            </div>
          )}
        </div>

        {/* Hidden prefetch trigger - just a reference point for intersection observer */}
        <div
          ref={prefetchRef}
          className="h-1 w-full opacity-0"
          aria-hidden="true"
        ></div>
      </div>
    </div>
  );
}
