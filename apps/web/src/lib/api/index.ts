// src/lib/api/index.ts
/**
 * Fetch helpers that always use an ABSOLUTE URL so they work
 * in Server Components, on Vercel, and during prerendering.
 */

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

export async function apiGet<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), { cache: "no-store", ...(init || {}) });
  return handle<T>(res);
}

export async function apiPost<T = any>(
  path: string,
  data?: unknown,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    body: init?.body !== undefined ? init.body : data === undefined ? undefined : JSON.stringify(data),
    ...(init || {}),
  });
  return handle<T>(res);
}

export async function apiPut<T = any>(
  path: string,
  data?: unknown,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "PUT",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    body: init?.body !== undefined ? init.body : data === undefined ? undefined : JSON.stringify(data),
    ...(init || {}),
  });
  return handle<T>(res);
}

export async function apiDelete<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), { method: "DELETE", cache: "no-store", ...(init || {}) });
  return handle<T>(res);
}

/** Multipart upload (let the browser set the boundary) */
export async function apiUpload<T = any>(
  path: string,
  form: FormData,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    cache: "no-store",
    body: form,
    ...(init || {}),
  });
  return handle<T>(res);
}

export const __debug = { ORIGIN, PUBLIC_BASE };
