// apps/api/scripts/create-admin.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      out[key] = val;
    }
  }
  return out;
}

(async () => {
  const prisma = new PrismaClient();
  try {
    const args = parseArgs(process.argv);
    const email = args.email || process.env.ADMIN_EMAIL || 'admin@filespay.org';
    const password = args.password || process.env.ADMIN_PASSWORD || 'admin123';
    const name = args.name || process.env.ADMIN_NAME || 'Admin';

    if (!email || !password) {
      console.error('Missing --email or --password (or ADMIN_EMAIL / ADMIN_PASSWORD in env).');
      process.exit(1);
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: hash, role: 'ADMIN', isActive: true, name },
      create: { email, passwordHash: hash, role: 'ADMIN', isActive: true, name },
      select: { id: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });

    console.log('✅ Admin upserted:', user);
  } catch (e) {
    console.error('❌ Failed:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
