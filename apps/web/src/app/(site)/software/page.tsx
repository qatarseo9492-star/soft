export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
export const metadata = {
  title: "Software — FilesPay",
  description: "Browse software list",
  alternates: { canonical: "/software" },
};

export default function Page() {
  return (
    <div className="max-w-wrapper py-10">
      <h1 className="text-3xl font-semibold">Software</h1>
      <p className="opacity-80 mt-2">List of software goes here.</p>
    </div>
  );
}
