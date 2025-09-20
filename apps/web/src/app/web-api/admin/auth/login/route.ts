// src/app/web-api/admin/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function b64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const u = String(form.get("username") || "");
  const p = String(form.get("password") || "");

  // DB user first
  const user = await db.adminUser.findUnique({ where: { username: u } }).catch(() => null);

  if (user) {
    const ok = await bcrypt.compare(p, user.passwordHash);
    if (!ok) return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 8;
    const payload = { sub: user.id, iat: Math.floor(Date.now() / 1000), exp };
    const payloadB64 = b64url(JSON.stringify(payload));
    const secret = process.env.ADMIN_JWT_SECRET || "dev-secret-change-me";
    const sig = createHmac("sha256", secret).update(payloadB64).digest();
    const sigB64 = b64url(sig);
    const res = NextResponse.json({ ok: true });
    res.cookies.set("adm", `${payloadB64}.${sigB64}`, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 8 });
    return res;
  }

  // Fallback to env
  if (u === (process.env.ADMIN_USER || "admin") && p === (process.env.ADMIN_PASS || "admin")) {
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 8;
    const payload = { sub: "__env__", iat: Math.floor(Date.now() / 1000), exp };
    const payloadB64 = b64url(JSON.stringify(payload));
    const secret = process.env.ADMIN_JWT_SECRET || "dev-secret-change-me";
    const sig = createHmac("sha256", secret).update(payloadB64).digest();
    const sigB64 = b64url(sig);
    const res = NextResponse.json({ ok: true });
    res.cookies.set("adm", `${payloadB64}.${sigB64}`, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 8 });
    return res;
  }

  return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
}
