export function authHeaders() {
  const jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : '';
  return {
    'content-type': 'application/json',
    ...(jwt ? { authorization: `Bearer ${jwt}` } : {}),
  };
}

export async function apiGet<T = any>(url: string): Promise<T> {
  const r = await fetch(url, { headers: authHeaders() });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function apiPost<T = any>(url: string, body: any): Promise<T> {
  const r = await fetch(url, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function apiPut<T = any>(url: string, body: any): Promise<T> {
  const r = await fetch(url, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
