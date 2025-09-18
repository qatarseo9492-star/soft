// src/app/admin/blocked-ips/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ListResp = { ok?: boolean; ips?: string[]; count?: number; error?: string };

export default function BlockedIpsPage() {
  const [ips, setIps] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busy,   setBusy]   = useState<string | null>(null);
  const [msg,    setMsg]    = useState<string | null>(null);
  const [newIp,  setNewIp]  = useState<string>("");

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      // ⬇️ point to web-api mirror (public GET, admin-gated POST/DELETE)
      const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/web-api/admin/blocked-ips", { cache: "no-store" });
      const json = (await res.json()) as ListResp;
      setIps(json.ips ?? []);
    } catch (e: any) {
      setMsg(e?.message || "Failed to load blocked IPs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function addIp(ip: string) {
    const clean = ip.trim();
    if (!clean) return;
    try {
      setBusy(clean);
      setMsg(null);
      const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/web-api/admin/blocked-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: clean }),
      });
      const json = await res.json();
      if (!res.ok || json?.ok === false) throw new Error(json?.error || `Add failed (${res.status})`);
      await load();
      setNewIp("");
      setMsg(`Blocked ${clean}`);
    } catch (e: any) {
      setMsg(e?.message || "Add failed");
    } finally {
      setBusy(null);
    }
  }

  async function removeIp(ip: string) {
    try {
      setBusy(ip);
      setMsg(null);
      const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/web-api/admin/blocked-ips", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip }),
      });
      const json = await res.json();
      if (!res.ok || json?.ok === false) throw new Error(json?.error || `Remove failed (${res.status})`);
      await load();
      setMsg(`Unblocked ${ip}`);
    } catch (e: any) {
      setMsg(e?.message || "Remove failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Blocked IPs</h1>
        <div className="flex items-center gap-2">
          {msg && <Badge variant="secondary">{msg}</Badge>}
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Add IP</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <input
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            placeholder="e.g. 203.0.113.10 or 2001:db8::1"
            className="w-full border rounded-md px-3 py-2 bg-background"
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); void addIp(newIp); }
            }}
          />
          <Button onClick={() => addIp(newIp)} disabled={!newIp.trim() || busy !== null}>
            {busy === newIp.trim() ? "Adding…" : "Add"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Current List ({ips.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP</TableHead>
                <TableHead className="w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ips.map((ip) => (
                <TableRow key={ip}>
                  <TableCell className="font-mono">{ip}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(ip)}>Copy</Button>
                      <Button size="sm" variant="destructive" onClick={() => removeIp(ip)} disabled={busy === ip}>
                        {busy === ip ? "Removing…" : "Remove"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!ips.length && !loading && (
                <TableRow>
                  <TableCell colSpan={2} className="opacity-70">Empty.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
