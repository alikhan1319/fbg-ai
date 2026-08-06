import type { NextConfig } from "next";

/**
 * Rewrites must hit FastAPI directly. On the VPS set API_INTERNAL_URL=http://127.0.0.1:8000
 * so /blog-media and /uploads do not loop through the public HTTPS domain.
 */
const rewriteApi = (
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    qualities: [100, 75],
    // Omit `search` so cache-bust query strings like ?v=… are allowed on local assets.
    localPatterns: [
      { pathname: "/img/**" },
      { pathname: "/images/**" },
      { pathname: "/blog-media/**" },
      { pathname: "/uploads/**" },
    ],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/uploads/**" },
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/blog-media/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/blog-media/**" },
      { protocol: "https", hostname: "freebackgroundremoverai.com", pathname: "/blog-media/**" },
      { protocol: "https", hostname: "www.freebackgroundremoverai.com", pathname: "/blog-media/**" },
      { protocol: "https", hostname: "freebackgroundremoverai.com", pathname: "/uploads/**" },
      { protocol: "https", hostname: "www.freebackgroundremoverai.com", pathname: "/uploads/**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${rewriteApi}/api/:path*`,
      },
      {
        source: "/blog-media/:path*",
        destination: `${rewriteApi}/blog-media/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${rewriteApi}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
