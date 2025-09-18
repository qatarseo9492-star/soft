// Forwards /web-api/software?... → API /v1/software?... (keeps browser off 127.0.0.1)
export const revalidate = 60;

export async function GET(req: Request) {
  const base = process.env.API_BASE_SERVER;
  if (!base) return Response.json({ ok: false, error: "API_BASE_SERVER not set" }, { status: 500 });

  const url = new URL(req.url);
  const upstream = `${base}/v1/software?${url.searchParams.toString()}`;

  const r = await fetch(upstream, { headers: { Accept: "application/json" }, cache: "no-store" });
  const body = await r.json().catch(() => ({}));
  return Response.json(body, { status: r.status });
}
