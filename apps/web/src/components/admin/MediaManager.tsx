"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Media = {
  id: string;
  type: "ICON"|"HERO"|"GALLERY"|"SCREENSHOT"|"VIDEO";
  url: string;
  alt: string | null;
  order: number;
  meta?: {
    blurDataURL?: string;
    variants?: { w:number; url:string }[];
    width?: number; height?: number;
  } | null
};

export default function MediaManager({ softwareId }: { softwareId: string }) {
  const [items, setItems] = useState<Media[]>([]);
  const [type, setType] = useState<Media["type"]>("GALLERY");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const r = await fetch(`/web-api/admin/software/${softwareId}/media`, { cache: "no-store" });
    const j = await r.json();
    setItems(j.items || []);
  };

  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    try {
      // 1) upload the binary
      const fd = new FormData();
      fd.set("file", file);
      const ur = await fetch(`/web-api/admin/upload`, { method: "POST", body: fd });
      const up = await ur.json();
      if (!up.ok) throw new Error("Upload failed");

      // 2) create media record (store meta with blur + variants)
      const meta = {
        blurDataURL: up.blurDataURL,
        variants: up.variants,
        width: up.width, height: up.height,
      };

      const cr = await fetch(`/web-api/admin/software/${softwareId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          url: up.variants?.[1]?.url || up.variants?.[0]?.url || up.original,
          alt: "",
          order: items.length,
          meta,
        }),
      });
      const cj = await cr.json();
      if (!cj.ok) throw new Error("Create media failed");

      setFile(null);
      await load();
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const del = async (mid: string) => {
    if (!confirm("Delete this image?")) return;
    await fetch(`/web-api/admin/software/${softwareId}/media?mid=${encodeURIComponent(mid)}`, { method: "DELETE" });
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4 flex items-center gap-3 bg-white">
        <select value={type} onChange={(e)=>setType(e.target.value as any)}
                className="border rounded-md px-2 py-1">
          <option value="HERO">HERO</option>
          <option value="ICON">ICON</option>
          <option value="GALLERY">GALLERY</option>
          <option value="SCREENSHOT">SCREENSHOT</option>
          <option value="VIDEO">VIDEO</option>
        </select>
        <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
        <button disabled={!file || busy} onClick={upload}
                className="px-3 py-1.5 rounded-md border bg-gray-50 hover:bg-gray-100 text-sm disabled:opacity-50">
          {busy ? "Uploading…" : "Upload"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((m)=>(
          <div key={m.id} className="border rounded-lg p-2 bg-white">
            <div className="text-[11px] text-gray-500 flex items-center justify-between">
              <span>{m.type}</span>
              <button className="text-red-600" onClick={()=>del(m.id)}>Delete</button>
            </div>
            <div className="mt-2 relative aspect-[16/10] overflow-hidden rounded-md bg-gray-50">
              <Image
                src={m.url}
                alt={m.alt || ""}
                fill
                sizes="(max-width:768px) 50vw, 25vw"
                placeholder={m.meta?.blurDataURL ? "blur" : "empty"}
                blurDataURL={m.meta?.blurDataURL || undefined}
              />
            </div>
            <div className="mt-2 text-xs break-all">
              {m.url}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
