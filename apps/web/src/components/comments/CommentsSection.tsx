"use client";

import { useEffect, useState } from "react";

type Props = {
  slug: string;
  softwareId?: string; // ← make optional so <CommentsSection slug={s.slug} softwareId={s.id} /> compiles
};

type CommentItem = {
  id: string;
  name: string | null;
  content: string;
  createdAt: string;
};

export default function CommentsSection({ slug, softwareId }: Props) {
  const [items, setItems] = useState<CommentItem[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function load() {
    try {
      setErr(null);
      const r = await fetch(`/web-api/software/${encodeURIComponent(slug)}/comments`, { cache: "no-store" });
      if (!r.ok) throw new Error("Failed to load comments");
      const j = await r.json();
      setItems(Array.isArray(j.items) ? j.items : []);
    } catch (e: any) {
      setErr(e?.message || "Error");
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [slug]);

  async function submit() {
    if (!content.trim()) return;
    setBusy(true); setErr(null); setOk(null);
    try {
      const res = await fetch(`/web-api/software/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || null,
          content,
          softwareId: softwareId ?? undefined, // passed through if available
        }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      setContent("");
      setOk("Comment submitted. It will appear after approval.");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">Comments</h3>

      {err && <div className="text-sm text-red-600">{err}</div>}
      {ok && <div className="text-sm text-green-600">{ok}</div>}

      <div className="rounded-xl border border-gray-200 p-4 space-y-2">
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[90px]"
          placeholder="Write a helpful comment…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            onClick={submit}
            disabled={busy || !content.trim()}
            className="text-sm px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
          >
            {busy ? "Posting…" : "Post"}
          </button>
        </div>
      </div>

      <div className="divide-y">
        {items.length === 0 && <div className="text-sm text-gray-500 py-3">No comments yet.</div>}
        {items.map((c) => (
          <div key={c.id} className="py-3">
            <div className="text-sm font-medium">{c.name || "Anonymous"}</div>
            <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
            <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
