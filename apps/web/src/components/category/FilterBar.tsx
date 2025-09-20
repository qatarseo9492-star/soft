// apps/web/src/components/category/FilterBar.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";
import { parseFiltersFromSearchParams, serializeFiltersToQuery, SORT_OPTIONS } from "@/lib/filters";
import { cn } from "@/lib/utils";

export type Facets = {
  os: Record<string, number>;
  license: Record<string, number>;
};

export function FilterBar({ facets }: { facets: Facets }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const filters = useMemo(() => parseFiltersFromSearchParams(sp ?? new URLSearchParams()), [sp]);

  function update(partial: Partial<typeof filters>) {
    const next = { ...filters, ...partial, page: 1 }; // reset page when filters change
    const qs = serializeFiltersToQuery(next);
    startTransition(() => router.push(`${pathname}?${qs}`));
  }

  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", pending && "opacity-70")}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>

      {/* OS facet */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">Operating System</label>
        <div className="space-y-2">
          {Object.entries(facets.os).map(([key, count]) => (
            <label key={key} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={filters.os?.includes(key) ?? false}
                onChange={(e) => {
                  const set = new Set(filters.os ?? []);
                  e.target.checked ? set.add(key) : set.delete(key);
                  update({ os: Array.from(set) });
                }}
              />
              <span className="capitalize">{key}</span>
              <span className="ml-auto tabular-nums text-muted-foreground">{count}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="my-4 opacity-50" />

      {/* License facet */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">License</label>
        <div className="space-y-2">
          {Object.entries(facets.license).map(([key, count]) => (
            <label key={key} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={filters.license?.includes(key) ?? false}
                onChange={(e) => {
                  const set = new Set(filters.license ?? []);
                  e.target.checked ? set.add(key) : set.delete(key);
                  update({ license: Array.from(set) });
                }}
              />
              <span className="capitalize">{key}</span>
              <span className="ml-auto tabular-nums text-muted-foreground">{count}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="my-4 opacity-50" />

      {/* Rating */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">Minimum Rating</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={5}
            step={0.5}
            defaultValue={filters.minRating ?? 0}
            onMouseUp={(e) => {
              const v = Number((e.target as HTMLInputElement).value);
              update({ minRating: v });
            }}
            onTouchEnd={(e) => {
              const v = Number((e.target as HTMLInputElement).value);
              update({ minRating: v });
            }}
            className="w-full"
          />
          <span className="w-10 text-right tabular-nums">{(filters.minRating ?? 0).toFixed(1)}</span>
        </div>
      </div>

      {/* Updated after */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">Updated After</label>
        <input
          type="date"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={filters.updatedAfter ?? ""}
          onChange={(e) => update({ updatedAfter: e.target.value || undefined })}
        />
      </div>

      {/* Size Max (kept in UI; backend may ignore if field not present in schema) */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">Max Size (MB)</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={5000}
            step={10}
            defaultValue={filters.sizeMaxMb ?? 5000}
            onMouseUp={(e) => update({ sizeMaxMb: Number((e.target as HTMLInputElement).value) })}
            onTouchEnd={(e) => update({ sizeMaxMb: Number((e.target as HTMLInputElement).value) })}
            className="w-full"
          />
          <span className="w-14 text-right tabular-nums">{filters.sizeMaxMb ?? 5000}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          className="rounded-md border px-3 py-1 text-sm"
          onClick={() => update({ os: [], license: [], minRating: 0, updatedAfter: undefined, sizeMaxMb: 5000 })}
        >
          Reset
        </button>
        <button
          type="button"
          className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground"
          onClick={() => update({})}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

// Small header sort control (desktop)
FilterBar.HeaderSort = function HeaderSort() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const filters = useMemo(() => parseFiltersFromSearchParams(sp ?? new URLSearchParams()), [sp]);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-muted-foreground">Sort</label>
      <select
        id="sort"
        className="rounded-md border bg-background px-2 py-1 text-sm"
        value={filters.sort}
        onChange={(e) => {
          const qs = serializeFiltersToQuery({ ...filters, sort: e.target.value as any, page: 1 });
          router.push(`${pathname}?${qs}`);
        }}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};
