import { z } from 'zod';

// Environment validation schema
const configSchema = z.object({
  // Database configuration
  database: z.object({
    url: z.string().min(1, 'DATABASE_URL is required'),
    postgresUser: z.string().min(1, 'POSTGRES_USER is required'),
    postgresPassword: z.string().min(20, 'POSTGRES_PASSWORD must be at least 20 characters'),
    postgresDb: z.string().min(1, 'POSTGRES_DB is required'),
    postgresPort: z.string().default('5432'),
  }),

  // NextAuth configuration
  auth: z.object({
    url: z.string().url('NEXTAUTH_URL must be a valid URL'),
    secret: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
    adminEmail: z.string().email('ADMIN_EMAIL must be a valid email'),
    adminPassword: z.string().optional(), // Will be validated separately based on environment
    adminInitialPassword: z.string().optional(), // For one-time admin creation
    sessionMaxAge: z.number().default(86400),
    bcryptRounds: z.number().default(12),
  }),

  // AI configuration
  ai: z.object({
    apiKey: z.string().optional(),
    model: z.string().default('gpt-4o-mini'),
    disabled: z.boolean().default(false),
  }),

  // App configuration
  app: z.object({
    port: z.number().default(3000),
    nodeEnv: z.enum(['development', 'staging', 'production']),
    domain: z.string().min(1, 'DOMAIN is required'),
    email: z.string().email('EMAIL must be a valid email'),
    logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  }),

  // Security configuration
  security: z.object({
    adminIngestKey: z.string().min(32, 'ADMIN_INGEST_KEY must be at least 32 characters'),
    rateLimitRequestsPerMinute: z.number().default(60),
    rateLimitBurst: z.number().default(10),
  }),

  // Content configuration
  content: z.object({
    rssFeedUrls: z.string().optional(),
    webCrawlEnabled: z.boolean().default(true),
    crawlIntervalHours: z.number().default(24),
    maxCrawlItemsPerRun: z.number().default(100),
    contentReviewThreshold: z.number().default(0.7),
    autoPublishEnabled: z.boolean().default(false),
    fileStorageStrategy: z.string().default('url_only'),
  }),

  // Analytics configuration
  analytics: z.object({
    enabled: z.boolean().default(false),
    googleAnalyticsId: z.string().optional(),
  }),
});

export type Config = z.infer<typeof configSchema>;

// Environment-specific validation
export function validateConfig(env: Record<string, string | undefined>): Config {
  const nodeEnv = (env.NODE_ENV || 'development') as 'development' | 'staging' | 'production';
  
  // Parse configuration
  const rawConfig = {
    database: {
      url: env.DATABASE_URL,
      postgresUser: env.POSTGRES_USER,
      postgresPassword: env.POSTGRES_PASSWORD,
      postgresDb: env.POSTGRES_DB,
      postgresPort: env.POSTGRES_PORT,
    },
    auth: {
      url: env.NEXTAUTH_URL,
      secret: env.NEXTAUTH_SECRET,
      adminEmail: env.ADMIN_EMAIL,
      adminPassword: env.ADMIN_PASSWORD,
      adminInitialPassword: env.ADMIN_INITIAL_PASSWORD,
      sessionMaxAge: parseInt(env.SESSION_MAX_AGE || '86400'),
      bcryptRounds: parseInt(env.BCRYPT_ROUNDS || '12'),
    },
    ai: {
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL || 'gpt-4o-mini',
      disabled: env.AI_DISABLED === 'true',
    },
    app: {
      port: parseInt(env.APP_PORT || env.PORT || '3000'),
      nodeEnv,
      domain: env.DOMAIN || 'localhost',
      email: env.EMAIL,
      logLevel: (env.LOG_LEVEL || 'info') as 'error' | 'warn' | 'info' | 'debug',
    },
    security: {
      adminIngestKey: env.ADMIN_INGEST_KEY,
      rateLimitRequestsPerMinute: parseInt(env.RATE_LIMIT_REQUESTS_PER_MINUTE || '60'),
      rateLimitBurst: parseInt(env.RATE_LIMIT_BURST || '10'),
    },
    content: {
      rssFeedUrls: env.RSS_FEED_URLS,
      webCrawlEnabled: env.WEB_CRAWL_ENABLED !== 'false',
      crawlIntervalHours: parseInt(env.CRAWL_INTERVAL_HOURS || '24'),
      maxCrawlItemsPerRun: parseInt(env.MAX_CRAWL_ITEMS_PER_RUN || '100'),
      contentReviewThreshold: parseFloat(env.CONTENT_REVIEW_THRESHOLD || '0.7'),
      autoPublishEnabled: env.AUTO_PUBLISH_ENABLED === 'true',
      fileStorageStrategy: env.FILE_STORAGE_STRATEGY || 'url_only',
    },
    analytics: {
      enabled: env.ANALYTICS_ENABLED === 'true',
      googleAnalyticsId: env.GOOGLE_ANALYTICS_ID,
    },
  };

  // Validate basic schema
  const config = configSchema.parse(rawConfig);

  // Environment-specific validations
  if (nodeEnv === 'production' || nodeEnv === 'staging') {
    // Production/Staging: Strict validation
    if (!config.auth.adminPassword && !config.auth.adminInitialPassword) {
      throw new Error(
        'Production/Staging: ADMIN_PASSWORD or ADMIN_INITIAL_PASSWORD must be set. ' +
        'Use ADMIN_INITIAL_PASSWORD for one-time admin creation, then unset it.'
      );
    }

    if (config.auth.adminPassword && config.auth.adminPassword.length < 20) {
      throw new Error('Production/Staging: ADMIN_PASSWORD must be at least 20 characters');
    }

    if (!config.database.url.startsWith('postgresql://') && !config.database.url.startsWith('postgres://')) {
      throw new Error('Production/Staging: DATABASE_URL must use PostgreSQL');
    }

    if (!config.security.adminIngestKey || config.security.adminIngestKey.length < 32) {
      throw new Error('Production/Staging: ADMIN_INGEST_KEY must be at least 32 characters');
    }
  } else {
    // Development: More lenient validation
    if (!config.auth.adminPassword) {
      console.warn('⚠️  Development: No ADMIN_PASSWORD set, will generate temporary password');
    }

    if (!config.security.adminIngestKey) {
      console.warn('⚠️  Development: No ADMIN_INGEST_KEY set, will generate temporary key');
    }
  }

  return config;
}

// Password strength validation
export function validatePasswordStrength(password: string, env: 'development' | 'staging' | 'production'): boolean {
  if (env === 'development') {
    return password.length >= 8;
  }
  
  // Production/Staging: Strong password requirements
  if (password.length < 20) return false;
  
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  
  return hasUpper && hasLower && hasNumber && hasSymbol;
}

// Secret strength validation
export function validateSecretStrength(secret: string, name: string, minLength: number = 32): boolean {
  if (secret.length < minLength) {
    console.error(`❌ ${name} must be at least ${minLength} characters`);
    return false;
  }
  
  // Check for common weak patterns
  const weakPatterns = [
    /^[a-z]+$/i, // Only letters
    /^[0-9]+$/, // Only numbers
    /^(.)\1+$/, // All same character
    /password|secret|key|token|admin|test/i, // Common weak words
  ];
  
  for (const pattern of weakPatterns) {
    if (pattern.test(secret)) {
      console.error(`❌ ${name} appears to be weak (matches pattern: ${pattern})`);
      return false;
    }
  }
  
  return true;
}
