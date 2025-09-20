"use client";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiJSON, apiUpload, slugify } from "@/lib/api";
import RichEditor from "@/components/admin/Editor";

type Category = { id: string; slug: string; name: string };
type FAQ = { q: string; a: string };
type SysReq = { os: string; min: string; rec?: string };

type Software = {
  id?: string;
  name: string;
  slug: string;
  shortDesc: string | null;
  longDesc: string | null;
  license: string | null;
  os: string[];
  categories: string[]; // slugs
  // extras
  seoTitle: string | null;
  seoDescription: string | null;
  vendor: string | null;
  version: string | null;
  fileSizeBytes: number | null;
  featuredImage: string | null;
  faqs: FAQ[] | null;
  systemRequirements: SysReq[] | null;
};

const OS_OPTS = ["Windows", "macOS", "Linux", "Android", "iOS"];

export default function SoftwareForm({
  initial,
  onSaved,
}: {
  initial?: Partial<Software>;
  onSaved?: (saved: { id: string; slug: string }) => void;
}) {
  const [cats, setCats] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState<Software>(() => ({
    id: initial?.id,
    name: initial?.name || "",
    slug: initial?.slug || "",
    shortDesc: initial?.shortDesc ?? "",
    longDesc: initial?.longDesc ?? "",
    license: initial?.license ?? "",
    os: initial?.os ?? [],
    categories: initial?.categories ?? [],
    seoTitle: initial?.seoTitle ?? "",
    seoDescription: initial?.seoDescription ?? "",
    vendor: initial?.vendor ?? "",
    version: initial?.version ?? "",
    fileSizeBytes: initial?.fileSizeBytes ?? null,
    featuredImage: initial?.featuredImage ?? "",
    faqs: (initial?.faqs as any) ?? [],
    systemRequirements: (initial?.systemRequirements as any) ?? [],
  }));

  // load categories
  useEffect(() => {
    apiGet<{ ok: boolean; items: Category[] }>("/admin/categories")
      .then((d) => setCats(d.items || []))
      .catch(() => setCats([]));
  }, []);

  // auto-slug
  useEffect(() => {
    if (!initial?.slug) setForm((f) => ({ ...f, slug: slugify(f.name) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name]);

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      const payload: any = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        shortDesc: form.shortDesc || null,
        longDesc: form.longDesc || null,
        license: form.license || null,
        os: form.os,
        categories: form.categories,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        vendor: form.vendor || null,
        version: form.version || null,
        fileSizeBytes: typeof form.fileSizeBytes === "number" ? form.fileSizeBytes : null,
        featuredImage: form.featuredImage || null,
        faqs: form.faqs || null,
        systemRequirements: form.systemRequirements || null,
      };

      const res = form.id
        ? await apiJSON<{ ok: boolean; id: string; slug: string }>(
            `/admin/software/${form.id}`,
            "PUT",
            payload
          )
        : await apiJSON<{ ok: boolean; id: string; slug: string }>(
            "/admin/software",
            "POST",
            payload
          );

      onSaved?.(res);
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const r = await apiUpload<{ ok: boolean; url: string }>("/admin/upload", fd);
    setForm((f) => ({ ...f, featuredImage: r.url }));
  };

  const setFAQ = (i: number, key: keyof FAQ, val: string) => {
    const next = [...(form.faqs || [])];
    next[i] = { ...(next[i] || { q: "", a: "" }), [key]: val };
    setForm((f) => ({ ...f, faqs: next }));
  };
  const addFAQ = () => setForm((f) => ({ ...f, faqs: [...(f.faqs || []), { q: "", a: "" }] }));
  const delFAQ = (i: number) =>
    setForm((f) => ({ ...f, faqs: (f.faqs || []).filter((_, idx) => idx !== i) }));

  const setReq = (i: number, key: keyof SysReq, val: string) => {
    const next = [...(form.systemRequirements || [])];
    next[i] = { ...(next[i] || { os: "", min: "", rec: "" }), [key]: val };
    setForm((f) => ({ ...f, systemRequirements: next }));
  };
  const addReq = () =>
    setForm((f) => ({ ...f, systemRequirements: [...(f.systemRequirements || []), { os: "", min: "", rec: "" }] }));
  const delReq = (i: number) =>
    setForm((f) => ({ ...f, systemRequirements: (f.systemRequirements || []).filter((_, idx) => idx !== i) }));

  const catOptions = useMemo(() => cats.map((c) => ({ value: c.slug, label: c.name })), [cats]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Basics</h2>
            {err && <div className="text-red-400 text-sm">{err}</div>}
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <label className="block">
              <div className="text-xs opacity-70 mb-1">Name</div>
              <input
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="block">
              <div className="text-xs opacity-70 mb-1">Slug</div>
              <input
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </label>
            <label className="block sm:col-span-2">
              <div className="text-xs opacity-70 mb-1">Short Description</div>
              <input
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
                value={form.shortDesc ?? ""}
                onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
              />
            </label>
            <label className="block sm:col-span-2">
              <div className="text-xs opacity-70 mb-1">Long Description (Rich Editor)</div>
              <RichEditor
                value={form.longDesc ?? ""}
                onChange={(val) => setForm({ ...form, longDesc: val })}
                height={480}
              />
            </label>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-semibold">FAQs</h2>
          <div className="mt-4 space-y-3">
            {(form.faqs || []).map((f, i) => (
              <div key={i} className="grid sm:grid-cols-2 gap-3">
                <input
                  placeholder="Question"
                  className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
                  value={f.q}
                  onChange={(e) => setFAQ(i, "q", e.target.value)}
                />
                <input
                  placeholder="Answer"
                  className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
                  value={f.a}
                  onChange={(e) => setFAQ(i, "a", e.target.value)}
                />
                <div className="sm:col-span-2">
                  <button className="text-red-400 text-xs underline" onClick={() => delFAQ(i)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button className="btn btn-ghost" onClick={addFAQ}>+ Add FAQ</button>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-semibold">System Requirements</h2>
          <div className="mt-4 space-y-3">
            {(form.systemRequirements || []).map((r, i) => (
              <div key={i} className="grid sm:grid-cols-3 gap-3">
                <input
                  placeholder="OS (e.g., Windows 11)"
                  className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
                  value={r.os}
                  onChange={(e) => setReq(i, "os", e.target.value)}
                />
                <input
                  placeholder="Minimum"
                  className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
                  value={r.min}
                  onChange={(e) => setReq(i, "min", e.target.value)}
                />
                <input
                  placeholder="Recommended (optional)"
                  className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
                  value={r.rec || ""}
                  onChange={(e) => setReq(i, "rec", e.target.value)}
                />
                <div className="sm:col-span-3">
                  <button className="text-red-400 text-xs underline" onClick={() => delReq(i)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button className="btn btn-ghost" onClick={addReq}>+ Add Requirement</button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card p-5">
          <h2 className="text-lg font-semibold">Meta & Flags</h2>
          <div className="mt-4 space-y-3">
            <label className="block">
              <div className="text-xs opacity-70 mb-1">Vendor</div>
              <input className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
                value={form.vendor ?? ""} onChange={(e) => setForm({ ...form, vendor: e.target.value })}/>
            </label>
            <label className="block">
              <div className="text-xs opacity-70 mb-1">Version</div>
              <input className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
                value={form.version ?? ""} onChange={(e) => setForm({ ...form, version: e.target.value })}/>
            </label>
            <label className="block">
              <div className="text-xs opacity-70 mb-1">License</div>
              <input className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
                value={form.license ?? ""} onChange={(e) => setForm({ ...form, license: e.target.value })}/>
            </label>
            <label className="block">
              <div className="text-xs opacity-70 mb-1">File size (bytes)</div>
              <input type="number" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
                value={form.fileSizeBytes ?? 0}
                onChange={(e) =>
                  setForm({ ...form, fileSizeBytes: Number.isFinite(+e.target.value) ? +e.target.value : null })
                }/>
            </label>
            <div>
              <div className="text-xs opacity-70 mb-1">OS</div>
              <div className="flex flex-wrap gap-2">
                {OS_OPTS.map((o) => {
                  const checked = form.os.includes(o);
                  return (
                    <label key={o} className="inline-flex items-center gap-2 border border-[var(--border)] rounded-lg px-2 py-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setForm((f) => ({
                            ...f,
                            os: checked ? f.os.filter((x) => x !== o) : [...f.os, o],
                          }))
                        }
                      />
                      <span className="text-sm">{o}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-70 mb-1">Categories</div>
              <div className="flex flex-wrap gap-2">
                {catOptions.map((c) => {
                  const checked = form.categories.includes(c.value);
                  return (
                    <label key={c.value} className="inline-flex items-center gap-2 border border-[var(--border)] rounded-lg px-2 py-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setForm((f) => ({
                            ...f,
                            categories: checked
                              ? f.categories.filter((s) => s !== c.value)
                              : [...f.categories, c.value],
                          }))
                        }
                      />
                      <span className="text-sm">{c.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <label className="block">
              <div className="text-xs opacity-70 mb-1">SEO Title</div>
              <input className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
                value={form.seoTitle ?? ""} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}/>
            </label>
            <label className="block">
              <div className="text-xs opacity-70 mb-1">SEO Description</div>
              <textarea rows={3} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
                value={form.seoDescription ?? ""} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}/>
            </label>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-semibold">Featured Image</h2>
          <div className="mt-3 space-y-3">
            {form.featuredImage ? (
              <img src={form.featuredImage} alt="" className="w-full rounded-xl border border-[var(--border)]" />
            ) : (
              <div className="text-sm opacity-70">No image yet</div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) await onUpload(f);
              }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={save} disabled={saving} className="btn btn-primary">{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
}
