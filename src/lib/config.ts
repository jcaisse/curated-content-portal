import { config as loadDotenv } from 'dotenv';
import { validateConfig as validateConfigSchema, validatePasswordStrength, validateSecretStrength, type Config } from './config-schema';
import { initializeAuthFingerprintGuard } from './auth-fingerprint';

// Load environment variables
loadDotenv();

// Validate and load configuration
export function loadAppConfig(): Config {
  try {
    // Skip validation during build time
    if (process.env.SKIP_CONFIG_VALIDATION === 'true') {
      return {
        database: { url: '', postgresUser: 'postgres', postgresPassword: '', postgresDb: 'app', postgresPort: '5432' },
        auth: { url: 'http://localhost:3000', secret: '', adminEmail: 'admin@example.com', adminPassword: '', sessionMaxAge: 86400, bcryptRounds: 12 },
        ai: { apiKey: '', model: 'gpt-4o-mini', disabled: true },
        app: { port: 3000, nodeEnv: 'development', domain: 'localhost', email: 'local@example.com', logLevel: 'info' },
        security: { adminIngestKey: '', rateLimitRequestsPerMinute: 60, rateLimitBurst: 10 },
        content: { rssFeedUrls: '', webCrawlEnabled: false, crawlIntervalHours: 24, maxCrawlItemsPerRun: 100, contentReviewThreshold: 0.7, autoPublishEnabled: false, fileStorageStrategy: 'url_only' },
        analytics: { enabled: false, googleAnalyticsId: '' }
      } as Config;
    }
    
    const config = validateConfigSchema(process.env);
    
    // Initialize auth fingerprint guard (only in production/staging)
    if (config.app.nodeEnv === 'production' || config.app.nodeEnv === 'staging') {
      initializeAuthFingerprintGuard();
    }
    
    // Additional environment-specific validations
    if (config.app.nodeEnv === 'production' || config.app.nodeEnv === 'staging') {
      // Validate password strength in production/staging
      if (config.auth.adminPassword && !validatePasswordStrength(config.auth.adminPassword, config.app.nodeEnv)) {
        throw new Error('ADMIN_PASSWORD does not meet strength requirements for production/staging');
      }
      
      // Validate secret strength
      if (!validateSecretStrength(config.auth.secret, 'NEXTAUTH_SECRET')) {
        throw new Error('NEXTAUTH_SECRET does not meet strength requirements');
      }
      
      if (!validateSecretStrength(config.security.adminIngestKey, 'ADMIN_INGEST_KEY')) {
        throw new Error('ADMIN_INGEST_KEY does not meet strength requirements');
      }
    }
    
    return config;
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    process.exit(1);
  }
}

// Export the loaded configuration
export const config = loadAppConfig();

// Legacy export for backward compatibility
export type AppConfig = Config;

/**
 * Validate that all required configuration is present
 * Call this during application startup
 */
export function validateConfig(): void {
  try {
    const cfg = loadAppConfig();
    
    // Environment-specific warnings
    if (cfg.app.nodeEnv === 'development') {
      if (!cfg.auth.adminPassword) {
        console.warn('⚠️  Development: No ADMIN_PASSWORD set, will generate temporary password');
      }
      if (!cfg.security.adminIngestKey) {
        console.warn('⚠️  Development: No ADMIN_INGEST_KEY set, will generate temporary key');
      }
    }
    
    if (!cfg.ai.apiKey && cfg.app.nodeEnv === 'production') {
      console.warn('⚠️  OpenAI API key not configured - AI features will be disabled');
    }
    
    console.log('✅ Configuration loaded and validated successfully');
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    throw error;
  }
}