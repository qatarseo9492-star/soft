// src/app/web-api/admin/auth/logout/route.ts
import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.redirect("/admin/login");
  res.cookies.set("adm", "", { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 0 });
  return res;
}
