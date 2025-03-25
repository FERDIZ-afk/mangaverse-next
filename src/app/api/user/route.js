import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET: Mendapatkan data profil pengguna
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Cek apakah pengguna login
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Anda harus login untuk mengakses profil" },
        { status: 401 }
      );
    }

    // Ambil data pengguna dari database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        created_at: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error getting user profile:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil profil pengguna" },
      { status: 500 }
    );
  }
}

// PATCH: Memperbarui data profil pengguna
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    // Cek apakah pengguna login
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Anda harus login untuk memperbarui profil" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, image, currentPassword, newPassword } = body;

    // Validasi data
    if (!name && !image && !newPassword) {
      return NextResponse.json(
        { error: "Tidak ada data yang diperbarui" },
        { status: 400 }
      );
    }

    // Jika ada permintaan untuk mengganti password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Password saat ini diperlukan untuk mengganti password" },
          { status: 400 }
        );
      }

      // Verifikasi password saat ini
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      });

      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordCorrect) {
        return NextResponse.json(
          { error: "Password saat ini tidak benar" },
          { status: 400 }
        );
      }

      // Hash password baru
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update data pengguna
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          ...(name && { name }),
          ...(image && { image }),
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });

      return NextResponse.json({
        message: "Profil berhasil diperbarui",
        user: updatedUser,
      });
    } else {
      // Update data pengguna tanpa mengubah password
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          ...(name && { name }),
          ...(image && { image }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });

      return NextResponse.json({
        message: "Profil berhasil diperbarui",
        user: updatedUser,
      });
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui profil pengguna" },
      { status: 500 }
    );
  }
}
