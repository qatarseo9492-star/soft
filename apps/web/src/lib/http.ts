// apps/web/src/lib/http.ts
import { jsonFetch, JsonFetchResult } from "./json-fetch";

const API_BASE_SERVER = process.env.API_BASE_SERVER || "http://127.0.0.1:3011"; // SSR/internal
const PUBLIC_BASE = process.env.NEXT_PUBLIC_API_BASE || "/web-api";             // Browser

function join(a: string, b: string) {
  if (!a.endsWith("/") && !b.startsWith("/")) return `${a}/${b}`;
  if (a.endsWith("/") && b.startsWith("/")) return a + b.slice(1);
  return a + b;
}

function isServer() {
  return typeof window === "undefined";
}

type Query = Record<string, string | number | boolean | undefined | null>;

function withQuery(url: string, q?: Query) {
  if (!q) return url;
  const u = new URL(url, "http://dummy");
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
  });
  // remove dummy origin
  return u.pathname + (u.search ? "?" + u.searchParams.toString() : "");
}

export const api = {
  url(path: string, q?: Query) {
    const base = isServer() ? API_BASE_SERVER : PUBLIC_BASE;
    return withQuery(join(base, path), q);
  },

  get<T = unknown>(path: string, opts?: { query?: Query; init?: RequestInit }) {
    return jsonFetch<T>(api.url(path, opts?.query), {
      cache: "no-store",
      ...(opts?.init || {}),
      method: "GET",
    });
  },

  post<T = unknown>(path: string, body?: unknown, init?: RequestInit) {
    return jsonFetch<T>(api.url(path), {
      ...(init || {}),
      method: "POST",
      headers: { "content-type": "application/json", ...(init?.headers || {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  put<T = unknown>(path: string, body?: unknown, init?: RequestInit) {
    return jsonFetch<T>(api.url(path), {
      ...(init || {}),
      method: "PUT",
      headers: { "content-type": "application/json", ...(init?.headers || {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  patch<T = unknown>(path: string, body?: unknown, init?: RequestInit) {
    return jsonFetch<T>(api.url(path), {
      ...(init || {}),
      method: "PATCH",
      headers: { "content-type": "application/json", ...(init?.headers || {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  delete<T = unknown>(path: string, init?: RequestInit) {
    return jsonFetch<T>(api.url(path), { ...(init || {}), method: "DELETE" });
  },
};

export type { JsonFetchResult };
