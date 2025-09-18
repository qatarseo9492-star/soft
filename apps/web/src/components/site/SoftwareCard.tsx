import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import RatingStars from "./RatingStars";
import PlatformBadge from "./PlatformBadge";

type Item = {
  id: string;
  slug: string;
  name: string;
  shortDesc?: string | null;
  category?: string | null;
  updatedAt: string;
  versions?: { version: string; channel: string; createdAt: string }[];
  meta?: { os?: string; size?: string | number; reputation?: number };
};

export default function SoftwareCard({ item }: { item: Item }) {
  const sizeLabel =
    typeof item.meta?.size === "number" ? `${Math.round((item.meta?.size as number) / (1024 * 1024))}MB` : item.meta?.size;

  return (
    <Card className="group overflow-hidden border shadow-sm hover:shadow-md transition">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Logo placeholder */}
          <div className="size-12 shrink-0 rounded-xl bg-primary/10 grid place-content-center text-primary font-bold">
            {item.name.slice(0, 1).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <Link href={`/s/${item.slug}`} className="line-clamp-1 font-medium hover:underline">
              {item.name}
            </Link>
            <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.shortDesc ?? "—"}</div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <PlatformBadge os={item.meta?.os ?? item.versions?.[0]?.channel} />
              {item.category && <Badge variant="secondary">{item.category}</Badge>}
              <div className="ml-auto flex items-center gap-2">
                <RatingStars value={item.meta?.reputation ?? 4.2} />
                {sizeLabel && <span className="text-muted-foreground">{sizeLabel}</span>}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
