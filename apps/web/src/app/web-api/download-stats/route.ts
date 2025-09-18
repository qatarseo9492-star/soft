export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/web-api/download-stats/route.ts
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";


// Prefer JSONL (new), fall back to legacy text log
const JSONL = path.join(process.cwd(), "download_events.jsonl");
const LEGACY = path.join(process.cwd(), "private_downloads", "_download_access.log");

const MAX_LINES = Number(process.env.DOWNLOAD_STATS_MAX_LINES || 100_000);

type IpRow = { ip: string; count: number };
type DayRow = { day: string; count: number };
type FileRow = { file: string; count: number };

function sliceTailLines(content: string) {
  let lines = content.trim().split(/\r?\n/);
  if (lines.length > MAX_LINES) lines = lines.slice(-MAX_LINES);
  return lines;
}

export async function GET() {
  try {
    // First try JSONL
    if (fs.existsSync(JSONL)) {
      const raw = await fs.promises.readFile(JSONL, "utf8");
      const lines = sliceTailLines(raw);

      const ipCount = new Map<string, number>();
      const dayCount = new Map<string, number>();
      const fileCount = new Map<string, number>();

      for (const ln of lines) {
        if (!ln) continue;
        try {
          const ev = JSON.parse(ln) as { ts: string; ip: string | null; file: string; ua?: string };
          const ip = ev.ip ?? "-";
          const day = (ev.ts || "").slice(0, 10) || "unknown";
          ipCount.set(ip, (ipCount.get(ip) || 0) + 1);
          dayCount.set(day, (dayCount.get(day) || 0) + 1);
          fileCount.set(ev.file, (fileCount.get(ev.file) || 0) + 1);
        } catch {
          // skip bad line
        }
      }

      const topIps: IpRow[] = [...ipCount.entries()]
        .map(([ip, count]) => ({ ip, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);

      const byDay: DayRow[] = [...dayCount.entries()]
        .map(([day, count]) => ({ day, count }))
        .sort((a, b) => a.day.localeCompare(b.day));

      const topFiles: FileRow[] = [...fileCount.entries()]
        .map(([file, count]) => ({ file, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);

      const total = lines.length;
      const uniqueIps = ipCount.size;

      const res = NextResponse.json({ total, uniqueIps, topIps, byDay, topFiles });
      res.headers.set("Cache-Control", "no-store");
      return res;
    }

    // Legacy fallback
    if (fs.existsSync(LEGACY)) {
      const raw = await fs.promises.readFile(LEGACY, "utf8");
      const lines = sliceTailLines(raw);

      const ipCount = new Map<string, number>();
      const dayCount = new Map<string, number>();
      const fileCount = new Map<string, number>();

      for (const ln of lines) {
        // 2025-09-12T... ip=1.2.3.4 file=name.exe ua="..."
        const mIp = /(?:^|\s)ip=([0-9a-fA-F:\.]+)/.exec(ln);
        const mTs = /^(\d{4}-\d{2}-\d{2})T/.exec(ln);
        const mFile = /\sfile=([^\s]+)/.exec(ln);
        if (mIp) ipCount.set(mIp[1], (ipCount.get(mIp[1]) || 0) + 1);
        const day = mTs ? mTs[1] : "unknown";
        dayCount.set(day, (dayCount.get(day) || 0) + 1);
        if (mFile) fileCount.set(mFile[1], (fileCount.get(mFile[1]) || 0) + 1);
      }

      const topIps: IpRow[] = [...ipCount.entries()]
        .map(([ip, count]) => ({ ip, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);

      const byDay: DayRow[] = [...dayCount.entries()]
        .map(([day, count]) => ({ day, count }))
        .sort((a, b) => a.day.localeCompare(b.day));

      const topFiles: FileRow[] = [...fileCount.entries()]
        .map(([file, count]) => ({ file, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);

      const total = lines.length;
      const uniqueIps = ipCount.size;

      const res = NextResponse.json({ total, uniqueIps, topIps, byDay, topFiles });
      res.headers.set("Cache-Control", "no-store");
      return res;
    }

    // Nothing yet
    const res = NextResponse.json({ total: 0, uniqueIps: 0, topIps: [], byDay: [], topFiles: [] });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
