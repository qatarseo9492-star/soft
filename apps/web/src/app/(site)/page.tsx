export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import SiteHeader from "@/components/site/SiteHeader";
import SoftwareCard from "@/components/site/SoftwareCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet } from "@/lib/public-api";

type ListItem = {
  id: string;
  slug: string;
  name: string;
  shortDesc?: string | null;
  category?: string | null;
  updatedAt: string;
  versions?: { version: string; channel: string; createdAt: string }[];
};

type ListResp = { ok: boolean; items?: ListItem[]; nextCursor?: string | null };


export default async function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const os = typeof searchParams.os === "string" ? searchParams.os : undefined;
  const cat = typeof searchParams.cat === "string" ? searchParams.cat : undefined;

  const url = new URL("/admin/software", "http://local");
  url.searchParams.set("take", "24");
  if (os) url.searchParams.set("os", os);
  if (cat) url.searchParams.set("category", cat);

  const data = await apiGet<ListResp>(`${url.pathname}?${url.searchParams}`);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{os ? `Software — ${os}` : "Trending Software"}</span>
              {/* optional view all */}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2">
              {(data.items ?? []).map((item) => (
                <SoftwareCard key={item.id} item={{ ...item, meta: { os: os ?? undefined, reputation: 4.4 } }} />
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
