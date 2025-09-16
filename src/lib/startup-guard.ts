import { runArchitectureGuard } from './arch-guard';
import { validateSecretsAtBoot, checkForHardcodedSecrets } from './secret-guard';

/**
 * Startup Guard - Runs architecture and security validation on application startup
 * 
 * This should be called early in the application lifecycle to ensure
 * the application is running with the correct architectural configuration
 * and secure secrets.
 */

let hasRun = false;

export async function runStartupGuard(): Promise<void> {
  if (hasRun) {
    return; // Only run once per process
  }

  // Skip in development if explicitly disabled
  if (process.env.SKIP_ARCH_GUARD === 'true') {
    console.log('⚠️  Architecture guard skipped (SKIP_ARCH_GUARD=true)');
    return;
  }

  try {
    // Run architecture validation
    await runArchitectureGuard();
    
    // Run security validation
    await validateSecretsAtBoot();
    
    // Check for hardcoded secrets (development only)
    checkForHardcodedSecrets();
    
    hasRun = true;
  } catch (error) {
    console.error('🚨 Application startup failed due to validation');
    throw error;
  }
}

// Auto-run on import in server environments
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  // Run asynchronously to not block module loading
  setImmediate(() => {
    runStartupGuard().catch(error => {
      console.error('Startup guard failed:', error);
      process.exit(1);
    });
  });
}
