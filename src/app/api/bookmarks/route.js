import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET: Ambil daftar bookmark pengguna
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Cek apakah pengguna login
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Anda harus login untuk mengakses bookmark" },
        { status: 401 }
      );
    }

    // Ambil bookmark
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil bookmark" },
      { status: 500 }
    );
  }
}

// POST: Tambah atau hapus bookmark
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Cek apakah pengguna login
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Anda harus login untuk menambahkan bookmark" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { mangaSlug, mangaTitle } = body;

    // Validasi input
    if (!mangaSlug || !mangaTitle) {
      return NextResponse.json(
        { error: "Slug dan judul manga diperlukan" },
        { status: 400 }
      );
    }

    console.log("Toggle bookmark request:", {
      mangaSlug,
      mangaTitle,
      userId: session.user.id,
    });

    // Cek apakah bookmark sudah ada
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId: session.user.id,
        mangaSlug,
      },
    });

    // Jika bookmark sudah ada, hapus (toggle off)
    if (existingBookmark) {
      try {
        await prisma.bookmark.delete({
          where: {
            id: existingBookmark.id,
          },
        });

        return NextResponse.json({
          action: "removed",
          message: "Bookmark telah dihapus",
        });
      } catch (deleteError) {
        console.error("Error deleting bookmark:", deleteError);
        return NextResponse.json(
          { error: "Terjadi kesalahan saat menghapus bookmark" },
          { status: 500 }
        );
      }
    }

    // Jika bookmark belum ada, buat baru (toggle on)
    try {
      // Periksa dahulu apakah user ada di database
      const userExists = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true },
      });

      if (!userExists) {
        return NextResponse.json(
          { error: "User tidak ditemukan di database" },
          { status: 404 }
        );
      }

      const bookmark = await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          mangaSlug,
          mangaTitle,
        },
      });

      return NextResponse.json({
        action: "added",
        message: "Bookmark telah ditambahkan",
        data: bookmark,
      });
    } catch (createError) {
      console.error("Detailed error creating bookmark:", createError);

      return NextResponse.json(
        { error: "Terjadi kesalahan saat menambahkan bookmark" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menambahkan bookmark" },
      { status: 500 }
    );
  }
}

// DELETE: Hapus bookmark
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    // Cek apakah pengguna login
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Anda harus login untuk menghapus bookmark" },
        { status: 401 }
      );
    }

    // Parse URL untuk mendapatkan parameter
    const url = new URL(request.url);
    const mangaSlug = url.searchParams.get("mangaSlug");

    // Validasi parameter
    if (!mangaSlug) {
      return NextResponse.json(
        { error: "Parameter mangaSlug diperlukan" },
        { status: 400 }
      );
    }

    console.log(
      "Deleting bookmark for:",
      mangaSlug,
      "User ID:",
      session.user.id
    );

    // Hapus bookmark
    await prisma.bookmark.deleteMany({
      where: {
        userId: session.user.id,
        mangaSlug,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus bookmark" },
      { status: 500 }
    );
  }
}

// HEAD: Cek status bookmark
export async function HEAD(request) {
  try {
    const session = await getServerSession(authOptions);

    // Cek apakah pengguna login
    if (!session || !session.user) {
      return new NextResponse(null, { status: 401 });
    }

    // Parse URL untuk mendapatkan parameter
    const url = new URL(request.url);
    const mangaSlug = url.searchParams.get("mangaSlug");

    // Validasi parameter
    if (!mangaSlug) {
      console.log(
        "Parameter mangaSlug tidak ditemukan:",
        url.searchParams.toString()
      );
      return new NextResponse(null, { status: 400 });
    }

    console.log(
      "Checking bookmark for:",
      mangaSlug,
      "User ID:",
      session.user.id
    );

    // Cek apakah bookmark ada
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId: session.user.id,
        mangaSlug,
      },
    });

    // Return 200 jika bookmark ditemukan, 404 jika tidak
    return new NextResponse(null, {
      status: bookmark ? 200 : 404,
    });
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return new NextResponse(null, { status: 500 });
  }
}
