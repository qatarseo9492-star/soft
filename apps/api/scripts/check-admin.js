// apps/api/scripts/check-admin.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@filespay.org';
    const testPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const u = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, isActive: true, passwordHash: true },
    });

    console.log({
      exists: !!u,
      id: u?.id,
      role: u?.role,
      isActive: u?.isActive,
      hashPrefix: u?.passwordHash?.slice(0, 4),
    });

    if (u?.passwordHash) {
      const ok = await bcrypt.compare(testPassword, u.passwordHash);
      console.log('matches:', ok);
    }
  } catch (e) {
    console.error('❌ Failed:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
