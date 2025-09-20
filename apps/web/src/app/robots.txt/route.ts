import db from "@/app/web-api/_lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://filespay.org";
  const enable = await db.setting.findUnique({ where: { key: "enable_indexing" } });
  const allow = (enable?.json ?? true) !== false;

  const body = [
    "User-agent: *",
    allow ? "Allow: /" : "Disallow: /",
    "",
    `Sitemap: ${base.replace(/\/$/, "")}/sitemap.xml`,
  ].join("\n");

  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
