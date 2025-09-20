import { createMirror } from "@/app/web-api/_lib/software-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { bid: string } }) {
  const body = await req.json().catch(() => ({}));
  const out = await createMirror(params.bid, body);
  return Response.json({ ok: true, mirror: out });
}
