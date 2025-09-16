#!/usr/bin/env node

const { readFileSync, existsSync } = require('fs');
const { join, dirname } = require('path');
const { execSync } = require('child_process');

const projectRoot = join(__dirname, '..');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function logError(message) {
  console.error(`${colors.red}${colors.bold}❌ pgvector Validation Error:${colors.reset} ${colors.red}${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}${colors.bold}✅ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}${colors.bold}⚠️  ${message}${colors.reset}`);
}

function validatePrismaMigrations() {
  const migrationsDir = join(projectRoot, 'prisma', 'migrations');
  
  if (!existsSync(migrationsDir)) {
    logError('Prisma migrations directory not found');
    return false;
  }

  let foundVectorExtension = false;
  
  try {
    const migrationFiles = execSync(`find "${migrationsDir}" -name "*.sql"`, { encoding: 'utf8' });
    
    for (const file of migrationFiles.trim().split('\n')) {
      if (file && existsSync(file)) {
        const content = readFileSync(file, 'utf8');
        if (content.includes('CREATE EXTENSION IF NOT EXISTS vector')) {
          foundVectorExtension = true;
          break;
        }
      }
    }
  } catch (error) {
    logWarning('Could not search migration files');
  }

  if (!foundVectorExtension) {
    logError('No migration found that enables pgvector extension (CREATE EXTENSION IF NOT EXISTS vector)');
    return false;
  }

  logSuccess('Prisma migrations validate: pgvector extension creation found');
  return true;
}

async function validateRuntimePgvector() {
  // Load environment variables
  const envPath = join(projectRoot, '.env.local');
  let databaseUrl = process.env.DATABASE_URL;
  
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('DATABASE_URL=')) {
        databaseUrl = line.split('=').slice(1).join('=').replace(/['"]/g, '');
        break;
      }
    }
  }

  if (!databaseUrl) {
    logWarning('DATABASE_URL not found - skipping runtime pgvector validation');
    return true;
  }

  // Check if it's a PostgreSQL URL
  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    logWarning('DATABASE_URL is not PostgreSQL - skipping runtime pgvector validation');
    return true;
  }

  try {
    // Try to connect and check for pgvector extension
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    });

    // Check if pgvector extension exists
    const result = await prisma.$queryRaw`SELECT extname FROM pg_extension WHERE extname='vector'`;
    
    if (!result || result.length === 0) {
      logError('pgvector extension is not enabled in the database');
      await prisma.$disconnect();
      return false;
    }

    await prisma.$disconnect();
    logSuccess('Runtime validation: pgvector extension is enabled');
    return true;

  } catch (error) {
    logWarning(`Could not validate pgvector at runtime: ${error.message}`);
    logWarning('This may be expected if the database is not running or accessible');
    return true; // Don't fail the check if we can't connect
  }
}

function validateDockerComposePgvector() {
  const composeFiles = ['docker-compose.yml', 'docker-compose.yaml'];
  
  for (const composeFile of composeFiles) {
    const composePath = join(projectRoot, composeFile);
    
    if (!existsSync(composePath)) {
      continue;
    }

    const composeContent = readFileSync(composePath, 'utf8');
    
    // Check for pgvector image or init script
    if (composeContent.includes('pgvector/pgvector') || 
        composeContent.includes('pgvector') ||
        composeContent.includes('CREATE EXTENSION IF NOT EXISTS vector')) {
      logSuccess('Docker Compose validates: pgvector configuration found');
      return true;
    }
  }

  logWarning('Docker Compose may not be configured for pgvector');
  return true; // Don't fail, just warn
}

async function main() {
  console.log(`${colors.blue}${colors.bold}🔍 pgvector Validation${colors.reset}\n`);

  const validations = [
    validatePrismaMigrations,
    validateDockerComposePgvector,
    validateRuntimePgvector
  ];

  let allPassed = true;

  for (const validation of validations) {
    try {
      const passed = await validation();
      if (!passed) {
        allPassed = false;
      }
    } catch (error) {
      logError(`Validation error: ${error.message}`);
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));

  if (allPassed) {
    logSuccess('All pgvector validations passed!');
    process.exit(0);
  } else {
    logError('pgvector validation failed!');
    process.exit(1);
  }
}

main().catch(error => {
  logError(`Script error: ${error.message}`);
  process.exit(1);
});
