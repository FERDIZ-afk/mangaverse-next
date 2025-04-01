"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import IconsWaguri from "../../public/logo.jpg";

import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Bookmark,
  History,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/";

const navigationItems = [
  {
    title: "Manga",
    href: "/manga",
  },
  {
    title: "Manhwa",
    href: "/manhwa",
  },
  {
    title: "Manhua",
    href: "/manhua",
  },
];

export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    // Close menus when clicking outside
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Implement actual theme toggling logic here
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-900/95 backdrop-blur-sm shadow-lg"
          : "bg-gradient-to-b from-gray-900 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - DIGANTI DENGAN WAGURI */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="h-8 w-8 relative overflow-hidden rounded-full">
                <Image
                  src={IconsWaguri}
                  alt="MangaVerse"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
                MangaVerse
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* Right Navigation - Desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <button
              onClick={toggleDarkMode}
              className="text-gray-300 hover:text-white p-1.5 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <Link
              href="/bookmarks"
              className="text-gray-300 hover:text-white p-1.5 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Bookmarks"
            >
              <Bookmark className="h-5 w-5" />
            </Link>

            <Link
              href="/history"
              className="text-gray-300 hover:text-white p-1.5 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="History"
            >
              <History className="h-5 w-5" />
            </Link>

            {status === "authenticated" ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center justify-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                    {session.user?.name?.charAt(0) || (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </Link>
                      {/* <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Pengaturan
                      </Link> */}
                      <button
                        onClick={() => signOut()}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Daftar
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-3 md:hidden">
            {status === "authenticated" ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center justify-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                    {session.user?.name?.charAt(0) || (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Pengaturan
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}

            <div className="pt-2 pb-1 border-t border-gray-700">
              <Link
                href="/bookmarks"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <Bookmark className="h-5 w-5 mr-2" />
                Bookmark
              </Link>
              <Link
                href="/history"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <History className="h-5 w-5 mr-2" />
                Riwayat Baca
              </Link>
            </div>

            {status !== "authenticated" && (
              <div className="mt-4 space-y-2 px-3 pt-2 border-t border-gray-700">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Daftar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
