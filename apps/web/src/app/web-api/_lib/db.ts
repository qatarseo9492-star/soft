// apps/web/src/app/web-api/_lib/db.ts
import { PrismaClient } from "@prisma/client";

// Map WEB_DATABASE_URL -> DATABASE_URL for Prisma inside the web app.
if (!process.env.DATABASE_URL && process.env.WEB_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.WEB_DATABASE_URL;
}

declare global {
  // eslint-disable-next-line no-var
  var __webPrisma: PrismaClient | undefined;
}

// Reuse the Prisma instance in dev; single instance in prod.
const db = global.__webPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__webPrisma = db;
}

export default db;
