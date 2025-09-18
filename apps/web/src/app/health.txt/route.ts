export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";

export function GET() {
  return new Response('ok\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
