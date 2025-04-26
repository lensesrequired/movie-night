import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    nodeMiddleware: true,
  },
  images: {
    remotePatterns: [new URL('https://image.tmdb.org/t/p/w500/**')],
  },
};

export default nextConfig;
