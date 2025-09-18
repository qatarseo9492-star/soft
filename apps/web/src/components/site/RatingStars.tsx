"use client";
import { Star } from "lucide-react";
export default function RatingStars({ value = 4.2, size = 14 }: { value?: number; size?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} style={{ width: size, height: size }} className="fill-yellow-400 text-yellow-400" />
      ))}
      {half === 1 && (
        <Star style={{ width: size, height: size }} className="text-yellow-400">
          {/* outline star (half look) */}
        </Star>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} style={{ width: size, height: size }} className="text-muted-foreground" />
      ))}
    </div>
  );
}
