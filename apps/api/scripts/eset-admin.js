// apps/api/scripts/reset-admin.js
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

    const updated = await prisma.user.update({
      where: { email },
      data: { passwordHash: hash, role: 'ADMIN', isActive: true, name },
      select: { id: true, email: true, role: true, isActive: true },
    }).catch(async (err) => {
      if (err.code === 'P2025') {
        // Not found → create
        return prisma.user.create({
          data: { email, passwordHash: hash, role: 'ADMIN', isActive: true, name },
          select: { id: true, email: true, role: true, isActive: true },
        });
      }
      throw err;
    });

    console.log('✅ Admin reset:', updated);
  } catch (e) {
    console.error('❌ Failed:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
