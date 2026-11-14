import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  async rewrites() {
    return [
      {
        source: '/storage/:path*',
        destination: 'https://flowstay.live/storage/:path*',
      },
      {
        source: '/:tenant(the-par-phuket|theparphuket|hotel-a|hotel-b|phuket-airport-villa)',
        destination: '/sites/:tenant',
      },
      {
        source: '/:tenant(the-par-phuket|theparphuket|hotel-a|hotel-b|phuket-airport-villa)/:path*',
        destination: '/sites/:tenant/:path*',
      },
    ];
  },
};

export default nextConfig;
