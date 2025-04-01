"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Calendar,
  Camera,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Save,
  Check,
  X,
  Loader2,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form values
  const [name, setName] = useState("");
  const [imageSrc, setImageSrc] = useState("/waguri.jpg");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Referensi untuk input file
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Jika tidak terautentikasi, arahkan ke halaman login
    if (status === "unauthenticated") {
      router.push("/login");
    }

    // Ambil data profil jika sudah terautentikasi
    if (status === "authenticated") {
      fetchUserProfile();
    }
  }, [status, router]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengambil data profil");
      }

      setUser(data.user);
      setName(data.user.name || "");
      setImageSrc(data.user.image || "/waguri.jpg");
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Gagal memuat profil. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setError("File yang dipilih bukan gambar.");
      return;
    }

    // Validasi ukuran file (maksimal 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran gambar terlalu besar. Maksimal 2MB.");
      return;
    }

    // Convert to base64 for preview and storage
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const toggleEditPassword = () => {
    setIsEditingPassword(!isEditingPassword);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    // Validasi data
    if (isEditingPassword) {
      if (!currentPassword) {
        setError("Password saat ini diperlukan");
        setIsSubmitting(false);
        return;
      }
      if (!newPassword) {
        setError("Password baru diperlukan");
        setIsSubmitting(false);
        return;
      }
      if (newPassword.length < 6) {
        setError("Password baru terlalu pendek (minimal 6 karakter)");
        setIsSubmitting(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Password baru dan konfirmasi tidak cocok");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload = {
        name,
        image: imageSrc === "/waguri.jpg" ? null : imageSrc,
      };

      // Tambahkan password jika sedang mengedit password
      if (isEditingPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui profil");
      }

      // Update session dengan data terbaru
      await update({
        ...session,
        user: {
          ...session.user,
          name: data.user.name,
          image: data.user.image,
        },
      });

      setUser(data.user);
      setSuccessMessage("Profil berhasil diperbarui");

      if (isEditingPassword) {
        setIsEditingPassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message || "Terjadi kesalahan. Silakan coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        {/* <Navbar /> */}
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl">Memuat profil...</p>
          </div>
        </div>
      </div>
    );
  }

  // Pastikan sudah login
  if (status === "unauthenticated") {
    return null; // Akan di-redirect ke login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* <Navbar /> */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link
            href="/"
            className="flex items-center text-gray-400 hover:text-white mr-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Kembali</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Profil Saya</h1>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-300 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500 bg-opacity-20 text-green-300 px-4 py-3 rounded-md mb-6 flex items-center">
            <Check className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 overflow-hidden rounded-full border-4 border-purple-600">
                  <Image
                    src={imageSrc}
                    alt="Foto profil"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 rounded-full p-2 text-white transition-colors"
                >
                  <Camera size={18} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <h2 className="text-xl font-bold mb-1">{user?.name}</h2>
              <p className="text-gray-400 mb-4">{user?.email}</p>
              <div className="flex items-center text-sm text-gray-400 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  Bergabung sejak{" "}
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 md:col-span-2">
            <h2 className="text-xl font-bold mb-6">Edit Profil</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nama
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white pl-10"
                    placeholder="Nama Anda"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <Input
                    type="email"
                    value={user?.email || ""}
                    className="bg-gray-700 border-gray-600 text-white pl-10"
                    disabled
                    readOnly
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Email tidak dapat diubah
                </p>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={toggleEditPassword}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    {isEditingPassword
                      ? "Batal Ubah Password"
                      : "Ubah Password"}
                  </button>
                </div>

                {isEditingPassword ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white pl-10 pr-10"
                        placeholder="Password saat ini"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white pl-10 pr-10"
                        placeholder="Password baru"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white pl-10 pr-10"
                        placeholder="Konfirmasi password baru"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-400">
                    ••••••••
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
