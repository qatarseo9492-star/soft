export function absUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  const base =
    (typeof window !== 'undefined' && window.location?.origin)
      || process.env.NEXT_PUBLIC_SITE_URL
      || 'http://127.0.0.1:3000';
  const p = path.startsWith('/') ? path : `/${path}`;
  return new URL(p, base).toString();
}
