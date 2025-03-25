"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/";
import {
  BookOpen,
  User,
  LogOut,
  Bookmark,
  History,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <BookOpen className="text-purple-500 h-6 w-6 mr-2" />
            <span className="text-xl font-bold text-white">MangaVerse</span>
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={toggleMenu}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "authenticated" ? (
              <>
                <Link
                  href="/history"
                  className="text-gray-300 hover:text-white flex items-center"
                >
                  <History className="h-5 w-5 mr-1" />
                  <span>History</span>
                </Link>
                <Link
                  href="/bookmarks"
                  className="text-gray-300 hover:text-white flex items-center"
                >
                  <Bookmark className="h-5 w-5 mr-1" />
                  <span>Bookmark</span>
                </Link>
                <div className="relative group">
                  <button className="text-gray-300 hover:text-white flex items-center">
                    <User className="h-5 w-5 mr-1" />
                    <span className="max-w-[100px] truncate">
                      {session.user.name}
                    </span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-gray-300 hover:bg-gray-600 hover:text-white flex items-center"
                    >
                      <User className="h-4 w-4 mr-2" />
                      <span>Profil Saya</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-600 hover:text-white flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Daftar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            {status === "authenticated" ? (
              <>
                <div className="flex items-center mb-4">
                  <User className="h-5 w-5 mr-2 text-purple-400" />
                  <span className="text-white font-medium">
                    {session.user.name}
                  </span>
                </div>
                <Link
                  href="/profile"
                  className="block py-2 px-4 text-gray-300 hover:text-white rounded hover:bg-gray-700"
                  onClick={toggleMenu}
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    <span>Profil Saya</span>
                  </div>
                </Link>
                <Link
                  href="/history"
                  className="block py-2 px-4 text-gray-300 hover:text-white rounded hover:bg-gray-700"
                  onClick={toggleMenu}
                >
                  <div className="flex items-center">
                    <History className="h-5 w-5 mr-2" />
                    <span>History Baca</span>
                  </div>
                </Link>
                <Link
                  href="/bookmarks"
                  className="block py-2 px-4 text-gray-300 hover:text-white rounded hover:bg-gray-700"
                  onClick={toggleMenu}
                >
                  <div className="flex items-center">
                    <Bookmark className="h-5 w-5 mr-2" />
                    <span>Bookmark</span>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="w-full text-left py-2 px-4 text-red-300 hover:text-red-200 rounded hover:bg-gray-700 flex items-center"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/login"
                  className="py-2 px-4 text-gray-300 hover:text-white rounded hover:bg-gray-700 text-center"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded text-center"
                  onClick={toggleMenu}
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
