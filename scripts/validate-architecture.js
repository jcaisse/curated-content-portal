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
  console.error(`${colors.red}${colors.bold}❌ Architecture Lock Violation:${colors.reset} ${colors.red}${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}${colors.bold}✅ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}${colors.bold}⚠️  ${message}${colors.reset}`);
}

function checkApprovalFile() {
  const approvalFile = join(projectRoot, 'ARCH_CHANGE_REQUEST.md');
  if (existsSync(approvalFile)) {
    const content = readFileSync(approvalFile, 'utf8');
    if (content.includes('ARCH_CHANGE_APPROVED: true')) {
      logWarning('Architecture change approval detected. Proceeding with validation...');
      return true;
    }
  }
  return false;
}

function validatePrismaSchema() {
  const schemaPath = join(projectRoot, 'prisma', 'schema.prisma');
  
  if (!existsSync(schemaPath)) {
    logError('prisma/schema.prisma not found');
    return false;
  }

  const schema = readFileSync(schemaPath, 'utf8');
  
  // Check for SQLite provider
  if (schema.includes('provider = "sqlite"')) {
    logError('Prisma schema contains provider = "sqlite". PostgreSQL required.');
    return false;
  }

  // Check for PostgreSQL provider
  if (!schema.includes('provider = "postgresql"')) {
    logError('Prisma schema must use provider = "postgresql"');
    return false;
  }

  // Check for file-based DSNs
  if (schema.includes('file:./') || schema.includes('file://')) {
    logError('Prisma schema contains file-based DSN. PostgreSQL required.');
    return false;
  }

  logSuccess('Prisma schema validates: PostgreSQL provider detected');
  return true;
}

function validatePackageJson() {
  const packagePath = join(projectRoot, 'package.json');
  
  if (!existsSync(packagePath)) {
    logError('package.json not found');
    return false;
  }

  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  const allDeps = {
    ...packageJson.dependencies || {},
    ...packageJson.devDependencies || {}
  };

  // Check for SQLite dependencies
  const forbiddenDeps = ['sqlite3', 'better-sqlite3'];
  const foundForbidden = forbiddenDeps.filter(dep => allDeps[dep]);
  
  if (foundForbidden.length > 0) {
    logError(`Forbidden SQLite dependencies found: ${foundForbidden.join(', ')}`);
    return false;
  }

  logSuccess('Package.json validates: No SQLite dependencies found');
  return true;
}

function validateEnvironmentFiles() {
  const envFiles = ['.env.example', '.env.prod.example'];
  let allValid = true;

  for (const envFile of envFiles) {
    const envPath = join(projectRoot, envFile);
    
    if (!existsSync(envPath)) {
      logWarning(`${envFile} not found - skipping validation`);
      continue;
    }

    const envContent = readFileSync(envPath, 'utf8');
    
    // Check for file-based DATABASE_URL
    if (envContent.includes('DATABASE_URL="file:') || envContent.includes('DATABASE_URL=file:')) {
      logError(`${envFile} contains file-based DATABASE_URL. PostgreSQL required.`);
      allValid = false;
    }

    // Check for PostgreSQL DATABASE_URL
    if (!envContent.includes('DATABASE_URL=') || 
        (!envContent.includes('postgresql://') && !envContent.includes('postgres://'))) {
      logWarning(`${envFile} missing PostgreSQL DATABASE_URL`);
    }
  }

  if (allValid) {
    logSuccess('Environment files validate: No file-based DATABASE_URL found');
  }

  return allValid;
}

function validateDockerCompose() {
  const composeFiles = ['docker-compose.yml', 'docker-compose.yaml'];
  let foundValidCompose = false;

  for (const composeFile of composeFiles) {
    const composePath = join(projectRoot, composeFile);
    
    if (!existsSync(composePath)) {
      continue;
    }

    const composeContent = readFileSync(composePath, 'utf8');
    
    // Check for PostgreSQL service
    if (composeContent.includes('postgres') || composeContent.includes('pgvector')) {
      foundValidCompose = true;
      
      // Check for proper image
      if (!composeContent.includes('postgres') && !composeContent.includes('pgvector')) {
        logWarning(`${composeFile} has db service but may not use PostgreSQL image`);
      }
      
      break;
    }
  }

  if (!foundValidCompose) {
    logError('No docker-compose.yml found with PostgreSQL service');
    return false;
  }

  logSuccess('Docker Compose validates: PostgreSQL service detected');
  return true;
}

function validateNoSqliteInCode() {
  const searchPaths = [
    'src',
    'scripts',
    'prisma',
    'tests'
  ];

  const forbiddenPatterns = [
    'sqlite3',
    'better-sqlite3',
    'file:./',
    'file://',
    'provider = "sqlite"'
  ];

  // Files to exclude from validation (guard scripts, backup schemas, and migration scripts)
  const excludedFiles = [
    'validate-architecture.js',
    'validate-pgvector.js', 
    'assert-no-sqlite-gitdiff.js',
    'schema-sqlite.prisma',
    'schema-postgres.prisma',
    'sqlite_export.ts',
    'sqlite_to_pg.ts'
  ];

  let violations = [];

  for (const searchPath of searchPaths) {
    const fullPath = join(projectRoot, searchPath);
    
    if (!existsSync(fullPath)) {
      continue;
    }

    // Check each forbidden pattern individually
    for (const pattern of forbiddenPatterns) {
      try {
        // Use a simpler approach with proper escaping
        const escapedPattern = pattern.replace(/"/g, '\\"');
        const command = `find "${fullPath}" -type f \\( -name "*.ts" -o -name "*.js" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" -o -name "*.txt" -o -name "*.prisma" \\) -exec grep -l "${escapedPattern}" {} + 2>/dev/null || true`;
        const result = execSync(command, { encoding: 'utf8' });
        
        if (result.trim()) {
          const files = result.trim().split('\n').filter(f => f.trim());
          // Filter out excluded files
          const filteredFiles = files.filter(file => {
            const fileName = file.split('/').pop();
            return !excludedFiles.includes(fileName);
          });
          
          if (filteredFiles.length > 0) {
            violations.push(...filteredFiles);
          }
        }
      } catch (error) {
        // Ignore grep errors (no matches)
      }
    }
  }

  if (violations.length > 0) {
    logError(`SQLite references found in files: ${violations.join(', ')}`);
    return false;
  }

  logSuccess('Code validation: No SQLite references found');
  return true;
}

function main() {
  console.log(`${colors.blue}${colors.bold}🔒 Architecture Lock Validation${colors.reset}\n`);

  const hasApproval = checkApprovalFile();
  
  const validations = [
    validatePrismaSchema,
    validatePackageJson,
    validateEnvironmentFiles,
    validateDockerCompose,
    validateNoSqliteInCode
  ];

  let allPassed = true;

  for (const validation of validations) {
    try {
      const passed = validation();
      if (!passed && !hasApproval) {
        allPassed = false;
      }
    } catch (error) {
      logError(`Validation error: ${error.message}`);
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));

  if (allPassed) {
    logSuccess('All architecture validations passed!');
    process.exit(0);
  } else {
    logError('Architecture validation failed!');
    if (!hasApproval) {
      console.log(`\n${colors.yellow}To override this check, create ARCH_CHANGE_REQUEST.md with:${colors.reset}`);
      console.log(`${colors.yellow}ARCH_CHANGE_APPROVED: true${colors.reset}\n`);
    }
    process.exit(1);
  }
}

main();
