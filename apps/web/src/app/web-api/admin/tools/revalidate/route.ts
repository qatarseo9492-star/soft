export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// src/app/web-api/admin/tools/revalidate/route.ts
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";


function assertAdmin(req: Request) {
  const hdr = req.headers.get("authorization") || "";
  const expectedUser = process.env.ADMIN_USER || "admin";
  const expectedPass = process.env.ADMIN_PASS || "change-me-please";
  const ok = hdr.startsWith("Basic ");
  if (!ok) return false;
  const b64 = hdr.slice("Basic ".length);
  try {
    const [u, p] = Buffer.from(b64, "base64").toString("utf8").split(":");
    return u === expectedUser && p === expectedPass;
  } catch {
    return false;
  }
}

type Body = { paths?: unknown; tags?: unknown };

export async function POST(req: Request) {
  if (!assertAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { paths, tags } = ((await req.json().catch(() => ({}))) as Body) || {};

  const normalizedPaths = Array.isArray(paths)
    ? (paths.filter((x) => typeof x === "string" && x.startsWith("/")) as string[])
    : [];

  const normalizedTags = Array.isArray(tags)
    ? (tags.filter((x) => typeof x === "string" && x.trim().length > 0) as string[])
    : [];

  const okPaths: string[] = [];
  const okTags: string[] = [];

  // Revalidate paths
  for (const p of normalizedPaths) {
    try {
      revalidatePath(p);
      okPaths.push(p);
    } catch {
      // ignore one-off failures
    }
  }

  // Revalidate tags
  for (const t of normalizedTags) {
    try {
      revalidateTag(t);
      okTags.push(t);
    } catch {
      // ignore one-off failures
    }
  }

  return NextResponse.json({
    ok: true,
    paths: okPaths,
    tags: okTags,
    at: new Date().toUTCString(),
  });
}
