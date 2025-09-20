// apps/web/src/app/web-api/admin/software/[id]/versions/route.ts
import { createVersion } from "@/app/web-api/_lib/software-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const v = await createVersion(params.id, body);
  return Response.json({ ok: true, version: v });
}
