import { NextResponse } from "next/server";
import { chapterSchema } from "@/lib/validations/manga";
import { safeParse } from "valibot";

export async function GET(request, { params }) {
  let slug, chapter;
  try {
    // Pastikan params tersedia (gunakan await)
    const paramsData = await params;
    if (!paramsData?.slug || !paramsData?.chapter) {
      return NextResponse.json(
        { error: "Manga slug and chapter required" },
        { status: 400 }
      );
    }

    slug = paramsData.slug;
    chapter = paramsData.chapter;
    console.log(`Fetching chapter: ${chapter} for manga: ${slug}`);

    // URL asli yang digunakan sebelumnya
    const apiUrl = `http://weeb-scraper.onrender.com/api/komikcast/chapter/${slug}-${chapter}`;
    console.log("Full URL:", apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    console.log("API Response status:", response.status);

    if (!response.ok) {
      console.log("Using fallback data due to API error");
      // Ekstrak informasi dari slug
      const { mangaSlug, chapterNumber, prevChapter, nextChapter } =
        extractInfoFromSlug(`${slug}-${chapter}`);
      // Buat judul manga dari slug manga
      const mangaTitle = generateTitleFromSlug(mangaSlug);
      // Buat hash untuk konsistensi data
      const hash = Math.abs(hashCode(`${slug}-${chapter}`));
      // Buat array gambar fallback yang bervariasi
      const fallbackImages = generateFallbackImages(
        mangaSlug,
        chapterNumber,
        hash
      );

      return NextResponse.json({
        title: mangaTitle,
        chapter_number: chapterNumber,
        manga_param: mangaSlug,
        prev_chapter: prevChapter,
        next_chapter: nextChapter,
        images: fallbackImages,
      });
    }

    const rawData = await response.text();
    if (!rawData || rawData.trim() === "") {
      console.log("Empty response from API, using fallback data");
      return useFallbackData(slug, chapter);
    }

    let data;
    try {
      data = JSON.parse(rawData);

      if (!data || !data.data) {
        console.log("Invalid API data format, using fallback data");
        return useFallbackData(slug, chapter);
      }

      // Format data dengan struktur yang sama seperti fallback
      const { mangaSlug, chapterNumber } = extractInfoFromSlug(
        `${slug}-${chapter}`
      );
      const mangaTitle = generateTitleFromSlug(mangaSlug);

      // Ekstrak informasi chapter
      const chapterNum = parseInt(chapterNumber, 10);
      const prevChapter =
        chapterNum > 1
          ? `${mangaSlug}-chapter-${(chapterNum - 1)
              .toString()
              .padStart(2, "0")}-bahasa-indonesia`
          : null;
      const nextChapter = `${mangaSlug}-chapter-${(chapterNum + 1)
        .toString()
        .padStart(2, "0")}-bahasa-indonesia`;

      // Format data dengan struktur yang sama seperti fallback
      return NextResponse.json({
        title: mangaTitle,
        chapter_number: chapterNumber,
        manga_param: mangaSlug,
        prev_chapter: prevChapter,
        next_chapter: nextChapter,
        images: data.data, // gunakan array gambar dari API langsung
      });
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return useFallbackData(slug, chapter);
    }
  } catch (error) {
    console.error("Error in chapter API route:", error);
    if (slug && chapter) {
      return useFallbackData(slug, chapter);
    }
    return NextResponse.json(
      { error: `Failed to fetch chapter details: ${error.message}` },
      { status: 500 }
    );
  }
}

// Helper untuk menggunakan fallback data
function useFallbackData(slug, chapter) {
  // Ekstrak informasi dari slug
  const { mangaSlug, chapterNumber, prevChapter, nextChapter } =
    extractInfoFromSlug(`${slug}-${chapter}`);
  // Buat judul manga dari slug manga
  const mangaTitle = generateTitleFromSlug(mangaSlug);
  // Buat hash untuk konsistensi data
  const hash = Math.abs(hashCode(`${slug}-${chapter}`));
  // Buat array gambar fallback yang bervariasi
  const fallbackImages = generateFallbackImages(mangaSlug, chapterNumber, hash);

  return NextResponse.json({
    title: mangaTitle,
    chapter_number: chapterNumber,
    manga_param: mangaSlug,
    prev_chapter: prevChapter,
    next_chapter: nextChapter,
    images: fallbackImages,
  });
}

// Fungsi untuk mengubah slug menjadi judul yang lebih manusiawi
function generateTitleFromSlug(slug) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Fungsi hash sederhana
function hashCode(s) {
  return s.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
}

// Fungsi untuk mengekstrak informasi dari slug chapter
function extractInfoFromSlug(slug) {
  // Pola umum: manga-name-chapter-XX-bahasa-indonesia
  let chapterNumber = "1";
  let mangaSlug = slug;
  let prevChapter = null;
  let nextChapter = null;

  // Coba ekstrak nomor chapter
  const chapterMatch = slug.match(/-chapter-(\d+)/i);
  if (chapterMatch && chapterMatch[1]) {
    chapterNumber = chapterMatch[1];

    // Ekstrak slug manga (semua sebelum -chapter-)
    const mangaSlugMatch = slug.match(/(.*?)-chapter-/i);
    if (mangaSlugMatch && mangaSlugMatch[1]) {
      mangaSlug = mangaSlugMatch[1];
    }

    // Buat slug chapter sebelumnya dan berikutnya
    const chapterNum = parseInt(chapterNumber, 10);
    if (chapterNum > 1) {
      const prevChapterNum = chapterNum - 1;
      prevChapter = `${mangaSlug}-chapter-${prevChapterNum
        .toString()
        .padStart(2, "0")}-bahasa-indonesia`;
    }

    const nextChapterNum = chapterNum + 1;
    nextChapter = `${mangaSlug}-chapter-${nextChapterNum
      .toString()
      .padStart(2, "0")}-bahasa-indonesia`;
  }

  return { mangaSlug, chapterNumber, prevChapter, nextChapter };
}

// Fungsi untuk menghasilkan gambar fallback yang bervariasi
function generateFallbackImages(mangaSlug, chapterNumber, hash) {
  // Buat tema gambar berdasarkan hash
  const themes = [
    { bg: "333333", text: "FFFFFF" },
    { bg: "553322", text: "FFFFFF" },
    { bg: "224477", text: "FFFFFF" },
    { bg: "117755", text: "FFFFFF" },
    { bg: "772211", text: "FFFFFF" },
  ];

  // Pilih tema berdasarkan hash
  const theme = themes[hash % themes.length];

  // Tentukan jumlah halaman (8-15 halaman)
  const numberOfPages = 8 + (hash % 8);

  // Buat array gambar SVG base64
  const images = [];

  // Buat gambar SVG untuk setiap halaman dan encode sebagai base64
  for (let i = 1; i <= numberOfPages; i++) {
    const mangaTitle = generateTitleFromSlug(mangaSlug);
    const pageText = `${mangaTitle} - Ch ${chapterNumber} - Page ${i}`;

    // Buat konten SVG
    const svgContent = `<svg width="800" height="1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="1200" fill="#${theme.bg}"/>
      <text x="400" y="200" font-family="Arial" font-size="36" fill="#${theme.text}" text-anchor="middle">Manga Page</text>
      <text x="400" y="300" font-family="Arial" font-size="24" fill="#${theme.text}" text-anchor="middle">${pageText}</text>
      <text x="400" y="600" font-family="Arial" font-size="72" fill="#${theme.text}" text-anchor="middle">${i}</text>
      <text x="400" y="1000" font-family="Arial" font-size="18" fill="#${theme.text}" text-anchor="middle">MangaVerse Fallback Image</text>
    </svg>`;

    // Encode SVG sebagai base64 (gunakan btoa di client, Buffer di server)
    let base64Image;
    try {
      // Server-side (Node.js)
      base64Image = Buffer.from(svgContent).toString("base64");
    } catch (e) {
      // Client-side (Browser)
      base64Image = btoa(svgContent);
    }

    const dataUrl = `data:image/svg+xml;base64,${base64Image}`;
    images.push(dataUrl);
  }

  return images;
}
