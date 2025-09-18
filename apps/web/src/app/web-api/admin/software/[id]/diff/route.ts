export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import { NextResponse } from "next/server";
import { getVersion, type VersionItem } from "@/app/web-api/_lib/software-store";

function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

type VersionDiff<T extends VersionItem> = {
  [K in "version" | "os" | "license" | "changelog" | "releasedAt"]?: {
    from: T[K] | null;
    to: T[K] | null;
  };
};

function diffVersions(a: VersionItem | null, b: VersionItem | null): VersionDiff<VersionItem> {
  const out: VersionDiff<VersionItem> = {};
  const fields: (keyof VersionItem)[] = ["version", "os", "license", "changelog", "releasedAt"];

  for (const k of fields) {
    const av = a ? (a[k] as any) : null;
    const bv = b ? (b[k] as any) : null;
    const same =
      (av instanceof Date && bv instanceof Date ? av.getTime() === bv.getTime() : JSON.stringify(av) === JSON.stringify(bv));
    if (!same) {
      (out as any)[k] = { from: av ?? null, to: bv ?? null };
    }
  }
  return out;
}

/**
 * GET /web-api/admin/software/[id]/diff?from=<versionId>&to=<versionId>
 * NOTE: [id] is not used server-side for the query (we diff by version IDs).
 */
export async function GET(req: Request, _ctx: { params: { id: string } }) {
  try {
    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    if (!from || !to) return ok({ ok: false, error: 'Query params "from" and "to" are required' }, 400);

    const a = await getVersion(from);
    const b = await getVersion(to);

    if (!a && !b) return ok({ ok: false, error: "Both versions not found" }, 404);

    const diff = diffVersions(a, b);
    return ok({ ok: true, fromId: from, toId: to, diff });
  } catch (e: any) {
    return ok({ ok: false, error: e?.message || String(e) }, 500);
  }
}
