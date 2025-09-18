// apps/web/src/components/home/RecentlyReleasedList.tsx
import Link from "next/link";

const rows = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  title: "Driver Easy Professional 6.1.1.29",
  meta: "Video Editor 2  years ago 5.0", // note the two spaces before 'years'
  lines: [
    "Video Editing Simplified - Ignite Your Story. A powerful",
    "and intuitive video editing experience. Filmora 10hash",
    "two new ways to edit:",
  ],
  size: "761 MB",
  cta: "Dowload", // kept EXACT spelling
}));

export default function RecentlyReleasedList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {rows.map((r) => (
        <article
          key={r.id}
          className="rounded-2xl border border-gray-200 p-5 bg-white flex flex-col justify-between"
        >
          <div>
            <h4 className="text-lg font-semibold">{r.title}</h4>
            <div className="text-xs text-gray-500 mt-1">{r.meta}</div>

            <div className="mt-3 text-sm text-gray-700 space-y-1">
              {r.lines.map((ln, i) => (
                <p key={i}>{ln}</p>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">{r.size}</div>
            <Link
              href="#"
              className="text-sm px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100"
            >
              {r.cta}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
