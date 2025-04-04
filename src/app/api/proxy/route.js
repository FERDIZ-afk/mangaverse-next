import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 18;

    const apiUrl = `http://weeb-scraper.onrender.com/api/komikcast?page=${page}`;
    const response = await fetch(apiUrl, { cache: "no-store" }); // Hindari caching
    const data = await response.json();

    console.log("Raw API response:", data);

    if (!data || !data.data) {
      throw new Error("Invalid data format from API");
    }

    let mangaList = Array.isArray(data.data) ? data.data : [];
    if (!Array.isArray(data.data) && data.data.chapters) {
      mangaList = data.data.chapters;
    }

    // Filter berdasarkan type
    let filteredData = mangaList.filter((item) => {
      if (!item || !item.type) return false;
      return item.type.toLowerCase() === type.toLowerCase();
    });

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
        totalItems,
        hasMore: endIndex < totalItems,
        nextPage:
          endIndex < totalItems
            ? `/api/proxy?type=${type}&page=${page + 1}`
            : null,
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
