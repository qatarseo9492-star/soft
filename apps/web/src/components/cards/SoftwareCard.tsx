import Image from "next/image";
import Link from "next/link";
import RatingStars from "@/components/RatingStars";

export type CardItem = {
  id: string;
  slug: string;
  name: string;
  iconUrl?: string | null;
  version?: string | null;
  rating?: number | null;
  category?: { name: string; slug: string } | null;
};

export default function SoftwareCard({ item }: { item: CardItem }) {
  return (
    <Link href={`/software/${item.slug}`} className="card hover:shadow-lg hover:-translate-y-0.5 transition p-4 block">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-100">
          {item.iconUrl ? (
            <Image src={item.iconUrl} alt={item.name} fill className="object-cover" sizes="48px" />
          ) : (
            <div className="w-full h-full grid place-items-center text-neutral-400 text-xs">ICON</div>
          )}
        </div>
        <div className="min-w-0">
          <div className="font-semibold truncate">{item.name}</div>
          <div className="text-xs text-neutral-600 truncate">
            {item.version ? `v${item.version}` : "—"}
            {item.category ? ` • ${item.category.name}` : ""}
          </div>
          <div className="mt-1">
            <RatingStars value={item.rating ?? 5} size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
}
