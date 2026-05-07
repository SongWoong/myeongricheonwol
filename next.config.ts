import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "vegetables-fitting-skip-fork.trycloudflare.com",
    "*.trycloudflare.com",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "k.kakaocdn.net" },
      { protocol: "http", hostname: "k.kakaocdn.net" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.kakaocdn.net" },
    ],
  },
};

export default nextConfig;
