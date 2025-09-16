#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const composeFiles = [
  'docker-compose.yml',
  'docker-compose.override.yml',
  'docker-compose.test.yml'
];

const forbiddenSecretKeys = [
  'POSTGRES_PASSWORD',
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'AUTH_SECRET',
  'ADMIN_INGEST_KEY',
  'ADMIN_PASSWORD'
];

function validateCompose() {
  console.log('🔍 Validating Docker Compose configuration...');

  let hasErrors = false;

  for (const fileName of composeFiles) {
    const filePath = join(process.cwd(), fileName);
    
    if (!existsSync(filePath)) {
      console.log(`ℹ️  Skipping ${fileName} (not found)`);
      continue;
    }

    console.log(`📄 Checking ${fileName}...`);
    
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Check for version key (obsolete)
    if (content.includes('version:')) {
      console.error(`❌ ${fileName}: Remove obsolete 'version:' key`);
      hasErrors = true;
    }

    // Check for secret expansions
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      for (const secretKey of forbiddenSecretKeys) {
        // Look for ${SECRET_KEY} patterns
        const expansionPattern = new RegExp(`\\$\\{${secretKey}\\}`, 'g');
        if (expansionPattern.test(line)) {
          console.error(`❌ ${fileName}:${lineNum}: Forbidden secret expansion: \${${secretKey}}`);
          console.error(`   Line: ${line.trim()}`);
          console.error(`   💡 Use env_file: instead of environment expansions for secrets`);
          hasErrors = true;
        }
      }
    }

    // Check for required services and configurations
    if (fileName === 'docker-compose.yml') {
      // Check for db service with env_file
      if (!content.includes('services:') || !content.includes('db:')) {
        console.error(`❌ ${fileName}: Missing 'db' service`);
        hasErrors = true;
      }
      
      if (!content.includes('env_file:') || !content.includes('./.secrets/.env.local')) {
        console.error(`❌ ${fileName}: Missing env_file: [./.secrets/.env.local] for db service`);
        hasErrors = true;
      }
      
      if (!content.includes('migrate:') || !content.includes('depends_on:')) {
        console.error(`❌ ${fileName}: Missing 'migrate' service with proper dependencies`);
        hasErrors = true;
      }
      
      if (!content.includes('./db/init:/docker-entrypoint-initdb.d:ro')) {
        console.error(`❌ ${fileName}: Missing db/init mount for pgvector initialization`);
        hasErrors = true;
      }
    }
  }

  // Check for required init SQL file
  const initSqlPath = join(process.cwd(), 'db', 'init', '01-enable-pgvector.sql');
  if (!existsSync(initSqlPath)) {
    console.error('❌ Missing required file: db/init/01-enable-pgvector.sql');
    hasErrors = true;
  } else {
    console.log('✅ Found pgvector init SQL file');
  }

  if (hasErrors) {
    console.log('\n❌ Compose validation failed');
    console.log('💡 Fix: Remove secret expansions and ensure proper service dependencies');
    process.exit(1);
  } else {
    console.log('\n✅ Compose validation passed');
    console.log('🔒 No forbidden secret expansions found');
    console.log('🔒 Proper service dependencies configured');
  }
}

validateCompose();
