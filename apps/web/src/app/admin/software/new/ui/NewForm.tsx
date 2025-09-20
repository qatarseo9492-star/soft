// src/app/admin/software/new/ui/NewForm.tsx
"use client";

import { useMemo, useState } from "react";
import RichEditor from "../../_ui/RichEditor";
import { slugify } from "@/lib/slug";

type Cat = { id: string; name: string; slug: string };

export default function NewForm({ categories }: { categories: Cat[] }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [license, setLicense] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [version, setVersion] = useState("");
  const [vendor, setVendor] = useState("");
  const [fileSizeMB, setFileSizeMB] = useState<number | undefined>(undefined);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);

  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>([]);
  const [sysReq, setSysReq] = useState<{ os: string; min: string; rec?: string }[]>([
    { os: "Windows", min: "", rec: "" },
  ]);

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const uploadFolder = useMemo(() => `posts/${slug || slugify(name) || "draft"}`, [name, slug]);

  function addFAQ() { setFaqs((x) => [...x, { q: "", a: "" }]); }
  function delFAQ(i: number) { setFaqs((x) => x.filter((_, idx) => idx !== i)); }

  function addSysReq() { setSysReq((x) => [...x, { os: "", min: "", rec: "" }]); }
  function delSysReq(i: number) { setSysReq((x) => x.filter((_, idx) => idx !== i)); }

  async function uploadFeatured(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", uploadFolder);
    fd.append("webp", "1");
    const res = await fetch("/web-api/admin/upload", { method: "POST", body: fd });
    const j = await res.json();
    if (!res.ok || !j?.ok) throw new Error(j?.error || "Upload failed");
    setFeaturedImage(j.url);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(null); setOk(false);
    const fd = new FormData(e.currentTarget);
    const os = fd.getAll("os").map(String).filter(Boolean);
    const cats = fd.getAll("categories").map(String).filter(Boolean);
    const payload = {
      name,
      slug: slug || undefined,
      shortDesc,
      longDesc: contentHtml,               // store rich content as longDesc/contentHtml
      license: license || null,
      os,
      categories: cats,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      version: version || null,
      vendor: vendor || null,
      fileSizeBytes: typeof fileSizeMB === "number" ? Math.round(fileSizeMB * 1024 * 1024) : null,
      featuredImage,
      faqs,
      systemRequirements: sysReq,
    };
    const res = await fetch("/web-api/admin/software", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.ok) { setOk(true); setTimeout(() => (location.href = "/admin/software"), 400); }
    else setErr(j?.error || "Save failed");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Basics */}
      <div className="rounded-2xl border p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder={slugify(name)}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Short Description</label>
            <input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">License</label>
            <input value={license} onChange={(e) => setLicense(e.target.value)} className="w-full rounded-md border px-3 py-2" />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm mb-2">Operating Systems</label>
          <div className="flex flex-wrap gap-4">
            {["windows", "mac", "linux", "android", "ios"].map((o) => (
              <label key={o} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="os" value={o} /> <span className="capitalize">{o}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm mb-2">Categories</label>
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="categories" value={c.slug} /> <span>{c.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Featured image */}
      <div className="rounded-2xl border p-4">
        <label className="block text-sm mb-1">Featured image</label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) await uploadFeatured(f);
            }}
          />
          {featuredImage && (
            <img src={featuredImage} alt="featured" className="h-20 rounded-md border" />
          )}
        </div>
      </div>

      {/* Rich content */}
      <div className="rounded-2xl border p-4">
        <label className="block text-sm mb-2">Content</label>
        <RichEditor value={contentHtml} onChange={setContentHtml} uploadFolder={uploadFolder} />
      </div>

      {/* SEO */}
      <div className="rounded-2xl border p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">SEO Title</label>
            <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">SEO Description</label>
            <input value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="w-full rounded-md border px-3 py-2" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 mt-4">
          <div>
            <label className="block text-sm mb-1">Version</label>
            <input value={version} onChange={(e) => setVersion(e.target.value)} className="w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Vendor/Author</label>
            <input value={vendor} onChange={(e) => setVendor(e.target.value)} className="w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">File size (MB)</label>
            <input
              type="number" min={0} step={1}
              value={fileSizeMB ?? ""}
              onChange={(e) => setFileSizeMB(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-2xl border p-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium">FAQ</label>
          <button type="button" className="rounded-md border px-3 py-1 text-sm" onClick={addFAQ}>Add FAQ</button>
        </div>
        <div className="mt-3 space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-lg border p-3">
              <div className="flex gap-3">
                <input
                  placeholder="Question"
                  value={f.q}
                  onChange={(e) => setFaqs((x) => x.map((y, j) => j === i ? { ...y, q: e.target.value } : y))}
                  className="w-1/2 rounded-md border px-3 py-2"
                />
                <input
                  placeholder="Answer"
                  value={f.a}
                  onChange={(e) => setFaqs((x) => x.map((y, j) => j === i ? { ...y, a: e.target.value } : y))}
                  className="flex-1 rounded-md border px-3 py-2"
                />
                <button type="button" className="rounded-md border px-3" onClick={() => delFAQ(i)}>×</button>
              </div>
            </div>
          ))}
          {faqs.length === 0 && <div className="text-sm text-muted-foreground">No FAQ yet.</div>}
        </div>
      </div>

      {/* System requirements */}
      <div className="rounded-2xl border p-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium">System requirements</label>
          <button type="button" className="rounded-md border px-3 py-1 text-sm" onClick={addSysReq}>Add OS</button>
        </div>
        <div className="mt-3 space-y-3">
          {sysReq.map((s, i) => (
            <div key={i} className="rounded-lg border p-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  placeholder="OS (e.g., Windows 10)"
                  value={s.os}
                  onChange={(e) => setSysReq((x) => x.map((y, j) => j === i ? { ...y, os: e.target.value } : y))}
                  className="rounded-md border px-3 py-2"
                />
                <input
                  placeholder="Minimum requirements"
                  value={s.min}
                  onChange={(e) => setSysReq((x) => x.map((y, j) => j === i ? { ...y, min: e.target.value } : y))}
                  className="rounded-md border px-3 py-2"
                />
                <input
                  placeholder="Recommended (optional)"
                  value={s.rec ?? ""}
                  onChange={(e) => setSysReq((x) => x.map((y, j) => j === i ? { ...y, rec: e.target.value } : y))}
                  className="rounded-md border px-3 py-2"
                />
              </div>
              <div className="mt-2">
                <button type="button" className="rounded-md border px-3 py-1 text-sm" onClick={() => delSysReq(i)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {err && <div className="text-sm text-red-600">{err}</div>}
      {ok && <div className="text-sm text-green-600">Saved! Redirecting…</div>}
      <button className="btn btn-primary rounded-xl">Save</button>
    </form>
  );
}
