// src/app/admin/software/import/page.tsx
"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse"; // npm i papaparse
import { AdminToolbar, GradientHeader } from "@/components/admin/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Row = {
  slug: string;
  name: string;
  shortDesc?: string;
  category?: string;
  website?: string;
  license?: string;
  published?: boolean;
};

const SAMPLE_JSON = `[
  {"slug":"filespay-desktop","name":"FilesPay Desktop","shortDesc":"Secure file downloads","category":"Utilities","published":true},
  {"slug":"sample-app-2","name":"Sample App 2","shortDesc":"demo","category":"Utilities","published":false}
]`;

const SAMPLE_CSV = `slug,name,shortDesc,category,website,license,published
filespay-desktop,FilesPay Desktop,Secure file downloads,Utilities,,MIT,true
sample-app-2,Sample App 2,demo,Utilities,,,false`;

export default function ImportPage() {
  const [mode, setMode] = useState<"json" | "csv">("json");
  const [text, setText] = useState(SAMPLE_JSON);
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const parsed = useMemo(() => {
    try {
      if (!text.trim()) return [];
      if (mode === "json") {
        const val = JSON.parse(text);
        if (!Array.isArray(val)) return [];
        return val as Row[];
      } else {
        const res = Papa.parse<Row>(text.trim(), { header: true, skipEmptyLines: true });
        return (res.data || []) as Row[];
      }
    } catch {
      return [];
    }
  }, [mode, text]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <AdminToolbar moreHref="/admin/software" homeHref="/" />
      <GradientHeader title="Bulk Import" subtitle="Paste JSON or CSV, preview, then import." />

      <div className="flex gap-2">
        <Button variant={mode === "json" ? "default" : "outline"} onClick={() => { setMode("json"); setText(SAMPLE_JSON); }}>
          JSON
        </Button>
        <Button variant={mode === "csv" ? "default" : "outline"} onClick={() => { setMode("csv"); setText(SAMPLE_CSV); }}>
          CSV
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader><CardTitle>Paste your {mode.toUpperCase()}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <textarea
            className="w-full h-56 border rounded-md px-3 py-2 font-mono"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Parsed rows: {parsed.length}</Badge>
            {msg && <Badge variant="secondary">{msg}</Badge>}
            <Button
              variant="outline"
              onClick={() => setRows(parsed)}
            >
              Preview
            </Button>
            <Button
              disabled={!parsed.length || running}
              onClick={async () => {
                setRunning(true);
                setMsg(null);
                try {
                  let okCount = 0, failCount = 0;
                  for (const r of parsed) {
                    const payload: Record<string, any> = {
                      slug: r.slug,
                      name: r.name,
                      shortDesc: r.shortDesc || undefined,
                      category: r.category || undefined,
                      website: r.website || undefined,
                      license: r.license || undefined,
                      published: !!r.published,
                    };
                    const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/web-api/admin/software", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    const j = await res.json();
                    if (j?.ok) okCount++; else failCount++;
                  }
                  setMsg(`Imported: ${okCount} ok, ${failCount} failed`);
                } catch (e: any) {
                  setMsg(e?.message || "Import failed");
                } finally {
                  setRunning(false);
                }
              }}
            >
              {running ? "Importing…" : "Import"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Short Desc</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Published</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={`${r.slug}-${i}`}>
                    <TableCell className="font-mono text-xs">{r.slug}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="max-w-[26rem] truncate">{r.shortDesc || "—"}</TableCell>
                    <TableCell>{r.category || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{r.website || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{r.license || "—"}</TableCell>
                    <TableCell>{r.published ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
                {!rows.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="opacity-70">No rows yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
