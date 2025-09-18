// No Prisma enum imports needed here.

export type SortOption = 'updated' | 'new' | 'rating' | 'name' | 'downloads';

export class CreateSoftwareDto {
  name!: string;
  slug!: string;
  categoryId!: string;

  vendorId?: string;
  isFree?: boolean;
  shortDesc?: string;
  longDesc?: string;
  iconUrl?: string;
  heroUrl?: string;
  websiteUrl?: string;

  // Homepage/list badges
  isLatest?: boolean;
  isUpdated?: boolean;
  isRecommended?: boolean;
  isNew?: boolean;

  status?: string; // 'published' | 'draft' etc.
  tags?: string[]; // optional tag slugs
}

export class UpdateSoftwareDto extends CreateSoftwareDto {}
