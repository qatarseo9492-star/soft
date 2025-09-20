"use client";

import { useState } from "react";

export default function CommentForm({ slug }: { slug: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // optional but enables anti-spam throttle
  const [content, setContent] = useState("");
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hp, setHp] = useState(""); // honeypot

  const submit = async () => {
    setOk(null); setErr(null);
    if (hp) { setErr("Bot detected"); return; } // bots fill hidden
    if (content.trim().length < 5) { setErr("Please write a longer comment."); return; }

    setBusy(true);
    try {
      const r = await fetch(`/web-api/software/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, content }),
      });
      const j = await r.json().catch(()=>({ ok:false }));
      if (j.ok) {
        setOk("Thanks! Your comment is awaiting moderation.");
        setName(""); setEmail(""); setContent("");
      } else {
        setErr(j.error || "Failed to post");
      }
    } catch {
      setErr("Failed to post");
    } finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <input
          value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (not published)"
          className="border border-gray-300 rounded-lg px-3 py-2" type="email"
        />
      </div>
      {/* Honeypot (hidden) */}
      <input
        value={hp} onChange={e=>setHp(e.target.value)}
        className="hidden" aria-hidden="true" tabIndex={-1} placeholder="Leave blank"
      />
      <textarea
        value={content} onChange={e=>setContent(e.target.value)} placeholder="Write your comment…"
        rows={4} className="mt-3 w-full border border-gray-300 rounded-lg px-3 py-2"
      />
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-gray-500">Comments are reviewed before publishing.</div>
        <button
          onClick={submit} disabled={busy}
          className="text-sm px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
        >
          {busy ? "Posting…" : "Post comment"}
        </button>
      </div>
      {ok && <div className="mt-2 text-green-700 text-sm">{ok}</div>}
      {err && <div className="mt-2 text-red-700 text-sm">{err}</div>}
    </div>
  );
}
