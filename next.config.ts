import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      // Redirect /uploads/* to /api/uploads/* for dynamic file serving in production
      {
        source: '/uploads/:filename*',
        destination: '/api/uploads/:filename*',
      },
    ];
  },
};

export default nextConfig;
