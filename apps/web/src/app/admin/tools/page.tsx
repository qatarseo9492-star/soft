// src/app/admin/tools/page.tsx
"use client";

import { useState } from "react";
import { AdminToolbar, GradientHeader } from "@/components/admin/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Play, ServerCog, ScanSearch, Link2 } from "lucide-react";

type MirrorResult = { id: string; url: string; httpStatus: number | null; latencyMs: number | null; statusLabel: string };

export default function ToolsPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // mirror check state
  const [mLimit, setMLimit] = useState(10);
  const [mTimeout, setMTimeout] = useState(8000);
  const [mResults, setMResults] = useState<MirrorResult[]>([]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <AdminToolbar moreHref="/admin" homeHref="/" />
      <GradientHeader
        title="Admin Tools"
        subtitle="Reindex search, regenerate sitemap, trigger revalidate, and check mirrors."
      />

      {msg && <Badge variant="secondary">{msg}</Badge>}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Sitemap */}
        <Card id="sitemap" className="shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2"><ServerCog className="h-5 w-5 text-indigo-600" /> Sitemap</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Generate sitemap & ping search engines.</p>
            <Button
              disabled={busy === "sitemap"}
              onClick={async () => {
                setBusy("sitemap"); setMsg(null);
                try {
                  const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/web-api/admin/tools/sitemap", { method: "POST" });
                  const j = await res.json();
                  if (!j.ok) throw new Error(j.error || "Failed");
                  setMsg("Sitemap generated.");
                } catch (e:any) { setMsg(e?.message || "Failed"); }
                finally { setBusy(null); }
              }}
            >
              {busy === "sitemap" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              Run
            </Button>
          </CardContent>
        </Card>

        {/* Revalidate */}
        <Card id="revalidate" className="shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2"><ServerCog className="h-5 w-5 text-purple-600" /> Revalidate Queue</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Trigger background revalidate job.</p>
            <Button
              disabled={busy === "revalidate"}
              onClick={async () => {
                setBusy("revalidate"); setMsg(null);
                try {
                  const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/web-api/admin/tools/revalidate", { method: "POST" });
                  const j = await res.json();
                  if (!j.ok) throw new Error(j.error || "Failed");
                  setMsg("Revalidate triggered.");
                } catch (e:any) { setMsg(e?.message || "Failed"); }
                finally { setBusy(null); }
              }}
            >
              {busy === "revalidate" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              Run
            </Button>
          </CardContent>
        </Card>

        {/* Mirrors */}
        <Card id="mirrors" className="shadow-sm lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5 text-emerald-600" /> Mirror Checker</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="space-y-1">
                <div className="text-sm">Limit</div>
                <input className="w-full border rounded-md px-3 py-2" type="number" min={1} value={mLimit} onChange={(e)=>setMLimit(+e.target.value||10)} />
              </label>
              <label className="space-y-1">
                <div className="text-sm">Timeout (ms)</div>
                <input className="w-full border rounded-md px-3 py-2" type="number" min={1000} step={500} value={mTimeout} onChange={(e)=>setMTimeout(+e.target.value||8000)} />
              </label>
              <div className="flex items-end">
                <Button
                  className="w-full"
                  disabled={busy === "mirrors"}
                  onClick={async () => {
                    setBusy("mirrors"); setMsg(null);
                    try {
                      const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + `/web-api/admin/tools/mirrors/check?limit=${mLimit}&timeoutMs=${mTimeout}`, { method: "POST" });
                      const j = await res.json();
                      if (!j.ok) throw new Error(j.error || "Failed");
                      setMResults(j.results || []);
                      setMsg(`Checked: ${j.checked}`);
                    } catch (e:any) { setMsg(e?.message || "Failed"); }
                    finally { setBusy(null); }
                  }}
                >
                  {busy === "mirrors" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ScanSearch className="h-4 w-4 mr-2" />}
                  Check
                </Button>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead>HTTP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mResults.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell className="max-w-[28rem] truncate font-mono text-xs">{r.url}</TableCell>
                      <TableCell>{r.statusLabel ?? "UNKNOWN"}</TableCell>
                      <TableCell>{r.latencyMs ?? "—"}</TableCell>
                      <TableCell>{r.httpStatus ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                  {!mResults.length && (
                    <TableRow><TableCell colSpan={5} className="opacity-70">No results yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card id="search" className="shadow-sm lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><ServerCog className="h-5 w-5 text-pink-600" /> Search Index (Meili)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Sync software entries to Meilisearch.</p>
            <div className="flex items-center gap-2">
              <Button
                disabled={busy === "search"}
                onClick={async () => {
                  setBusy("search"); setMsg(null);
                  try {
                    const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/web-api/admin/tools/search/sync", { method: "POST" });
                    const j = await res.json();
                    if (!j.ok) throw new Error(j.error || "Failed");
                    setMsg(`Indexed ${j.indexed} items in ${j.batches} batch(es).`);
                  } catch (e:any) { setMsg(e?.message || "Failed"); }
                  finally { setBusy(null); }
                }}
              >
                {busy === "search" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                Sync Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
