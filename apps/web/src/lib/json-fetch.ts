// apps/web/src/lib/json-fetch.ts
export type JsonFetchResult<T = unknown> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  raw?: string;
  headers: Headers;
};

function isJson(res: Response) {
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") || ct.includes("+json");
}

export async function jsonFetch<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<JsonFetchResult<T>> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch (e: any) {
    return {
      ok: false,
      status: 0,
      error: e?.message || "Network error",
      headers: new Headers(),
    };
  }

  // No body (204 etc.)
  if (res.status === 204) {
    return { ok: res.ok, status: res.status, headers: res.headers };
  }

  let raw = "";
  let data: any | undefined;

  if (isJson(res)) {
    const text = await res.text().catch(() => "");
    raw = text;
    if (text.trim()) {
      try {
        data = JSON.parse(text);
      } catch (e: any) {
        return {
          ok: false,
          status: res.status,
          error: `Invalid JSON: ${e?.message}`,
          raw,
          headers: res.headers,
        };
      }
    }
  } else {
    // Non-JSON (HTML, text, etc.)
    raw = await res.text().catch(() => "");
  }

  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      raw ||
      `HTTP ${res.status}`;
    return { ok: false, status: res.status, data, error: msg, raw, headers: res.headers };
  }

  return { ok: true, status: res.status, data, raw, headers: res.headers };
}
