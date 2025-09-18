export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/web-api/sign-download/route.ts
import { NextResponse } from "next/server";
import crypto from "node:crypto";


/**
 * ---------------------------
 * Env / Config
 * ---------------------------
 */
const SECRET = (process.env.DOWNLOAD_SIGN_SECRET || "").trim();
const TTL_DEFAULT = Number(process.env.DOWNLOAD_TOKEN_TTL_SECONDS || 14400); // 4h default
const BIND_IP = (process.env.DOWNLOAD_BIND_IP ?? "true").toLowerCase() !== "false";
const ADMIN_KEY = (process.env.DOWNLOAD_SIGN_ADMIN_KEY || "").trim(); // optional gate

// sanity bounds for ttl
const TTL_MIN = 60;                  // 1 minute min
const TTL_MAX = 7 * 24 * 60 * 60;    // 7 days max

/**
 * ---------------------------
 * Helpers
 * ---------------------------
 */
const b64url = (buf: Buffer) =>
  buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const badFileName = (f: string) =>
  !f || f.includes("/") || f.includes("\\") || f.includes("..");

function siteOrigin(req: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return new URL(env).origin;
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  return host ? `${proto}://${host}` : new URL(req.url).origin;
}

// MUST match middleware & /windows|/macos|/linux routes: `${file}|${exp}|${ip ?? ""}`
function sign(file: string, exp: number, ip?: string) {
  const h = crypto.createHmac("sha256", SECRET);
  h.update(`${file}|${exp}|${ip ?? ""}`);
  return b64url(h.digest());
}

type SignInput = { file: string; ttl?: number; ip?: string };

function normalizeTtl(ttlRaw: unknown): number {
  const n = Number(ttlRaw);
  if (!Number.isFinite(n)) return TTL_DEFAULT;
  const ttl = Math.floor(n);
  if (ttl < TTL_MIN) return TTL_MIN;
  if (ttl > TTL_MAX) return TTL_MAX;
  return ttl;
}

function jsonNoStore(body: any, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

function requireConfigured() {
  if (!SECRET) {
    return jsonNoStore({ error: "Signing not configured" }, { status: 500 });
  }
  return null;
}

function requireAdmin(req: Request) {
  if (!ADMIN_KEY) return null; // gate disabled
  const key = (req.headers.get("x-admin-key") || "").trim();
  if (key !== ADMIN_KEY) {
    return jsonNoStore({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function buildResponse(req: Request, { file, ttl, ip }: { file: string; ttl: number; ip?: string }) {
  const exp = Math.floor(Date.now() / 1000) + ttl;
  const sig = sign(file, exp, BIND_IP ? ip : undefined);

  const origin = siteOrigin(req);
  const qs = new URLSearchParams({ exp: String(exp), sig });
  if (BIND_IP && ip) qs.set("ip", ip);

  const url = `${origin}/downloads/${encodeURIComponent(file)}?${qs.toString()}`;

  return jsonNoStore({
    url,
    file,
    exp,
    ttl,
    bindIp: BIND_IP,
    ip: BIND_IP ? ip : undefined,
  });
}

/**
 * ---------------------------
 * Handlers
 * ---------------------------
 *
 * POST /web-api/sign-download
 * Body: { file: string; ttl?: number; ip?: string }
 */
export async function POST(req: Request) {
  const mis = requireConfigured(); if (mis) return mis;
  const auth = requireAdmin(req);  if (auth) return auth;

  let body: Partial<SignInput> = {};
  try { body = await req.json(); } catch {}

  const file = String(body.file || "").trim();
  if (badFileName(file)) return jsonNoStore({ error: "Bad file name" }, { status: 400 });

  const ttl = normalizeTtl(body.ttl ?? TTL_DEFAULT);
  const ip  = (body.ip ? String(body.ip).trim() : undefined) || undefined;

  if (BIND_IP && !ip) {
    return jsonNoStore({ error: "ip is required when DOWNLOAD_BIND_IP=true" }, { status: 400 });
  }

  return buildResponse(req, { file, ttl, ip });
}

/**
 * GET /web-api/sign-download?file=<file>&ttl=<secs>&ip=<ip>
 * (Convenience for curl/testing)
 */
export async function GET(req: Request) {
  const mis = requireConfigured(); if (mis) return mis;
  const auth = requireAdmin(req);  if (auth) return auth;

  const url  = new URL(req.url);
  const file = (url.searchParams.get("file") || "").trim();
  if (badFileName(file)) return jsonNoStore({ error: "Bad file name" }, { status: 400 });

  const ttl = normalizeTtl(url.searchParams.get("ttl") ?? TTL_DEFAULT);
  const ip  = (url.searchParams.get("ip") || "").trim() || undefined;

  if (BIND_IP && !ip) {
    return jsonNoStore({ error: "ip is required when DOWNLOAD_BIND_IP=true" }, { status: 400 });
  }

  return buildResponse(req, { file, ttl, ip });
}
