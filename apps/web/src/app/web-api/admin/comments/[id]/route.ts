import { NextRequest } from "next/server";
import db from "@/app/web-api/_lib/db";
import { requireAdmin } from "@/app/web-api/_lib/admin-auth";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;

  // Hard delete; if you prefer, change to status: "DELETED"
  await db.comment.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}
