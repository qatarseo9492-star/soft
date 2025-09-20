// apps/web/src/app/web-api/admin/software/[id]/diff/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getVersion } from "@/app/web-api/_lib/software-store";

// Flatten only the fields we care about for an easy diff
function flatVersion(v: any) {
  if (!v) return null;
  return {
    version: v.version ?? null,
    os: v.os ?? v.osLabel ?? null,
    license: v.license ?? null,
    changelog: v.changelog ?? null,
    releasedAt: v.releasedAt ? new Date(v.releasedAt).toISOString() : null,
  };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // Optional query params: ?from=<versionId>&to=<versionId>
  const u = new URL(req.url);
  const fromId = u.searchParams.get("from");
  const toId = u.searchParams.get("to");

  const fromV = fromId ? await getVersion(fromId) : null;
  const toV = toId ? await getVersion(toId) : null;

  const from = flatVersion(fromV);
  const to = flatVersion(toV);

  // Build naive field-by-field diff
  const keys = ["version", "os", "license", "changelog", "releasedAt"] as const;
  const diff: Record<string, { from: unknown; to: unknown }> = {};

  for (const k of keys) {
    const f = (from as any)?.[k] ?? null;
    const t = (to as any)?.[k] ?? null;
    if (f !== t) diff[k] = { from: f, to: t };
  }

  return NextResponse.json({ ok: true, diff, from, to, softwareId: params.id });
}
