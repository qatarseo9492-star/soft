// apps/web/src/lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_BASE || "/web-api";

/** Client-safe GET (relative to Next proxy) */
export async function apiGet<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    // don't cache admin data
    cache: "no-store",
    next: { revalidate: 0 },
    // include cookies so admin endpoints can see session, if any
    credentials: "include",
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}
