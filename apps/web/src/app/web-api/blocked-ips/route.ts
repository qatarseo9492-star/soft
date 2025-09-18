export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// Alias so the app can read blocked IPs from /web-api/blocked-ips

// Reuse the actual handlers
export { GET, HEAD, OPTIONS, POST, DELETE } from "../../api/blocked-ips/route";
