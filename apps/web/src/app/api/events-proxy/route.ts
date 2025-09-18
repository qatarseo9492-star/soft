// Small proxy to the API SSE so we don't fight CORS with EventSource.
export async function GET() {
  const base = process.env.API_BASE_SERVER;
  if (!base) return new Response("API_BASE_SERVER not set", { status: 500 });

  const upstream = await fetch(`${base}/v1/events`, { headers: { Accept: "text/event-stream" } });
  const { readable, writable } = new TransformStream();
  // Pipe the SSE stream through
  upstream.body?.pipeTo(writable).catch(() => {});
  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
