// src/app/admin/software/new/page.tsx
"use client";

import { useState, Suspense } from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AdminToolbar, GradientHeader, clsx } from "@/components/admin/ui";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import ClassicEditor from "@/components/admin/ClassicEditor";
import { Image as ImageIcon, Link as LinkIcon, Tags, Globe, Save, Rocket } from "lucide-react";

type CreateResp =
  | { ok: true; item: { id: string } }
  | { ok: false; error: string };

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <CreateSoftware />
    </Suspense>
  );
}

function CreateSoftware() {
  const router = useRouter();

  // Core fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState(""); // << TinyMCE content

  const [category, setCategory] = useState("Utilities");
  const [website, setWebsite] = useState("");
  const [license, setLicense] = useState("MIT");
  const [published, setPublished] = useState(false);

  // Meta boxes (classic WP-style)
  const [featuredImage, setFeaturedImage] = useState("");
  const [directLink, setDirectLink] = useState("");
  const [torrentLink, setTorrentLink] = useState("");
  const [tagsText, setTagsText] = useState(""); // comma separated
  const [focusKeyword, setFocusKeyword] = useState(""); // simple SEO input

  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function autoSlug(v: string) {
    setName(v);
    if (!slug) {
      const s = v
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(s);
    }
  }

  async function save(publishNow: boolean) {
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        shortDesc: shortDesc.trim() || null,
        longDesc: longDesc.trim() || null,
        category: category.trim() || null,
        website: website.trim() || null,
        license: license.trim() || null,
        published: publishNow ? true : !!published,
        // anything not in the core model can go into meta; server can ignore/accept
        meta: {
          featuredImage: featuredImage.trim() || null,
          downloads: {
            direct: directLink.trim() || null,
            torrent: torrentLink.trim() || null,
          },
          tags: tagsText
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          seo: { focusKeyword: focusKeyword.trim() || null },
        },
      };

      const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + "/web-api/admin/software", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as CreateResp;
      if (!json.ok) throw new Error(json.error || "Create failed");
      // go to detail; there you’ll also have a “Republish” button (see note below)
      router.push((`/admin/software/${json.item.id}`) as Route);
    } catch (e: any) {
      setMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const words = longDesc.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <AdminToolbar homeHref={"/" as Route} moreHref={"/admin" as Route} showProfile />

      <GradientHeader
        title="Create Software"
        subtitle="Fill the basics and publish when ready."
        right={
          <Link href={"/admin/settings" as Route}>
            <Button variant="outline" size="sm">Profile</Button>
          </Link>
        }
      />

      <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
        {/* LEFT: content column */}
        <div className="space-y-6">
          {/* Details */}
          <Card className="soft-card">
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-sm opacity-80">Name *</span>
                  <input className="border rounded-md px-3 py-2 bg-background/60"
                    value={name} onChange={(e) => autoSlug(e.target.value)} placeholder="FilesPay Desktop" />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm opacity-80">Slug *</span>
                  <input className="border rounded-md px-3 py-2 bg-background/60"
                    value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="filespay-desktop" />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-sm opacity-80">Short Description</span>
                <input className="border rounded-md px-3 py-2 bg-background/60"
                  value={shortDesc} onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Secure file downloads with signed links and stats." />
              </label>

              {/* Classic Editor — Long Description */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-80">Long Description</span>
                  <span className="text-xs opacity-60">{words} words</span>
                </div>
                <ClassicEditor value={longDesc} onChange={setLongDesc} height={480} />
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <label className="grid gap-1">
                  <span className="text-sm opacity-80">Category</span>
                  <input className="border rounded-md px-3 py-2 bg-background/60"
                    value={category} onChange={(e) => setCategory(e.target.value)} />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm opacity-80">Website</span>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                    <input className="w-full border rounded-md pl-9 pr-3 py-2 bg-background/60"
                      value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
                  </div>
                </label>
                <label className="grid gap-1">
                  <span className="text-sm opacity-80">License</span>
                  <input className="border rounded-md px-3 py-2 bg-background/60"
                    value={license} onChange={(e) => setLicense(e.target.value)} placeholder="MIT" />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Publish controls */}
          <Card className="soft-card">
            <CardHeader><CardTitle>Publish</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                <span>Published</span>
              </label>

              <div className="ml-auto flex gap-2">
                <Button variant="outline" onClick={() => save(false)} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" /> {saving ? "Saving…" : "Save draft"}
                </Button>
                <Button onClick={() => save(true)} className="btn-gradient shadow-soft" disabled={saving}>
                  <Rocket className="h-4 w-4 mr-2" /> {saving ? "Publishing…" : "Publish"}
                </Button>
              </div>

              {msg && <Badge variant="secondary" className="ml-0">{msg}</Badge>}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: meta boxes column */}
        <div className="space-y-6">
          {/* Featured image */}
          <Card className="soft-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Featured image</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <input className="w-full border rounded-md px-3 py-2 bg-background/60"
                placeholder="https://…/cover.jpg" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} />
              {featuredImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featuredImage} alt="" className="rounded-md border" />
              )}
            </CardContent>
          </Card>

          {/* Downloads */}
          <Card className="soft-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Download Links</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <label className="grid gap-1">
                <span className="text-sm opacity-80">Direct Download</span>
                <input className="border rounded-md px-3 py-2 bg-background/60"
                  value={directLink} onChange={(e) => setDirectLink(e.target.value)} placeholder="https://…" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm opacity-80">Torrent Download</span>
                <input className="border rounded-md px-3 py-2 bg-background/60"
                  value={torrentLink} onChange={(e) => setTorrentLink(e.target.value)} placeholder="magnet:?xt=…" />
              </label>
            </CardContent>
          </Card>

          {/* Taxonomies */}
          <Card className="soft-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><Tags className="h-4 w-4" /> Categories & Tags</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <label className="grid gap-1">
                <span className="text-sm opacity-80">Category (free text)</span>
                <input className="border rounded-md px-3 py-2 bg-background/60"
                  value={category} onChange={(e) => setCategory(e.target.value)} />
              </label>
              <label className="grid gap-1">
                <span className="text-sm opacity-80">Tags (comma separated)</span>
                <input className="border rounded-md px-3 py-2 bg-background/60"
                  value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="utilities, downloader, security" />
              </label>
            </CardContent>
          </Card>

          {/* Simple SEO box (like RankMath focus keyword) */}
          <Card className="soft-card">
            <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <label className="grid gap-1">
                <span className="text-sm opacity-80">Focus keyword</span>
                <input className="border rounded-md px-3 py-2 bg-background/60"
                  value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="Example: file downloader" />
              </label>
              <div className="text-xs opacity-70">
                Tip: include your focus keyword in title, description and early in your long description.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
