export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// GET returns { google, bing, yandex, cloudflare, other }
// POST expects same keys, writes to Setting table.
import { NextRequest, NextResponse } from 'next/server'
import db from '../../../_lib/db'

const KEYS = [
  'site.verification.google',
  'site.verification.bing',
  'site.verification.yandex',
  'site.verification.cloudflare',
  'site.verification.other'
] as const

export async function GET() {
  const rows = await db.setting.findMany({ where: { key: { in: KEYS as unknown as string[] } } })
  const map: Record<string, string> = {}
  rows.forEach(r => (map[r.key] = r.value ?? ''))
  return NextResponse.json({
    google: map[KEYS[0]] ?? '',
    bing: map[KEYS[1]] ?? '',
    yandex: map[KEYS[2]] ?? '',
    cloudflare: map[KEYS[3]] ?? '',
    other: map[KEYS[4]] ?? ''
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const entries = [
    { key: KEYS[0], value: String(body.google ?? '') },
    { key: KEYS[1], value: String(body.bing ?? '') },
    { key: KEYS[2], value: String(body.yandex ?? '') },
    { key: KEYS[3], value: String(body.cloudflare ?? '') },
    { key: KEYS[4], value: String(body.other ?? '') }
  ]
  for (const e of entries) {
    await db.setting.upsert({
      where: { key: e.key },
      create: e,
      update: { value: e.value }
    })
  }
  return NextResponse.json({ ok: true })
}
