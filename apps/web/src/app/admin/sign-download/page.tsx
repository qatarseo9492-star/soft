"use client";

import { useEffect, useState } from "react";

export default function SignDownloadAdminPage() {
  const [file, setFile] = useState("");
  const [ttl, setTtl] = useState<string>("14400"); // 4h default
  const [bindIp, setBindIp] = useState(true);
  const [ip, setIp] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load saved admin key from localStorage
  useEffect(() => {
    const k = localStorage.getItem("signAdminKey");
    if (k) setAdminKey(k);
  }, []);

  // Save admin key for convenience
  useEffect(() => {
    if (adminKey) localStorage.setItem("signAdminKey", adminKey);
  }, [adminKey]);

  async function detectIp() {
    setError(null);
    try {
      const res = await fetch("/api/whoami");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to detect IP");
      setIp(data.ip || "");
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUrl(null);

    try {
      const body: Record<string, unknown> = {
        file: file.trim(),
      };
      const ttlNum = Number(ttl);
      if (Number.isFinite(ttlNum) && ttlNum > 0) body.ttl = ttlNum;
      if (bindIp && ip.trim()) body.ip = ip.trim();

      const res = await fetch("/api/sign-download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminKey ? { "x-admin-key": adminKey } : {}),
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to sign");

      setUrl(data.url);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Sign Download URL</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm opacity-80 mb-1">File name</label>
          <input
            className="w-full rounded-lg border border-white/10 bg-transparent p-2"
            placeholder="example-app-1.0.0-win-x64.exe"
            value={file}
            onChange={(e) => setFile(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3 items-end">
          <div>
            <label className="block text-sm opacity-80 mb-1">TTL (seconds)</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-transparent p-2"
              type="number"
              min={60}
              placeholder="14400"
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="bindIp"
              type="checkbox"
              checked={bindIp}
              onChange={(e) => setBindIp(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="bindIp" className="text-sm">Bind to IP</label>
          </div>
        </div>

        {bindIp && (
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <div>
              <label className="block text-sm opacity-80 mb-1">IP address</label>
              <input
                className="w-full rounded-lg border border-white/10 bg-transparent p-2"
                placeholder="123.123.123.123"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                required={bindIp}
              />
            </div>
            <button
              type="button"
              onClick={detectIp}
              className="self-end px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
            >
              Detect my IP
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm opacity-80 mb-1">Admin key (x-admin-key)</label>
          <input
            className="w-full rounded-lg border border-white/10 bg-transparent p-2"
            placeholder="paste DOWNLOAD_SIGN_ADMIN_KEY"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />
          <p className="text-xs opacity-60 mt-1">
            This is only used client-side to call <code>/api/sign-download</code>. It is stored in your browser’s localStorage for convenience.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-60"
        >
          {loading ? "Signing…" : "Generate signed URL"}
        </button>
      </form>

      {error && (
        <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-sm">
          {error}
        </div>
      )}

      {url && (
        <div className="p-3 rounded-lg border border-white/10 bg-white/5 space-y-2">
          <div className="text-sm opacity-80">Signed URL</div>
          <div className="break-all text-sm">{url}</div>
          <div className="flex gap-2">
            <button onClick={copy} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">
              Copy
            </button>
            <a href={url} target="_blank" className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">
              Open
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
