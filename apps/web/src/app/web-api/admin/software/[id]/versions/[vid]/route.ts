export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import { NextResponse } from "next/server";
import {
  getVersion,
  updateVersion,
  deleteVersion,
  type VersionItem,
  type VersionUpsertInput,
} from "@/app/web-api/_lib/software-store";

function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

/** GET one version by id */
export async function GET(_req: Request, { params }: { params: { id: string; vid: string } }) {
  try {
    const it = await getVersion(params.vid);
    if (!it) return ok({ ok: false, error: "Not found" }, 404);
    return ok({ ok: true, item: it });
  } catch (e: any) {
    return ok({ ok: false, error: e?.message || String(e) }, 500);
  }
}

/** UPDATE a version (fields: version, os, license, changelog, releasedAt) */
export async function PUT(req: Request, { params }: { params: { id: string; vid: string } }) {
  try {
    const body = (await req.json()) as Partial<VersionItem> & VersionUpsertInput;
    const updated = await updateVersion(params.vid, body);
    return ok({ ok: true, item: updated });
  } catch (e: any) {
    return ok({ ok: false, error: e?.message || String(e) }, 500);
  }
}

/** DELETE a version */
export async function DELETE(_req: Request, { params }: { params: { id: string; vid: string } }) {
  try {
    await deleteVersion(params.vid);
    return ok({ ok: true, removed: true });
  } catch (e: any) {
    return ok({ ok: false, error: e?.message || String(e) }, 500);
  }
}
