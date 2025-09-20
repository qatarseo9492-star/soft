import { approveComment, deleteComment } from "./actions";

export const dynamic = "force-dynamic";

async function loadPending() {
  const key = process.env.ADMIN_API_KEY || "";
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  const r = await fetch(`${base}/web-api/admin/comments/pending`, {
    headers: { "x-admin-key": key },
    cache: "no-store",
  });
  if (!r.ok) return [];
  const j = await r.json();
  return j.items || [];
}

export default async function Page() {
  const items = await loadPending();

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Pending Comments</h1>
      <div className="mt-4 space-y-3">
        {items.map((c: any) => (
          <div key={c.id} className="rounded-lg border bg-white p-4">
            <div className="text-sm text-gray-500">
              on <a className="underline" href={`/software/${c.software.slug}`} target="_blank">
                {c.software.name}
              </a> • {new Date(c.createdAt).toLocaleString()}
            </div>
            <div className="font-medium mt-1">{c.name || "Anonymous"} {c.email ? `· ${c.email}` : ""}</div>
            <p className="mt-2 text-gray-800 whitespace-pre-wrap break-words">{c.content}</p>
            <div className="mt-3 flex items-center gap-2">
              <form action={async () => { "use server"; await approveComment(c.id); }}>
                <button className="px-3 py-1.5 text-sm rounded-md border bg-green-50 hover:bg-green-100">Approve</button>
              </form>
              <form action={async () => { "use server"; await deleteComment(c.id); }}>
                <button className="px-3 py-1.5 text-sm rounded-md border bg-red-50 hover:bg-red-100">Delete</button>
              </form>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-500">No pending comments 🎉</div>}
      </div>
    </main>
  );
}
