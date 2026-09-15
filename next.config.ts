import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/:tenant(the-par-phuket|hotel-a|hotel-b|phuket-airport-villa)',
        destination: '/sites/:tenant',
      },
      {
        source: '/:tenant(the-par-phuket|hotel-a|hotel-b|phuket-airport-villa)/:path*',
        destination: '/sites/:tenant/:path*',
      },
    ];
  },
};

export default nextConfig;
