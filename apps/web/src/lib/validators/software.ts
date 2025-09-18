// src/lib/validators/software.ts
import { z } from "zod";

/**
 * Be intentionally permissive (admin UI is trusted):
 * - strings are trimmed
 * - optional/nullables allowed
 * - URLs are not hard-validated to avoid false negatives from private links
 */

export const DownloadsSchema = z
  .object({
    direct: z.string().trim().optional().nullable(),
    torrent: z.string().trim().optional().nullable(),
  })
  .partial();

export const SeoSchema = z
  .object({
    focusKeyword: z.string().trim().optional().nullable(),
  })
  .partial();

export const SoftwareMetaSchema = z
  .object({
    featuredImage: z.string().trim().optional().nullable(),
    downloads: DownloadsSchema.optional(),
    tags: z.array(z.string().trim()).max(50).optional(),
    seo: SeoSchema.optional(),
  })
  .partial();

export const SoftwareCreateSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  shortDesc: z.string().trim().optional().nullable(),
  longDesc: z.string().trim().optional().nullable(),
  category: z.string().trim().optional().nullable(),
  website: z.string().trim().optional().nullable(),
  license: z.string().trim().optional().nullable(),
  published: z.boolean().optional(),
  meta: SoftwareMetaSchema.optional(),
});

export const SoftwareUpdateSchema = SoftwareCreateSchema.partial().extend({
  // control flags
  touch: z.boolean().optional(),
});

export type SoftwareCreateInput = z.infer<typeof SoftwareCreateSchema>;
export type SoftwareUpdateInput = z.infer<typeof SoftwareUpdateSchema>;
export type SoftwareMetaInput = z.infer<typeof SoftwareMetaSchema>;
