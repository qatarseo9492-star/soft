// apps/web/src/app/web-api/admin/settings/route.ts
import db from "../../_lib/db";
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.setting.findMany({ orderBy: { key: "asc" } });
  return Response.json({ ok: true, items: rows });
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  // Accepts { key: string, text?: string, json?: any }
  const { key, text, json } = body || {};
  if (!key) return new Response(JSON.stringify({ ok: false, error: "key_required" }), { status: 400 });
  const rec = await db.setting.upsert({
    where: { key },
    update: { text: text ?? undefined, json: json ?? undefined },
    create: { key, text: text ?? null, json: json ?? undefined },
  });
  return Response.json({ ok: true, item: rec });
}
