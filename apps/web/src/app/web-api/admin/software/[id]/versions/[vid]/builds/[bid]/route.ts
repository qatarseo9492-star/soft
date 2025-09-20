import { updateBuild, deleteBuild } from "@/app/web-api/_lib/software-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: { bid: string } }) {
  const body = await req.json().catch(() => ({}));
  const out = await updateBuild(params.bid, body);
  return Response.json({ ok: true, build: out });
}

export async function DELETE(_: Request, { params }: { params: { bid: string } }) {
  const out = await deleteBuild(params.bid);
  return Response.json(out);
}
