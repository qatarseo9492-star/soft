export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/api/blocked-ips/route.ts
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";


const ADMIN_KEY = (process.env.DOWNLOAD_SIGN_ADMIN_KEY || "").trim();
// Text file at app root (same place as counters, etc.)
const FILE_PATH = path.join(process.cwd(), "blocked_ips.txt");

// ---------- utils ----------
const isIPv4 = (s: string) =>
  /^(25[0-5]|2[0-4]\d|[01]?\d\d?)(\.(25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/.test(s);

const isIPv6 = (s: string) =>
  // practical IPv6 check (accepts :: shorthand)
  /^(([0-9A-Fa-f]{1,4}:){1,7}|:)(([0-9A-Fa-f]{1,4})?(:|$)){1,7}$/.test(s) ||
  /^::1$/.test(s) ||
  (/^[0-9A-Fa-f:]+$/.test(s) && s.includes("::"));

function normalizeIPs(list: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const raw of list) {
    const ip = String(raw || "").trim();
    if (!ip) continue;
    if (isIPv4(ip) || isIPv6(ip)) valid.push(ip);
    else invalid.push(ip);
  }
  return { valid, invalid };
}

async function ensureFile(): Promise<void> {
  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.writeFile(FILE_PATH, "", "utf8");
  }
}

async function readSet(): Promise<Set<string>> {
  await ensureFile();
  const txt = await fs.readFile(FILE_PATH, "utf8");
  return new Set(
    txt
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

// atomic write (tmp then rename) to avoid partial reads
async function writeSet(set: Set<string>) {
  const tmp = FILE_PATH + ".tmp-" + Date.now();
  await fs.writeFile(tmp, [...set].join("\n") + "\n", "utf8");
  await fs.rename(tmp, FILE_PATH);
}

async function fileMeta() {
  try {
    const st = await fs.stat(FILE_PATH);
    const mtime = st.mtime.toUTCString();
    const etag = `"${crypto
      .createHash("sha1")
      .update(String(st.size) + ":" + mtime)
      .digest("hex")}"`;
    return { mtime, etag };
  } catch {
    return { mtime: new Date(0).toUTCString(), etag: `"0"` };
  }
}

function withCommonHeaders(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

function json200(data: any) {
  // Always return 200 JSON (admin UI-friendly; no conditional 304s)
  return withCommonHeaders(
    NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    })
  );
}

function requireAdmin(req: Request) {
  if (!ADMIN_KEY) return { ok: true as const }; // gate disabled
  const key = (req.headers.get("x-admin-key") || "").trim();
  return key === ADMIN_KEY
    ? { ok: true as const }
    : { ok: false as const, error: "Unauthorized" };
}

// ---------- handlers ----------
export async function GET() {
  try {
    const set = await readSet();
    const { mtime, etag } = await fileMeta();

    const res = json200({ ok: true, ips: [...set], count: set.size, updatedAt: mtime });
    res.headers.set("ETag", etag);
    res.headers.set("Last-Modified", mtime);
    return res;
  } catch (e: any) {
    return json200({ ok: false, error: e?.message || String(e) });
  }
}

export async function HEAD() {
  try {
    const { mtime, etag } = await fileMeta();
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ETag: etag,
        "Last-Modified": mtime,
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch {
    // Even on error, return 200 with safe headers
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }
}

export async function OPTIONS() {
  return withCommonHeaders(
    new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS,HEAD",
        "Access-Control-Allow-Headers": "Content-Type, x-admin-key",
        "Access-Control-Max-Age": "600",
      },
    })
  );
}

export async function POST(req: Request) {
  try {
    const gate = requireAdmin(req);
    if (!gate.ok) return json200({ ok: false, error: gate.error });

    let body: { ip?: string; ips?: string[] } = {};
    try {
      body = await req.json();
    } catch {}

    const rawList = body.ips ?? (body.ip ? [body.ip] : []);
    const { valid, invalid } = normalizeIPs(rawList);

    if (!valid.length && !invalid.length) {
      return json200({ ok: false, error: "No ip provided" });
    }

    const set = await readSet();
    const before = set.size;
    for (const ip of valid) set.add(ip);
    await writeSet(set);

    const added = set.size - before;
    return json200({
      ok: true,
      added,
      skipped: valid.length - added,
      invalid,
      count: set.size,
      ips: [...set],
    });
  } catch (e: any) {
    return json200({ ok: false, error: e?.message || String(e) });
  }
}

export async function DELETE(req: Request) {
  try {
    const gate = requireAdmin(req);
    if (!gate.ok) return json200({ ok: false, error: gate.error });

    let body: { ip?: string; ips?: string[] } = {};
    try {
      body = await req.json();
    } catch {}

    const rawList = body.ips ?? (body.ip ? [body.ip] : []);
    const { valid, invalid } = normalizeIPs(rawList);

    if (!valid.length && !invalid.length) {
      return json200({ ok: false, error: "No ip provided" });
    }

    const set = await readSet();
    let removed = 0;
    for (const ip of valid) if (set.delete(ip)) removed++;
    await writeSet(set);

    return json200({ ok: true, removed, invalid, count: set.size, ips: [...set] });
  } catch (e: any) {
    return json200({ ok: false, error: e?.message || String(e) });
  }
}
