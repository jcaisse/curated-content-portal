#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

console.log('🔍 Checking required artifacts for auth fingerprint system...');

const requiredFiles = [
  'scripts/auth-fingerprint-check.mjs',
  'scripts/db-smoke.mjs',
  'prisma/schema.prisma'
];

const requiredPackageJsonScript = 'auth:fpr:check';
const requiredSchemaModel = 'model AppConfig';
const requiredComposeCommand = 'node scripts/auth-fingerprint-check.mjs';

let hasErrors = false;

// Check required files exist
for (const file of requiredFiles) {
  if (!existsSync(file)) {
    console.error(`❌ Required file missing: ${file}`);
    hasErrors = true;
  } else {
    console.log(`✅ Found: ${file}`);
  }
}

// Check package.json has the script
try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
  if (!packageJson.scripts || !packageJson.scripts[requiredPackageJsonScript]) {
    console.error(`❌ Missing npm script: ${requiredPackageJsonScript}`);
    hasErrors = true;
  } else {
    console.log(`✅ Found npm script: ${requiredPackageJsonScript}`);
  }
} catch (error) {
  console.error('❌ Could not read package.json:', error.message);
  hasErrors = true;
}

// Check schema has AppConfig model
try {
  const schemaContent = readFileSync('prisma/schema.prisma', 'utf-8');
  if (!schemaContent.includes(requiredSchemaModel)) {
    console.error(`❌ Missing schema model: ${requiredSchemaModel}`);
    hasErrors = true;
  } else {
    console.log(`✅ Found schema model: ${requiredSchemaModel}`);
  }
} catch (error) {
  console.error('❌ Could not read prisma/schema.prisma:', error.message);
  hasErrors = true;
}

// Check for AppConfig migration
try {
  const migrations = execSync('find prisma/migrations -name "*.sql" -exec cat {} \\;', { encoding: 'utf-8' });
  if (!migrations.includes('AppConfig')) {
    console.error('❌ No migration found that creates AppConfig table');
    hasErrors = true;
  } else {
    console.log('✅ Found AppConfig migration');
  }
} catch (error) {
  console.error('❌ Could not check migrations:', error.message);
  hasErrors = true;
}

// Check Dockerfile copies scripts
try {
  const dockerfileContent = readFileSync('Dockerfile', 'utf-8');
  if (!dockerfileContent.includes('COPY scripts scripts')) {
    console.error('❌ Dockerfile missing "COPY scripts scripts" in builder stage');
    hasErrors = true;
  } else {
    console.log('✅ Found "COPY scripts scripts" in builder stage');
  }
  
  if (!dockerfileContent.includes('COPY --from=builder /app/scripts ./scripts')) {
    console.error('❌ Dockerfile missing "COPY --from=builder /app/scripts ./scripts" in runner stage');
    hasErrors = true;
  } else {
    console.log('✅ Found "COPY --from=builder /app/scripts ./scripts" in runner stage');
  }
} catch (error) {
  console.error('❌ Could not read Dockerfile:', error.message);
  hasErrors = true;
}

// Check compose migrate service command
try {
  const composeContent = readFileSync('docker-compose.yml', 'utf-8');
  if (!composeContent.includes(requiredComposeCommand)) {
    console.error(`❌ Missing compose command: ${requiredComposeCommand}`);
    hasErrors = true;
  } else {
    console.log(`✅ Found compose command: ${requiredComposeCommand}`);
  }
} catch (error) {
  console.error('❌ Could not read docker-compose.yml:', error.message);
  hasErrors = true;
}

if (hasErrors) {
  console.error('\n❌ Required artifacts check failed');
  console.error('💡 Ensure all required components are present:');
  console.error('   - scripts/auth-fingerprint-check.mjs');
  console.error('   - scripts/db-smoke.mjs');
  console.error('   - Dockerfile copies scripts in both stages');
  console.error('   - AppConfig model in prisma/schema.prisma');
  console.error('   - AppConfig migration');
  console.error('   - npm script auth:fpr:check');
  console.error('   - compose migrate service calls the script');
  process.exit(1);
} else {
  console.log('\n✅ All required artifacts present');
  console.log('🔒 Auth fingerprint system is properly configured');
}
