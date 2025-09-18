// apps/web/src/lib/seo.ts
// Keep types minimal and compatible with your current Prisma schema.
type WithCounts = { _count?: { versions?: number } };

export function canonicalFor(software: { slug: string }, version?: { version: string }) {
  const base = `https://filespay.org/s/${software.slug}`;
  return version ? `${base}?v=${encodeURIComponent(version.version)}` : base;
}

export function buildSoftwareJsonLd(
  software: { name: string; slug: string; shortDesc?: string | null; websiteUrl?: string | null },
  opts: { version?: { version: string } } = {}
) {
  const url = software.websiteUrl || `https://filespay.org/s/${software.slug}`;
  const jsonld: any = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: software.name,
    url,
    applicationCategory: 'SoftwareApplication',
    description: software.shortDesc ?? undefined,
  };
  if (opts.version) jsonld.softwareVersion = opts.version.version;
  return jsonld;
}

export function generateMeta(
  software: { name: string; slug: string; shortDesc?: string | null } & WithCounts,
  opts: { version?: { version: string } } = {}
) {
  const title = opts.version ? `${software.name} ${opts.version.version} — Download` : `${software.name} — Download`;
  const description = software.shortDesc || `${software.name} downloads and information.`;
  const canonical = canonicalFor({ slug: software.slug }, opts.version);
  return { title, description, canonical };
}
