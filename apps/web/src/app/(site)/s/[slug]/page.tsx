export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import SiteHeader from "@/components/site/SiteHeader";
import RatingStars from "@/components/site/RatingStars";
import PlatformBadge from "@/components/site/PlatformBadge";
import Comments from "@/components/site/Comments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet } from "@/lib/public-api";
import Link from "next/link";

type Version = {
  id: string;
  version: string;
  channel: string;
  createdAt: string;
  builds?: {
    id: string;
    os: string;
    arch: string;
    kind: string;
    sizeBytes?: string | number | null;
  }[];
};

type Item = {
  id: string;
  slug: string;
  name: string;
  shortDesc?: string | null;
  longDesc?: string | null;
  category?: string | null;
  updatedAt: string;
  website?: string | null;
  versions?: Version[];
  media?: { url: string; kind: string }[];
};

type Resp = { ok: boolean; item: Item };


export default async function SoftwarePage({ params }: { params: { slug: string } }) {
  const data = await apiGet<Resp>(`/software/${params.slug}`);
  const item = data.item;

  const latest = item.versions?.[0];

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 grid gap-6 md:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* hero */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-5 py-4 flex items-center justify-between">
                <h1 className="text-xl md:text-2xl font-semibold">{item.name}</h1>
                <div className="text-right">
                  <div className="text-3xl font-bold tracking-tight">{
                    latest?.builds?.[0]?.sizeBytes ? `${Math.round(Number(latest.builds[0].sizeBytes) / (1024 * 1024))}MB` : ""
                  }</div>
                  <div className="text-xs text-muted-foreground">package size</div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <PlatformBadge os={latest?.builds?.[0]?.os ?? "WINDOWS"} />
                  {item.category && <Badge variant="secondary">{item.category}</Badge>}
                  <RatingStars value={4.4} />
                </div>

                {item.media?.length ? (
                  <div className="aspect-video w-full overflow-hidden rounded-xl border bg-muted" />
                ) : null}

                <p className="text-sm text-muted-foreground">{item.shortDesc}</p>

                <div className="grid gap-3">
                  <h3 className="font-semibold">Version history</h3>
                  <div className="divide-y rounded-xl border bg-card">
                    {(item.versions ?? []).map((v) => (
                      <div key={v.id} className="p-3 flex items-center gap-3">
                        <div className="font-mono">{v.version}</div>
                        <Badge variant="outline">{v.channel}</Badge>
                        <div className="text-xs text-muted-foreground">
                          {new Date(v.createdAt).toLocaleDateString()}
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          {(v.builds ?? []).map((b) => (
                            <Link key={b.id} href={`/download/${b.id}`}>
                              <Button size="sm" variant="secondary">
                                Download {b.kind}
                              </Button>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                    {!item.versions?.length && <div className="p-3 text-sm text-muted-foreground">No versions yet.</div>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* comments */}
          <Comments softwareId={item.id} />
        </section>

        {/* sidebar */}
        <aside className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="text-sm text-muted-foreground">Direct download</div>
              <Link href={latest?.builds?.[0] ? `/download/${latest.builds[0].id}` : "#"}>
                <Button className="w-full">Direct Download</Button>
              </Link>
              <Button variant="secondary" className="w-full">
                Add to Favorite
              </Button>
              <Link href="#history" className="text-sm text-muted-foreground hover:underline">
                Version history
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Product Information</div>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                </div>
                {item.website && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Website</span>
                    <a target="_blank" href={item.website} className="underline">
                      Visit
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </>
  );
}
