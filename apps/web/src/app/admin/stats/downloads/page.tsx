export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";

export default function AdminDownloadsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80">
        <h1 className="text-xl font-semibold text-white">Downloads — Admin</h1>
        <p className="mt-2 text-sm text-white/70">
          Placeholder page. Wire this to /web-api/admin/stats/downloads when ready.
        </p>
      </div>
    </div>
  );
}
