"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { Button, Input } from "@/components/ui/";

export default function RegisterPage() {
  const router = useRouter();
  const { status } = useSession();
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (formValues.password !== formValues.confirmPassword) {
      setError("Password tidak sama");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formValues.name,
          email: formValues.email,
          password: formValues.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registrasi gagal");
      }

      // Login otomatis setelah registrasi berhasil
      const result = await signIn("credentials", {
        redirect: false,
        email: formValues.email,
        password: formValues.password,
      });

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError(error.message);
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-8 shadow-lg max-w-md w-full">
        <Link href="/" className="block text-gray-400 hover:text-white mb-6">
          &larr; Kembali ke Beranda
        </Link>

        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
          Daftar Akun MangaVerse
        </h1>

        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-300 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Nama</label>
            <Input
              type="text"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="block mb-1">Email</label>
            <Input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="block mb-1">Password</label>
            <Input
              type="password"
              name="password"
              value={formValues.password}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border-gray-600 text-white"
              minLength={6}
            />
          </div>

          <div>
            <label className="block mb-1">Konfirmasi Password</label>
            <Input
              type="password"
              name="confirmPassword"
              value={formValues.confirmPassword}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border-gray-600 text-white"
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isLoading ? "Memproses..." : "Daftar"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p>
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-purple-400 hover:text-purple-300"
            >
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
