// src/lib/jsonld.ts

/**
 * Build SoftwareApplication JSON-LD for public pages.
 * Pulls from core fields + meta (seo, downloads) + latest version.
 */

type VersionLite = {
  version?: string | null;
  channel?: string | null;
  createdAt?: string | Date;
  published?: boolean;
};

type SoftwareLite = {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string | null;
  longDesc?: string | null;
  category?: string | null;
  website?: string | null;
  license?: string | null;
  updatedAt?: string | Date;
  meta?: {
    featuredImage?: string | null;
    downloads?: { direct?: string | null; torrent?: string | null } | null;
    tags?: string[];
    seo?: { focusKeyword?: string | null } | null;
  } | null;
  versions?: VersionLite[];
};

export function buildSoftwareJsonLd(item: SoftwareLite) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const url = `${site.replace(/\/$/, "")}/software/${item.slug}`;
  const latest = item.versions?.[0];

  // Collect download URLs if present
  const downloadUrls = [
    item.meta?.downloads?.direct,
    item.meta?.downloads?.torrent,
  ].filter(Boolean) as string[];

  const jsonld: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: item.name,
    url,
    applicationCategory: item.category || "Utilities",
    description: item.longDesc || item.shortDesc || undefined,
    image: item.meta?.featuredImage || undefined,
    softwareVersion: latest?.version || undefined,
    dateModified: item.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
    operatingSystem: undefined, // set if you later pass builds OS
    license: item.license || undefined,
    sameAs: item.website || undefined,
    keywords: item.meta?.seo?.focusKeyword || (item.meta?.tags?.length ? item.meta.tags.join(", ") : undefined),
  };

  // Add potentialAction + downloadUrl if we have them
  if (downloadUrls.length) {
    jsonld["downloadUrl"] = downloadUrls.length === 1 ? downloadUrls[0] : downloadUrls;
    jsonld["potentialAction"] = {
      "@type": "DownloadAction",
      target: downloadUrls[0],
    };
  }

  // Remove undefined keys for a clean object
  Object.keys(jsonld).forEach((k) => {
    if (jsonld[k] === undefined) delete (jsonld as any)[k];
  });

  return jsonld;
}
