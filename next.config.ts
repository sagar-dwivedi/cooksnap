import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
      },
      {
        hostname: "i.pravatar.cc",
      },
      {
        hostname: "source.unsplash.com",
      },
      {
        hostname: "moonlit-basilisk-965.convex.cloud",
      },
    ],
  },
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
