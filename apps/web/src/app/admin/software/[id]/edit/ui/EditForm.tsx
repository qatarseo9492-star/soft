// src/app/admin/software/[id]/edit/ui/EditForm.tsx
"use client";
import { useState } from "react";

export default function EditForm({ item, categories }: { item: any; categories: any[] }) {
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean>(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null); setOk(false);
    const fd = new FormData(e.currentTarget);
    const os = fd.getAll("os").map(String).filter(Boolean);
    const cats = fd.getAll("categories").map(String).filter(Boolean);
    const payload = {
      name: fd.get("name"),
      slug: fd.get("slug") || undefined,
      shortDesc: fd.get("shortDesc") || null,
      longDesc: fd.get("longDesc") || null,
      license: fd.get("license") || null,
      os,
      categories: cats,
    };
    const res = await fetch(`/web-api/admin/software/${item.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.ok) {
      setOk(true);
      setTimeout(() => (location.href = "/admin/software"), 400);
    } else {
      setErr(j?.error || "Save failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border p-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input name="name" defaultValue={item.name} required className="w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Slug</label>
          <input name="slug" defaultValue={item.slug} className="w-full rounded-md border px-3 py-2" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Short Description</label>
          <input name="shortDesc" defaultValue={item.shortDesc ?? ""} className="w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">License</label>
          <input name="license" defaultValue={item.license ?? ""} className="w-full rounded-md border px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Long Description</label>
        <textarea name="longDesc" rows={6} defaultValue={item.longDesc ?? ""} className="w-full rounded-md border px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm mb-2">Operating Systems</label>
        <div className="flex flex-wrap gap-4">
          {["windows", "mac", "linux", "android", "ios"].map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="os" value={o} defaultChecked={(item.os || []).includes(o)} />{" "}
              <span className="capitalize">{o}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm mb-2">Categories</label>
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="categories"
                value={c.slug}
                defaultChecked={(item.categories || []).some((x: any) => x.slug === c.slug)}
              />{" "}
              <span>{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {err && <div className="text-sm text-red-600">{err}</div>}
      {ok && <div className="text-sm text-green-600">Saved!</div>}
      <button className="btn btn-primary rounded-xl">Update</button>
    </form>
  );
}
