export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import { NextRequest, NextResponse } from "next/server";
import db from "../../../_lib/db"; // ../../../ from /admin/software/[id]/route.ts
import { toUpdateData, presentSoftware } from "../../../_lib/software-store";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const item = await db.software.findUnique({
    where: { id: params.id },
  });
  if (!item) return bad("Not found", 404);
  return NextResponse.json({ ok: true, item: presentSoftware(item) });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const data = toUpdateData(body);
  const updated = await db.software.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true, item: presentSoftware(updated) });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await db.software.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
