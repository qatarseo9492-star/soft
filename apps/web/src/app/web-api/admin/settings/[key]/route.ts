export const revalidate = 0;

export async function GET(_: Request, { params }: { params: { key: string } }) {
  const base = process.env.API_BASE_SERVER;
  if (!base) return Response.json({ ok:false, error:"API_BASE_SERVER not set" }, { status: 500 });
  const r = await fetch(`${base}/v1/admin/settings/${encodeURIComponent(params.key)}`, { cache: "no-store" });
  const b = await r.json().catch(() => ({}));
  return Response.json(b, { status: r.status });
}

export async function PUT(req: Request, { params }: { params: { key: string } }) {
  const base = process.env.API_BASE_SERVER;
  if (!base) return Response.json({ ok:false, error:"API_BASE_SERVER not set" }, { status: 500 });
  const body = await req.json().catch(() => ({}));
  const r = await fetch(`${base}/v1/admin/settings/${encodeURIComponent(params.key)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const b = await r.json().catch(() => ({}));
  return Response.json(b, { status: r.status });
}

export async function DELETE(_: Request, { params }: { params: { key: string } }) {
  const base = process.env.API_BASE_SERVER;
  if (!base) return Response.json({ ok:false, error:"API_BASE_SERVER not set" }, { status: 500 });
  const r = await fetch(`${base}/v1/admin/settings/${encodeURIComponent(params.key)}`, { method: "DELETE" });
  const b = await r.json().catch(() => ({}));
  return Response.json(b, { status: r.status });
}
