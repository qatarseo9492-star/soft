export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Ensure valid JSON without XSS vectors
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
