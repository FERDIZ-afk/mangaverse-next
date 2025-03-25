# MangaVerse

MangaVerse adalah platform baca manga online yang dibangun dengan Next.js 14 dan Prisma. Aplikasi ini menyediakan berbagai fitur seperti:

## Fitur

- 📚 Baca manga dengan tampilan yang nyaman
- 👤 Sistem autentikasi pengguna
- 💬 Sistem komentar dengan foto profil
- 🔖 Bookmark manga favorit
- 📱 Responsif di semua perangkat
- 📖 Riwayat baca
- 🌙 Mode gelap

## Teknologi

- Next.js 14 (App Router)
- Prisma (SQLite)
- NextAuth.js
- TailwindCSS
- Shadcn UI

## Instalasi

1. Clone repositori:
   \`\`\`bash
   git clone https://github.com/yourusername/mangaverse.git
   cd mangaverse
   \`\`\`

2. Install dependensi:
   \`\`\`bash
   npm install
   \`\`\`

3. Salin file environment:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Sesuaikan variabel environment di file `.env`

5. Setup database:
   \`\`\`bash
   npx prisma migrate dev
   \`\`\`

6. Jalankan aplikasi:
   \`\`\`bash
   npm run dev
   \`\`\`

## Struktur Proyek

\`\`\`
mangaverse/
├── prisma/ # Schema dan migrasi database
├── public/ # Aset statis
├── src/
│ ├── app/ # Route dan halaman
│ ├── components/ # Komponen React
│ └── lib/ # Utilitas dan konfigurasi
\`\`\`

## API Routes

- `/api/auth/*` - Endpoint autentikasi
- `/api/manga/*` - Endpoint manga dan chapter
- `/api/comments/*` - Endpoint komentar
- `/api/bookmarks/*` - Endpoint bookmark
- `/api/history/*` - Endpoint riwayat baca

## Kontribusi

Kontribusi selalu diterima! Silakan buat pull request untuk perbaikan atau penambahan fitur.

## Lisensi

[MIT License](LICENSE)
