import { NextRequest } from "next/server";
import crypto from "node:crypto";
import db from "@/app/web-api/_lib/db";
import { updateSoftwareRatingsAggregate } from "@/app/web-api/_lib/ratings";

export const dynamic = "force-dynamic";

// Helper to get client IP (Cloudways/NGINX friendly)
function getIp(req: NextRequest) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const s = await db.software.findUnique({
    where: { slug: params.slug },
    select: { id: true, ratingsAvg: true, ratingsCount: true },
  });
  if (!s) return new Response("Not found", { status: 404 });
  return Response.json({ ok: true, avg: s.ratingsAvg, count: s.ratingsCount });
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const body = await req.json().catch(() => ({}));
  const rating = Math.max(1, Math.min(5, Number(body.rating || 0)));
  const title = typeof body.title === "string" ? body.title.slice(0, 120) : null;
  const reviewBody = typeof body.body === "string" ? body.body.slice(0, 4000) : null;

  const s = await db.software.findUnique({ where: { slug: params.slug }, select: { id: true } });
  if (!s) return new Response("Not found", { status: 404 });

  // Create a stable "guest" user for this IP
  const ip = getIp(req);
  const ipHash = crypto.createHash("sha1").update(ip).digest("hex").slice(0, 16);
  const guestEmail = `guest+${ipHash}@filespay.org`;

  const user = await db.user.upsert({
    where: { email: guestEmail },
    update: {},
    create: { email: guestEmail, passwordHash: "-", name: "Guest" },
    select: { id: true },
  });

  // Upsert review (unique on softwareId+userId)
  await db.review.upsert({
    where: { softwareId_userId: { softwareId: s.id, userId: user.id } },
    create: {
      softwareId: s.id,
      userId: user.id,
      rating,
      title,
      body: reviewBody,
    },
    update: {
      rating,
      title,
      body: reviewBody,
      updatedAt: new Date(),
    },
    select: { id: true },
  });

  const stats = await updateSoftwareRatingsAggregate(s.id);
  return Response.json({ ok: true, ...stats });
}
