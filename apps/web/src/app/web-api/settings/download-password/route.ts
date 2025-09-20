// apps/web/src/app/web-api/settings/download-password/route.ts
import db from "../../_lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  // Priority: DB(Setting.key='download_password' -> text/value) → ENV → null
  try {
    const rec = await db.setting.findUnique({ where: { key: "download_password" } });
    const password =
      (rec?.text ?? (rec as any)?.value ?? null) ||
      process.env.NEXT_PUBLIC_DEFAULT_DOWNLOAD_PASSWORD ||
      null;

    return new Response(JSON.stringify({ password }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  } catch {
    return new Response(
      JSON.stringify({ password: process.env.NEXT_PUBLIC_DEFAULT_DOWNLOAD_PASSWORD || null }),
      { headers: { "content-type": "application/json", "cache-control": "no-store" } }
    );
  }
}
