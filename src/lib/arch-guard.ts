import { PrismaClient } from '@prisma/client';

/**
 * Architecture Guard - Runtime self-defense for architectural invariants
 * 
 * This module validates that the application is running with the correct
 * architectural configuration (PostgreSQL + pgvector) at startup.
 */

interface ArchGuardResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ArchitectureGuard {
  private databaseUrl: string;
  private prisma: PrismaClient;

  constructor() {
    this.databaseUrl = process.env.DATABASE_URL || '';
    this.prisma = new PrismaClient();
  }

  /**
   * Validates the DATABASE_URL format
   */
  private validateDatabaseUrl(): string[] {
    const errors: string[] = [];

    if (!this.databaseUrl) {
      errors.push('DATABASE_URL environment variable is not set');
      return errors;
    }

    // Check for file-based DSNs
    if (this.databaseUrl.startsWith('file:')) {
      errors.push('Architecture lock: Postgres required. Found file-based DSN.');
    }

    // Check for SQLite DSNs
    if (this.databaseUrl.includes('sqlite') || this.databaseUrl.includes('.db')) {
      errors.push('Architecture lock: Postgres required. Found SQLite DSN.');
    }

    // Check for PostgreSQL DSNs
    if (!this.databaseUrl.startsWith('postgresql://') && !this.databaseUrl.startsWith('postgres://')) {
      errors.push('Architecture lock: Postgres required. DATABASE_URL must start with postgresql:// or postgres://');
    }

    return errors;
  }

  /**
   * Validates that pgvector extension is enabled
   */
  private async validatePgvectorExtension(): Promise<string[]> {
    const errors: string[] = [];

    try {
      // Check if pgvector extension exists
      const result = await this.prisma.$queryRaw`
        SELECT extname FROM pg_extension WHERE extname='vector'
      ` as Array<{ extname: string }>;

      if (!result || result.length === 0) {
        errors.push('pgvector extension is not enabled in the database');
      }
    } catch (error) {
      errors.push(`Failed to validate pgvector extension: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return errors;
  }

  /**
   * Validates database connectivity
   */
  private async validateDatabaseConnectivity(): Promise<string[]> {
    const errors: string[] = [];

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      errors.push(`Database connectivity failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return errors;
  }

  /**
   * Runs all architecture validations
   */
  async validate(): Promise<ArchGuardResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log('🔒 Architecture Guard: Validating configuration...');

    // Validate DATABASE_URL
    const urlErrors = this.validateDatabaseUrl();
    errors.push(...urlErrors);

    // If DATABASE_URL is invalid, skip database checks
    if (urlErrors.length === 0) {
      try {
        // Validate database connectivity
        const connectivityErrors = await this.validateDatabaseConnectivity();
        errors.push(...connectivityErrors);

        // If connectivity is good, validate pgvector
        if (connectivityErrors.length === 0) {
          const pgvectorErrors = await this.validatePgvectorExtension();
          errors.push(...pgvectorErrors);
        }
      } catch (error) {
        warnings.push(`Database validation skipped: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Clean up
    await this.prisma.$disconnect();

    const result: ArchGuardResult = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    return result;
  }

  /**
   * Validates and throws if architecture is invalid
   */
  async enforce(): Promise<void> {
    const result = await this.validate();

    // Log warnings
    result.warnings.forEach(warning => {
      console.warn(`⚠️  ${warning}`);
    });

    // Throw on errors
    if (!result.isValid) {
      console.error('❌ Architecture Guard: Configuration validation failed!');
      result.errors.forEach(error => {
        console.error(`   ${error}`);
      });
      
      console.error('\n🔒 Architecture Lock: Application startup blocked due to invalid configuration.');
      console.error('   Ensure PostgreSQL + pgvector is properly configured.');
      
      process.exit(1);
    }

    console.log('✅ Architecture Guard: All validations passed!');
  }
}

/**
 * Convenience function to run architecture guard
 */
export async function runArchitectureGuard(): Promise<void> {
  const guard = new ArchitectureGuard();
  await guard.enforce();
}

/**
 * Health check function that can be used in API endpoints
 */
export async function getArchitectureHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  database: 'connected' | 'disconnected';
  pgvector: 'enabled' | 'disabled' | 'unknown';
  errors: string[];
}> {
  const guard = new ArchitectureGuard();
  const result = await guard.validate();

  // Check database connectivity
  let databaseStatus: 'connected' | 'disconnected' = 'disconnected';
  let pgvectorStatus: 'enabled' | 'disabled' | 'unknown' = 'unknown';

  if (result.errors.length === 0) {
    databaseStatus = 'connected';
    pgvectorStatus = 'enabled';
  } else {
    // Try to determine specific issues
    if (result.errors.some(e => e.includes('pgvector'))) {
      pgvectorStatus = 'disabled';
    }
    if (result.errors.some(e => e.includes('connectivity') || e.includes('DATABASE_URL'))) {
      databaseStatus = 'disconnected';
    }
  }

  return {
    status: result.isValid ? 'healthy' : 'unhealthy',
    database: databaseStatus,
    pgvector: pgvectorStatus,
    errors: result.errors
  };
}
