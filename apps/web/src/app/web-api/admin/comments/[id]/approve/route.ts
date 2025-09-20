import { NextRequest } from "next/server";
import db from "@/app/web-api/_lib/db";
import { requireAdmin } from "@/app/web-api/_lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;

  await db.comment.update({
    where: { id: params.id },
    data: { status: "APPROVED" },
  });

  return Response.json({ ok: true });
}
