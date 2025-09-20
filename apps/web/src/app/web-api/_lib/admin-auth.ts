import { NextRequest } from "next/server";

/**
 * Admin auth via header x-admin-key matching process.env.ADMIN_API_KEY
 * Keep ADMIN_API_KEY only on the server (never expose to client).
 */
export function isAdmin(req: NextRequest) {
  const hdr = (req.headers.get("x-admin-key") || "").trim();
  const key = (process.env.ADMIN_API_KEY || "").trim();
  return !!key && hdr === key;
}

export function requireAdmin(req: NextRequest) {
  if (!isAdmin(req)) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}
