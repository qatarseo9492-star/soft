// apps/web/src/app/download/[slug]/route.ts
import { chooseBuildUrlBySlug, logDownloadByIds } from "../../web-api/_lib/software-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: { slug: string } }) {
  try {
    const u = new URL(req.url);
    const buildId = u.searchParams.get("id");

    // FIX: pass an options object, not a string
    const chosen = await chooseBuildUrlBySlug(
      ctx.params.slug,
      buildId ? { id: buildId } : undefined
    );

    if (!chosen?.url) {
      return new Response("No download available", { status: 404 });
    }

    // Best-effort log (don’t block redirect)
    const ip =
      (req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "")
        .split(",")[0]
        ?.trim() || null;
    const ua = req.headers.get("user-agent") || null;
    const referer = req.headers.get("referer") || null;

    // fire-and-forget
    logDownloadByIds({
      softwareId: chosen.softwareId,
      versionId: chosen.versionId,
      buildId: chosen.buildId,
      ip,
      ua,
      referer,
    }).catch(() => {});

    return Response.redirect(chosen.url, 302);
  } catch {
    return new Response("Internal error", { status: 500 });
  }
}
