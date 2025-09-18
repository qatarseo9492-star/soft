export const revalidate = 0;

export async function GET() {
  const base = process.env.API_BASE_SERVER;
  if (!base) return Response.json({ ok:false, error:"API_BASE_SERVER not set" }, { status: 500 });
  const r = await fetch(`${base}/v1/admin/settings`, { cache: "no-store" });
  const b = await r.json().catch(() => ({}));
  return Response.json(b, { status: r.status });
}

export async function POST(req: Request) {
  const base = process.env.API_BASE_SERVER;
  if (!base) return Response.json({ ok:false, error:"API_BASE_SERVER not set" }, { status: 500 });
  const body = await req.json().catch(() => ({}));
  const key = body?.key as string;
  if (!key) return Response.json({ ok:false, error:"key required" }, { status: 400 });
  const r = await fetch(`${base}/v1/admin/settings/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ json: body?.json ?? null, text: body?.text ?? null }),
  });
  const b = await r.json().catch(() => ({}));
  return Response.json(b, { status: r.status });
}
