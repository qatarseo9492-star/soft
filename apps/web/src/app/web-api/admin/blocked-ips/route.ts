export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/web-api/admin/blocked-ips/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Reuse the real API handlers so logic stays in one place
import {
  GET as API_GET,
  HEAD as API_HEAD,
  OPTIONS as API_OPTIONS,
  POST as API_POST,
  DELETE as API_DELETE,
} from "@/app/api/blocked-ips/route";


// Use DOWNLOAD_SIGN_ADMIN_KEY (same key you already use for admin ops)
const ADMIN_KEY = (process.env.DOWNLOAD_SIGN_ADMIN_KEY || "").trim();

/**
 * Build a new Request that:
 *  - preserves URL/method/body/headers from the incoming request
 *  - injects x-admin-key header so the underlying API accepts the mutation
 */
async function buildAdminRequest(req: Request): Promise<Request> {
  // Read the raw body ONCE, then create a fresh Request
  const rawBody = await req.text(); // safe for both POST and DELETE (JSON body)
  const headers = new Headers(req.headers);
  if (ADMIN_KEY) headers.set("x-admin-key", ADMIN_KEY);
  // Ensure content-type survives (Next’s JSON parser depends on it)
  if (!headers.get("content-type")) headers.set("content-type", "application/json");

  return new Request(req.url, {
    method: req.method,
    headers,
    body: rawBody,
    // @ts-ignore — duplex is needed in some runtimes, harmless elsewhere
    duplex: "half",
  });
}

/** GET just returns the list; no auth needed */
export async function GET() {
  // API_GET returns a NextResponse already; just forward it.
  return API_GET();
}

/** HEAD/OPTIONS passthrough */
export function HEAD() {
  return API_HEAD();
}
export function OPTIONS() {
  return API_OPTIONS();
}

/** POST -> add IP(s). Inject admin key. Always returns JSON. */
export async function POST(req: NextRequest) {
  const adminReq = await buildAdminRequest(req);
  return API_POST(adminReq);
}

/** DELETE -> remove IP(s). Inject admin key. Always returns JSON. */
export async function DELETE(req: NextRequest) {
  const adminReq = await buildAdminRequest(req);
  return API_DELETE(adminReq);
}
