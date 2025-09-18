export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// src/app/web-api/admin/tools/sitemap/route.ts
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

export async function POST(req: Request) {
  if (!assertAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // If your sitemap route uses a revalidateTag("sitemap"), this will refresh it too.
  try {
    revalidateTag("sitemap");
  } catch {
    // no-op if unused
  }

  try {
    revalidatePath("/sitemap.xml");
  } catch {
    // If your sitemap is an app route file, this works.
    // If it's static in /public, you can ignore this.
  }

  return NextResponse.json({
    ok: true,
    message: "Sitemap refresh triggered",
    paths: ["/sitemap.xml"],
    tags: ["sitemap"],
    at: new Date().toUTCString(),
  });
}
