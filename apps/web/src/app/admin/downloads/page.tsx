// apps/web/src/app/admin/downloads/page.tsx
"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Daily = { date: string; count: number };
type Resp = { days: number; daily: Daily[]; topFiles: { file: string; count: number }[]; total: number };

export default function AdminDownloads() {
  const [key, setKey] = useState("");
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(`/api/download-stats?days=${days}`, {
        headers: key ? { "x-admin-key": key } : undefined,
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = (await res.json()) as Resp;
      setData(json);
    } catch (e: any) {
      setErr(e.message || String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // do nothing on mount
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Download analytics</h1>

      <div className="grid gap-3 sm:grid-cols-3">
        <input
          type="password"
          placeholder="Admin key (x-admin-key)"
          className="px-3 py-2 rounded bg-white/10 outline-none"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <select
          className="px-3 py-2 rounded bg-white/10"
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value, 10))}
        >
          {[7, 14, 30, 60, 90].map((d) => (
            <option key={d} value={d}>{d} days</option>
          ))}
        </select>
        <button
          className="px-4 py-2 rounded bg-white/10 hover:bg-white/20"
          onClick={load}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load stats"}
        </button>
      </div>

      {err && <div className="text-red-400 text-sm">Error: {err}</div>}

      {data && (
        <>
          <div className="text-sm opacity-80">Total downloads in window: <b>{data.total}</b></div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopOpacity={0.4}/>
                    <stop offset="95%" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" strokeOpacity={1} fillOpacity={1} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6">
            <h2 className="font-semibold mb-2">Top files</h2>
            <div className="space-y-1 text-sm">
              {data.topFiles.map((t) => (
                <div key={t.file} className="flex justify-between">
                  <span className="truncate">{t.file}</span>
                  <span className="opacity-80">{t.count}</span>
                </div>
              ))}
              {data.topFiles.length === 0 && <div className="opacity-60">No data.</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
