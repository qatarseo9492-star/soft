"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import { AdminToolbar, GradientHeader } from "@/components/admin/ui";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input"; // ⬅️ default import
import { ShieldAlert } from "lucide-react";

type BanRow = { id: string; ip: string; reason?: string | null; createdAt: string };
type BansResp = { ok: true; total: number; items: BanRow[] } | { ok: false; error: string };

export default function SecurityPage() {
  const [rows, setRows] = useState<BanRow[]>([]);
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const r: BansResp = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/web-api/admin/security/banned-ips?take=50", { cache: "no-store" })
      .then((x) => x.json())
      .catch(() => ({ ok: false, error: "failed" } as const));
    if (r && "ok" in r && r.ok) setRows(r.items ?? []);
    else setRows([]);
  }

  async function addBan() {
    if (!ip) return;
    setLoading(true);
    await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/web-api/admin/security/banned-ips", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ip, reason }),
    }).catch(() => {});
    setIp("");
    setReason("");
    setLoading(false);
    await load();
  }

  async function removeBan(id: string) {
    await fetch(process.env.NEXT_PUBLIC_SITE_URL + `/web-api/admin/security/banned-ips/${id}`, { method: "DELETE" }).catch(() => {});
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <AdminToolbar homeHref={"/" as Route} moreHref={"/admin" as Route} />
      <GradientHeader
        title="Security"
        subtitle="Manage banned IP addresses (Admins only)."
        right={<ShieldAlert className="h-6 w-6 text-orange-400" />}
      />

      <Card className="soft-card">
        <CardHeader>
          <CardTitle>Add ban</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <Input value={ip} onChange={(e: any) => setIp(e.target.value)} placeholder="IP address" />
          <Input value={reason} onChange={(e: any) => setReason(e.target.value)} placeholder="Reason (optional)" />
          <Button onClick={addBan} disabled={loading}>{loading ? "Banning…" : "Ban"}</Button>
        </CardContent>
      </Card>

      <Card className="soft-card">
        <CardHeader>
          <CardTitle>Banned IPs</CardTitle>
        </CardHeader>
        <CardContent className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono">{r.ip}</TableCell>
                    <TableCell className="text-sm">{r.reason ?? "—"}</TableCell>
                    <TableCell className="text-sm">{new Date(r.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => void removeBan(r.id)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="opacity-70">
                    No bans.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
