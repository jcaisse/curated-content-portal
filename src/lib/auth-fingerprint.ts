import { PrismaClient } from '@prisma/client';

/**
 * Soft Runtime Auth Fingerprint Check
 * 
 * This is a lightweight check that logs a warning if the auth fingerprint
 * is missing from the database. The actual fingerprint validation happens
 * during the migrate step before the app starts.
 */
export async function checkAuthFingerprintExists(): Promise<void> {
  try {
    const prisma = new PrismaClient();
    const nodeEnv = process.env.NODE_ENV || 'development';
    const key = `auth_fpr:${nodeEnv}`;
    
    const config = await prisma.appConfig.findUnique({
      where: { key }
    });
    
    if (!config) {
      console.warn(`⚠️  Auth fingerprint not found in database (key: ${key})`);
      console.warn('   This should not happen if migrations ran successfully');
      console.warn('   The migrate step should have created this fingerprint');
    } else {
      console.log(`✅ Auth fingerprint found in database (key: ${key})`);
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.warn('⚠️  Could not check auth fingerprint in database:', error);
    // Don't throw - this is just a soft check
  }
}

/**
 * Legacy function - now just calls the soft check
 * @deprecated The actual fingerprint validation happens during migrate step
 */
export function initializeAuthFingerprintGuard(): void {
  console.log('ℹ️  Auth fingerprint validation now happens during migrate step');
  console.log('   This runtime check is for debugging only');
  
  // Run the soft check asynchronously (don't await to avoid blocking startup)
  checkAuthFingerprintExists().catch(() => {
    // Ignore errors in the soft check
  });
}
