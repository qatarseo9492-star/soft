export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import { NextResponse } from "next/server";
export async function GET() {
  const v = process.env.DATABASE_URL || "";
  return NextResponse.json({
    ok: true,
    hasUrl: !!v,
    prefix: v.slice(0, 24),
    usesPostgres: /^postgres(ql)?:\/\//.test(v),
  });
}
