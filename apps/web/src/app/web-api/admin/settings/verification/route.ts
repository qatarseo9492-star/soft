import { NextRequest, NextResponse } from "next/server";
import db from "@/app/web-api/_lib/db";
import { requireAdmin } from "@/app/web-api/_lib/admin-auth";

export const dynamic = "force-dynamic";

// Keys we store in Setting.text
const KEYS = [
  "seo.verify.google",
  "seo.verify.bing",
  "seo.verify.yandex",
  "seo.verify.pinterest",
] as const;

export async function GET() {
  const rows = await db.setting.findMany({
    where: { key: { in: KEYS as unknown as string[] } },
    select: { key: true, text: true, updatedAt: true },
  });

  const map: Record<string, string> = {};
  rows.forEach((r) => (map[r.key] = r.text ?? ""));

  return NextResponse.json({
    ok: true,
    google: map[KEYS[0]] ?? "",
    bing: map[KEYS[1]] ?? "",
    yandex: map[KEYS[2]] ?? "",
    pinterest: map[KEYS[3]] ?? "",
  });
}

export async function PUT(req: NextRequest) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;

  const body = await req.json().catch(() => ({} as any));
  const payload: Record<(typeof KEYS)[number], string> = {
    [KEYS[0]]: String(body.google ?? ""),
    [KEYS[1]]: String(body.bing ?? ""),
    [KEYS[2]]: String(body.yandex ?? ""),
    [KEYS[3]]: String(body.pinterest ?? ""),
  };

  await db.$transaction(
    (Object.entries(payload) as [string, string][])
      .map(([key, val]) =>
        db.setting.upsert({
          where: { key },
          update: { text: val },
          create: { key, text: val },
          select: { key: true },
        }),
      )
  );

  return NextResponse.json({ ok: true });
}
