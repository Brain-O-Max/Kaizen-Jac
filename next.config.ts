import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Lets several sites run in dev at once, each with its own build folder (see the dev:* scripts).
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // The built-in photos are read from disk at request time, so serverless hosts (Vercel) must be told to ship them.
  outputFileTracingIncludes: {
    '/uploads/[name]': ['./seed-uploads/**/*'],
  },
};

export default nextConfig;
