// apps/web/next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://filespay.org',
  generateRobotsTxt: true,
  outDir: 'public',
  sitemapSize: 5000,
  exclude: [
    '/web-api/*',
    '/admin/*',
    '/api/*',
  ],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/web-api', '/admin', '/api'] },
    ],
  },
  transform: async (config, path) => ({
    loc: path,
    changefreq: 'daily',
    priority: path === '/' ? 1 : 0.7,
    lastmod: new Date().toISOString(),
  }),
};
