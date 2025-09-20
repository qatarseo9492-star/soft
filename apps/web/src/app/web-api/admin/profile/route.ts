// src/app/web-api/admin/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getUserIdFromCookie(req: NextRequest) {
  const token = req.cookies.get("adm")?.value || "";
  const [payloadB64] = token.split(".");
  if (!payloadB64) return null;
  try {
    const json = Buffer.from(payloadB64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const payload = JSON.parse(json);
    return payload?.sub || null;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const id = getUserIdFromCookie(req);
  if (!id || id === "__env__") return NextResponse.json({ ok: false, error: "Profile not available for env user" }, { status: 400 });
  const user = await db.adminUser.findUnique({ where: { id }, select: { id: true, username: true, name: true, email: true, avatarUrl: true } });
  return NextResponse.json({ ok: true, user });
}

export async function PUT(req: NextRequest) {
  const id = getUserIdFromCookie(req);
  if (!id || id === "__env__") return NextResponse.json({ ok: false, error: "Profile not available for env user" }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const data: any = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.email === "string") data.email = body.email || null;
  if (typeof body.avatarUrl === "string") data.avatarUrl = body.avatarUrl || null;
  const u = await db.adminUser.update({ where: { id }, data, select: { id: true, username: true, name: true, email: true, avatarUrl: true } });
  return NextResponse.json({ ok: true, user: u });
}

export async function PATCH(req: NextRequest) {
  const id = getUserIdFromCookie(req);
  if (!id || id === "__env__") return NextResponse.json({ ok: false, error: "Profile not available for env user" }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const current = String(body.current || "");
  const next = String(body.next || "");
  if (!current || !next) return NextResponse.json({ ok: false, error: "Missing passwords" }, { status: 400 });
  const user = await db.adminUser.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const ok = await bcrypt.compare(current, user.passwordHash);
  if (!ok) return NextResponse.json({ ok: false, error: "Current password invalid" }, { status: 400 });
  const hash = await bcrypt.hash(next, 10);
  await db.adminUser.update({ where: { id }, data: { passwordHash: hash } });
  return NextResponse.json({ ok: true });
}
