// apps/web/src/app/web-api/_lib/slack.ts
export const SLACK_WEBHOOK_URL = (process.env.SLACK_WEBHOOK_URL || "").trim();

export async function postSlack(
  text: string,
  blocks?: unknown[]
): Promise<{ ok: boolean; status: number; error?: string }> {
  if (!SLACK_WEBHOOK_URL) {
    return { ok: false, status: 0, error: "SLACK_WEBHOOK_URL not configured" };
  }

  const payload: any = { text };
  if (blocks && blocks.length) payload.blocks = blocks;

  const res = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    return { ok: false, status: res.status, error: msg || `HTTP ${res.status}` };
  }
  return { ok: true, status: res.status };
}

export function formatList(items: Array<{ label: string; count: number }>, limit = 10): string {
  const top = items.slice(0, limit);
  if (top.length === 0) return "—";
  return top.map((x, i) => `${i + 1}. ${x.label} — ${x.count}`).join("\n");
}
