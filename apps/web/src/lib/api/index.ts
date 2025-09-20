/**
 * Fetch helpers that always use an ABSOLUTE URL so they work
 * in Server Components, on Vercel, and during prerendering.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const ORIGIN =
  (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"))
    .replace(/\/$/, "");

const PUBLIC_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").trim().replace(/\/$/, ""); // e.g. "/web-api"

function join(base: string, path: string) {
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

/** Turn a relative path or URL into absolute URL string */
export function toAbs(pathOrUrl: string) {
  try {
    const u = new URL(pathOrUrl); // already absolute
    return u.toString();
  } catch {
    return new URL(pathOrUrl, ORIGIN).toString();
  }
}

/** Build absolute API URL; prefixes NEXT_PUBLIC_API_BASE when provided */
export function apiUrl(path: string) {
  const p = PUBLIC_BASE ? join(PUBLIC_BASE, path) : path;
  return toAbs(p);
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

/** ---------------------------
 *  Backward-compatible JSON fetcher
 *  Supports:
 *   - apiJSON(url, { method, headers, body })
 *   - apiJSON(url, "POST" | "PUT" | "PATCH" | "DELETE", payload)
 * --------------------------- */
export async function apiJSON<T = any>(path: string, init?: RequestInit): Promise<T>;
export async function apiJSON<T = any>(
  path: string,
  method: HttpMethod,
  payload?: unknown
): Promise<T>;
export async function apiJSON<T = any>(
  path: string,
  initOrMethod?: RequestInit | HttpMethod,
  maybeBody?: unknown
): Promise<T> {
  const url = apiUrl(path);
  let init: RequestInit = {};

  if (typeof initOrMethod === "string") {
    // legacy 3-arg style
    init.method = initOrMethod;
    if (maybeBody !== undefined) {
      if (maybeBody instanceof FormData) {
        init.body = maybeBody;
      } else {
        init.body = JSON.stringify(maybeBody);
        init.headers = { "Content-Type": "application/json" };
      }
    }
  } else if (initOrMethod) {
    init = { ...initOrMethod };
    if (init.body && !(init.body instanceof FormData)) {
      init.headers = { "Content-Type": "application/json", ...(init.headers || {}) };
      if (typeof init.body !== "string") {
        init.body = JSON.stringify(init.body);
      }
    }
  }

  if (init.cache === undefined) init.cache = "no-store";
  const res = await fetch(url, init);
  return handle<T>(res);
}

/** Convenience helpers built on apiJSON */
export async function apiGet<T = any>(path: string, init?: RequestInit): Promise<T> {
  return apiJSON<T>(path, { ...(init || {}), method: "GET" });
}

export async function apiPost<T = any>(
  path: string,
  data?: unknown,
  init?: RequestInit
): Promise<T> {
  return apiJSON<T>(path, { ...(init || {}), method: "POST", body: data });
}

export async function apiPut<T = any>(
  path: string,
  data?: unknown,
  init?: RequestInit
): Promise<T> {
  return apiJSON<T>(path, { ...(init || {}), method: "PUT", body: data });
}

export async function apiDelete<T = any>(path: string, init?: RequestInit): Promise<T> {
  return apiJSON<T>(path, { ...(init || {}), method: "DELETE" });
}

/** Multipart upload helper (auto-sends FormData) */
export async function apiUpload<T = any>(
  path: string,
  form: FormData,
  init?: RequestInit
): Promise<T> {
  // Let the browser set multipart boundaries; do NOT set content-type here.
  return apiJSON<T>(path, { ...(init || {}), method: "POST", body: form });
}

export const __debug = { ORIGIN, PUBLIC_BASE };

/** Re-export for places importing slugify from "@/lib/api" */
export { slugify } from "@/lib/slug";
