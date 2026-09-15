import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Phuket Airport Villa custom domains
        {
          source: '/',
          destination: '/sites/phuket-airport-villa',
          has: [{ type: 'host', value: '(?<domain>.*phuketairportvilla\\.com|.*phuketairvilla\\.com)' }],
        },
        {
          source: '/:path((?!sites/|api/|_next/|favicon\\.ico).*)',
          destination: '/sites/phuket-airport-villa/:path',
          has: [{ type: 'host', value: '(?<domain>.*phuketairportvilla\\.com|.*phuketairvilla\\.com)' }],
        },
        // The Par Phuket custom domains
        {
          source: '/',
          destination: '/sites/the-par-phuket',
          has: [{ type: 'host', value: '(?<domain>.*theparphuket\\.com)' }],
        },
        {
          source: '/:path((?!sites/|api/|_next/|favicon\\.ico).*)',
          destination: '/sites/the-par-phuket/:path',
          has: [{ type: 'host', value: '(?<domain>.*theparphuket\\.com)' }],
        },
      ],
      afterFiles: [
        {
          source: '/:tenant(the-par-phuket|hotel-a|hotel-b|phuket-airport-villa)',
          destination: '/sites/:tenant',
        },
        {
          source: '/:tenant(the-par-phuket|hotel-a|hotel-b|phuket-airport-villa)/:path*',
          destination: '/sites/:tenant/:path*',
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
