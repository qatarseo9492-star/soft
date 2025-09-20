// apps/web/next.config.js
const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: false },

  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536, 1920, 2560],
    imageSizes: [16, 24, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      { protocol: 'https', hostname: 'filespay.org' },
      { protocol: 'https', hostname: 'www.filespay.org' },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.cloudflare-ipfs.com' },
    ],
    minimumCacheTTL: 60 * 60 * 24,
  },

  // ⛔️ Stop proxying /web-api/* to the API.
  // We now serve these routes from Next.js Route Handlers.
  async rewrites() {
    return [];
  },

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

  eslint: { ignoreDuringBuilds: true },
  // typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
