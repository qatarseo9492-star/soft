// src/lib/api.ts
/**
 * Unified API helpers for client & server.
 * Works with either relative routes (/web-api/...) or an absolute NEXT_PUBLIC_API_BASE.
 */
const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE) || "";

/** Build the final URL (allows absolute URLs too) */
export function apiUrl(path: string): string {
  if (!path) throw new Error("apiUrl: path is required");
  if (/^https?:\/\//i.test(path)) return path;
  // If API_BASE is empty, we keep it relative so Next can resolve it
  return `${API_BASE}${path}`;
}

/** Low-level helper to throw on non-2xx and parse JSON */
export async function apiJSON<T = any>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j?.error || JSON.stringify(j);
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new Error(`${res.status} ${res.statusText}${detail ? ` – ${detail}` : ""}`);
  }
  return (res.json() as Promise<T>);
}

/** GET JSON */
export async function apiGet<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "GET",
    credentials: "include",
    ...init,
    headers: {
      ...(init.headers || {}),
    },
  });
  return apiJSON<T>(res);
}

/** POST JSON body -> JSON response */
export async function apiPost<T = any>(path: string, body: any, init: RequestInit = {}): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    body: body == null ? null : JSON.stringify(body),
  });
  return apiJSON<T>(res);
}

/** PUT JSON body -> JSON response */
export async function apiPut<T = any>(path: string, body: any, init: RequestInit = {}): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "PUT",
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    body: body == null ? null : JSON.stringify(body),
  });
  return apiJSON<T>(res);
}

/** DELETE -> JSON response (optionally with JSON body) */
export async function apiDelete<T = any>(path: string, body?: any, init: RequestInit = {}): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "DELETE",
    credentials: "include",
    ...init,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
    body: body == null ? null : JSON.stringify(body),
  });
  return apiJSON<T>(res);
}

/** Multipart upload (FormData) -> JSON response */
export async function apiUpload<T = any>(path: string, form: FormData, init: RequestInit = {}): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    credentials: "include",
    // DO NOT set Content-Type for FormData; the browser will set the boundary.
    body: form,
    ...init,
  });
  return apiJSON<T>(res);
}

/** Re-export slugify so older imports `from "@/lib/api"` keep working */
export { slugify } from "./slug";
