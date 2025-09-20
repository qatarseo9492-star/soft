"use client";
import { useEffect, useMemo, useState } from "react";

type SItem = { key: string; text: string | null; json: any | null };

export default function AdminSettingsPage() {
  const [items, setItems] = useState<SItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const map = useMemo(() => {
    const m = new Map<string, SItem>();
    items.forEach(r => m.set(r.key, r));
    return m;
  }, [items]);

  const getText = (k: string) => map.get(k)?.text ?? "";
  const getJsonBool = (k: string, def = true) => {
    const v = map.get(k)?.json;
    return typeof v === "boolean" ? v : def;
  };

  useEffect(() => {
    (async () => {
      const r = await fetch("/web-api/admin/settings");
      const j = await r.json();
      setItems(j.items || []);
    })();
  }, []);

  const setText = (key: string, val: string) => {
    setItems(prev => {
      const copy = [...prev];
      const i = copy.findIndex(x => x.key === key);
      if (i >= 0) copy[i] = { ...copy[i], text: val };
      else copy.push({ key, text: val, json: null });
      return copy;
    });
  };
  const setJsonBool = (key: string, val: boolean) => {
    setItems(prev => {
      const copy = [...prev];
      const i = copy.findIndex(x => x.key === key);
      if (i >= 0) copy[i] = { ...copy[i], json: val };
      else copy.push({ key, text: null, json: val });
      return copy;
    });
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      set: [
        { key: "site_name", text: getText("site_name") },
        { key: "site_url", text: getText("site_url") },
        { key: "download_password", text: getText("download_password") },
        { key: "default_meta_title", text: getText("default_meta_title") },
        { key: "default_meta_description", text: getText("default_meta_description") },
        { key: "google_site_verification", text: getText("google_site_verification") },
        { key: "bing_site_verification", text: getText("bing_site_verification") },
        { key: "analytics_google_id", text: getText("analytics_google_id") },
        { key: "enable_indexing", json: getJsonBool("enable_indexing", true) },
      ],
    };
    const r = await fetch("/web-api/admin/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (r.ok) {
      setMsg("Saved");
      setTimeout(() => setMsg(""), 1200);
    }
  };

  return (
    <main className="px-5 md:px-8 lg:px-12 py-8">
      <h1 className="text-2xl font-semibold">Admin → Settings</h1>
      <p className="text-sm text-gray-500 mt-1">Global site options & SEO.</p>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Site">
          <Input label="Site Name" value={getText("site_name")} onChange={v=>setText("site_name", v)} />
          <Input label="Site URL" value={getText("site_url")} onChange={v=>setText("site_url", v)} placeholder="https://filespay.org" />
          <Toggle label="Allow indexing (robots)" value={getJsonBool("enable_indexing", true)} onChange={v=>setJsonBool("enable_indexing", v)} />
        </Card>

        <Card title="Downloads">
          <Input label="Global Download Password" value={getText("download_password")} onChange={v=>setText("download_password", v)} placeholder="e.g., filespay123" />
          <p className="text-xs text-gray-500 mt-2">
            This password is shown on each software page and used in JSON-LD “softwareHelp”.
          </p>
        </Card>

        <Card title="SEO Basics">
          <Input label="Default Meta Title" value={getText("default_meta_title")} onChange={v=>setText("default_meta_title", v)} />
          <Textarea label="Default Meta Description" value={getText("default_meta_description")} onChange={v=>setText("default_meta_description", v)} />
        </Card>

        <Card title="Search Engine Verification">
          <Input label="Google Site Verification" value={getText("google_site_verification")} onChange={v=>setText("google_site_verification", v)} />
          <Input label="Bing Site Verification" value={getText("bing_site_verification")} onChange={v=>setText("bing_site_verification", v)} />
        </Card>

        <Card title="Analytics">
          <Input label="Google Analytics ID" value={getText("analytics_google_id")} onChange={v=>setText("analytics_google_id", v)} placeholder="G-XXXXXXXXXX" />
        </Card>
      </section>

      <div className="mt-6">
        <button onClick={save} disabled={saving}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100">
          {saving ? "Saving…" : "Save Settings"}
        </button>
        <span className="ml-3 text-sm text-green-600">{msg}</span>
      </div>
    </main>
  );
}

function Card({ title, children }: any) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-base font-semibold">{title}</div>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}
function Input({ label, value, onChange, placeholder }: any) {
  return (
    <label className="block">
      <div className="text-sm text-gray-700">{label}</div>
      <input
        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
        value={value || ""} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder}
      />
    </label>
  );
}
function Textarea({ label, value, onChange }: any) {
  return (
    <label className="block">
      <div className="text-sm text-gray-700">{label}</div>
      <textarea
        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 h-28"
        value={value || ""} onChange={(e)=>onChange(e.target.value)}
      />
    </label>
  );
}
function Toggle({ label, value, onChange }: any) {
  return (
    <label className="inline-flex items-center gap-2">
      <input type="checkbox" checked={!!value} onChange={(e)=>onChange(e.target.checked)} />
      <span className="text-sm">{label}</span>
    </label>
  );
}
