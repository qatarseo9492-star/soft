export const revalidate = 300;

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const base = process.env.API_BASE_SERVER;
  if (!base) return Response.json({ ok: false, error: "API_BASE_SERVER not set" }, { status: 500 });

  const r = await fetch(`${base}/v1/software/${encodeURIComponent(params.slug)}`, {
    headers: { Accept: "application/json" }, cache: "no-store"
  });
  const body = await r.json().catch(() => ({}));
  return Response.json(body, { status: r.status });
}
