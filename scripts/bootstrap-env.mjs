#!/usr/bin/env node

import { randomBytes, randomUUID } from 'crypto';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Generate a strong random string
 */
function generateSecret(length = 32) {
  return randomBytes(length).toString('base64').replace(/[+/=]/g, '');
}

/**
 * Generate a random password
 */
function generatePassword(length = 20) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Bootstrap environment file
 */
async function bootstrapEnv() {
  console.log('🔧 Bootstrapping environment configuration...');
  
  // Generate secrets
  const postgresPassword = generatePassword(20);
  const nextAuthSecret = generateSecret(32);
  const adminIngestKey = generateSecret(32);
  
  const envContent = `# Generated environment file for local Docker deployment
# DO NOT COMMIT THIS FILE - it contains secrets

# Database Configuration
DATABASE_URL=postgresql://postgres:${postgresPassword}@db:5432/curated_content_portal?schema=public
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${postgresPassword}
POSTGRES_DB=curated_content_portal
POSTGRES_PORT=5432

# App Configuration
APP_PORT=3000
NODE_ENV=production

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${nextAuthSecret}

# OpenAI API Configuration (optional)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!

# Domain and Email
DOMAIN=localhost
EMAIL=local@example.com

# AI Configuration (disabled for local)
AI_DISABLED=true

# Admin Ingest Key
ADMIN_INGEST_KEY=${adminIngestKey}

# Content Sources Configuration
RSS_FEED_URLS=https://example.com/feed1.xml,https://example.com/feed2.xml
WEB_CRAWL_ENABLED=true
CRAWL_INTERVAL_HOURS=24

# File Storage Configuration
FILE_STORAGE_STRATEGY=url_only

# Content Curation Configuration
MAX_CRAWL_ITEMS_PER_RUN=100
CONTENT_REVIEW_THRESHOLD=0.7
AUTO_PUBLISH_ENABLED=false

# API Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST=10

# Monitoring & Analytics
ANALYTICS_ENABLED=false

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_MAX_AGE=86400

# Logging
LOG_LEVEL=info
`;

  // Ensure .secrets directory exists
  const secretsDir = join(process.cwd(), '.secrets');
  mkdirSync(secretsDir, { recursive: true });
  
  // Write the environment file
  const envPath = join(secretsDir, '.env.local');
  writeFileSync(envPath, envContent, 'utf8');
  
  console.log('✅ Environment file created successfully!');
  console.log(`📁 Location: ${envPath}`);
  console.log('');
  console.log('🔐 Generated secrets:');
  console.log(`   POSTGRES_PASSWORD: ${postgresPassword.substring(0, 8)}...`);
  console.log(`   NEXTAUTH_SECRET: ${nextAuthSecret.substring(0, 8)}...`);
  console.log(`   ADMIN_INGEST_KEY: ${adminIngestKey.substring(0, 8)}...`);
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. docker compose up -d --build');
  console.log('   2. docker compose exec app npx prisma migrate deploy');
  console.log('   3. docker compose exec app npx prisma db seed || true');
  console.log('');
  console.log('🌐 URLs:');
  console.log('   Public: http://localhost:3000/');
  console.log('   Admin: http://localhost:3000/admin');
  console.log('   Admin login: admin@example.com / ChangeMe123!');
}

// Run the bootstrap
bootstrapEnv().catch((error) => {
  console.error('❌ Bootstrap failed:', error);
  process.exit(1);
});
