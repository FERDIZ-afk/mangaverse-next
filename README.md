<div align="center">
<a href="https://mangaverse-gamma.vercel.app">
  <img src="https://res.cloudinary.com/djsdnb4td/image/upload/v1743765717/58386473-d40b-4952-8708-8362aba69894_gggz0i.jpg" alt="logo" width="180" style="border-radius: 50%;"/>
</a>
</div>

<h1 align="center">
  <a href="https://mangaverse-gamma.vercel.app/">MangaVerse Read Any Manga For Free</a>
</h1>

<p align="center">

 <a href="https://github.com/VernSG/mangaverse-next/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/LuckyIndraEfendi/Mangazuna" alt="license"/>
  </a>
  <a href="https://github.com/VernSG/MangaVerse/fork">
    <img src="https://img.shields.io/github/forks/VernSG/MangaVerse?style=social" alt="fork"/>
  </a>
  <a href="https://github.com/VernSG/MangaVerse">
    <img src="https://img.shields.io/github/stars/VernSG/MangaVerse?style=social" alt="stars"/>
  </a>
  
</p>

# Preview MangaVerse

<p align="center">
 <img src="https://res.cloudinary.com/djsdnb4td/image/upload/v1743945192/6802C4FF-2DBE-46D5-866B-F57DD33A0026_peoomp.png" alt="main" width="100%">
</p>

<details>
<summary>More Screenshots</summary>

<h5 align="center">Home page after you login</h5>
<img src="https://res.cloudinary.com/djsdnb4td/image/upload/v1744101323/00D54337-B354-405E-99B5-7C757BCB00B8_vfwic0.png" alt="main" width="100%"/>

<h5 align="center">Profile Page</h5>
<img src="https://res.cloudinary.com/djsdnb4td/image/upload/v1744101515/DFCA1199-F5B7-4656-8D60-F886441CAE55_vhrz1s.png"/>

<h5 align="center">Detail Page</h5>
<p align="center">
<img src="https://res.cloudinary.com/djsdnb4td/image/upload/v1744101601/3EC2C863-8DFF-4237-9313-D07AC7F85813_iqfq3i.png" width="100%"/>
</p>

<h5 align="center">Read Page</h5>
<img src="https://res.cloudinary.com/djsdnb4td/image/upload/v1744101671/A80CC352-B278-42C7-BC6B-AD17C9E4182F_u4opwj.png" width="100%"/>
 
</details>

## Introduction

<p><a href="https://mangaverse-gamma.vercel.app/">MangaVerse</a> is an Manga,Manhwa,Manhua Reader website made possible by MangaVerse API build with <a href="https://github.com/vercel/next.js">NextJS</a> and <a href="https://github.com/tailwindlabs/tailwindcss">Tailwind</a> with a sleek and modern design that offers MangaVerse integration to help you keep track of your favorite anime series. MangaVerse is entirely free and does not feature any ads, making it a great option for you who want an uninterrupted viewing experience.</p>

## Features

- General
  - User-friendly interface
  - Free ad-supported Reading service
  - Mobile-responsive design
  - Next Auth Login
  - PWA Supported Features
- Watch Page
  - Player
    - Skip op/ed button
  - Comment section
- Profile page to see your watch list

## For Local Development

1. Clone this repository using :

```bash
git clone https://github.com/VernSG/MangaVerse.git
```

2. Install package using npm :

```bash
npm install
```

3. Create `.env` file in the root folder and put this inside the file :

```bash
DATABASE_URL="Using Provider MySQL Prisma"
NEXTAUTH_SECRET="Your Next Auth Secret"
```

5. Generate Prisma :

```bash
npx prisma migrate dev
npx prisma generate

### NOTE
# If you get a vercel build error related to prisma that says prisma detected but no initialized just change the following line in package.json line number 8
"build": "next build" to > "build": "npx prisma migrate deploy && npx prisma generate && next build"
```

6. Add this endpoint Rest API Anime Indo :
   Deploy your Rest API MangaVerse Using Vercel or other platform

```bash
https://{your-website-api-url}
```

7. Start local server :

```bash
npm run dev
```

## Credits

- [WeebScraper](https://github.com/fahmih6/Weebs_Scraper) Api
- [MangaZuna](https://github.com/luckyindraefendi/mangazuna) for inspiring me making this site

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact

Thank You for passing by!!
If you have any questions or feedback, please reach out to us at [contact@MangaVerse.xyz](mailto:snexmania76@gmail.com?subject=[Mangaverse]%20-%20Your%20Subject), or you can join our [discord sever](https://discord.gg/zmeA3gS9k2)
<br>
or you can DM me on Discord `panggilajasyris` or Instagram `thevoid.yamada`. (just contact me on one of these account)

## Support This Project

✨ [Star this project](https://github.com/VernSG/mangaverse-next)

<p>Saweria</p>
<a href="https://saweria.co/vernsg" target="_blank"><img id="wse-buttons-preview" src="https://res.cloudinary.com/djsdnb4td/image/upload/v1744102044/cara-pakai-saweria-untuk-streaming-dan-donasi-mudah-56d3c34f05be12d8774be60aa9cc84c0_600x400_gnuass.jpg" height="36" style="border: 0px; height: 36px;" alt="Trakteer Saya"></a>
