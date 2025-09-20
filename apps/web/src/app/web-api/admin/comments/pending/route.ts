import { NextRequest } from "next/server";
import db from "@/app/web-api/_lib/db";
import { requireAdmin } from "@/app/web-api/_lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;

  const items = await db.comment.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: {
      id: true, name: true, email: true, content: true, createdAt: true,
      software: { select: { id: true, slug: true, name: true } },
    },
  });

  return Response.json({ ok: true, items });
}
