import db from "@/app/web-api/_lib/db";

export const dynamic = "force-dynamic";

// GET /web-api/admin/settings  -> return all settings as { key, text, json }
export async function GET() {
  const rows = await db.setting.findMany({ orderBy: { key: "asc" } });
  return Response.json({
    ok: true,
    items: rows.map(r => ({ key: r.key, text: r.text ?? null, json: r.json ?? null, updatedAt: r.updatedAt })),
  });
}

// PUT /web-api/admin/settings  -> upsert many at once
// Body: { set: Array<{ key: string, text?: string|null, json?: any }> }
export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  const set: Array<{ key: string; text?: string | null; json?: any }> = body?.set ?? [];
  if (!Array.isArray(set) || set.length === 0) {
    return new Response("Bad Request", { status: 400 });
  }

  for (const row of set) {
    await db.setting.upsert({
      where: { key: row.key },
      create: { key: row.key, text: row.text ?? null, json: row.json ?? null },
      update: {
        text: row.hasOwnProperty("text") ? (row.text ?? null) : undefined,
        json: row.hasOwnProperty("json") ? (row.json ?? null) : undefined,
      },
    });
  }
  return Response.json({ ok: true });
}
