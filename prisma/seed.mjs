// prisma/seed.mjs
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const email = process.env.ADMIN_EMAIL || 'admin@example.com';
const pwd = process.env.ADMIN_PASSWORD;

if (!pwd && process.env.NODE_ENV === 'production') {
  console.error('ADMIN_PASSWORD missing in production.');
  process.exit(1);
}
const password = pwd || 'adminadmin'; // DEV DEFAULT ONLY
const hash = await bcrypt.hash(password, 12);

try {
  await prisma.user.upsert({
    where: { email },
    update: { password: hash, role: 'ADMIN', name: 'Admin' },
    create: { email, name: 'Admin', role: 'ADMIN', password: hash }
  });
  console.log(`Seed: ensured admin ${email}`);
  process.exit(0);
} catch (e) {
  console.error('Seed error:', e?.message || e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
