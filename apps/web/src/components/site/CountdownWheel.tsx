"use client";

import { useEffect, useMemo, useState } from "react";

export default function CountdownWheel({
  seconds = 10,
  onFinish,
  label = "Generating Download Link",
}: {
  seconds?: number;
  onFinish?: () => void;
  label?: string;
}) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const [t, setT] = useState(seconds);

  useEffect(() => {
    if (t <= 0) return void onFinish?.();
    const id = setTimeout(() => setT((x) => x - 1), 1000);
    return () => clearTimeout(id);
  }, [t, onFinish]);

  const progress = useMemo(() => ((seconds - t) / seconds) * circumference, [t, seconds, circumference]);

  return (
    <div className="flex items-center gap-4">
      <svg width="90" height="90" viewBox="0 0 80 80" className="drop-shadow-sm">
        <circle cx="40" cy="40" r={radius} stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="fill-foreground font-semibold"
        >
          {t}s
        </text>
      </svg>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-xs text-muted-foreground/80">Your link will be ready in a moment…</div>
      </div>
    </div>
  );
}
