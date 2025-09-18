export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import Link from "next/link";
import type { UrlObject } from "url";


// ---- Types (align loosely with your API list response) ----
type SoftwareItem = {
  id: string;
  slug: string;
  name: string;
  version?: string | null;
  vendorName?: string | null;
  shortDesc?: string | null;
  iconUrl?: string | null;
  os?: string[];
  license?: string | null;
  downloads7d?: number | null;
  updatedAt?: string | null;
};

type ListResp = {
  ok?: boolean;
  items?: SoftwareItem[];
  total?: number;
  page?: number;
  limit?: number;
  error?: string;
};

function buildQuery(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });
  return qs.toString();
}

async function fetchList(searchParams: Record<string, string | undefined>): Promise<ListResp> {
  const page = searchParams.page ?? "1";
  const limit = searchParams.limit ?? "24";
  const q = searchParams.q ?? searchParams.query; // allow both q/query
  const os = searchParams.os;
  const license = searchParams.license;

  const qs = buildQuery({ page, limit, q, os, license });
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + `/web-api/software?${qs}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as ListResp;
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Fetch error" };
  }
}

function numberFormat(n?: number | null) {
  if (typeof n !== "number") return "—";
  return new Intl.NumberFormat().format(n);
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/80">
      {children}
    </span>
  );
}

function SoftwareCard({ item }: { item: SoftwareItem }) {
  // Use UrlObject so Next's typed routes are satisfied for dynamic paths
  const detailsHref: UrlObject = { pathname: "/software/[slug]", query: { slug: item.slug } };
  const downloadHref: UrlObject = { pathname: "/download/[slug]", query: { slug: item.slug } };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-4 transition hover:border-white/20 hover:shadow-xl hover:shadow-cyan-500/10">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 rounded-xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.iconUrl ?? "/favicon.ico"} alt={item.name} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">
            <Link href={detailsHref} className="outline-none ring-0">
              <span className="absolute inset-0" />
              {item.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-white/60">
            {item.vendorName ? `${item.vendorName} • ` : ""}
            {item.version ?? "—"}
          </p>
        </div>
      </div>

      {item.shortDesc && (
        <p className="mt-3 line-clamp-2 text-sm text-white/70">{item.shortDesc}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {item.os?.slice(0, 3).map((o) => (
          <Badge key={o}>{o}</Badge>
        ))}
        {item.license && <Badge>{item.license}</Badge>}
        {typeof item.downloads7d === "number" && (
          <Badge>{numberFormat(item.downloads7d)} downloads</Badge>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Link
          href={detailsHref}
          className="text-sm text-white/80 underline-offset-4 hover:text-white hover:underline"
        >
          Details
        </Link>
        <Link
          href={downloadHref}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-sm font-medium text-cyan-200 transition hover:border-cyan-400/80 hover:bg-cyan-500/20 hover:text-white"
        >
          Download
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </Link>
      </div>
    </div>
  );
}

export default async function Page({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const resp = await fetchList(searchParams);
  const items = resp.items ?? [];
  const total = resp.total ?? 0;
  const page = Number(resp.page ?? searchParams.page ?? 1);
  const limit = Number(resp.limit ?? searchParams.limit ?? 24);
  const pages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

  const os = searchParams.os ?? "";
  const license = searchParams.license ?? "";
  const q = searchParams.q ?? searchParams.query ?? "";

  // Use UrlObject (typed route) for pagination links to "/"
  const makePageHref = (p: number): UrlObject => {
    const query: Record<string, string> = {
      page: String(p),
      limit: String(limit),
    };
    if (os) query.os = os;
    if (license) query.license = license;
    if (q) query.q = q;
    return { pathname: "/" as const, query };
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Hero */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Discover & Download Trusted Software</h1>
        <p className="mt-2 max-w-3xl text-sm text-white/70">
          Fast, clean, and organized downloads. Filter by OS and license, sort by popularity, and see what’s trending.
        </p>

        {/* Filters */}
        <form className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-5" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search apps, vendors, or keywords…"
            className="col-span-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-none ring-0 focus:border-cyan-400/50"
          />
          <select
            name="os"
            defaultValue={os}
            className="col-span-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
          >
            <option value="">All OS</option>
            <option value="Windows">Windows</option>
            <option value="macOS">macOS</option>
            <option value="Linux">Linux</option>
            <option value="Android">Android</option>
          </select>
          <select
            name="license"
            defaultValue={license}
            className="col-span-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
          >
            <option value="">All licenses</option>
            <option value="Free">Free</option>
            <option value="Open Source">Open Source</option>
            <option value="Trial">Trial</option>
            <option value="Paid">Paid</option>
          </select>
        </form>
      </section>

      {/* Content */}
      <section className="mt-8">
        {resp.error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            Failed to load list: {resp.error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <SoftwareCard key={item.id} item={item} />
          ))}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Link
              href={makePageHref(Math.max(1, page - 1))}
              className="rounded-xl border border-white/10 px-3 py-1.5 text-sm text-white/80 hover:border-white/20 hover:text-white"
            >
              Prev
            </Link>
            <span className="select-none rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70">
              Page {page} of {pages}
            </span>
            <Link
              href={makePageHref(Math.min(pages, page + 1))}
              className="rounded-xl border border-white/10 px-3 py-1.5 text-sm text-white/80 hover:border-white/20 hover:text-white"
            >
              Next
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
