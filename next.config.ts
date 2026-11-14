import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Lets several sites run in dev at once, each with its own build folder (see the dev:* scripts).
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
