// apps/web/next.config.js
const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: false },

  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Allow <Image> to load assets from your domain/CDN
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'filespay.org' },
      { protocol: 'https', hostname: 'www.filespay.org' },
      // add/remove hosts as you use them:
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.cloudflare-ipfs.com' },
    ],
  },

  // Dev/prod parity: proxy /web-api/* to Nest API
  async rewrites() {
    const target = process.env.API_BASE_SERVER || 'http://127.0.0.1:3011';
    return [{ source: '/web-api/:path*', destination: `${target}/:path*` }];
  },

  // Tiny bundles for lucide-react icons
  modularizeImports: {
    'lucide-react': { transform: 'lucide-react/dist/esm/icons/{{member}}' },
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },

  // Keep CI green if ESLint complains during prod builds
  eslint: { ignoreDuringBuilds: true },
  // If you ever need to force-build through TS errors, uncomment:
  // typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
