/* npx ts-node prisma/seed.ts (or configure "prisma": { "seed": "ts-node prisma/seed.ts" }) */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const vendor = await prisma.vendor.upsert({
    where: { name: 'AcmeSoft' },
    update: {},
    create: { name: 'AcmeSoft', website: 'https://acme.example' },
  });

  const cat = await prisma.category.upsert({
    where: { slug: 'video' },
    update: {},
    create: { slug: 'video', name: 'Video' },
  });

  const sw = await prisma.software.upsert({
    where: { slug: 'filmora' },
    update: {},
    create: {
      slug: 'filmora',
      name: 'Filmora',
      vendorId: vendor.id,
      license: 'Pro',
      os: ['Windows','macOS'] as any,
      tags: ['editor','video'] as any,
      description: 'Video editor.',
      updatedAt: new Date(),
      categories: { create: [{ categoryId: cat.id }] },
    },
  });

  const v = await prisma.version.create({
    data: { softwareId: sw.id, version: '14.0.1', releasedAt: new Date() },
  });

  await prisma.build.create({
    data: {
      versionId: v.id,
      os: 'Windows',
      arch: 'x64',
      sizeMB: 300,
      sha256: 'a'.repeat(64),
      downloadUrl: 'https://example.com/downloads/filmora-14-win-x64.exe',
      mirrors: { create: [{ title: 'Primary', url: 'https://example.com/downloads/filmora-14-win-x64.exe', priority: 10 }] },
    },
  });
}

main().finally(() => prisma.$disconnect());
