import type { NextConfig } from "next";

const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    qualities: [100, 75],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/uploads/**" },
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/blog-media/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/blog-media/**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/api/:path*`,
      },
      {
        source: "/blog-media/:path*",
        destination: `${apiBase}/blog-media/:path*`,
      },
    ];
  },
};

export default nextConfig;
