// apps/web/src/components/home/PopularGrid.tsx
import Link from "next/link";

const cards = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  category: "Video Editor",
  title: "Wondershare Filmora",
  version: "14.0.11.9772",
  rating: "5.0",
}));

export default function PopularGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((c) => (
        <article
          key={c.id}
          className="rounded-2xl border border-gray-200 p-5 bg-white"
        >
          <div className="text-xs text-gray-500">{c.category}</div>
          <h4 className="text-lg font-semibold mt-1">{c.title}</h4>
          <div className="text-sm text-gray-600 mt-0.5">{c.version}</div>
          <div className="text-sm font-medium mt-3">{c.rating}</div>
          {/* No changes to labels/values, links are placeholders */}
          <div className="mt-4">
            <Link href="#" className="text-sm underline">
              View
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
