/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "komikcast02.com",
      "weeb-scraper.onrender.com",
      "i.ibb.co",
      "i.ibb.io",
      "i0.wp.com",
      "i1.wp.com",
      "i2.wp.com",
      "i3.wp.com",
      "i4.wp.com",
      "i5.wp.com",
      "i6.wp.com",
      "i7.wp.com",
      "i8.wp.com",
      "i9.wp.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
