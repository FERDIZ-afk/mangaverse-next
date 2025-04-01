import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata = {
  title: "MangaVerse - Baca Manga Online",
  description: "Baca manga, manhwa, dan manhua online terbaru",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow pt-16 pb-0">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
