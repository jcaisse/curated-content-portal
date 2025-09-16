import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface AuthConfig {
  authSecret: string;
  nextAuthSecret: string;
  allowRotation: boolean;
}

interface FingerprintData {
  fingerprint: string;
  timestamp: number;
}

/**
 * Auth Secrets Fingerprint Guard
 * 
 * Prevents JWT session errors by detecting auth secret changes between runs.
 * Stores a non-reversible fingerprint of AUTH_SECRET + NEXTAUTH_SECRET.
 */
export class AuthFingerprintGuard {
  private readonly fingerprintPath: string;
  private readonly config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
    
    // Store fingerprint in a named volume or temp directory
    const stateDir = join(process.cwd(), '.state');
    if (!existsSync(stateDir)) {
      mkdirSync(stateDir, { recursive: true });
    }
    this.fingerprintPath = join(stateDir, 'auth.fpr');
  }

  /**
   * Compute a SHA-256 fingerprint of the auth secrets
   */
  private computeFingerprint(): string {
    const combined = `${this.config.authSecret}||${this.config.nextAuthSecret}`;
    return createHash('sha256').update(combined).digest('hex');
  }

  /**
   * Load existing fingerprint from storage
   */
  private loadExistingFingerprint(): FingerprintData | null {
    if (!existsSync(this.fingerprintPath)) {
      return null;
    }

    try {
      const content = readFileSync(this.fingerprintPath, 'utf-8');
      return JSON.parse(content) as FingerprintData;
    } catch (error) {
      console.warn('⚠️  Could not load existing auth fingerprint, treating as new installation');
      return null;
    }
  }

  /**
   * Save fingerprint to storage
   */
  private saveFingerprint(fingerprint: string): void {
    const data: FingerprintData = {
      fingerprint,
      timestamp: Date.now()
    };

    try {
      writeFileSync(this.fingerprintPath, JSON.stringify(data, null, 2));
      console.log('✅ Auth fingerprint saved');
    } catch (error) {
      console.error('❌ Failed to save auth fingerprint:', error);
      throw new Error('Could not persist auth fingerprint');
    }
  }

  /**
   * Validate auth secrets haven't changed unexpectedly
   */
  public validate(): void {
    const currentFingerprint = this.computeFingerprint();
    const existing = this.loadExistingFingerprint();

    if (existing) {
      if (existing.fingerprint !== currentFingerprint) {
        if (this.config.allowRotation) {
          console.warn('⚠️  Auth secrets changed - rotation allowed');
          console.warn('   Users may need to log in again');
        } else {
          const errorMessage = [
            '🚨 Auth secret changed. This will cause JWT session errors.',
            '',
            'To fix:',
            '1. Set ALLOW_AUTH_SECRET_ROTATION=true for one run, or',
            '2. Clear browser cookies and re-login, or', 
            '3. Restore the previous auth secrets',
            '',
            'Current fingerprint:', currentFingerprint.substring(0, 16) + '...',
            'Previous fingerprint:', existing.fingerprint.substring(0, 16) + '...'
          ].join('\n');

          throw new Error(errorMessage);
        }
      } else {
        console.log('✅ Auth secrets fingerprint matches');
      }
    } else {
      console.log('🆕 First run - creating auth fingerprint');
    }

    // Always save current fingerprint (for rotation case)
    this.saveFingerprint(currentFingerprint);
  }

  /**
   * Get current fingerprint for debugging
   */
  public getCurrentFingerprint(): string {
    return this.computeFingerprint();
  }
}

/**
 * Initialize and run the auth fingerprint guard
 */
export function initializeAuthFingerprintGuard(): void {
  const authSecret = process.env.AUTH_SECRET;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  const allowRotation = process.env.ALLOW_AUTH_SECRET_ROTATION === 'true';

  if (!authSecret || !nextAuthSecret) {
    throw new Error('AUTH_SECRET and NEXTAUTH_SECRET must be set');
  }

  if (authSecret.length < 32 || nextAuthSecret.length < 32) {
    throw new Error('AUTH_SECRET and NEXTAUTH_SECRET must be at least 32 characters');
  }

  const guard = new AuthFingerprintGuard({
    authSecret,
    nextAuthSecret,
    allowRotation
  });

  guard.validate();
}
