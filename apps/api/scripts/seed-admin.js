// apps/api/scripts/seed-admin.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@filespay.org';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const name = process.env.ADMIN_NAME || 'Admin';

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: hash, role: 'ADMIN', isActive: true, name },
      create: { email, passwordHash: hash, role: 'ADMIN', isActive: true, name },
      select: { id: true, email: true, role: true, isActive: true },
    });

    console.log('✅ Seeded admin:', user);
  } catch (e) {
    console.error('❌ Failed:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
