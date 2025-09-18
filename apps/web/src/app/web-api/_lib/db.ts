// apps/web/src/app/web-api/_lib/db.ts
import { PrismaClient } from "@prisma/client";

// Optional guard/warning if someone sets a non-MySQL URL
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("mysql://")) {
  const proto = process.env.DATABASE_URL.split("://")[0];
  console.warn("[prisma] DATABASE_URL does not start with mysql:// — current value looks like:", `${proto}://***`);
}

// Reuse a single Prisma instance in dev to avoid connection storms
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma = global.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") global.__prisma = prisma;

// Default export (what most files use)
export default prisma;

// Named export for places that do: `import { db } from "@/lib/db"`
export const db = prisma;
