export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import type { Metadata, Route } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Browse downloads by software title and version.",
};

export default function DownloadsPage() {
  return (
    <div className="max-w-wrapper py-10 space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Downloads</h1>
      <p className="opacity-80 mt-1">
        Downloads are provided per software release. Browse the{" "}
        <Link href={"/software" as Route} className="underline hover:no-underline">
          Software
        </Link>{" "}
        list and open a title to see its available downloads.
      </p>
    </div>
  );
}
