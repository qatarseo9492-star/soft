// apps/api/scripts/seed.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log('🌱 Seeding database...');

    // Basic taxonomy
    const categories = ['Utilities', 'Video Editors', 'Browsers', 'Security'];
    for (const name of categories) {
      await prisma.category.upsert({
        where: { slug: name.toLowerCase().replace(/\s+/g, '-') },
        update: {},
        create: { name, slug: name.toLowerCase().replace(/\s+/g, '-') },
      });
    }

    // Optional vendor + example software
    const vendor = await prisma.vendor.upsert({
      where: { slug: 'example-vendor' },
      update: {},
      create: { name: 'Example Vendor', slug: 'example-vendor', website: 'https://example.com' },
    });

    const cat = await prisma.category.findUnique({ where: { slug: 'utilities' } });

    await prisma.software.upsert({
      where: { slug: 'filespay-desktop' },
      update: {},
      create: {
        slug: 'filespay-desktop',
        name: 'FilesPay Desktop',
        isFree: true,
        shortDesc: 'Secure file downloads with signed links and stats.',
        categoryId: cat.id,
        vendorId: vendor.id,
        websiteUrl: 'https://filespay.org',
        publishedAt: new Date(),
        status: 'published',
      },
    });

    console.log('✅ Seed complete.');
  } catch (e) {
    console.error('❌ Seed failed:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
