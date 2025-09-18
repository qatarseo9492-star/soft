// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

/** Run on Edge */
export const runtime = "edge";

/** Only run on the routes we care about */
export const config = {
  matcher: ["/downloads/:path*", "/admin/:path*", "/web-api/admin/:path*"],
};

/* ------------------------------
 * Helpers (Edge-safe)
 * ------------------------------ */

// Edge-safe base64url encoder for ArrayBuffer
function b64url(buf: ArrayBuffer): string {
  const u8 = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmacSHA256(message: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return b64url(sig);
}

function unauthorizedBasic(realm = "Admin") {
  const res = new NextResponse("Authentication required", { status: 401 });
  res.headers.set("WWW-Authenticate", `Basic realm="${realm}", charset="UTF-8"`);
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noimageindex, noarchive, nocache");
  return res;
}

function withAdminSecurityHeaders(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noimageindex, noarchive, nocache");
  // Mild hardening (safe on Edge)
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
}

/* ------------------------------
 * Middleware
 * ------------------------------ */

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  /* ---- 1) Basic Auth for /admin/** and /web-api/admin/** ---- */
  if (pathname.startsWith("/admin/") || pathname === "/admin" || pathname.startsWith("/web-api/admin/")) {
    const USER = (process.env.ADMIN_UI_USER || "").trim();
    const PASS = (process.env.ADMIN_UI_PASS || "").trim();

    // If creds provided in env, enforce Basic Auth. If either is empty, auth is disabled.
    if (USER && PASS) {
      const auth = req.headers.get("authorization") || "";
      const [scheme, encoded] = auth.split(" ");

      // Require "Basic <base64(user:pass)>"
      if (scheme !== "Basic" || !encoded) {
        return unauthorizedBasic();
      }

      // atob is available in Edge runtime
      let decoded = "";
      try {
        decoded = atob(encoded);
      } catch {
        return unauthorizedBasic();
      }

      // Allow colons in password — split once
      const idx = decoded.indexOf(":");
      const name = idx >= 0 ? decoded.slice(0, idx) : decoded;
      const pwd = idx >= 0 ? decoded.slice(idx + 1) : "";

      if (!(name === USER && pwd === PASS)) {
        return unauthorizedBasic();
      }
    }

    // Pass through with noindex/no-cache headers for admin
    return withAdminSecurityHeaders(NextResponse.next());
  }

  /* ---- 2) Signed downloads for /downloads/** ---- */
  if (pathname.startsWith("/downloads/")) {
    const secret = (process.env.DOWNLOAD_SIGN_SECRET || "").trim();
    const bindIp = (process.env.DOWNLOAD_BIND_IP ?? "true").toLowerCase() !== "false";
    if (!secret) return new NextResponse("Downloads misconfigured", { status: 500 });

    // Required query params from the signed link
    const expStr = url.searchParams.get("exp");
    const sig = (url.searchParams.get("sig") || "").trim();
    const ipParam = (url.searchParams.get("ip") || "").trim();

    if (!expStr) return new NextResponse("Forbidden", { status: 403 });

    // Expiry FIRST → always 410 on expired links
    const now = Math.floor(Date.now() / 1000);
    const exp = Number(expStr);
    if (!Number.isFinite(exp)) return new NextResponse("Bad exp", { status: 400 });
    if (exp < now) return new NextResponse("Link expired", { status: 410 });

    // Now require signature
    if (!sig) return new NextResponse("Forbidden", { status: 403 });

    // Determine client IP (Cloudflare → XFF → X-Real-IP)
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "";

    // If IP binding is enabled, require ip param and ensure it matches (when visible)
    if (bindIp) {
      if (!ipParam) return new NextResponse("IP required", { status: 403 });
      if (clientIp && ipParam !== clientIp) {
        return new NextResponse("IP mismatch", { status: 403 });
      }
    }

    // IMPORTANT: match the server-side signer EXACTLY:
    // message = `${file}|${exp}|${ip ?? ""}`
    const file = decodeURIComponent(pathname.replace(/^\/downloads\//, ""));
    const ipForSig = bindIp ? ipParam : "";
    const message = `${file}|${exp}|${ipForSig}`;
    const expected = await hmacSHA256(message, secret);

    if (sig !== expected) return new NextResponse("Invalid signature", { status: 403 });

    // OK → let Next serve (route handler or proxied file)
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    res.headers.set("Vary", "CF-Connecting-IP, X-Forwarded-For, X-Real-IP");
    return res;
  }

  // Not an admin or downloads path → no-op
  return NextResponse.next();
}
