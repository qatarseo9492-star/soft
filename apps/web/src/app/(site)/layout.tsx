export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// src/app/(site)/layout.tsx
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      // same premium background vibe used in admin, now for the site
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(1200px 600px at 20% -10%, hsl(200 90% 20% / 0.18), transparent 55%)," +
          "radial-gradient(1000px 500px at 120% -10%, hsl(267 83% 40% / 0.14), transparent 50%)," +
          "linear-gradient(180deg, hsl(248 86% 7%) 0%, hsl(248 86% 5%) 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      {children}
    </div>
  );
}
