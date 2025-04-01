"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import IconsWaguri from "../../public/logo.jpg";
import {
  Heart,
  Code,
  Mail,
  Github,
  Twitter,
  Facebook,
  Instagram,
  ArrowUp,
} from "lucide-react";
import ScrollToTopButton from "./ScrollToTopButton";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-[#121827] text-gray-300 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
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
            <p className="mt-3 text-sm text-gray-400">
              Platform baca manga, manhwa, dan manhua terlengkap dengan update
              tercepat.
            </p>
            <div className="mt-4 flex space-x-4">
              <a
                href="https://github.com/vernsg"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Github"
              >
                <Github className="h-5 w-5" />
              </a>
              {/* <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a> */}
              <a
                href="https://www.instagram.com/thevoid.yamada"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              {/* <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a> */}
            </div>
          </div>

          {/* Navigation */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Navigasi
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/manga"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Manga
                </Link>
              </li>
              <li>
                <Link
                  href="/manhwa"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Manhwa
                </Link>
              </li>
              <li>
                <Link
                  href="/Manhua"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Manhua
                </Link>
              </li>
              <li>
                <Link
                  href="/bookmark"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Bookmark
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link
                  href="/dmca"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  DMCA
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Hubungi Kami
            </h3>
            <p className="mt-4 text-sm text-gray-400">
              Punya pertanyaan atau saran? Jangan ragu untuk menghubungi kami.
            </p>
            <div className="mt-4">
              <a
                href="mailto:contact@snexmania76@gmail.com"
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                contact@snexmania76@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} MangaVerse. Dibuat dengan{" "}
            <Heart className="inline-block h-4 w-4 text-pink-500" /> di
            Indonesia
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <span className="text-sm text-gray-400 mr-2">Dibuat dengan</span>
            <Code className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-sm text-gray-400">
              oleh{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300">
                Muhammad Yusuf
              </a>
            </span>
          </div>
          <ScrollToTopButton />
        </div>
      </div>
    </footer>
  );
}
