import MeiliSearch from "meilisearch";

export function getMeili() {
  const host = process.env.MEILI_HOST;
  if (!host) return null;
  return new MeiliSearch({
    host,
    apiKey: process.env.MEILI_KEY || undefined,
  });
}

export const MEILI_INDEX = process.env.MEILI_INDEX || "software";

export type SearchDoc = {
  id: string;
  slug: string;
  name: string;
  shortDesc?: string | null;
  category?: string | null;
  published: boolean;
  updatedAt: string; // ISO
};
