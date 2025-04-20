"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { saveToLocalCache, getFromLocalCache } from "@/utils/cache-helpers";

export default function useComicFetch(comicType) {
  const [comicList, setComicList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [showFallbackNotice, setShowFallbackNotice] = useState(false);

  // Ref to track network status
  const networkStatusRef = useRef({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    lastOnlineCheck: Date.now(),
  });

  // Intersection observer for infinite loading
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "400px",
    triggerOnce: false,
  });

  // Cache key generation helper
  const generateCacheKey = useCallback(
    (pageUrl = null) => {
      return `${comicType}_${pageUrl || "initial"}`;
    },
    [comicType]
  );

  // Fetch comics with caching
  const fetchComics = useCallback(
    async (pageUrl = null) => {
      setLoading(true);
      const cacheKey = generateCacheKey(pageUrl);

      // Check online status
      const isOnline = navigator.onLine;
      if (!isOnline) {
        const cachedData = getFromLocalCache(cacheKey);
        if (cachedData) {
          setShowFallbackNotice(true);
          setOfflineMode(true);

          if (!pageUrl) {
            setComicList(cachedData.data || []);
          } else {
            setComicList((prev) => [...prev, ...(cachedData.data || [])]);
          }

          setNextPage(cachedData.pagination?.nextPage || null);
          setHasMore(!!cachedData.pagination?.nextPage);
          setLoading(false);
          return;
        }

        setError("Anda sedang offline dan tidak ada data cache yang tersedia");
        setLoading(false);
        return;
      }

      try {
        const url = pageUrl || `/api/proxy?type=${comicType}`;

        // Set a timeout for the fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

        // Check cache for fresher data
        const cachedData = getFromLocalCache(cacheKey, 5 * 60 * 1000); // 5 min for normal operation

        const fetchPromise = fetch(url, {
          signal: controller.signal,
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

            if (!pageUrl) {
              setComicList(cachedData.data || []);
            } else {
              setComicList((prev) => [...prev, ...(cachedData.data || [])]);
            }

            setNextPage(cachedData.pagination?.nextPage || null);
            setHasMore(!!cachedData.pagination?.nextPage);
            setLoading(false);
            return;
          }

          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || `API responded with status: ${res.status}`
          );
        }

        // Parse response
        const data = await res.json();

        // Process the data
        if (data.success && data.data) {
          const validComics = data.data.map((item) => ({
            ...item,
            slug: item.param || item.id?.toString(),
          }));

          if (!pageUrl) {
            setComicList(validComics);
          } else {
            setComicList((prev) => [...prev, ...validComics]);
          }

          // Cache successful responses
          saveToLocalCache(cacheKey, {
            data: validComics,
            pagination: {
              nextPage: data.pagination?.nextPage || null,
            },
          });

          setNextPage(data.pagination?.nextPage || null);
          setHasMore(!!data.pagination?.nextPage);
          setShowFallbackNotice(false);
        } else {
          throw new Error(data.message || `Failed to fetch ${comicType}`);
        }
      } catch (err) {
        console.error(`Error fetching ${comicType}:`, err);

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

            if (!pageUrl) {
              setComicList(cachedData.data || []);
            } else {
              setComicList((prev) => [...prev, ...(cachedData.data || [])]);
            }

            setNextPage(cachedData.pagination?.nextPage || null);
            setHasMore(!!cachedData.pagination?.nextPage);
            setLoading(false);
            return;
          }
        }

        setError(`Gagal memuat data ${comicType}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    },
    [comicType, generateCacheKey]
  );

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log("App is back online");
      networkStatusRef.current.isOnline = true;
      networkStatusRef.current.lastOnlineCheck = Date.now();
      setOfflineMode(false);
      // Refetch data if we've been offline
      if (comicList.length > 0) {
        fetchComics();
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
  }, [fetchComics, comicList.length]);

  // Initial fetch
  useEffect(() => {
    fetchComics();
  }, [fetchComics]);

  // Load more when scrolling to the bottom
  useEffect(() => {
    if (inView && hasMore && !loading && nextPage) {
      fetchComics(nextPage);
    }
  }, [inView, hasMore, loading, nextPage, fetchComics]);

  return {
    comicList,
    loading,
    error,
    hasMore,
    loadMoreRef,
    offlineMode,
    showFallbackNotice,
    refetch: () => fetchComics(),
  };
}
