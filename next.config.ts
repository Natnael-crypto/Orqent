import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['ws', 'bufferutil', 'utf-8-validate'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
