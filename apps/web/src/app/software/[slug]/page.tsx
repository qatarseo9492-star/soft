// apps/web/src/app/software/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import PasswordBlock from "@/components/ui/PasswordBlock";
import PasswordField from "@/components/ui/PasswordField";
import CommentsSection from "@/components/comments/CommentsSection";

export const dynamic = "force-dynamic";

/* ---------------- utils ---------------- */
function timeAgo(d?: string | Date | null) {
  if (!d) return null;
  const ts = typeof d === "string" ? new Date(d).getTime() : d.getTime();
  const mins = Math.floor((Date.now() - ts) / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);
  if (years >= 1) return `${years} year${years > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months >= 1) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (days >= 1) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours >= 1) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${mins} min ago`;
}

function stars(rating: number) {
  const val = Math.max(0, Math.min(5, Math.round(rating)));
  return "★★★★★".slice(0, val).padEnd(5, "☆");
}

// shimmer blur fallback
const shimmer = (w: number, h: number) =>
  `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" version="1.1">
    <defs><linearGradient id="g"><stop stop-color="#f3f4f6" offset="20%"/><stop stop-color="#e5e7eb" offset="50%"/><stop stop-color="#f3f4f6" offset="70%"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="#f3f4f6"/><rect id="r" width="${w}" height="${h}" fill="url(#g)"/>
    <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite"/>
  </svg>`;
const toBase64 = (s: string) =>
  typeof window === "undefined" ? Buffer.from(s).toString("base64") : window.btoa(s);

/* ---------------- data ---------------- */
async function getDetail(slug: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE || "/web-api";
  const r = await fetch(`${base}/software/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (!r.ok) return null;
  const j = await r.json();
  return j?.software ?? j?.data?.software ?? j?.data ?? j;
}

async function getRelated(categoryName?: string) {
  if (!categoryName) return [];
  const base = process.env.NEXT_PUBLIC_API_BASE || "/web-api";
  const r = await fetch(`${base}/software?category=${encodeURIComponent(categoryName)}&limit=4`, {
    cache: "no-store",
  });
  if (!r.ok) return [];
  const j = await r.json();
  return j?.items ?? [];
}

async function getGlobalPassword(): Promise<string | null> {
  const base = process.env.NEXT_PUBLIC_API_BASE || "/web-api";
  try {
    const r = await fetch(`${base}/settings/download-password`, { cache: "no-store" });
    if (!r.ok) return process.env.NEXT_PUBLIC_DEFAULT_DOWNLOAD_PASSWORD || null;
    const j = await r.json();
    return j?.password ?? process.env.NEXT_PUBLIC_DEFAULT_DOWNLOAD_PASSWORD ?? null;
  } catch {
    return process.env.NEXT_PUBLIC_DEFAULT_DOWNLOAD_PASSWORD || null;
  }
}

/* ---------------- page ---------------- */
export default async function SoftwarePage({ params }: { params: { slug: string } }) {
  const [s, password] = await Promise.all([getDetail(params.slug), getGlobalPassword()]);
  if (!s) {
    return (
      <main className="px-6 py-16">
        <h1 className="text-2xl font-semibold">Not found</h1>
      </main>
    );
  }

  const latest = (s.versions ?? [])[0];
  const latestBuild = latest?.builds?.[0];
  const cats: string[] = (s.categories ?? []) as any[];
  const firstCat = cats?.[0];
  const related = await getRelated(firstCat);

  // ---------- HERO PICK + BLUR ----------
  const media: any[] = Array.isArray(s.media) ? s.media : [];
  const heroMedia =
    media.find((m) => m?.type === "HERO") ??
    media.find((m) => m?.type === "GALLERY") ??
    null;

  const heroUrl: string | null = heroMedia?.url || s.heroUrl || s.iconUrl || null;
  const heroAlt: string = heroMedia?.alt || `${s.name} hero`;
  const blurFromMeta: string | null =
    (heroMedia?.meta && (heroMedia.meta.blurDataURL || heroMedia.meta.placeholder)) || null;
  const blurDataURL = blurFromMeta || `data:image/svg+xml;base64,${toBase64(shimmer(1600, 600))}`;

  /* ---------- JSON-LD ---------- */
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://filespay.org";
  const downloadsTotal = Number(s.downloadsTotal ?? s.counter?.total ?? 0);

  // Main SoftwareApplication
  const jsonLdSoftware: any = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: s.name,
    applicationCategory: firstCat || "Software",
    operatingSystem: (s.os ?? []).join(", "),
    softwareVersion: latest?.version || undefined,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    downloadUrl: latestBuild?.downloadUrl || undefined,
    interactionStatistic:
      downloadsTotal > 0
        ? [
            {
              "@type": "InteractionCounter",
              interactionType: { "@type": "DownloadAction" },
              userInteractionCount: downloadsTotal,
            },
          ]
        : undefined,
    aggregateRating: s.ratingsCount
      ? {
          "@type": "AggregateRating",
          ratingValue: Number(s.ratingsAvg || 0).toFixed(1),
          ratingCount: s.ratingsCount,
        }
      : undefined,
  };

  // Breadcrumbs
  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site}/` },
      ...(firstCat
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: firstCat,
              item: `${site}/category/${firstCat.toLowerCase().replace(/\s+/g, "-")}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: firstCat ? 3 : 2,
        name: s.name,
        item: `${site}/software/${encodeURIComponent(s.slug)}`,
      },
    ],
  };

  // ItemList of previous versions (helps long-tail)
  const prevVersions = (s.versions ?? []).slice(1) || [];
  const jsonLdPrevious: any =
    prevVersions.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: prevVersions.map((v: any, i: number) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${s.name} ${v.version}`,
            url: `${site}/software/${encodeURIComponent(s.slug)}?v=${encodeURIComponent(v.version)}`,
          })),
        }
      : null;

  // FAQPage (if present)
  const faqs: any[] = Array.isArray(s.faqs) ? s.faqs : [];
  const jsonLdFaq =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <main className="px-4 md:px-8 lg:px-12 py-6">
      {/* JSON-LD blocks */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      {jsonLdPrevious && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPrevious) }} />
      )}
      {jsonLdFaq && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />}

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        {firstCat && (
          <>
            <span className="mx-1">›</span>
            <Link href={`/category/${firstCat.toLowerCase().replace(/\s+/g, "-")}`} className="hover:underline">
              {firstCat}
            </Link>
          </>
        )}
        <span className="mx-1">›</span>
        <span className="text-gray-700">
          {s.name}
          {latest?.version ? ` ${latest.version}` : ""}
        </span>
      </nav>

      {/* HERO banner */}
      {heroUrl && (
        <section className="mt-4">
          <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200">
            <div className="relative w-full h-0" style={{ paddingBottom: "36%" /* ~21:9 */ }}>
              <Image
                src={heroUrl}
                alt={heroAlt}
                fill
                priority
                placeholder="blur"
                blurDataURL={blurDataURL}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1200px"
                className="object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* Title + meta + CTA + password */}
      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 md:p-7">
        <div className="flex flex-col md:flex-row gap-6 md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-[28px] md:text-[32px] font-semibold leading-tight">{s.name}</h1>

            {/* rating + freshness */}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1">
                <span className="text-yellow-500">{stars(Number(s.ratingsAvg || 0))}</span>
                <span className="ml-1">{Number(s.ratingsAvg || 0).toFixed(1)}</span>
              </span>
              {s.ratingsCount ? <span>({s.ratingsCount} reviews)</span> : null}
              {latest?.releasedAt && <span>• {timeAgo(latest.releasedAt)}</span>}
              {s.isRecommended && (
                <span className="ml-2 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                  Recommended
                </span>
              )}
            </div>

            {/* SHORT DESCRIPTION */}
            <p className="mt-4 text-gray-700 max-w-3xl">{s.description ?? "Overview coming soon."}</p>

            {/* QUICK FACTS */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px]">
              {latest?.version && <span className="px-2 py-1 rounded-full bg-gray-100">v{latest.version}</span>}
              {(latestBuild?.fileSize || latestBuild?.sizeMB) && (
                <span className="px-2 py-1 rounded-full bg-gray-100">
                  {latestBuild?.fileSize || `${latestBuild?.sizeMB} MB`}
                </span>
              )}
              {(s.os ?? []).length > 0 && (
                <span className="px-2 py-1 rounded-full bg-gray-100">{(s.os as string[]).join(", ")}</span>
              )}
              {s.license && <span className="px-2 py-1 rounded-full bg-gray-100">{s.license}</span>}
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link
                href={`/download/${s.slug}${latestBuild?.id ? `?id=${encodeURIComponent(latestBuild.id)}` : ""}`}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
              >
                Download Now
              </Link>
              {latestBuild?.sha256 && (
                <span className="text-xs text-gray-500">SHA256: {String(latestBuild.sha256).slice(0, 10)}…</span>
              )}
            </div>

            {/* Official password row */}
            {password && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm">
                <span className="font-medium text-blue-900">Official Password:</span>
                <code className="text-blue-900">{password}</code>
              </div>
            )}

            {/* meta line */}
            <div className="mt-3 text-xs text-gray-500">
              {s.vendor?.name && <span className="mr-2">by {s.vendor.name}</span>}
              {s.homepage && (
                <>
                  <span className="mx-1">•</span>
                  <a href={s.homepage} target="_blank" className="underline">
                    Homepage
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Stats side card */}
          <div className="min-w-[220px]">
            <div className="rounded-xl border border-gray-200 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Downloads</span>
                <span className="font-semibold">{downloadsTotal.toLocaleString()}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-gray-600">Updated</span>
                <span>{s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content grid */}
      <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT column */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Info + secondary password input */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold">File Info</h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between border border-gray-100 rounded-lg px-3 py-2">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">
                  {s.slug}
                  {latest?.version ? `-${latest.version}` : ""}
                </span>
              </div>
              <div className="flex justify-between border border-gray-100 rounded-lg px-3 py-2">
                <span className="text-gray-500">Version</span>
                <span className="font-medium">{latest?.version ?? "—"}</span>
              </div>
              <div className="flex justify-between border border-gray-100 rounded-lg px-3 py-2">
                <span className="text-gray-500">Size</span>
                <span className="font-medium">
                  {latestBuild?.fileSize ? latestBuild.fileSize : latestBuild?.sizeMB ? `${latestBuild.sizeMB} MB` : "—"}
                </span>
              </div>
              <div className="flex justify-between border border-gray-100 rounded-lg px-3 py-2">
                <span className="text-gray-500">Category</span>
                <span className="font-medium">{firstCat ?? "—"}</span>
              </div>
              <div className="flex justify-between border border-gray-100 rounded-lg px-3 py-2">
                <span className="text-gray-500">Platforms</span>
                <span className="font-medium">{(s.os ?? []).join(", ") || "—"}</span>
              </div>
              <div className="flex justify-between border border-gray-100 rounded-lg px-3 py-2">
                <span className="text-gray-500">License</span>
                <span className="font-medium">{s.license ?? "—"}</span>
              </div>
              <div className="sm:col-span-2">
                <PasswordField password={password} />
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold">Overview</h2>
            <p className="mt-3 text-gray-700 whitespace-pre-line">{s.description ?? "—"}</p>
          </div>

          {/* Previous versions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold">Previous Versions</h3>
            <div className="mt-4 divide-y">
              {(prevVersions as any[]).map((v: any) => {
                const b = v.builds?.[0];
                return (
                  <div key={v.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium">v{v.version}</div>
                      <div className="text-xs text-gray-500">
                        {v.releasedAt ? new Date(v.releasedAt).toLocaleDateString() : ""}{" "}
                        {b?.sizeMB ? `• ${b.sizeMB} MB` : b?.fileSize ? `• ${b.fileSize}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/download/${s.slug}${b?.id ? `?id=${encodeURIComponent(b.id)}` : ""}`}
                        className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100"
                      >
                        Download
                      </Link>
                    </div>
                  </div>
                );
              })}
              {prevVersions.length === 0 && (
                <div className="text-sm text-gray-500 py-4">No previous versions listed.</div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold">Tags</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(s.tags ?? []).map((t: string) => (
                <span key={t} className="text-[11px] px-2 py-1 rounded-full bg-gray-100">
                  {t}
                </span>
              ))}
              {(!s.tags || !s.tags.length) && <span className="text-sm text-gray-500">—</span>}
            </div>
          </div>

          {/* ------- NEW: Comments (moderated) ------- */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold">Comments</h3>
            <p className="mt-1 text-sm text-gray-600">
              Share your experience. Your comment appears after admin approval.
            </p>
            <div className="mt-4">
              <CommentsSection slug={s.slug} softwareId={s.id} />
            </div>
          </div>
        </div>

        {/* RIGHT column */}
        <aside className="space-y-6">
          {/* Newsletter */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold">Subscribe Our Newsletter</h3>
            <p className="mt-1 text-sm text-gray-600">Subscribe to receive weekly updates.</p>
            <form className="mt-3 flex items-center gap-2">
              <input
                type="email"
                placeholder="Your e-mail"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <button className="px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-sm">
                Send
              </button>
            </form>
          </div>

          {/* Related */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold">Related Products</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              {(related ?? []).map((it: any) => (
                <Link
                  key={it.slug}
                  href={`/software/${it.slug}`}
                  className="border border-gray-100 rounded-xl p-4 hover:shadow-sm"
                >
                  <div className="text-sm font-medium line-clamp-1">{it.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {it.vendor?.name ?? "—"} {it.version ? `• v${it.version}` : ""}
                  </div>
                </Link>
              ))}
              {(!related || !related.length) && (
                <div className="text-sm text-gray-500">No related items yet.</div>
              )}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const s = await getDetail(params.slug);
  if (!s) return { title: "Not found" };
  const title = `${s.name}${s.latestVersion ? ` ${s.latestVersion}` : ""} — Download`;
  const desc = s.description ? String(s.description).slice(0, 160) : "Find, download & stay updated.";
  const urlBase = process.env.NEXT_PUBLIC_SITE_URL || "https://filespay.org";
  return {
    title,
    description: desc,
    alternates: { canonical: `${urlBase}/software/${encodeURIComponent(s.slug)}` },
    openGraph: {
      title,
      description: desc,
      url: `${urlBase}/software/${encodeURIComponent(s.slug)}`,
      images: s.heroImage ? [{ url: s.heroImage }] : undefined,
      type: "website",
    },
  };
}
