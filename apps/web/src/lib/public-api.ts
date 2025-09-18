// tiny fetch wrapper that always hits your web-api
export const API_BASE =
  process.env.NEXT_PUBLIC_PUBLIC_API_BASE ??
  "/web-api"; // fallback: same origin

export async function apiGet<T>(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `GET ${path} failed`);
  }
  return (await res.json()) as T;
}
