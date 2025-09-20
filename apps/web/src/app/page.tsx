// src/app/page.tsx
import Link from "next/link";

function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-max h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg tracking-tight hover:opacity-90">
          Filespay
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/category/windows" className="hover:underline">Windows</Link>
          <Link href="/category/mac" className="hover:underline">macOS</Link>
          <Link href="/category/ios" className="hover:underline">iOS</Link>
          <Link href="/category/android" className="hover:underline">Android</Link>
          <Link href="/category/games" className="hover:underline">Games</Link>
        </nav>

        <div className="flex md:hidden">
          <a href="#sections" className="rounded-lg border px-3 py-1.5 text-sm">Menu</a>
        </div>
      </div>
    </header>
  );
}

function SectionTitle({
  eyebrow,
  title,
  trailing,
}: {
  eyebrow?: string;
  title: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="container-max mb-4 mt-10 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{eyebrow}</div>
        ) : null}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {trailing ? <div className="text-sm">{trailing}</div> : null}
    </div>
  );
}

type AppCardProps = {
  title: string;
  sub: string;
  tint: "cyan" | "violet" | "blue";
};

function AppCard({ title, sub, tint }: AppCardProps) {
  const tints = {
    cyan:  "bg-cyan-50 border-cyan-200/60 hover:bg-cyan-100/50 shadow-[0_6px_24px_-6px_rgba(6,182,212,.35)]",
    violet:"bg-violet-50 border-violet-200/60 hover:bg-violet-100/50 shadow-[0_6px_24px_-6px_rgba(139,92,246,.35)]",
    blue:  "bg-blue-50 border-blue-200/60 hover:bg-blue-100/50 shadow-[0_6px_24px_-6px_rgba(43,134,255,.35)]",
  } as const;

  return (
    <Link
      href="#"
      className={`rounded-2xl border p-4 transition-shadow ${tints[tint]}`}
    >
      <div className="text-lg font-medium">{title}</div>
      <div className="text-sm text-muted-foreground">{sub}</div>
    </Link>
  );
}

function FeatureCard() {
  return (
    <div className="rounded-2xl border bg-white/70 dark:bg-white/5 p-5 shadow-brand">
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Driver Easy Professional 6.1.1.29</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Video Editor • 2 years ago • <span className="inline-flex items-center">★ 5.0</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-foreground/80">
            Video Editing Simplified — Ignite Your Story. A powerful and intuitive video editing
            experience. Filmora 10 has two new ways to edit:
          </p>
          <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="badge">761 MB</span>
            <Link href="/download/wondershare-filmora" className="btn btn-primary rounded-xl">
              Download
            </Link>
          </div>
        </div>
        <div className="w-full sm:w-64 aspect-video rounded-xl border bg-gradient-to-br from-blue-200 to-cyan-200" />
      </div>
    </div>
  );
}

export default function HomePage() {
  // demo content to visualize colors
  const quickLinks = [
    { title: "Windows", sub: "Popular PC apps", tint: "blue"   as const },
    { title: "macOS",   sub: "Tools for your Mac", tint: "violet" as const },
    { title: "Android", sub: "Mobile utilities & apps", tint: "cyan"  as const },
  ];

  const upcomings = [
    "CapCut", "Grand Theft Auto V", "Lightroom", "Photo Drop", "Language Game", "Lightroom Photo",
  ];

  return (
    <>
      <Header />

      {/* HERO with strong visible gradients */}
      <section
        className="
          relative border-b
          bg-[radial-gradient(1200px_600px_at_15%_-10%,rgba(43,134,255,.35),transparent_60%),
              radial-gradient(1100px_600px_at_110%_10%,rgba(6,182,212,.38),transparent_55%)]
        "
      >
        <div className="container-max relative py-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 bg-clip-text text-transparent">
                Download Your Desired App For Free
              </span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Explore trending, new, and top software by platform and license.
            </p>
          </div>

          {/* Search */}
          <form action="/search" className="mt-6">
            <div className="max-w-2xl rounded-2xl border bg-white/70 p-2 shadow-glow backdrop-blur dark:bg-white/10">
              <div className="flex items-center gap-3 px-2">
                <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-60" aria-hidden>
                  <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.48-5.34C15.16 5.59 12.53 3 9.5 3S3.84 5.59 3.84 8.39s2.63 5.39 5.66 5.39c1.61 0 3.09-.59 4.22-1.57l.27.28v.79l4.25 4.25c.41.41 1.07.41 1.49 0c.41-.42.41-1.08 0-1.49L15.5 14Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14Z"/>
                </svg>
                <input
                  name="q"
                  placeholder="Search here"
                  className="h-10 w-full bg-transparent outline-none placeholder:text-muted-foreground/70"
                />
                <button className="btn btn-primary h-10 rounded-xl px-4">Search</button>
              </div>
            </div>
          </form>

          {/* Quick links row with colored cards */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {quickLinks.map((x, i) => (
              <AppCard key={i} title={x.title} sub={x.sub} tint={x.tint} />
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR APPS */}
      <SectionTitle
        eyebrow="Popular Apps"
        title="Popular · Most View · New"
        trailing={<Link href="/popular" className="hover:underline">View All</Link>}
      />
      <div className="container-max grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FeatureCard />
        <FeatureCard />
        <FeatureCard />
        <FeatureCard />
      </div>

      {/* UPCOMINGS */}
      <SectionTitle eyebrow="Upcomings" title="Coming Soon & Trending Hype" />
      <div className="container-max">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {upcomings.map((u, i) => (
            <span key={i} className="badge whitespace-nowrap">{u}</span>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-14 border-t">
        <div className="container-max py-8 text-sm text-muted-foreground">
          © 2024 Filespay — All rights reserved.
        </div>
      </footer>
    </>
  );
}
