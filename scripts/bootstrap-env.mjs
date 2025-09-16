#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

const secretsDir = join(process.cwd(), '.secrets');
const envFilePath = join(secretsDir, '.env.local');
const exampleFilePath = join(secretsDir, '.env.local.example');

function generateStrongPassword(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateBase64Secret(length = 32) {
  return crypto.randomBytes(length).toString('base64').replace(/=/g, '');
}

function generateAdminIngestKey(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < length; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

async function bootstrapEnv() {
  console.log('🔧 Bootstrapping environment configuration...');

  // Create secrets directory if it doesn't exist
  if (!existsSync(secretsDir)) {
    mkdirSync(secretsDir, { recursive: true });
    console.log('✅ Created .secrets directory');
  }

  // Check if example file exists
  if (!existsSync(exampleFilePath)) {
    console.error('❌ Example file not found: .secrets/.env.local.example');
    console.log('💡 Please create the example file first');
    process.exit(1);
  }

  // Read example file
  const exampleContent = readFileSync(exampleFilePath, 'utf8');

  // Generate secrets
  const postgresPassword = generateStrongPassword(32);
  const nextAuthSecret = generateBase64Secret(32);
  const authSecret = generateBase64Secret(32);
  const adminPassword = generateStrongPassword(24);
  const adminIngestKey = generateAdminIngestKey(32);

  // Replace placeholders with actual values
  let envContent = exampleContent
    .replace(/POSTGRES_PASSWORD=<set-strong-password>/g, `POSTGRES_PASSWORD=${postgresPassword}`)
    .replace(/NEXTAUTH_SECRET=<generate-32B-base64>/g, `NEXTAUTH_SECRET=${nextAuthSecret}`)
    .replace(/AUTH_SECRET=<generate-32B-base64>/g, `AUTH_SECRET=${authSecret}`)
    .replace(/ADMIN_PASSWORD=<set-strong-password>/g, `ADMIN_PASSWORD=${adminPassword}`)
    .replace(/ADMIN_INGEST_KEY=<generate-32\+chars>/g, `ADMIN_INGEST_KEY=${adminIngestKey}`)
    .replace(/DATABASE_URL=postgresql:\/\/postgres:<set-strong-password>@db:5432\/app\?schema=public/g, `DATABASE_URL=postgresql://postgres:${postgresPassword}@db:5432/app?schema=public`);

  // Write env file
  writeFileSync(envFilePath, envContent);

  console.log('✅ Environment file created successfully!');
  console.log(`📁 Location: ${envFilePath}`);
  console.log('\n🔐 Generated secrets:');
  console.log(`   POSTGRES_PASSWORD: ${postgresPassword.substring(0, 8)}...`);
  console.log(`   NEXTAUTH_SECRET: ${nextAuthSecret.substring(0, 8)}...`);
  console.log(`   AUTH_SECRET: ${authSecret.substring(0, 8)}...`);
  console.log(`   ADMIN_PASSWORD: ${adminPassword.substring(0, 8)}...`);
  console.log(`   ADMIN_INGEST_KEY: ${adminIngestKey.substring(0, 8)}...`);
  console.log('\n📋 Next steps:');
  console.log('   1. npm run env:check');
  console.log('   2. npm run compose:rebuild');
  console.log('   3. npm run compose:up');
  console.log('   4. npm run db:migrate');
  console.log('   5. npm run db:seed');
  console.log('\n🌐 URLs:');
  console.log('   Public: http://localhost:3000/');
  console.log('   Admin: http://localhost:3000/admin');
  console.log(`   Admin login: admin@example.com / ${adminPassword.substring(0, 8)}...`);
}

bootstrapEnv().catch(console.error);
