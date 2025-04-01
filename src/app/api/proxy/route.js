import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 18; // Tampilkan 18 item per page

    const response = await fetch(
      "http://weeb-scraper.onrender.com/api/komikcast"
    );
    const data = await response.json();

    // Log untuk debugging
    console.log("Raw API response:", data);

    // Tambahkan ini setelah fetch
    console.log("API Response Structure:", {
      isArray: Array.isArray(data.data),
      dataType: typeof data.data,
      keys: data.data ? Object.keys(data.data) : [],
      sample: data.data,
    });

    // Periksa struktur data yang benar
    if (!data || !data.data) {
      throw new Error("Invalid data format from API");
    }

    // Pastikan data.data adalah array sebelum di-filter
    let mangaList = Array.isArray(data.data) ? data.data : [];

    // Jika data.data bukan array, coba ambil dari properti lain
    if (!Array.isArray(data.data) && data.data.chapters) {
      mangaList = data.data.chapters;
    }

    // Filter berdasarkan type
    let filteredData = mangaList.filter((item) => {
      // Pastikan item dan type ada sebelum membandingkan
      if (!item || !item.type) return false;
      return item.type.toLowerCase() === type.toLowerCase();
    });

    // Hitung total pages dan slice data sesuai page yang diminta
    const totalItems = filteredData.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const currentPageData = filteredData.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: currentPageData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems: totalItems,
        hasMore: endIndex < totalItems,
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    // Tambahkan lebih banyak detail error untuk debugging
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        details: {
          name: error.name,
          stack: error.stack,
        },
      },
      { status: 500 }
    );
  }
}
