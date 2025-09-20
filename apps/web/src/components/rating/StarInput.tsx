"use client";
import { useState } from "react";
import StarDisplay from "./StarDisplay";

export default function StarInput({
  slug,
  initialAvg,
  initialCount,
}: { slug: string; initialAvg: number; initialCount: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const [value, setValue] = useState<number>(0);
  const [avg, setAvg] = useState(initialAvg);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!value) return;
    setBusy(true);
    try {
      const r = await fetch(`/web-api/software/${encodeURIComponent(slug)}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: value }),
      });
      const j = await r.json();
      if (j.ok) { setAvg(j.avg); setCount(j.count); }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <StarDisplay value={avg} />
          <span className="text-sm text-gray-600">{avg.toFixed(2)} ({count})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setValue(n)}
                  className="p-0.5 text-yellow-500"
                  aria-label={`Rate ${n} stars`}
                >
                  <StarDisplay value={(hover ?? value) >= n ? 1 : 0} />
                </button>
              );
            })}
          </div>
          <button
            onClick={submit}
            disabled={busy || !value}
            className="text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
