// src/components/admin/forms/SoftwareForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiGet, apiPost, apiPut, apiUpload } from "@/lib/api";
import { slugify } from "@/lib/slug";

type Category = { id: string; name: string; slug: string };

type SoftwareInitial = {
  id?: string;
  name?: string;
  slug?: string;
  license?: string | null;
  shortDesc?: string | null;
  longDesc?: string | null;
  os?: string[];
  categories?: { slug: string; name?: string }[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  vendor?: string | null;
  version?: string | null;
  fileSizeBytes?: number | null;
  featuredImage?: string | null;
  faqs?: Array<{ q: string; a: string }> | null;
  systemRequirements?: Array<{ os: string; min: string; rec?: string }> | null;
};

export default function SoftwareForm({
  initial,
  softwareId,
}: {
  initial?: SoftwareInitial;
  softwareId?: string; // if present -> PUT, else POST
}) {
  const [loading, setLoading] = useState(false);
  const [cats, setCats] = useState<Category[]>([]);

  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [license, setLicense] = useState(initial?.license || "");
  const [shortDesc, setShortDesc] = useState(initial?.shortDesc || "");
  const [longDesc, setLongDesc] = useState(initial?.longDesc || "");
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || "");
  const [vendor, setVendor] = useState(initial?.vendor || "");
  const [version, setVersion] = useState(initial?.version || "");
  const [fileSizeBytes, setFileSizeBytes] = useState<number | "">(initial?.fileSizeBytes ?? "");
  const [featuredImage, setFeaturedImage] = useState(initial?.featuredImage || "");
  const [osList, setOsList] = useState<string[]>(initial?.os || []);
  const [selectedCatSlugs, setSelectedCatSlugs] = useState<string[]>(
    (initial?.categories || []).map((c) => c.slug)
  );

  useEffect(() => {
    if (!initial?.slug && !slug && name) setSlug(slugify(name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await apiGet<{ ok: boolean; items: Category[] }>("/web-api/admin/categories");
        if (alive && r?.ok) setCats(r.items || []);
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, []);

  const canSubmit = useMemo(() => name.trim().length > 1 && slug.trim().length > 1, [name, slug]);

  function toggleCat(s: string) {
    setSelectedCatSlugs((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }
  function toggleOs(os: string) {
    setOsList((prev) => (prev.includes(os) ? prev.filter((x) => x !== os) : [...prev, os]));
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await apiUpload<{ ok: boolean; url?: string; error?: string }>(
        "/web-api/admin/upload",
        fd
      );
      if (res?.ok && res.url) {
        setFeaturedImage(res.url);
        toast.success("Image uploaded");
      } else {
        throw new Error(res?.error || "Upload failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      e.target.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        license: license.trim() || null,
        shortDesc: shortDesc.trim() || null,
        longDesc: longDesc.trim() || null,
        os: osList,
        categories: selectedCatSlugs,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
        vendor: vendor.trim() || null,
        version: version.trim() || null,
        fileSizeBytes:
          fileSizeBytes === ""
            ? null
            : Number.isFinite(Number(fileSizeBytes))
            ? Number(fileSizeBytes)
            : null,
        featuredImage: featuredImage || null,
      };

      if (softwareId) {
        // UPDATE
        const res = await apiPut<{ ok: boolean; id: string; slug: string; error?: string }>(
          `/web-api/admin/software/${softwareId}`,
          payload
        );
        if (!res?.ok) throw new Error(res?.error || "Update failed");
        toast.success("Software updated");
      } else {
        // CREATE
        const res = await apiPost<{ ok: boolean; id: string; slug: string; error?: string }>(
          "/web-api/admin/software",
          payload
        );
        if (!res?.ok) throw new Error(res?.error || "Create failed");
        toast.success("Software created");
        // reset
        setName("");
        setSlug("");
        setLicense("");
        setShortDesc("");
        setLongDesc("");
        setOsList([]);
        setSelectedCatSlugs([]);
        setSeoTitle("");
        setSeoDescription("");
        setVendor("");
        setVersion("");
        setFileSizeBytes("");
        setFeaturedImage("");
      }
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Basics */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">Name</label>
        <input
          className="rounded-md border px-3 py-2 bg-transparent"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Software name"
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Slug</label>
        <input
          className="rounded-md border px-3 py-2 bg-transparent"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="auto-generated-from-name"
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">License</label>
        <input
          className="rounded-md border px-3 py-2 bg-transparent"
          value={license}
          onChange={(e) => setLicense(e.target.value)}
          placeholder="Free, GPL, Commercial…"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Short description</label>
        <input
          className="rounded-md border px-3 py-2 bg-transparent"
          value={shortDesc || ""}
          onChange={(e) => setShortDesc(e.target.value)}
          placeholder="One-line summary"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Long description (HTML allowed)</label>
        <textarea
          className="rounded-md border px-3 py-2 min-h-[120px] bg-transparent"
          value={longDesc || ""}
          onChange={(e) => setLongDesc(e.target.value)}
          placeholder="Rich content (paste HTML if needed)"
        />
      </div>

      {/* OS & Categories */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">Operating systems</label>
        <div className="flex flex-wrap gap-2">
          {["Windows", "macOS", "Linux", "Android", "iOS"].map((os) => (
            <button
              key={os}
              type="button"
              onClick={() => toggleOs(os)}
              className={`px-3 py-1 rounded-full border ${
                osList.includes(os) ? "bg-blue-600 text-white border-blue-600" : "bg-transparent"
              }`}
            >
              {os}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Categories</label>
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => toggleCat(c.slug)}
              className={`px-3 py-1 rounded-full border ${
                selectedCatSlugs.includes(c.slug)
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-transparent"
              }`}
              title={c.name}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* SEO / Meta */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">SEO Title</label>
        <input
          className="rounded-md border px-3 py-2 bg-transparent"
          value={seoTitle || ""}
          onChange={(e) => setSeoTitle(e.target.value)}
          placeholder="Optional"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">SEO Description</label>
        <textarea
          className="rounded-md border px-3 py-2 min-h-[80px] bg-transparent"
          value={seoDescription || ""}
          onChange={(e) => setSeoDescription(e.target.value)}
          placeholder="Optional"
        />
      </div>

      {/* Vendor / Version / Size */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Vendor</label>
          <input
            className="rounded-md border px-3 py-2 bg-transparent"
            value={vendor || ""}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Version</label>
          <input
            className="rounded-md border px-3 py-2 bg-transparent"
            value={version || ""}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">File Size (bytes)</label>
          <input
            type="number"
            className="rounded-md border px-3 py-2 bg-transparent"
            value={fileSizeBytes as number | ""}
            onChange={(e) => setFileSizeBytes(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Optional"
            min={0}
          />
        </div>
      </div>

      {/* Featured image */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">Featured Image</label>
        <div className="flex items-center gap-3">
          <input type="file" accept="image/*" onChange={onUpload} />
          {featuredImage ? (
            <a href={featuredImage} target="_blank" rel="noreferrer" className="text-sm underline">
              Preview
            </a>
          ) : (
            <span className="text-xs opacity-70">No image uploaded</span>
          )}
        </div>
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
        >
          {loading ? "Saving…" : softwareId ? "Update software" : "Create software"}
        </button>
      </div>
    </form>
  );
}
