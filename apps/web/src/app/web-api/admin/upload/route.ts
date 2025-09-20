// src/app/web-api/admin/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "misc");
    const wantWebp = String(form.get("webp") || "") === "1";

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "file is required" }, { status: 400 });
    }

    const baseDir = process.env.UPLOAD_DIR || "/home/1510120.cloudwaysapps.com/kpvbrsfqas/public_html/uploads";
    const relDir = folder.replace(/^\/+|\/+$/g, ""); // posts/my-slug
    const absDir = path.join(baseDir, relDir);
    await fs.mkdir(absDir, { recursive: true });

    const origName = sanitizeName(file.name || "upload.bin");
    const input = Buffer.from(await file.arrayBuffer());
    const isImage = /^image\//.test(file.type || "");

    // lazy-load sharp
    let sharp: any = null;
    try { sharp = (await import("sharp")).default; } catch {}
    let out = input;
    let ext = path.extname(origName).toLowerCase() || ".bin";

    if (sharp && isImage) {
      if (wantWebp) {
        out = await sharp(input).webp({ quality: 82 }).toBuffer();
        ext = ".webp";
      } else {
        // just ensure it's not enormous
        out = await sharp(input).resize({ width: 2000, withoutEnlargement: true }).toBuffer();
      }
    }

    const base = path.basename(origName, path.extname(origName));
    const fname = sanitizeName(`${base}-${Date.now()}${ext}`);
    const fullPath = path.join(absDir, fname);
    await fs.writeFile(fullPath, out);

    const urlPath = `/uploads/${relDir}/${fname}`;
    const absolute = `${process.env.NEXT_PUBLIC_SITE_URL || ""}${urlPath}`;
    return NextResponse.json({ ok: true, url: urlPath, absolute, bytes: out.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Upload failed" }, { status: 500 });
  }
}
