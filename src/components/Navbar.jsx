"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  Home,
  Book,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/";
import NavbarSearchButton from "./NavbarSearchButton";

const navigationItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Manga",
    href: "/manga",
    icon: Book,
  },
  {
    title: "Manhwa",
    href: "/manhwa",
    icon: Book,
  },
  {
    title: "Manhua",
    href: "/manhua",
    icon: Book,
  },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
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

    // Handle escape key to close mobile menu
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    // Prevent scrolling when mobile menu is open
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "auto";
    };
  }, [isUserMenuOpen, isMenuOpen]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Implement actual theme toggling logic here
  };

  // Function to check if the current path matches the navigation item
  const isActive = (itemPath) => {
    // Check for exact match or if pathname starts with itemPath (for nested routes)
    return (
      pathname === itemPath ||
      (itemPath !== "/" && pathname.startsWith(itemPath))
    );
  };

  return (
    <>
      <header
        className={`fixed w-full z-40 transition-all duration-300 ${
          scrolled
            ? "bg-gray-900/95 backdrop-blur-sm shadow-lg"
            : "bg-gradient-to-b from-gray-900 to-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
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
                  className={`transition-colors ${
                    isActive(item.href)
                      ? "text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </div>

            {/* Right Navigation - Desktop */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <NavbarSearchButton className="mr-2" />
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
                {/* <NavbarSearchButton className="ml-2" /> */}
              </Link>

              {status === "authenticated" ? (
                <div className="relative user-menu-container">
                  {/* <NavbarSearchButton className="mr-2" /> */}
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
                      className="rounded border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="rounded bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      Daftar
                    </Button>
                  </Link>
                  <NavbarSearchButton />
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-3 md:hidden">
              <NavbarSearchButton />
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
                      {/* <NavbarSearchButton /> */}
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
              ) : null}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors"
                aria-label="Open menu"
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
      </header>

      {/* Side Drawer Mobile Menu with Overlay */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop/Overlay */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        ></div>

        {/* Side Drawer */}
        <div
          className={`absolute top-0 right-0 h-full w-64 bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <div className="flex items-center">
                <div className="h-8 w-8 relative overflow-hidden rounded-full">
                  <Image
                    src={IconsWaguri}
                    alt="MangaVerse"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <span className="ml-2 text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
                  MangaVerse
                </span>
                {/* <NavbarSearchButton /> */}
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-4 px-3">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                        active
                          ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <Icon
                          className={`h-5 w-5 mr-3 ${
                            active ? "text-purple-400" : ""
                          }`}
                        />
                        <span
                          className={
                            active
                              ? "font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text"
                              : ""
                          }
                        >
                          {item.title}
                        </span>
                      </div>
                      {active && (
                        <ChevronRight className="h-4 w-4 text-purple-400" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Additional Links */}
              <div className="mt-6 space-y-1">
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Features
                </div>

                <Link
                  href="/bookmarks"
                  className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Bookmark className="h-5 w-5 mr-3" />
                  Bookmark
                </Link>

                <Link
                  href="/history"
                  className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <History className="h-5 w-5 mr-3" />
                  Riwayat Baca
                </Link>

                <button
                  onClick={toggleDarkMode}
                  className="flex items-center w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                >
                  {darkMode ? (
                    <>
                      <Sun className="h-5 w-5 mr-3" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5 mr-3" />
                      Dark Mode
                    </>
                  )}
                </button>
                {/* <NavbarSearchButton /> */}
              </div>
            </div>

            {/* Footer - Auth Buttons */}
            {status !== "authenticated" ? (
              <div className="p-4 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
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
              </div>
            ) : (
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                    {session.user?.name?.charAt(0) || (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {session.user?.name || "User"}
                    </div>
                    <div className="text-sm text-gray-400">
                      {session.user?.email || ""}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
                    aria-label="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
