import db from "@/app/web-api/_lib/db";

export const dynamic = "force-dynamic";

export default async function Page() {
  const rows = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, rating: true, title: true, createdAt: true,
      software: { select: { id: true, name: true, slug: true } },
      user: { select: { email: true, name: true } },
    },
  });
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Recent Reviews</h1>
      <div className="mt-4 space-y-3">
        {rows.map(r=>(
          <div key={r.id} className="rounded-lg border p-3 bg-white text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium">{r.software.name}</div>
              <div className="text-yellow-600">★ {r.rating}</div>
            </div>
            <div className="text-gray-600">{r.title ?? ""}</div>
            <div className="text-[12px] text-gray-500">
              by {r.user.name || r.user.email} • {new Date(r.createdAt).toLocaleString()}
            </div>
            <a className="text-xs underline" href={`/software/${r.software.slug}`} target="_blank">Open page</a>
          </div>
        ))}
        {rows.length === 0 && <div className="text-sm text-gray-500">No reviews yet.</div>}
      </div>
    </main>
  );
}
