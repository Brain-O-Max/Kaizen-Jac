import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

// The sites are built as static HTML (`output: 'export'`) so they run on shared hosting without Node.js.
// Saving content, uploads, admin sign-in and the contact form are handled by the PHP scripts in php/api.
export default function config(phase: string): NextConfig {
  const base: NextConfig = {
    // Lets several sites run in dev at once, each with its own build folder (see the dev:* scripts).
    distDir: process.env.NEXT_DIST_DIR || '.next',
    // Pages are folders with an index.html (/admin/media/), which every web server serves without extra rules.
    trailingSlash: true,
    images: { unoptimized: true },
  };

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    // Locally, forward the PHP backend URLs to `npm run php` (php/dev-router.php), one server for all three sites.
    const site = process.env.SITE?.trim() || 'enterprise';
    const php = (process.env.PHP_DEV_URL || 'http://127.0.0.1:8080').replace(/\/+$/, '');
    return {
      ...base,
      async rewrites() {
        return [
          { source: '/api/:path*', destination: `${php}/${site}/api/:path*` },
          { source: '/uploads/:path*', destination: `${php}/${site}/uploads/:path*` },
        ];
      },
    };
  }

  return { ...base, output: 'export' };
}
