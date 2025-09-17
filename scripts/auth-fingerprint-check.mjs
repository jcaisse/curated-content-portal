#!/usr/bin/env node

import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!secret) {
  console.error('Auth fingerprint: AUTH_SECRET/NEXTAUTH_SECRET is missing.');
  process.exit(1);
}
const fpr = crypto.createHash('sha256').update(secret).digest('base64');
const key = `auth_fpr:${process.env.NODE_ENV || 'production'}`;

const prisma = new PrismaClient();
try {
  const row = await prisma.appConfig.findUnique({ where: { key } });
  const allowRotate = process.env.ALLOW_AUTH_SECRET_ROTATION === 'true';

  if (!row) {
    await prisma.appConfig.create({ data: { key, value: fpr } });
    console.log('Auth fingerprint: seeded.');
    process.exit(0);
  }

  if (row.value === fpr) {
    console.log('Auth fingerprint: OK.');
    process.exit(0);
  }

  if (allowRotate) {
    await prisma.appConfig.update({ where: { key }, data: { value: fpr } });
    console.warn('Auth fingerprint: rotated with ALLOW_AUTH_SECRET_ROTATION=true.');
    process.exit(0);
  }

  console.error('Auth fingerprint mismatch. Set ALLOW_AUTH_SECRET_ROTATION=true once to rotate, and inform users session cookies may be invalid.');
  process.exit(1);
} catch (e) {
  console.error('Auth fingerprint error:', e?.message || e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}

