export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import { NextResponse } from "next/server";

// DELETE /web-api/admin/security/banned-ips/:id  (no-op stub)
export async function DELETE() {
  return NextResponse.json({ ok: true });
}
