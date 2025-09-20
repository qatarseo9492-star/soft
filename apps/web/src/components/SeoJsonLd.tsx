import Script from "next/script";

export default function SeoJsonLd({ data }: { data: any }) {
  return (
    <Script id="ld-json" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
