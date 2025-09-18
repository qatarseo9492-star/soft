import { JsonLd } from "./JsonLd";
export function SoftwareJsonLd({ s }: { s: any }) {
  const latest = s.versions?.[0];
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": s.name,
    "applicationCategory": "SoftwareApplication",
    "operatingSystem": [...new Set((s.versions||[]).map((v:any)=>v.os))].join(", "),
    "softwareVersion": latest?.version,
    "offers": { "@type":"Offer", "price": s.isFree ? "0" : "0", "priceCurrency":"USD", "category": latest?.license || "Free" },
    "description": s.shortDesc
  };
  return <JsonLd data={data} />;
}
