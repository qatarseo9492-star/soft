import { NextRequest, NextResponse } from "next/server";
import db from "@/app/web-api/_lib/db";
import { requireAdmin } from "@/app/web-api/_lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * GET /web-api/admin/settings/<key>  -> { ok, key, text, json }
 * PUT /web-api/admin/settings/<key>  -> body: { text?: string, json?: any }
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { key: string } }
) {
  const key = decodeURIComponent(params.key);
  const row = await db.setting.findUnique({ where: { key } });
  return NextResponse.json({
    ok: true,
    key,
    text: row?.text ?? "",
    json: row?.json ?? null,
    updatedAt: row?.updatedAt ?? null,
  });
}

export async function PUT(req: NextRequest, { params }: { params: { key: string } }) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;

  const key = decodeURIComponent(params.key);
  const body = await req.json().catch(() => ({} as any));
  const text: string | null =
    typeof body.text === "string" ? body.text : (body.text === null ? null : undefined as any);
  const json =
    body.json === undefined ? undefined : body.json; // can be any JSON / null

  const data: any = {};
  if (text !== undefined) data.text = text;
  if (json !== undefined) data.json = json;

  await db.setting.upsert({
    where: { key },
    update: data,
    create: { key, ...data },
  });

  return NextResponse.json({ ok: true });
}
