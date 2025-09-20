// apps/web/src/app/web-api/admin/software/[id]/versions/[vid]/route.ts
import { getVersion, updateVersion, deleteVersion } from "@/app/web-api/_lib/software-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { vid: string } }) {
  const v = await getVersion(params.vid);
  if (!v) return new Response("Not found", { status: 404 });
  return Response.json({ ok: true, version: v });
}

export async function PUT(req: Request, { params }: { params: { vid: string } }) {
  const body = await req.json().catch(() => ({}));
  const v = await updateVersion(params.vid, body);
  return Response.json({ ok: true, version: v });
}

export async function DELETE(_: Request, { params }: { params: { vid: string } }) {
  const out = await deleteVersion(params.vid);
  return Response.json(out);
}
