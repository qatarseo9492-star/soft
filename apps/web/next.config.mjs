/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental:{ typedRoutes:true },
  headers: async () => ([
    {
      source: '/_next/static/:path*',
      headers: [{ key:'Cache-Control', value:'public, max-age=31536000, immutable' }]
    },
    { source: '/uploads/:path*', headers:[{ key:'Cache-Control', value:'public, max-age=604800, stale-while-revalidate=86400' }] }
  ])
}
export default nextConfig
