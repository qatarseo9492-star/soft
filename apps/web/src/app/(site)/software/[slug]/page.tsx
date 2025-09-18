export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";

function apiBase() {
  const isServer = typeof window === 'undefined';
  return (isServer ? process.env.API_BASE_SERVER : process.env.NEXT_PUBLIC_API_BASE)
    || (process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/web-api` : '/web-api');
}

async function fetchSoftware(slug: string) {
  const base = apiBase();
  try {
    const res = await fetch(`${base}/v1/software/${encodeURIComponent(slug)}`, {
      next: { revalidate: 600 }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (e) {
    console.error('fetchSoftware error', e);
    return null;
  }
}

export default async function SoftwarePage({ params }: { params: { slug: string } }) {
  const data = await fetchSoftware(params.slug);
  if (!data) {
    return <div className="p-6">Not found or temporarily unavailable.</div>;
  }
  // ... render details ...
  return <div className="p-6">{data.name}</div>;
}
