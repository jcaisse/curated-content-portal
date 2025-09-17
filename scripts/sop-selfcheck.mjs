#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';

console.log('🔍 Checking Standard Operating Procedure (SOP) files...');

let hasErrors = false;

// Required SOP files
const requiredFiles = [
  'ops/deploy-sop.md',
  'ops/deploy.sh',
  'ops/deploy.recipe.json',
  'ops/agent-contract.md'
];

// Check required files exist
for (const file of requiredFiles) {
  if (!existsSync(file)) {
    console.error(`❌ Missing required SOP file: ${file}`);
    hasErrors = true;
  } else {
    console.log(`✅ Found: ${file}`);
  }
}

// Check deploy script is executable
if (existsSync('ops/deploy.sh')) {
  try {
    const { execSync } = await import('child_process');
    execSync('test -x ops/deploy.sh', { stdio: 'ignore' });
    console.log('✅ ops/deploy.sh is executable');
  } catch (error) {
    console.error('❌ ops/deploy.sh is not executable');
    hasErrors = true;
  }
}

// Check Dockerfile has required COPYs
if (existsSync('Dockerfile')) {
  const dockerfileContent = readFileSync('Dockerfile', 'utf-8');
  const requiredCopies = [
    'COPY src src',
    'COPY public public',
    'COPY prisma prisma',
    'COPY scripts scripts',
    'tailwind.config.*',
    'postcss.config.*'
  ];
  
  for (const copy of requiredCopies) {
    if (!dockerfileContent.includes(copy)) {
      console.error(`❌ Dockerfile missing required COPY: ${copy}`);
      hasErrors = true;
    } else {
      console.log(`✅ Dockerfile has: ${copy}`);
    }
  }
  
  // Check Prisma generate runs in build stage
  if (!dockerfileContent.includes('RUN node node_modules/.bin/prisma generate')) {
    console.error('❌ Dockerfile missing Prisma generate in build stage');
    hasErrors = true;
  } else {
    console.log('✅ Dockerfile runs Prisma generate in build stage');
  }
} else {
  console.error('❌ Dockerfile not found');
  hasErrors = true;
}

// Check docker-compose.yml has required migrate command
if (existsSync('docker-compose.yml')) {
  const composeContent = readFileSync('docker-compose.yml', 'utf-8');
  const requiredCommands = [
    'node node_modules/.bin/prisma migrate deploy',
    'node prisma/seed.mjs',
    'node scripts/auth-fingerprint-check.mjs',
    'node scripts/db-smoke.mjs'
  ];
  
  for (const cmd of requiredCommands) {
    if (!composeContent.includes(cmd)) {
      console.error(`❌ docker-compose.yml missing required command: ${cmd}`);
      hasErrors = true;
    } else {
      console.log(`✅ docker-compose.yml has: ${cmd}`);
    }
  }
  
  // Check migrate service has restart: "no"
  if (!composeContent.includes('restart: "no"')) {
    console.error('❌ docker-compose.yml migrate service missing restart: "no"');
    hasErrors = true;
  } else {
    console.log('✅ docker-compose.yml migrate service has restart: "no"');
  }
} else {
  console.error('❌ docker-compose.yml not found');
  hasErrors = true;
}

// Check package.json has required scripts
if (existsSync('package.json')) {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
  const requiredScripts = [
    'deploy:local',
    'deploy:staging', 
    'deploy:prod',
    'ci:preflight',
    'ci:prove-image'
  ];
  
  for (const script of requiredScripts) {
    if (!packageJson.scripts || !packageJson.scripts[script]) {
      console.error(`❌ package.json missing required script: ${script}`);
      hasErrors = true;
    } else {
      console.log(`✅ package.json has script: ${script}`);
    }
  }
} else {
  console.error('❌ package.json not found');
  hasErrors = true;
}

// Check seed file exists
if (!existsSync('prisma/seed.mjs')) {
  console.error('❌ Missing prisma/seed.mjs');
  hasErrors = true;
} else {
  console.log('✅ Found prisma/seed.mjs');
}

// Check required guard scripts exist
const requiredGuards = [
  'scripts/guard-no-musl.mjs',
  'scripts/guard-no-npx-prisma.mjs',
  'scripts/guard-tailwind.mjs',
  'scripts/guard-css-in-image.mjs',
  'scripts/validate-migrations-in-image.mjs'
];

for (const guard of requiredGuards) {
  if (!existsSync(guard)) {
    console.error(`❌ Missing required guard script: ${guard}`);
    hasErrors = true;
  } else {
    console.log(`✅ Found guard script: ${guard}`);
  }
}

if (hasErrors) {
  console.error('\n❌ SOP self-check failed');
  console.error('💡 Ensure all required SOP files and configurations are present:');
  console.error('   - ops/deploy-sop.md (human-readable checklist)');
  console.error('   - ops/deploy.sh (executable deployment script)');
  console.error('   - ops/deploy.recipe.json (machine-readable steps)');
  console.error('   - ops/agent-contract.md (agent behavior contract)');
  console.error('   - Dockerfile copies all required files and runs Prisma generate');
  console.error('   - docker-compose.yml has correct migrate command sequence');
  console.error('   - package.json has all required deploy scripts');
  console.error('   - prisma/seed.mjs exists for database seeding');
  console.error('   - All guard scripts are present');
  process.exit(1);
} else {
  console.log('\n✅ SOP self-check passed');
  console.log('🔒 Standard Operating Procedure is complete and valid');
}
