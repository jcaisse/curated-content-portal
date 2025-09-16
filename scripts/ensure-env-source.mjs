#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

function ensureEnvSource() {
  console.log('🔍 Checking environment source consistency...');

  const envFilePath = join(process.cwd(), '.secrets', '.env.local');
  
  if (!existsSync(envFilePath)) {
    console.error('❌ Environment file not found: .secrets/.env.local');
    console.error('💡 Run: npm run env:bootstrap');
    process.exit(1);
  }

  // Check if we're in a docker compose context
  const isDockerCompose = process.argv.includes('docker') && process.argv.includes('compose');
  
  if (isDockerCompose && !process.argv.includes('--env-file')) {
    console.error('❌ Docker Compose command missing --env-file flag');
    console.error('💡 Always use: docker compose --env-file ./.secrets/.env.local <command>');
    console.error('   Current command:', process.argv.join(' '));
    process.exit(1);
  }

  // Check for required environment variables in the file
  const envContent = readFileSync(envFilePath, 'utf-8');
  
  const requiredVars = [
    'POSTGRES_PASSWORD',
    'NEXTAUTH_SECRET', 
    'AUTH_SECRET',
    'ADMIN_PASSWORD',
    'ADMIN_INGEST_KEY'
  ];

  const missingVars = [];
  for (const varName of requiredVars) {
    const regex = new RegExp(`^${varName}=.+`, 'm');
    if (!regex.test(envContent)) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('💡 Run: npm run env:bootstrap');
    process.exit(1);
  }

  console.log('✅ Environment source consistency verified');
  console.log(`📁 Using: ${envFilePath}`);
}

ensureEnvSource();
