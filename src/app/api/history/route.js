import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Redireksi ke halaman riwayat baca
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Cek apakah pengguna login
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Anda harus login untuk mengakses riwayat baca" },
        { status: 401 }
      );
    }

    // Riwayat baca sekarang ditangani oleh localStorage di sisi klien
    return NextResponse.json([]);
  } catch (error) {
    console.error("Error handling reading history:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengakses riwayat baca" },
      { status: 500 }
    );
  }
}

// POST: Menangani aksi pencatatan riwayat baca
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Cek apakah pengguna login
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Anda harus login untuk menyimpan riwayat baca" },
        { status: 401 }
      );
    }

    // Tidak perlu menyimpan data di server, akan ditangani oleh localStorage di klien
    const body = await request.json();
    const { mangaSlug, mangaTitle, chapterSlug, chapterTitle } = body;

    // Validasi input
    if (!mangaSlug || !mangaTitle || !chapterSlug || !chapterTitle) {
      return NextResponse.json(
        {
          error:
            "Semua data diperlukan (mangaSlug, mangaTitle, chapterSlug, chapterTitle)",
        },
        { status: 400 }
      );
    }

    // Kirim balik data untuk disimpan di localStorage oleh klien
    return NextResponse.json({
      success: true,
      message: "Gunakan localStorage untuk menyimpan data",
      data: {
        id: Date.now().toString(), // Menggunakan timestamp sebagai ID
        userId: session.user.id,
        mangaSlug,
        mangaTitle,
        chapterSlug,
        chapterTitle,
        readAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error handling reading history:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses riwayat baca" },
      { status: 500 }
    );
  }
}

// DELETE: Tanggapan untuk permintaan hapus riwayat
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    // Cek apakah pengguna login
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Anda harus login untuk menghapus riwayat baca" },
        { status: 401 }
      );
    }

    // Penghapusan ditangani di sisi klien dengan localStorage
    return NextResponse.json({
      success: true,
      message: "Gunakan localStorage untuk menghapus data",
    });
  } catch (error) {
    console.error("Error handling delete request:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses permintaan" },
      { status: 500 }
    );
  }
}
