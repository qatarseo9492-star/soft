"use client";
import { Star } from "lucide-react";

export default function RatingStars({ value = 0, size = 16 }: { value?: number; size?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${value.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && half);
        return <Star key={i} size={size} className={filled ? "fill-yellow-400 text-yellow-400" : "text-neutral-300"} />;
      })}
      <span className="ml-1 text-xs text-neutral-600">{value?.toFixed(1)}</span>
    </div>
  );
}
