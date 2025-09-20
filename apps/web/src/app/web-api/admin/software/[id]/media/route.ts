// apps/web/src/app/web-api/admin/software/[id]/media/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import db from "@/lib/db";

// List media for a software item
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const items = await db.softwareMedia.findMany({
    where: { softwareId: params.id },
    orderBy: [{ type: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    // ⬇️ only fields that exist in your Prisma model
    select: { id: true, type: true, url: true, alt: true, order: true, createdAt: true },
  });
  return Response.json({ ok: true, items });
}

// Create a media item
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json().catch(() => ({}));

  const data: any = {
    softwareId: params.id,
    type: b?.type ?? "GALLERY", // ICON | HERO | GALLERY | SCREENSHOT | VIDEO
    url: String(b?.url ?? ""),
    alt: b?.alt ?? null,
    order: typeof b?.order === "number" ? b.order : 0,
  };

  const item = await db.softwareMedia.create({
    data,
    select: { id: true, type: true, url: true, alt: true, order: true, createdAt: true },
  });

  return Response.json({ ok: true, item }, { status: 201 });
}
