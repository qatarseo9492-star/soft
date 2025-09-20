// src/app/(site)/category/[slug]/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilterBar } from "@/components/category/FilterBar";
import { SoftwareGrid } from "@/components/category/SoftwareGrid";
import { fetchCategoryListing } from "@/lib/fetchers";
import { DEFAULT_PAGE_SIZE } from "@/lib/filters";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const title = `${params.slug} Software Downloads — Filespay`;
  const description = `Explore ${params.slug} apps with filters for OS, license, rating, and more.`;
  return {
    title,
    description,
    alternates: { canonical: `/category/${params.slug}` },
    openGraph: { title, description },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const page = Number(searchParams.page ?? 1) || 1;
  const perPage = Number(searchParams.limit ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE;

  const { ok, data, facets, total, error } = await fetchCategoryListing({
    category: params.slug,
    searchParams,
  });

  if (!ok) {
    if (error === "CATEGORY_NOT_FOUND") return notFound();
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold">{params.slug} Software</h1>
        <p className="mt-4 text-sm text-red-500">Failed to load listing. {error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Breadcrumbs */}
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/">Home</Link>
        <span className="mx-2">/</span>
        <span className="capitalize">{params.slug}</span>
      </nav>

      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold capitalize">{params.slug} Software</h1>
          <p className="text-sm text-muted-foreground">{total.toLocaleString()} results</p>
        </div>
        {/* Sort control duplicated in FilterBar for mobile; here for desktop header */}
        <FilterBar.HeaderSort />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <aside className="md:col-span-3">
          <FilterBar facets={facets} />
        </aside>
        <main className="md:col-span-9">
          <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading results…</div>}>
            <SoftwareGrid items={data} total={total} page={page} perPage={perPage} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
