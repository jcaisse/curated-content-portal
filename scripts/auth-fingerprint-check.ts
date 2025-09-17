#!/usr/bin/env tsx

import { createHash } from 'crypto';
import { PrismaClient } from '@prisma/client';

interface FingerprintConfig {
  authSecret: string;
  nextAuthSecret: string;
  allowRotation: boolean;
  nodeEnv: string;
}

/**
 * DB-backed Auth Fingerprint Check
 * 
 * Computes a stable fingerprint of auth secrets and stores/validates it in Postgres.
 * Runs during the migrate step to gate app startup.
 */
async function main() {
  const config = getConfig();
  const fingerprint = computeFingerprint(config);
  const key = `auth_fpr:${config.nodeEnv}`;

  console.log(`🔍 Checking auth fingerprint for ${config.nodeEnv} environment...`);

  try {
    const prisma = new PrismaClient();
    
    // Read existing fingerprint from database
    const existing = await prisma.appConfig.findUnique({
      where: { key }
    });

    if (!existing) {
      // First run - insert the fingerprint
      await prisma.appConfig.create({
        data: {
          key,
          value: fingerprint,
          updatedAt: new Date()
        }
      });
      console.log('✅ Auth fingerprint created (first run)');
      console.log(`   Key: ${key}`);
      console.log(`   Fingerprint: ${fingerprint.substring(0, 16)}...`);
    } else if (existing.value === fingerprint) {
      // Fingerprint matches - all good
      console.log('✅ Auth fingerprint matches');
      console.log(`   Key: ${key}`);
      console.log(`   Fingerprint: ${fingerprint.substring(0, 16)}...`);
    } else {
      // Fingerprint mismatch - check if rotation is allowed
      if (config.allowRotation) {
        await prisma.appConfig.update({
          where: { key },
          data: {
            value: fingerprint,
            updatedAt: new Date()
          }
        });
        console.warn('⚠️  Auth secret changed - rotation allowed');
        console.warn('   Users may need to log in again');
        console.log(`   Updated fingerprint: ${fingerprint.substring(0, 16)}...`);
      } else {
        const errorMessage = [
          '🚨 Auth secret changed. This will cause JWT session errors.',
          '',
          'To fix:',
          '1. Set ALLOW_AUTH_SECRET_ROTATION=true for one run, or',
          '2. Clear browser cookies and re-login, or', 
          '3. Restore the previous auth secrets',
          '',
          `Current fingerprint: ${fingerprint.substring(0, 16)}...`,
          `Previous fingerprint: ${existing.value.substring(0, 16)}...`,
          '',
          `Key: ${key}`
        ].join('\n');

        console.error(errorMessage);
        process.exit(1);
      }
    }

    await prisma.$disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Auth fingerprint check failed:', error);
    process.exit(1);
  }
}

function getConfig(): FingerprintConfig {
  const authSecret = process.env.AUTH_SECRET;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  const allowRotation = process.env.ALLOW_AUTH_SECRET_ROTATION === 'true';
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Choose primary secret (AUTH_SECRET takes precedence)
  const primarySecret = authSecret || nextAuthSecret;
  
  if (!primarySecret) {
    console.error('❌ Neither AUTH_SECRET nor NEXTAUTH_SECRET is set');
    process.exit(1);
  }

  if (primarySecret.length < 32) {
    console.error('❌ Auth secret must be at least 32 characters');
    process.exit(1);
  }

  return {
    authSecret: authSecret || '',
    nextAuthSecret: nextAuthSecret || '',
    allowRotation,
    nodeEnv
  };
}

function computeFingerprint(config: FingerprintConfig): string {
  // Use the primary secret for fingerprint
  const primarySecret = config.authSecret || config.nextAuthSecret;
  const hash = createHash('sha256').update(primarySecret).digest('base64');
  return hash;
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}
