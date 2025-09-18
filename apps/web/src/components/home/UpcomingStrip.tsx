// apps/web/src/components/home/UpcomingStrip.tsx
export default function UpcomingStrip() {
  // EXACT text sequence from mockup
  const items = [
    "CapCut",
    "Grand Theft Auto V",
    "Lightroom Photo",
    "Drop Language Game",
    "Lightroom Photo",
  ];
  return (
    <div className="rounded-2xl border border-gray-200 p-4 bg-white">
      <div className="flex flex-wrap gap-3 text-sm">
        {items.map((t, i) => (
          <span key={i} className="px-3 py-1 rounded-full bg-gray-100">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
