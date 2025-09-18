export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/web-api/alerts/test/route.ts
import { NextResponse } from "next/server";
import { postSlack } from "@/app/web-api/_lib/slack";


const ADMIN_KEY =
  (process.env.ALERT_ADMIN_KEY || process.env.DOWNLOAD_SIGN_ADMIN_KEY || "").trim();
const WEBHOOK = (process.env.SLACK_WEBHOOK_URL || "").trim();

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
  return key === ADMIN_KEY ? { ok: true as const } : { ok: false as const, error: "Unauthorized" };
}

async function handle(req: Request, overrideText?: string) {
  try {
    const gate = requireAdmin(req);
    if (!gate.ok) return json200({ ok: false, error: gate.error });

    if (!WEBHOOK) {
      return json200({
        ok: false,
        error: "SLACK_WEBHOOK_URL is not set",
        webhookConfigured: false,
      });
    }

    // Allow custom text via query (?text=) or POST JSON { text }
    let text = overrideText;
    if (!text) {
      const url = new URL(req.url);
      text = url.searchParams.get("text") || undefined;
    }
    if (!text && req.method === "POST") {
      try {
        const body = await req.json();
        if (body && typeof body.text === "string") text = body.text;
      } catch {
        // ignore parse errors
      }
    }

    const now = new Date().toISOString();
    const defaultMsg = `✅ Slack webhook test from filespay.org\nTime: ${now}`;
    const msg = text || defaultMsg;

    const res = await postSlack(msg);
    return json200({
      ok: !!res?.ok,
      sent: !!res?.ok ? 1 : 0,
      message: msg,
      webhookConfigured: true,
      now,
      slackResponse: res || null,
    });
  } catch (e: any) {
    return json200({ ok: false, error: e?.message || String(e) });
  }
}

export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS,HEAD",
      "Access-Control-Allow-Headers": "Content-Type, x-admin-key",
      "Access-Control-Max-Age": "600",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
