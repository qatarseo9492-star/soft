export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import { NextRequest, NextResponse } from 'next/server'


// Proxies to API_URL/v1/uploads/image with the same form-data
export async function POST(req: NextRequest) {
  const api = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://127.0.0.1:3011'
  const fd = await req.formData()
  const upstream = await fetch(`${api}/v1/uploads/image`, { method: 'POST', body: fd })
  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}
