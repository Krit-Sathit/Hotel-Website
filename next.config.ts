import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Serve The Par Phuket at its public custom domain without exposing the
      // internal multi-tenant `/sites/the-par-phuket` path.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.theparphuket.com' }],
        destination: '/sites/the-par-phuket/:path*',
      },
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
