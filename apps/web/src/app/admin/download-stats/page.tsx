// apps/web/src/app/admin/download-stats/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

// shadcn/ui
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type IpRow = { ip: string; count: number };
type DayRow = { day: string; count: number };
type FileRow = { file: string; count: number };

type Stats = {
  total: number;
  uniqueIps: number;
  topIps: IpRow[];
  byDay: DayRow[];
  topFiles?: FileRow[];
};

export default function DownloadStatsPage() {
  const [data, setData] = useState<Stats | null>(null);
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busyIp, setBusyIp] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function loadStats() {
    const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/web-api/download-stats", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load stats");
    return res.json() as Promise<Stats>;
  }

  // Use the server-side proxy so the browser never needs the admin key
  async function loadBlocked() {
    const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/web-api/admin/blocked-ips", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load blocked IPs");
    const json = await res.json();
    return new Set<string>((json?.ips ?? []) as string[]);
  }

  async function loadAll() {
    setLoading(true);
    setMsg(null);
    try {
      const [stats, blockedSet] = await Promise.all([loadStats(), loadBlocked()]);
      setData(stats);
      setBlocked(blockedSet);
    } catch (e: any) {
      setMsg(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadAll(); }, []);

  function copy(txt: string) {
    navigator.clipboard.writeText(txt);
    setMsg("Copied to clipboard");
    setTimeout(() => setMsg(null), 1200);
  }

  async function blockIp(ip: string) {
    try {
      setBusyIp(ip);
      setMsg(null);
      const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/web-api/admin/blocked-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) throw new Error(json?.error || `Block failed (${res.status})`);
      setBlocked(await loadBlocked());
      setMsg(`Blocked ${ip}`);
    } catch (e: any) {
      setMsg(e?.message || "Block failed");
    } finally {
      setBusyIp(null);
    }
  }

  async function unblockIp(ip: string) {
    try {
      setBusyIp(ip);
      setMsg(null);
      const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/web-api/admin/blocked-ips", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) throw new Error(json?.error || `Unblock failed (${res.status})`);
      setBlocked(await loadBlocked());
      setMsg(`Unblocked ${ip}`);
    } catch (e: any) {
      setMsg(e?.message || "Unblock failed");
    } finally {
      setBusyIp(null);
    }
  }

  const topIps = useMemo(() => data?.topIps ?? [], [data]);
  const topFiles = useMemo(() => data?.topFiles ?? [], [data]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Download Stats</h1>
        <div className="flex items-center gap-2">
          {msg && <Badge variant="secondary">{msg}</Badge>}
          <Button variant="outline" onClick={loadAll} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Total Events</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{data?.total ?? "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Unique IPs</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{data?.uniqueIps ?? "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Status</CardTitle></CardHeader>
          <CardContent>
            <Badge variant="secondary">{loading ? "Loading…" : "Live"}</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Top IPs (last window)</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP</TableHead>
                <TableHead className="w-24">Count</TableHead>
                <TableHead>Quick Copy</TableHead>
                <TableHead className="w-56">Block / Unblock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topIps.map((row) => {
                const isBlocked = blocked.has(row.ip);
                const cfExpr = `(ip.src eq ${row.ip})`;
                const nginx = `deny ${row.ip};`;
                const ufw = `sudo ufw deny from ${row.ip}`;
                return (
                  <TableRow key={row.ip}>
                    <TableCell className="font-mono flex items-center gap-2">
                      {row.ip}
                      {isBlocked && <Badge variant="destructive">Blocked</Badge>}
                    </TableCell>
                    <TableCell>{row.count}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => copy(cfExpr)} title="Copy Cloudflare expression">
                        CF expr
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => copy(nginx)} title="Copy nginx deny rule">
                        nginx
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => copy(ufw)} title="Copy UFW command">
                        UFW
                      </Button>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      {!isBlocked ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => blockIp(row.ip)}
                          disabled={busyIp === row.ip}
                        >
                          {busyIp === row.ip ? "Blocking…" : "Block IP"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unblockIp(row.ip)}
                          disabled={busyIp === row.ip}
                        >
                          {busyIp === row.ip ? "Unblocking…" : "Unblock"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!topIps.length) && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="opacity-70">
                    No data yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {topFiles?.length ? (
        <Card>
          <CardHeader><CardTitle>Top Files (last window)</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead className="w-24">Count</TableHead>
                  <TableHead>Copy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topFiles.map((row) => (
                  <TableRow key={row.file}>
                    <TableCell className="font-mono">{row.file}</TableCell>
                    <TableCell>{row.count}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="secondary" onClick={() => copy(row.file)}>
                        Copy name
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
