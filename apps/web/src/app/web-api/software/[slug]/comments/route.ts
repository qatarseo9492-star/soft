import { NextRequest } from "next/server";
import db from "@/app/web-api/_lib/db";

export const dynamic = "force-dynamic";

function sanitize(s: unknown, max = 2000) {
  if (typeof s !== "string") return "";
  return s.replace(/\s+/g, " ").trim().slice(0, max);
}

const BAD = new Set(["http://", "https://", "viagra", "porn", "sex", "loan", "casino"]);

function looksSpam(s: string) {
  const lower = s.toLowerCase();
  for (const w of BAD) if (lower.includes(w)) return true;
  return false;
}

// GET: list approved comments for slug
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const s = await db.software.findUnique({ where: { slug: params.slug }, select: { id: true } });
  if (!s) return new Response("Not found", { status: 404 });

  const items = await db.comment.findMany({
    where: { softwareId: s.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, content: true, createdAt: true },
    take: 200,
  });
  return Response.json({ ok: true, items });
}

// POST: submit a comment (goes to PENDING moderation)
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const body = await req.json().catch(() => ({}));
  const name = sanitize(body.name, 80) || "Anonymous";
  const email = sanitize(body.email, 120); // optional but recommended
  const content = sanitize(body.content, 2000);

  if (!content || content.length < 5) {
    return new Response(JSON.stringify({ ok: false, error: "Too short" }), { status: 400 });
  }
  if (looksSpam(content) || looksSpam(name)) {
    return new Response(JSON.stringify({ ok: false, error: "Rejected" }), { status: 400 });
  }

  const s = await db.software.findUnique({ where: { slug: params.slug }, select: { id: true } });
  if (!s) return new Response("Not found", { status: 404 });

  // simple throttle per (software,email) within 2 minutes
  if (email) {
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);
    const recent = await db.comment.findFirst({
      where: { softwareId: s.id, email, createdAt: { gt: twoMinAgo } },
      select: { id: true },
    });
    if (recent) {
      return new Response(JSON.stringify({ ok: false, error: "Please wait before posting again." }), { status: 429 });
    }
  }

  await db.comment.create({
    data: {
      softwareId: s.id,
      name,
      email: email || null,
      content,
      status: "PENDING",
    },
  });

  return Response.json({ ok: true, status: "PENDING" });
}
