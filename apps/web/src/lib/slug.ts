// src/lib/slug.ts
export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/['".]+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
