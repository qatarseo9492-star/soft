export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/web-api/alerts/download-burst/route.ts
import { NextResponse } from "next/server";
import fsp from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import { postSlack } from "@/app/web-api/_lib/slack";

/* -------------------------
 * Route config
 * ------------------------- */

/* -------------------------
 * Env / auth (with compat)
 * ------------------------- */
const ADMIN_KEY = (
  process.env.ALERT_ADMIN_KEY || process.env.DOWNLOAD_SIGN_ADMIN_KEY || ""
).trim();

const WINDOW_S = Number(
  process.env.ALERT_WINDOW_SECONDS || process.env.BURST_IP_WINDOW_SECONDS || 60
);
const THRESHOLD = Number(
  process.env.ALERT_BURST_THRESHOLD || process.env.BURST_IP_THRESHOLD || 60
);
const COOLDOWN_S = Number(
  process.env.ALERT_COOLDOWN_SECONDS ||
    process.env.BURST_IP_ALERT_COOLDOWN_SECONDS ||
    600
);
const MAX_SCAN = Number(process.env.DOWNLOAD_STATS_MAX_LINES || 100_000);

const SLACK_WEBHOOK = (process.env.SLACK_WEBHOOK_URL || "").trim();

/* -------------------------
 * Logs & state
 * ------------------------- */
const LOG_JSONL = path.join(process.cwd(), "download_events.jsonl"); // preferred
const LEGACY_LOG = path.join(
  process.cwd(),
  "private_downloads",
  "_download_access.log"
); // fallback (text)
const STATE_FILE = path.join(process.cwd(), ".alert_state.json"); // { [ip]: epochSecLastAlert }

/* -------------------------
 * Types
 * ------------------------- */
type EventRow = { ts: string; ip: string | null; file?: string | null };

/* -------------------------
 * Helpers
 * ------------------------- */
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
  if (!ADMIN_KEY) return { ok: true as const }; // gate disabled
  const key = (req.headers.get("x-admin-key") || "").trim();
  return key === ADMIN_KEY
    ? { ok: true as const }
    : { ok: false as const, error: "Unauthorized" };
}

async function loadState(): Promise<Record<string, number>> {
  try {
    const raw = await fsp.readFile(STATE_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveState(state: Record<string, number>) {
  const tmp = STATE_FILE + ".tmp-" + Date.now();
  await fsp.writeFile(tmp, JSON.stringify(state), "utf8");
  await fsp.rename(tmp, STATE_FILE);
}

async function readEventsJSONL(): Promise<EventRow[]> {
  if (!fs.existsSync(LOG_JSONL)) return [];
  const raw = await fsp.readFile(LOG_JSONL, "utf8");
  let lines = raw.trim() ? raw.trim().split(/\r?\n/) : [];
  if (lines.length > MAX_SCAN) lines = lines.slice(-MAX_SCAN);

  const out: EventRow[] = [];
  for (const ln of lines) {
    try {
      const j = JSON.parse(ln);
      const ts: string = j.ts || j.time || j.timestamp;
      const ip: string | null = j.ip ?? null;
      const file: string | null = j.file ?? null;
      if (ts) out.push({ ts, ip, file });
    } catch {
      // skip malformed
    }
  }
  return out;
}

async function readEventsLegacy(): Promise<EventRow[]> {
  if (!fs.existsSync(LEGACY_LOG)) return [];
  const raw = await fsp.readFile(LEGACY_LOG, "utf8");
  let lines = raw.trim() ? raw.trim().split(/\r?\n/) : [];
  if (lines.length > MAX_SCAN) lines = lines.slice(-MAX_SCAN);

  const out: EventRow[] = [];
  for (const ln of lines) {
    // Example: 2025-09-13T.. ip=1.2.3.4 file=name ua=".."
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

/* -------------------------
 * GET /web-api/alerts/download-burst
 * ------------------------- */
export async function GET(req: Request) {
  try {
    const gate = requireAdmin(req);
    if (!gate.ok) return json200({ ok: false, error: gate.error });

    // Optional overrides via query string for manual checks:
    const url = new URL(req.url);
    const windowS = Number(url.searchParams.get("window") || WINDOW_S) || WINDOW_S;
    const threshold = Number(url.searchParams.get("threshold") || THRESHOLD) || THRESHOLD;
    const cooldownS = Number(url.searchParams.get("cooldown") || COOLDOWN_S) || COOLDOWN_S;

    const now = Date.now();
    const sinceMs = now - windowS * 1000;

    // Prefer JSONL; fall back to legacy
    const jsonl = await readEventsJSONL();
    const events = jsonl.length ? jsonl : await readEventsLegacy();

    const lookedAtLines = events.length;

    // Keep only recent events
    const recent = events.filter((e) => {
      const t = Date.parse(e.ts);
      return Number.isFinite(t) && t >= sinceMs;
    });

    // Count by IP
    const counts = new Map<string, number>();
    for (const e of recent) {
      if (!e.ip) continue;
      counts.set(e.ip, (counts.get(e.ip) || 0) + 1);
    }

    // Threshold + cooldown
    const state = await loadState();
    const epochSec = Math.floor(now / 1000);
    const offenders: Array<{ ip: string; count: number; nextAllowedAt?: string }> = [];

    for (const [ip, count] of counts.entries()) {
      if (count >= threshold) {
        const last = state[ip] || 0;
        const nextAllowed = last + cooldownS;
        if (epochSec >= nextAllowed) {
          offenders.push({ ip, count });
        } else {
          offenders.push({
            ip,
            count,
            nextAllowedAt: new Date(nextAllowed * 1000).toISOString(),
          });
        }
      }
    }

    // Split
    const toAlert = offenders.filter((o) => !o.nextAllowedAt);
    const cooling = offenders.filter((o) => !!o.nextAllowedAt);

    // Slack alert (optional)
    let sent = 0;
    const alerted: string[] = [];

    if (toAlert.length && SLACK_WEBHOOK) {
      const header = `🚨 *Download burst detected*  (window: ${windowS}s, threshold: ≥${threshold}/IP)`;
      const lines = toAlert
        .sort((a, b) => b.count - a.count)
        .map((o, i) => `${i + 1}. *${o.ip}* — ${o.count}`)
        .join("\n");

      const coolingLines = cooling.length
        ? "\n\n_(Cooling down; next alert after cooldown)_\n" +
          cooling
            .sort((a, b) => b.count - a.count)
            .map((o, i) => `${i + 1}. ${o.ip} — ${o.count} (next: ${o.nextAllowedAt})`)
            .join("\n")
        : "";

      const res = await postSlack(`${header}\n${lines}${coolingLines}`);
      if (res?.ok) {
        sent = 1;
        for (const o of toAlert) {
          state[o.ip] = epochSec; // start cooldown for each IP we alerted on
          alerted.push(o.ip);
        }
        await saveState(state);
      }
    }

    return json200({
      ok: true,
      slackEnabled: Boolean(SLACK_WEBHOOK),
      lookedAtLines,
      windowSeconds: windowS,
      threshold,
      cooldownSeconds: cooldownS,
      offenders,
      alerted,
      sent,
      now: new Date(now).toISOString(),
    });
  } catch (e: any) {
    return json200({ ok: false, error: e?.message || String(e) });
  }
}
