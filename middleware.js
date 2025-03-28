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
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return response;
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
      return new NextResponse("Terlalu banyak request. Coba lagi nanti.", {
        status: 429,
      });
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
        return new NextResponse("Anda harus login untuk mengakses API ini", {
          status: 401,
        });
      }
    } catch (error) {
      console.error("Error verifying auth token:", error);
      return new NextResponse("Kesalahan autentikasi", { status: 401 });
    }
  }

  // Tambahkan header keamanan
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

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
