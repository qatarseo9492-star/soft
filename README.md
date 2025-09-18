# Software Free Download (Next.js + NestJS)

Monorepo:
- apps/web → Next.js 14 (App Router, SEO/ISR)
- apps/api → NestJS + Prisma (PostgreSQL), Redis (queues later), Meilisearch (search later)

Deploy:
- Frontend (apps/web) → Vercel
- Backend (apps/api) → Cloudways (pm2)
