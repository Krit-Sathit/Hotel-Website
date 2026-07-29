import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/:tenant(the-par-phuket|hotel-a|hotel-b)',
        destination: '/sites/:tenant',
      },
      {
        source: '/:tenant(the-par-phuket|hotel-a|hotel-b)/:path*',
        destination: '/sites/:tenant/:path*',
      },
    ];
  },
};

export default nextConfig;
