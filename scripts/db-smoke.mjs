import { PrismaClient } from '@prisma/client';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DB smoke: DATABASE_URL is not set.');
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const r = await prisma.$queryRaw`SELECT 1::int AS ok`;
  console.log('DB smoke: OK', r);
  process.exit(0);
} catch (e) {
  console.error('DB smoke: FAIL', e?.message || e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
