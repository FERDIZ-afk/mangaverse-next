import { NextResponse } from "next/server";

// Simple in-memory cache to reduce API calls
let cachedData = {
  timestamp: 0,
  data: null,
  url: "",
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search");
    const urlParam = searchParams.get("url");

    // Construct the URL
    const url =
      urlParam ||
      (searchQuery
        ? `http://weeb-scraper.onrender.com/api/komikcast/search?q=${encodeURIComponent(
            searchQuery
          )}`
        : "http://weeb-scraper.onrender.com/api/komikcast");

    // Check if we have a valid cache (less than 5 minutes old)
    const now = Date.now();
    if (cachedData.url === url && now - cachedData.timestamp < 300000) {
      console.log("Serving from memory cache");
      return NextResponse.json(cachedData.data, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "X-Cache": "HIT",
        },
      });
    }

    // Create AbortController with increased timeout
    const controller = new AbortController();
    // Increase timeout to 15 seconds to accommodate cold starts on Render
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      console.log(`Fetching from: ${url}`);

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "MangaVerse/1.0",
          // Add a no-cache header to avoid any Fetch API caching
          "Cache-Control": "no-cache",
        },
        signal: controller.signal,
        next: { revalidate: 300 },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `External API responded with status: ${response.status}`
        );
      }

      const data = await response.json();

      // Update our memory cache
      cachedData = {
        timestamp: now,
        data: data,
        url: url,
      };

      return NextResponse.json(data, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "X-Cache": "MISS",
        },
      });
    } catch (error) {
      clearTimeout(timeoutId);
      throw error; // Re-throw for outer catch
    }
  } catch (error) {
    console.error("Error proxying request:", error);

    // Check if we have stale cached data to return as fallback
    if (cachedData.data && cachedData.url) {
      console.log("Serving stale data as fallback");
      return NextResponse.json(
        {
          ...cachedData.data,
          fallback: true,
          message: "Using cached data. The server is currently unavailable.",
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=60",
            "X-Cache": "STALE",
          },
        }
      );
    }

    // Specialized error handling
    if (error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Request timeout. The external API took too long to respond.",
          fallback: true,
          data: getFallbackData(), // Return fallback manga data
        },
        {
          status: 503, // Service Unavailable is better than 504 Gateway Timeout for UI handling
        }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch data: " + error.message,
        fallback: true,
        data: getFallbackData(),
      },
      { status: 500 }
    );
  }
}

// Fallback data function
function getFallbackData() {
  return {
    data: [
      {
        title: "One Piece",
        thumbnail: "/placeholder-manga.jpg",
        param: "one-piece",
        type: "Manga",
        rating: "9.5",
      },
      {
        title: "Solo Leveling",
        thumbnail: "/placeholder-manga.jpg",
        param: "solo-leveling",
        type: "Manhwa",
        rating: "9.2",
      },
      {
        title: "Jujutsu Kaisen",
        thumbnail: "/placeholder-manga.jpg",
        param: "jujutsu-kaisen",
        type: "Manga",
        rating: "9.0",
      },
      {
        title: "Tower of God",
        thumbnail: "/placeholder-manga.jpg",
        param: "tower-of-god",
        type: "Manhwa",
        rating: "8.9",
      },
    ],
    next_page: null,
  };
}
