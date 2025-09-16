#!/usr/bin/env node

/**
 * Configuration validation script
 * Run this to verify environment configuration is properly loaded
 */

const fs = require('fs');
const path = require('path');

// Load .env.local if it exists
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    for (const line of envLines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
          process.env[key] = value;
        }
      }
    }
  }
}

// Load environment variables from .env.local
loadEnvFile();

function loadConfig() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ];

  // Check for required environment variables
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    database: {
      url: process.env.DATABASE_URL,
    },
    
    auth: {
      url: process.env.NEXTAUTH_URL,
      secret: process.env.NEXTAUTH_SECRET,
      adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
      adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
      sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '86400'),
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    },
    
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    },
    
    content: {
      rssFeedUrls: process.env.RSS_FEED_URLS?.split(',') || [],
      webCrawlEnabled: process.env.WEB_CRAWL_ENABLED === 'true',
      crawlIntervalHours: parseInt(process.env.CRAWL_INTERVAL_HOURS || '24'),
      maxCrawlItemsPerRun: parseInt(process.env.MAX_CRAWL_ITEMS_PER_RUN || '100'),
      contentReviewThreshold: parseFloat(process.env.CONTENT_REVIEW_THRESHOLD || '0.7'),
      autoPublishEnabled: process.env.AUTO_PUBLISH_ENABLED === 'true',
    },
    
    storage: {
      strategy: process.env.FILE_STORAGE_STRATEGY || 'url_only',
    },
    
    api: {
      rateLimitRequestsPerMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '60'),
      rateLimitBurst: parseInt(process.env.RATE_LIMIT_BURST || '10'),
    },
    
    monitoring: {
      analyticsEnabled: process.env.ANALYTICS_ENABLED === 'true',
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
    },
    
    app: {
      nodeEnv: process.env.NODE_ENV || 'development',
      logLevel: process.env.LOG_LEVEL || 'info',
    },
  };
}

function validateConfig() {
  try {
    const cfg = loadConfig();
    
    // Additional validation logic can be added here
    if (cfg.auth.adminPassword === 'admin123' && cfg.app.nodeEnv === 'production') {
      console.warn('⚠️  Using default admin password in production is not recommended');
    }
    
    if (!cfg.openai.apiKey && cfg.app.nodeEnv === 'production') {
      console.warn('⚠️  OpenAI API key not configured - AI features will be disabled');
    }
    
    console.log('✅ Configuration loaded and validated successfully');
    return cfg;
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    throw error;
  }
}

async function main() {
  console.log('🔍 Validating environment configuration...\n');
  
  try {
    // Test configuration loading
    const config = validateConfig();
    
    // Display loaded configuration (without sensitive data)
    console.log('📋 Configuration Summary:');
    console.log(`  Database URL: ${config.database.url.replace(/\/\/.*@/, '//***:***@')}`);
    console.log(`  Auth URL: ${config.auth.url}`);
    console.log(`  Admin Email: ${config.auth.adminEmail}`);
    console.log(`  OpenAI Model: ${config.openai.model}`);
    console.log(`  OpenAI API Key: ${config.openai.apiKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`  Storage Strategy: ${config.storage.strategy}`);
    console.log(`  RSS Feed URLs: ${config.content.rssFeedUrls.length} configured`);
    console.log(`  Web Crawl Enabled: ${config.content.webCrawlEnabled}`);
    console.log(`  Node Environment: ${config.app.nodeEnv}`);
    console.log(`  Log Level: ${config.app.logLevel}`);
    
    // Test environment variable loading
    console.log('\n🔧 Environment Variables Test:');
    const testVars = [
      'DATABASE_URL',
      'NEXTAUTH_URL', 
      'NEXTAUTH_SECRET',
      'OPENAI_API_KEY',
      'ADMIN_EMAIL',
      'NODE_ENV'
    ];
    
    for (const varName of testVars) {
      const value = process.env[varName];
      const status = value ? '✅' : '❌';
      const displayValue = value ? (varName.includes('SECRET') || varName.includes('KEY') ? '***' : value) : 'Not set';
      console.log(`  ${status} ${varName}: ${displayValue}`);
    }
    
    console.log('\n✅ Configuration validation completed successfully!');
    console.log('🎯 Gate G0: Config ready - All environment configuration validated');
    
  } catch (error) {
    console.error('\n❌ Configuration validation failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
