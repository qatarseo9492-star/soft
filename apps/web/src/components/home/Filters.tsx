// apps/web/src/components/home/Filters.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const osOpts = ["Windows","macOS","Linux","Android","iOS"];
const licenseOpts = ["Free","Pro","GPL"];
const sortOpts = [
  { v: "updated", label: "Recently Updated" },
  { v: "new", label: "Newly Added" },
  { v: "downloads", label: "Most Downloaded" }, // ✅ enabled
];

export default function Filters() {
  const sp = useSearchParams();
  const r = useRouter();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [os, setOs] = useState(sp.get("os") ?? "");
  const [lic, setLic] = useState(sp.get("license") ?? "");
  const [sort, setSort] = useState(sp.get("sort") ?? "updated");

  useEffect(() => setQ(sp.get("q") ?? ""), [sp]);

  const apply = () => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (os) p.set("os", os);
    if (lic) p.set("license", lic);
    if (sort) p.set("sort", sort);
    r.push(`/?${p.toString()}`);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search apps…"
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <select value={os} onChange={(e) => setOs(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2">
          <option value="">All OS</option>
          {osOpts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={lic} onChange={(e) => setLic(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2">
          <option value="">All Licenses</option>
          {licenseOpts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2">
          {sortOpts.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
        </select>
      </div>
      <div className="mt-3 flex justify-end">
        <button onClick={apply} className="text-sm px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100">
          Apply
        </button>
      </div>
    </div>
  );
}
