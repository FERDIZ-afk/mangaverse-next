import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { commentSchema } from "@/lib/validations/comment";
import { safeParse } from "valibot";

// GET: Mendapatkan komentar untuk manga tertentu
export async function GET(request) {
  try {
    // Parse URL untuk mendapatkan parameter
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    // Validasi parameter
    if (!slug) {
      return NextResponse.json(
        { error: "Parameter manga slug diperlukan" },
        { status: 400 }
      );
    }

    // Ambil komentar
    const comments = await prisma.comment.findMany({
      where: {
        mangaSlug: slug,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil komentar" },
      { status: 500 }
    );
  }
}

// POST: Menambahkan komentar baru
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Cek apakah pengguna login
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Anda harus login untuk menambahkan komentar" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validasi input
    const result = safeParse(commentSchema, body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    const { content, mangaSlug, chapter } = result.data;

    // Buat komentar baru
    const comment = await prisma.comment.create({
      data: {
        content,
        mangaSlug,
        chapter,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menambahkan komentar" },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus komentar
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    // Cek apakah pengguna login
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Anda harus login untuk menghapus komentar" },
        { status: 401 }
      );
    }

    // Parse URL untuk mendapatkan parameter
    const url = new URL(request.url);
    const commentId = url.searchParams.get("id");

    // Validasi parameter
    if (!commentId) {
      return NextResponse.json(
        { error: "ID komentar diperlukan" },
        { status: 400 }
      );
    }

    // Cek apakah komentar ada dan milik pengguna
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Komentar tidak ditemukan" },
        { status: 404 }
      );
    }

    // Pastikan hanya pemilik yang bisa menghapus
    if (comment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Tidak diizinkan menghapus komentar orang lain" },
        { status: 403 }
      );
    }

    // Hapus komentar
    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    return NextResponse.json({ message: "Komentar berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus komentar" },
      { status: 500 }
    );
  }
}
