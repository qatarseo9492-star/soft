"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Setting = { id: string; key: string; value: string; type?: string | null; updatedAt?: string };

export default function SettingsPage() {
  const [items, setItems] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ key: "", value: "", type: "text" });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/web-api/admin/settings", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createSetting() {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/web-api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setForm({ key: "", value: "", type: "text" });
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Create failed");
    }
  }

  async function updateSetting(id: string, value: string) {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + `/web-api/admin/settings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Update failed");
    }
  }

  async function deleteSetting(id: string) {
    if (!confirm("Delete this setting?")) return;
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + `/web-api/admin/settings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e: any) {
      alert(e?.message ?? "Delete failed");
    }
  }

  const sorted = useMemo(() => items.slice().sort((a, b) => a.key.localeCompare(b.key)), [items]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <Link href="/admin" className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline">Back to Dashboard</Link>
      </div>

      {/* Create */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-medium text-white/90">Create new</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-5">
          <input
            placeholder="key"
            value={form.key}
            onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
            className="col-span-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-cyan-400/50"
          />
          <input
            placeholder="value"
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            className="col-span-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-cyan-400/50"
          />
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="col-span-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
          >
            <option value="text">text</option>
            <option value="boolean">boolean</option>
            <option value="number">number</option>
            <option value="json">json</option>
          </select>
        </div>
        <div className="mt-3">
          <button onClick={createSetting} className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 hover:border-emerald-400/80 hover:bg-emerald-500/20 hover:text-white">Save</button>
        </div>
      </div>

      {/* List */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5 text-left text-xs uppercase text-white/60">
            <tr>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-transparent">
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-white/60">Loading…</td></tr>
            )}
            {error && !loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-red-300">{error}</td></tr>
            )}
            {!loading && !error && sorted.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-white/60">No settings yet.</td></tr>
            )}
            {sorted.map((s) => (
              <tr key={s.id} className="align-top">
                <td className="px-4 py-3 text-sm text-white">{s.key}</td>
                <td className="px-4 py-3 text-sm text-white/80">
                  <InlineEditor value={s.value} onSave={(v) => updateSetting(s.id, v)} />
                </td>
                <td className="px-4 py-3 text-xs text-white/60">{s.type ?? "text"}</td>
                <td className="px-4 py-3 text-xs text-white/50">{s.updatedAt ? new Date(s.updatedAt).toLocaleString() : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => deleteSetting(s.id)} className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 hover:border-red-400/80 hover:bg-red-500/20 hover:text-white">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InlineEditor({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try { await onSave(v); } finally { setBusy(false); }
  }

  return (
    <div className="flex items-center gap-2">
      <input value={v} onChange={(e) => setV(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-400/50" />
      <button onClick={save} disabled={busy} className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-1.5 text-xs text-cyan-200 hover:border-cyan-400/80 hover:bg-cyan-500/20 hover:text-white disabled:opacity-50">Save</button>
    </div>
  );
}
