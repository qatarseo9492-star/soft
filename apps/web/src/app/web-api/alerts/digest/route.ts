export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/web-api/alerts/digest/route.ts
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import fss from "node:fs";
import path from "node:path";
import { formatList, postSlack } from "@/app/web-api/_lib/slack";


const ADMIN_KEY = (process.env.ALERT_ADMIN_KEY || process.env.DOWNLOAD_SIGN_ADMIN_KEY || "").trim();
const LOG_JSONL = path.join(process.cwd(), "download_events.jsonl");
const LEGACY_LOG = path.join(process.cwd(), "private_downloads", "_download_access.log");
const MAX_SCAN = Number(process.env.DOWNLOAD_STATS_MAX_LINES || 100_000);

type EventRow = { ts: string; ip: string | null; file?: string | null };

function json200(data: any) {
  return NextResponse.json(data, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
function requireAdmin(req: Request) {
  if (!ADMIN_KEY) return { ok: true as const };
  const key = (req.headers.get("x-admin-key") || "").trim();
  return key === ADMIN_KEY ? { ok: true as const } : { ok: false as const, error: "Unauthorized" };
}

async function readEventsJSONL(): Promise<EventRow[]> {
  if (!fss.existsSync(LOG_JSONL)) return [];
  const raw = await fs.readFile(LOG_JSONL, "utf8");
  let lines = raw.trim().split(/\r?\n/);
  if (lines.length > MAX_SCAN) lines = lines.slice(-MAX_SCAN);
  const out: EventRow[] = [];
  for (const ln of lines) {
    try {
      const j = JSON.parse(ln);
      const ts: string = j.ts || j.time || j.timestamp;
      const ip: string | null = j.ip ?? null;
      const file: string | null = j.file ?? null;
      if (ts) out.push({ ts, ip, file });
    } catch {}
  }
  return out;
}
async function readEventsLegacy(): Promise<EventRow[]> {
  if (!fss.existsSync(LEGACY_LOG)) return [];
  const raw = await fs.readFile(LEGACY_LOG, "utf8");
  let lines = raw.trim().split(/\r?\n/);
  if (lines.length > MAX_SCAN) lines = lines.slice(-MAX_SCAN);
  const out: EventRow[] = [];
  for (const ln of lines) {
    const mTs = /^(\d{4}-\d{2}-\d{2}T[^\s]+)/.exec(ln);
    const mIp = /\sip=([0-9A-Fa-f:\.]+)/.exec(ln);
    const mFile = /\sfile=([^\s]+)/.exec(ln);
    const ts = mTs?.[1];
    const ip = mIp?.[1] || null;
    const file = mFile?.[1] || null;
    if (ts) out.push({ ts, ip, file });
  }
  return out;
}

export async function GET(req: Request) {
  try {
    const gate = requireAdmin(req);
    if (!gate.ok) return json200({ ok: false, error: gate.error });

    const url = new URL(req.url);
    // default 1440 mins (24h). You can pass ?mins=60 or ?hours=6 etc.
    const minsParam = url.searchParams.get("mins");
    const hoursParam = url.searchParams.get("hours");
    const daysParam = url.searchParams.get("days");

    let lookbackMins = 1440;
    if (daysParam) lookbackMins = Math.max(1, Math.floor(Number(daysParam) * 1440));
    else if (hoursParam) lookbackMins = Math.max(1, Math.floor(Number(hoursParam) * 60));
    else if (minsParam) lookbackMins = Math.max(1, Math.floor(Number(minsParam)));

    const windowMs = lookbackMins * 60 * 1000;
    const since = Date.now() - windowMs;

    const events = (await readEventsJSONL()).length
      ? await readEventsJSONL()
      : await readEventsLegacy();

    const recent = events.filter((e) => {
      const t = Date.parse(e.ts);
      return Number.isFinite(t) && t >= since;
    });

    const ipCounts = new Map<string, number>();
    const fileCounts = new Map<string, number>();
    for (const e of recent) {
      if (e.ip) ipCounts.set(e.ip, (ipCounts.get(e.ip) || 0) + 1);
      if (e.file) fileCounts.set(e.file, (fileCounts.get(e.file) || 0) + 1);
    }

    const topIps = [...ipCounts.entries()]
      .map(([ip, count]) => ({ label: ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topFiles = [...fileCounts.entries()]
      .map(([file, count]) => ({ label: file, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const text =
      `📊 *Download digest* (last ${lookbackMins} mins)\n` +
      `Top IPs:\n${formatList(topIps)}\n\n` +
      `Top Files:\n${formatList(topFiles)}`;

    const res = await postSlack(text);
    return json200({
      ok: true,
      lookedAt: recent.length,
      windowMinutes: lookbackMins,
      sent: Number(res.ok),
      topIps,
      topFiles,
    });
  } catch (e: any) {
    return json200({ ok: false, error: e?.message || String(e) });
  }
}
