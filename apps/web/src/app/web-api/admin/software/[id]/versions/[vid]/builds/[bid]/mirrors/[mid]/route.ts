import { updateMirror, deleteMirror } from "@/app/web-api/_lib/software-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: { mid: string } }) {
  const body = await req.json().catch(() => ({}));
  const out = await updateMirror(params.mid, body);
  return Response.json({ ok: true, mirror: out });
}

export async function DELETE(_: Request, { params }: { params: { mid: string } }) {
  const out = await deleteMirror(params.mid);
  return Response.json(out);
}
