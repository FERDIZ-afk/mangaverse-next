"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { Button, Input } from "@/components/ui/";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
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

    try {
      console.log("Attempting to sign in with:", {
        email: formValues.email,
        // jangan log password di production
      });

      const result = await signIn("credentials", {
        redirect: false,
        email: formValues.email,
        password: formValues.password,
      });

      console.log("Sign in result:", result);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Login error details:", error);
      setError("Terjadi kesalahan saat login. Silakan coba lagi.");
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
          Login MangaVerse
        </h1>

        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-300 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isLoading ? "Memproses..." : "Login"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p>
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-purple-400 hover:text-purple-300"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
