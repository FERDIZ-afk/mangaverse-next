import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "MangaVerse - Baca Manga Online",
  description: "Baca manga, manhwa, dan manhua online terbaru",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
