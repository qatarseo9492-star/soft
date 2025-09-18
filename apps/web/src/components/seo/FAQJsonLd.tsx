import { JsonLd } from "./JsonLd";
export function FAQJsonLd({ faqs }: { faqs: any[] }) {
  if (!faqs?.length) return null;
  const data = {
    "@context":"https://schema.org",
    "@type":"FAQPage",
    "mainEntity": faqs.map(f=>({ "@type":"Question", "name":f.question, "acceptedAnswer":{ "@type":"Answer", "text":f.answer }}))
  };
  return <JsonLd data={data} />;
}
