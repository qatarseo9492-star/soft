// apps/web/src/app/web-api/auth/auth.service.ts
// Proxy login to the Nest API so web and api share the same source of truth.

type LoginBody = { email: string; password: string };

export async function login({ email, password }: LoginBody) {
  const base = process.env.API_BASE_SERVER || 'http://127.0.0.1:3011';

  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
    // next: { revalidate: 0 } // (optional on Next 14+)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Invalid credentials');
  }
  return data; // { access_token, user }
}
