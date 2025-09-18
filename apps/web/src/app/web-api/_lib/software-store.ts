import db from "./db";
import type { Prisma, Software, SoftwareVersion } from "@prisma/client";

/* ===========================
   Software helpers / types
   =========================== */

export type UpsertSoftwareInput = {
  name?: string;
  slug?: string;
  categoryId?: string;
  vendorId?: string | null;
  shortDesc?: string | null;
  longDesc?: string | null;
  iconUrl?: string | null;
  heroUrl?: string | null;
  websiteUrl?: string | null;
  isFree?: boolean;
  /** UI boolean; mapped to publishedAt timestamp */
  published?: boolean;
  /** explicit timestamp if needed */
  publishedAt?: Date | string | null;
};

export function toCreateData(input: UpsertSoftwareInput): Prisma.SoftwareCreateInput {
  return {
    name: String(input.name ?? ""),
    slug: String(input.slug ?? ""),
    category: { connect: { id: String(input.categoryId) } },
    vendor: input.vendorId ? { connect: { id: String(input.vendorId) } } : undefined,
    shortDesc: input.shortDesc ?? null,
    longDesc: input.longDesc ?? null,
    iconUrl: input.iconUrl ?? null,
    heroUrl: input.heroUrl ?? null,
    websiteUrl: input.websiteUrl ?? null,
    isFree: typeof input.isFree === "boolean" ? input.isFree : true,
    publishedAt:
      typeof input.published === "boolean"
        ? input.published
          ? new Date()
          : null
        : input.publishedAt
        ? (typeof input.publishedAt === "string" ? new Date(input.publishedAt) : input.publishedAt)
        : null,
  };
}

export function toUpdateData(input: UpsertSoftwareInput): Prisma.SoftwareUpdateInput {
  const data: Prisma.SoftwareUpdateInput = {};
  if (input.name !== undefined) data.name = String(input.name);
  if (input.slug !== undefined) data.slug = String(input.slug);
  if (input.categoryId !== undefined) data.category = { connect: { id: String(input.categoryId) } };
  if (input.vendorId !== undefined) data.vendor = input.vendorId ? { connect: { id: String(input.vendorId) } } : { disconnect: true };
  if (input.shortDesc !== undefined) data.shortDesc = input.shortDesc ?? null;
  if (input.longDesc !== undefined) data.longDesc = input.longDesc ?? null;
  if (input.iconUrl !== undefined) data.iconUrl = input.iconUrl ?? null;
  if (input.heroUrl !== undefined) data.heroUrl = input.heroUrl ?? null;
  if (input.websiteUrl !== undefined) data.websiteUrl = input.websiteUrl ?? null;
  if (input.isFree !== undefined) data.isFree = !!input.isFree;

  if (typeof input.published === "boolean") {
    data.publishedAt = input.published ? new Date() : null;
  } else if (input.publishedAt !== undefined) {
    data.publishedAt =
      input.publishedAt === null ? null : typeof input.publishedAt === "string" ? new Date(input.publishedAt) : input.publishedAt;
  }
  return data;
}

export function presentSoftware(s: Software) {
  return { ...s, published: !!s.publishedAt };
}

export async function createSoftware(input: UpsertSoftwareInput) {
  const created = await db.software.create({ data: toCreateData(input) });
  return presentSoftware(created);
}

/* ===========================
   Version helpers / types
   =========================== */

export type VersionUpsertInput = {
  version?: string;
  os?: string;
  license?: string;
  changelog?: string | null;
  releasedAt?: string | Date | null;
};

export type VersionItem = SoftwareVersion;

function toVersionUpdate(data: VersionUpsertInput): Prisma.SoftwareVersionUpdateInput {
  const u: Prisma.SoftwareVersionUpdateInput = {};
  if (data.version !== undefined) u.version = String(data.version);
  if (data.os !== undefined) u.os = String(data.os);
  if (data.license !== undefined) u.license = String(data.license);
  if (data.changelog !== undefined) u.changelog = data.changelog ?? null;
  if (data.releasedAt !== undefined) {
    u.releasedAt =
      data.releasedAt === null ? null : typeof data.releasedAt === "string" ? new Date(data.releasedAt) : data.releasedAt;
  }
  return u;
}

export async function createVersion(softwareId: string, input: VersionUpsertInput): Promise<VersionItem> {
  const created = await db.softwareVersion.create({
    data: {
      software: { connect: { id: softwareId } },
      version: String(input.version ?? "1.0.0"),
      os: String(input.os ?? "Windows"),
      license: String(input.license ?? "Free"),
      changelog: input.changelog ?? null,
      releasedAt:
        input.releasedAt == null ? null : typeof input.releasedAt === "string" ? new Date(input.releasedAt) : input.releasedAt,
    },
  });
  return created;
}

export async function getVersion(versionId: string): Promise<VersionItem | null> {
  return db.softwareVersion.findUnique({ where: { id: versionId } });
}

export async function updateVersion(versionId: string, input: VersionUpsertInput): Promise<VersionItem> {
  return db.softwareVersion.update({
    where: { id: versionId },
    data: toVersionUpdate(input),
  });
}

export async function deleteVersion(versionId: string): Promise<void> {
  await db.softwareVersion.delete({ where: { id: versionId } });
}
