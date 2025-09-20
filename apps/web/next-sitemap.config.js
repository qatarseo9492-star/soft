// apps/web/next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */

// Build a reliable siteUrl for prod/preview/local
const isProd = process.env.VERCEL_ENV === 'production';
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (isProd ? vercelUrl || 'https://filespay.org' : vercelUrl || 'http://localhost:3000');

if (!siteUrl) {
  throw new Error('next-sitemap: siteUrl is undefined. Set NEXT_PUBLIC_SITE_URL or rely on VERCEL_URL.');
}

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  outDir: 'public',
  sourceDir: 'src',                  // 👈 IMPORTANT because your app is at src/app
  exclude: ['/api/*', '/web-api/*', '/admin*', '/sitemap.xml'], // don’t include APIs/admin
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/admin', '/api', '/web-api'] },
    ],
  },
};
