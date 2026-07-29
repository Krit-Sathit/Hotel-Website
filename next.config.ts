import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/**': ['./database.json'],
  },
};

export default nextConfig;
