// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = [/^\/admin(\/.*)?$/, /^\/web-api\/admin(\/.*)?$/];
const PUBLIC = [/^\/admin\/login(\/.*)?$/, /^\/web-api\/admin\/auth\/login(\/.*)?$/];

async function verifyCookie(req: NextRequest): Promise<boolean> {
  const cookie = req.cookies.get("adm")?.value || "";
  if (!cookie) return false;
  const [payloadB64, sigB64] = cookie.split(".");
  if (!payloadB64 || !sigB64) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(process.env.ADMIN_JWT_SECRET || "dev-secret-change-me"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const verified = await crypto.subtle.verify(
    "HMAC",
    key,
    base64urlToBytes(sigB64),
    enc.encode(payloadB64)
  );
  if (!verified) return false;

  const payload = JSON.parse(new TextDecoder().decode(base64urlToBytes(payloadB64)));
  if (!payload?.exp || Date.now() / 1000 > payload.exp) return false;
  return true;
}

function base64urlToBytes(b64url: string) {
  const pad = "=".repeat((4 - (b64url.length % 4)) % 4);
  const b64 = (b64url + pad).replace(/-/g, "+").replace(/_/g, "/");
  const str = atob(b64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow publics
  if (PUBLIC.some((re) => re.test(pathname))) return NextResponse.next();

  // Only gate protected paths
  if (!PROTECTED.some((re) => re.test(pathname))) return NextResponse.next();

  const ok = await verifyCookie(req);
  if (ok) return NextResponse.next();

  // If it's a page, redirect to login; if it's API, return 401
  if (pathname.startsWith("/admin")) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export const config = {
  matcher: ["/admin/:path*", "/web-api/admin/:path*"],
};
