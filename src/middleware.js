import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Sederhana in-memory rate limiting
// Dalam produksi sebaiknya gunakan solusi seperti Redis
const rateLimit = {
  tokenBucket: new Map(),
  interval: 60 * 1000, // 1 menit
  maxRequests: 100, // Maksimal request per interval
};

export async function middleware(request) {
  const response = NextResponse.next();

  // Konfigurasi CORS
  // Hanya izinkan request dari aplikasi itu sendiri (same-origin) secara default
  const origin = request.headers.get("origin");

  // Daftar domain yang diizinkan
  const allowedOrigins = [
    "http://localhost:3000", // Development
    "https://mangaverse.vercel.app", // Sesuaikan dengan domain produksi Anda
    // Tambahkan domain lain yang diizinkan di sini
  ];

  if (origin) {
    if (allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    } else {
      // Jika origin tidak diizinkan, tolak request dengan CORS error
      return new NextResponse("CORS error: Domain tidak diizinkan", {
        status: 403,
      });
    }
  }

  // Izinkan metode HTTP yang dibutuhkan
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-API-Key"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return response;
  }

  // API Key protection for browser access
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Get the API key from environment variable
    const validApiKey = process.env.API_KEY;

    if (!validApiKey) {
      console.warn("API_KEY not configured in environment variables!");
    }

    // Check if request is from a browser (based on Accept header)
    const acceptHeader = request.headers.get("accept") || "";
    const isRequestFromBrowser = acceptHeader.includes("text/html");

    // Get API key from the request header
    const apiKey = request.headers.get("x-api-key");

    // If it's a browser request or specifically requesting HTML content
    if (isRequestFromBrowser) {
      // Check if API key is provided and valid
      if (!apiKey || apiKey !== validApiKey) {
        return new NextResponse(
          JSON.stringify({
            error: "Unauthorized - API key required",
            message:
              "Direct browser access to API endpoints is not allowed. Please use the application interface or provide a valid API key.",
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // For programmatic requests, require API key for sensitive endpoints
    // Daftar endpoint yang selalu memerlukan API key
    const PROTECTED_API_ENDPOINTS = [
      "/api/user",
      "/api/admin",
      "/api/bookmarks",
      "/api/comments",
    ];

    if (
      PROTECTED_API_ENDPOINTS.some((endpoint) =>
        request.nextUrl.pathname.startsWith(endpoint)
      )
    ) {
      // Periksa referrer untuk mengizinkan akses dari aplikasi kita sendiri
      const referer = request.headers.get("referer") || "";
      const isFromOurWebsite = allowedOrigins.some((origin) =>
        referer.startsWith(origin)
      );

      // Jika request berasal dari website kita sendiri, izinkan tanpa API key
      if (isFromOurWebsite) {
        // Lanjutkan request
        console.log(
          `Request dari website sendiri ke ${request.nextUrl.pathname} diizinkan`
        );
      }
      // Jika dari luar, tetap memerlukan API key
      else if (!apiKey || apiKey !== validApiKey) {
        console.log(
          `Unauthorized access attempt to ${request.nextUrl.pathname} tanpa API key valid`
        );
        return new NextResponse(
          JSON.stringify({
            error: "Unauthorized - Valid API key required for this endpoint",
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }
  }

  // API Rate limiting
  if (request.nextUrl.pathname.startsWith("/api")) {
    // Gunakan IP address atau session token sebagai identifier
    const ip = request.ip || "anonymous";

    // Cek apakah sudah ada token bucket untuk IP ini
    if (!rateLimit.tokenBucket.has(ip)) {
      rateLimit.tokenBucket.set(ip, {
        tokens: rateLimit.maxRequests,
        lastRefill: Date.now(),
      });
    }

    const bucket = rateLimit.tokenBucket.get(ip);

    // Isi ulang token jika interval sudah lewat
    const currentTime = Date.now();
    const timePassedSinceLastRefill = currentTime - bucket.lastRefill;

    if (timePassedSinceLastRefill > rateLimit.interval) {
      bucket.tokens = rateLimit.maxRequests;
      bucket.lastRefill = currentTime;
    }

    // Cek apakah masih ada token tersisa
    if (bucket.tokens <= 0) {
      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: "Terlalu banyak request. Coba lagi nanti.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60", // Menunjukkan kapan client bisa coba lagi (dalam detik)
          },
        }
      );
    }

    // Kurangi token
    bucket.tokens -= 1;
  }

  // Tambahan keamanan untuk endpoint sensitif (yang mengubah data)
  const SENSITIVE_METHODS = ["POST", "PUT", "PATCH", "DELETE"];
  const SENSITIVE_PATHS = ["/api/user", "/api/comments", "/api/bookmarks"];

  if (
    SENSITIVE_METHODS.includes(request.method) &&
    SENSITIVE_PATHS.some((path) => request.nextUrl.pathname.startsWith(path))
  ) {
    try {
      // Cek apakah pengguna terautentikasi (token JWT valid)
      const token = await getToken({ req: request });

      if (!token) {
        return new NextResponse(
          JSON.stringify({
            error: "Unauthorized",
            message: "Anda harus login untuk mengakses API ini",
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (error) {
      console.error("Error verifying auth token:", error);
      return new NextResponse(
        JSON.stringify({
          error: "Authentication Error",
          message: "Kesalahan autentikasi",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }

  // Tambahkan header keamanan
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Menambahkan Content-Security-Policy untuk keamanan tambahan
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; img-src 'self' data: https:; connect-src 'self'"
  );

  return response;
}

// Konfigurasi path mana yang akan diproses oleh middleware
export const config = {
  matcher: [
    // Perlindungan CORS hanya diperlukan untuk API routes
    "/api/:path*",
    // Tambahkan path lain yang perlu dilindungi
  ],
};
