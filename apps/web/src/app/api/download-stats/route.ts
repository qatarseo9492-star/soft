export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/api/download-stats/route.ts
import { NextResponse } from "next/server";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";


// ---- Inputs (both supported) ----
const JSONL = path.join(process.cwd(), "download_events.jsonl");                 // preferred (JSON lines)
const LOG   = path.join(process.cwd(), "private_downloads", "_download_access.log"); // legacy (plain text)

// ---- Tuning knobs ----
const MAX_LINES   = Number(process.env.DOWNLOAD_STATS_MAX_LINES || 100_000); // safety cap
const WINDOW_DAYS = Number(process.env.DOWNLOAD_STATS_WINDOW_DAYS || 14);    // rolling window
const TOP_N       = Number(process.env.DOWNLOAD_STATS_TOP_N || 50);          // top IPs to return

type IpRow = { ip: string; count: number };
type DayRow = { day: string; count: number };
type Event = { day: string; ip?: string }; // normalized minimal event

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function windowDays(): string[] {
  const out: string[] = [];
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (WINDOW_DAYS - 1));
  for (let i = 0; i < WINDOW_DAYS; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(ymd(d));
  }
  return out;
}

// ---- Readers ----

async function readJsonlEvents(): Promise<Event[]> {
  if (!fs.existsSync(JSONL)) return [];
  const raw = await fsp.readFile(JSONL, "utf8");
  let lines = raw.trim().split(/\r?\n/);
  if (lines.length > MAX_LINES) lines = lines.slice(-MAX_LINES);

  const events: Event[] = [];
  for (const line of lines) {
    if (!line) continue;
    try {
      const obj = JSON.parse(line) as { ts?: string; day?: string; ip?: string };
      const day = obj.day || (obj.ts ? ymd(new Date(obj.ts)) : undefined);
      if (!day) continue;
      events.push({ day, ip: obj.ip || undefined });
    } catch {
      // ignore bad line
    }
  }
  return events;
}

async function readLegacyLogEvents(): Promise<Event[]> {
  if (!fs.existsSync(LOG)) return [];
  const raw = await fsp.readFile(LOG, "utf8");
  let lines = raw.trim().split(/\r?\n/);
  if (lines.length > MAX_LINES) lines = lines.slice(-MAX_LINES);

  // Legacy line example:
  // 2025-09-12T12:34:56.789Z ip=1.2.3.4 file=example.exe ua="..."
  const events: Event[] = [];
  for (const ln of lines) {
    const mDay = /^(\d{4}-\d{2}-\d{2})T/.exec(ln);
    const mIp  = /(?:^|\s)ip=([0-9a-fA-F:\.]+)/.exec(ln);
    const day  = mDay?.[1];
    if (!day) continue;
    events.push({ day, ip: mIp?.[1] });
  }
  return events;
}

// ---- Aggregation ----
function aggregate(events: Event[]) {
  const days = windowDays();
  const daySet = new Set(days);
  const byDayMap = new Map<string, number>(days.map(d => [d, 0]));
  const ipCount = new Map<string, number>();
  const uniqueIps = new Set<string>();

  for (const ev of events) {
    // keep only within the window
    if (!daySet.has(ev.day)) continue;

    byDayMap.set(ev.day, (byDayMap.get(ev.day) || 0) + 1);

    if (ev.ip) {
      uniqueIps.add(ev.ip);
      ipCount.set(ev.ip, (ipCount.get(ev.ip) || 0) + 1);
    }
  }

  const byDay: DayRow[] = [...byDayMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, count]) => ({ day, count }));

  const topIps: IpRow[] = [...ipCount.entries()]
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_N);

  const total = byDay.reduce((s, d) => s + d.count, 0);

  return { total, uniqueIps: uniqueIps.size, topIps, byDay };
}

// ---- Route ----
export async function GET() {
  try {
    // Prefer JSONL if present; otherwise use legacy log
    const jsonlExists = fs.existsSync(JSONL);
    const source = jsonlExists ? await readJsonlEvents() : await readLegacyLogEvents();
    const payload = aggregate(source);
    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
