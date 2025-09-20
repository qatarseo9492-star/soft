"use client";

import { useEffect, useState } from "react";

type C = { id: string; name: string | null; content: string; createdAt: string };

export default function CommentsList({ slug }: { slug: string }) {
  const [items, setItems] = useState<C[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/web-api/software/${encodeURIComponent(slug)}/comments`, { cache: "no-store" });
        const j = await r.json();
        if (alive) setItems(j.items || []);
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [slug]);

  if (loading) return <div className="text-sm text-gray-500">Loading comments…</div>;
  if (!items.length) return <div className="text-sm text-gray-500">No comments yet.</div>;

  return (
    <div className="space-y-4">
      {items.map(c => (
        <div key={c.id} className="rounded-xl border bg-white p-4">
          <div className="text-sm font-medium">{c.name || "Anonymous"}</div>
          <div className="mt-1 text-[12px] text-gray-500">
            {new Date(c.createdAt).toLocaleString()}
          </div>
          <p className="mt-2 text-gray-800 text-[15px] leading-6 whitespace-pre-wrap break-words">
            {c.content}
          </p>
        </div>
      ))}
    </div>
  );
}
