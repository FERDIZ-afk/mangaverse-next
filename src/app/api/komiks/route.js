export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url =
      searchParams.get("url") ||
      "http://weeb-scraper.onrender.com/api/komikcast";

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // Jika ada URL halaman berikutnya, simpan URL aslinya
    if (data.next_page) {
      // Simpan URL asli agar bisa diproses oleh proxy saat diminta
      data.next_page = data.next_page;
    }

    return Response.json(data);
  } catch (error) {
    console.error("Error proxying request:", error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
