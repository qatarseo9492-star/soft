// apps/web/src/lib/burst-monitor.ts
import { postToSlack } from "./slack";

type Store = {
  hits: Map<string, number[]>;       // ip -> list of timestamps (sec)
  lastAlert: Map<string, number>;    // ip -> last alert ts (sec)
};

const g = globalThis as unknown as { __BURST_STORE__?: Store };
if (!g.__BURST_STORE__) {
  g.__BURST_STORE__ = { hits: new Map(), lastAlert: new Map() };
}
const store = g.__BURST_STORE__!;

// Defaults: 60 hits in 60 seconds -> alert; cooldown 10 minutes
const THRESH = Number(process.env.BURST_IP_THRESHOLD || 60);
const WINDOW_S = Number(process.env.BURST_IP_WINDOW_SECONDS || 60);
const COOLDOWN_S = Number(process.env.BURST_IP_ALERT_COOLDOWN_SECONDS || 600);

export async function recordAndMaybeAlert(ip: string, file: string) {
  try {
    const now = Math.floor(Date.now() / 1000);

    const arr = store.hits.get(ip) ?? [];
    // keep only within window
    const cutoff = now - WINDOW_S;
    const pruned = arr.filter((t) => t >= cutoff);
    pruned.push(now);
    store.hits.set(ip, pruned);

    if (pruned.length >= THRESH) {
      const last = store.lastAlert.get(ip) || 0;
      if (now - last >= COOLDOWN_S) {
        store.lastAlert.set(ip, now);
        const ok = await postToSlack(
          `🚨 *Burst downloads detected*\n• IP: \`${ip}\`\n• Hits in last ${WINDOW_S}s: *${pruned.length}*\n• Latest file: \`${file}\`\n• Threshold: ${THRESH}\n(_cooldown ${COOLDOWN_S}s_)`
        );
        if (!ok) {
          // no-op if webhook not set
        }
      }
    }
  } catch {
    // ignore errors
  }
}
