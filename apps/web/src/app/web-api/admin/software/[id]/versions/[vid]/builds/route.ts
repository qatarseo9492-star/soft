import { createBuild } from "@/app/web-api/_lib/software-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string; vid: string } }) {
  const body = await req.json().catch(() => ({}));
  const out = await createBuild(params.vid, body);
  return Response.json({ ok: true, build: out });
}
