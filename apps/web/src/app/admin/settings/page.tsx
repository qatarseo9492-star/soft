"use client";

import { useEffect, useState } from "react";

type Setting = { key: string; json: unknown | null; text: string | null; updatedAt?: string };

export default function AdminSettingsPage() {
  const [items, setItems] = useState<Setting[]>([]);
  const [key, setKey] = useState("");
  const [mode, setMode] = useState<"json"|"text">("json");
  const [value, setValue] = useState("");

  async function load() {
    const r = await fetch("/web-api/admin/settings", { cache: "no-store" });
    const b = await r.json();
    setItems(Array.isArray(b) ? b : b?.items ?? b ?? []);
  }

  async function save() {
    if (!key.trim()) return;
    const payload = mode === "json"
      ? { key, json: safeJson(value), text: null }
      : { key, json: null, text: value };
    await fetch("/web-api/admin/settings", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(payload),
    });
    setKey(""); setValue(""); load();
  }

  function safeJson(s: string) {
    try { return JSON.parse(s || "null"); }
    catch { return s ? { raw: s } : null; }
  }

  async function remove(k: string) {
    await fetch(`/web-api/admin/settings/${encodeURIComponent(k)}`, { method: "DELETE" });
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 md:px-6 py-8">
      <h1 className="text-2xl font-semibold">Admin Settings</h1>
      <p className="text-sm text-gray-500">Quick key/value settings stored in DB.</p>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="grid md:grid-cols-4 gap-3">
          <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Key (e.g., site.title)" className="border border-gray-300 rounded-lg px-3 py-2"/>
          <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="border border-gray-300 rounded-lg px-3 py-2">
            <option value="json">JSON</option>
            <option value="text">Text</option>
          </select>
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={mode==="json" ? `{"a":1}` : "plain text"} className="border border-gray-300 rounded-lg px-3 py-2 md:col-span-2"/>
        </div>
        <div className="mt-3 flex justify-end">
          <button onClick={save} className="text-sm px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100">Save</button>
        </div>
      </section>

      <section className="mt-6">
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((it) => (
            <article key={it.key} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{it.key}</h3>
                <button onClick={() => remove(it.key)} className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50">Delete</button>
              </div>
              <pre className="mt-3 text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                {JSON.stringify(it.json ?? it.text, null, 2)}
              </pre>
              {it.updatedAt && <div className="mt-2 text-[11px] text-gray-500">Updated: {new Date(it.updatedAt).toLocaleString()}</div>}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
