// src/lib/fetchers.ts
export async function fetchCategoryListing({
  category,
  searchParams,
}: {
  category: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (Array.isArray(v)) v.forEach((item) => params.append(k, item));
    else if (typeof v === "string") params.set(k, v);
  }
  params.set("category", category);

  const base = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, ""); // trim trailing slash

  // Build a correct URL whether base is "", "/", "/web-api", or a full origin
  let url: string;
  if (!base) {
    // No base → just use the relative internal route
    url = `/web-api/software?${params.toString()}`;
  } else if (base.endsWith("/web-api")) {
    // Base already points to /web-api → append resource only
    url = `${base}/software?${params.toString()}`;
  } else {
    // Any other base → append /web-api/software
    url = `${base}/web-api/software?${params.toString()}`;
  }

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return { ok: false, data: [], facets: { os: {}, license: {} }, total: 0, error: `HTTP ${res.status}` };
  }
  return res.json();
}
