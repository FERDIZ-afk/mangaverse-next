import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("s");

    if (!query) {
      return NextResponse.json(
        { success: false, message: "Parameter 's' diperlukan" },
        { status: 400 }
      );
    }

    const apiUrl = `https://weeb-scraper.onrender.com/api/komikcast?s=${encodeURIComponent(
      query
    )}`;
    const response = await fetch(apiUrl, { cache: "no-store" });
    const data = await response.json();

    if (!data || !data.data || data.data.length === 0) {
      return NextResponse.json(
        { success: false, message: "Komik tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
