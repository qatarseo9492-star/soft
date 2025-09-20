// apps/web/src/lib/filters.ts
import type { ReadonlyURLSearchParams } from "next/navigation";

export const DEFAULT_PAGE_SIZE = 24;
export const SORT_OPTIONS = [
  { label: "Newest", value: "new" },
  { label: "Recently Updated", value: "updated" },
  { label: "Rating", value: "rating" },
  { label: "Downloads", value: "downloads" },
  { label: "Size (Small → Large)", value: "size_asc" },
  { label: "Size (Large → Small)", value: "size_desc" },
] as const;
export type SortValue = typeof SORT_OPTIONS[number]["value"];

export type Filters = {
  page: number;
  limit: number;
  os: string[];
  license: string[];
  minRating?: number;
  updatedAfter?: string; // yyyy-mm-dd
  sizeMaxMb?: number; // MB
  sort: SortValue;
};

export function parseFiltersFromSearchParams(spInput: ReadonlyURLSearchParams | URLSearchParams | null): Filters {
  const sp = spInput ?? new URLSearchParams();
  const getAll = (k: string) => ("getAll" in sp ? (sp as any).getAll(k) : []);
  const get = (k: string) => ("get" in sp ? (sp as any).get(k) : null);

  return {
    page: Number(get("page") ?? 1) || 1,
    limit: Number(get("limit") ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE,
    os: getAll("os"),
    license: getAll("license"),
    minRating: get("minRating") ? Number(get("minRating")) : undefined,
    updatedAfter: get("updatedAfter") || undefined,
    sizeMaxMb: get("sizeMaxMb") ? Number(get("sizeMaxMb")) : undefined,
    sort: (get("sort") as SortValue) || "updated",
  };
}

export function serializeFiltersToQuery(f: Partial<Filters>) {
  const params = new URLSearchParams();
  if (f.page) params.set("page", String(f.page));
  if (f.limit) params.set("limit", String(f.limit));
  (f.os ?? []).forEach((v) => params.append("os", v));
  (f.license ?? []).forEach((v) => params.append("license", v));
  if (typeof f.minRating === "number") params.set("minRating", String(f.minRating));
  if (f.updatedAfter) params.set("updatedAfter", f.updatedAfter);
  if (typeof f.sizeMaxMb === "number") params.set("sizeMaxMb", String(f.sizeMaxMb));
  if (f.sort) params.set("sort", f.sort);
  return params.toString();
}
