import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Checking database environment consistency...');

const envFilePath = join(process.cwd(), '.secrets/.env.local');

if (!existsSync(envFilePath)) {
  console.error(`❌ Environment file not found: ${envFilePath}`);
  console.error('💡 Please create it from .secrets/.env.local.example or run `npm run env:bootstrap`');
  process.exit(1);
}

const envContent = readFileSync(envFilePath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, value] = trimmedLine.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim().replace(/^"|"$/g, '');
    }
  }
});

// Parse DATABASE_URL
const databaseUrl = envVars.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

// Extract components from DATABASE_URL
const urlMatch = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
if (!urlMatch) {
  console.error('❌ Invalid DATABASE_URL format');
  process.exit(1);
}

const [, dbUser, dbPassword, dbHost, dbPort, dbName] = urlMatch;

// Check consistency
const postgresUser = envVars.POSTGRES_USER;
const postgresPassword = envVars.POSTGRES_PASSWORD;
const postgresDb = envVars.POSTGRES_DB;

let hasErrors = false;

if (dbUser !== postgresUser) {
  console.error(`❌ User mismatch: DATABASE_URL user '${dbUser}' != POSTGRES_USER '${postgresUser}'`);
  hasErrors = true;
}

if (dbPassword !== postgresPassword) {
  console.error(`❌ Password mismatch: DATABASE_URL password != POSTGRES_PASSWORD`);
  hasErrors = true;
}

if (dbName !== postgresDb) {
  console.error(`❌ Database mismatch: DATABASE_URL db '${dbName}' != POSTGRES_DB '${postgresDb}'`);
  hasErrors = true;
}

// Check host consistency for current mode
const isContainerMode = dbHost === 'db';
const isHostMode = dbHost === 'localhost' || dbHost === '127.0.0.1';

if (!isContainerMode && !isHostMode) {
  console.error(`❌ Invalid host in DATABASE_URL: '${dbHost}'. Expected 'db' for container mode or 'localhost' for host mode`);
  hasErrors = true;
}

if (hasErrors) {
  console.error('\n❌ Database environment validation failed');
  console.error('💡 Ensure DATABASE_URL matches POSTGRES_* variables');
  process.exit(1);
}

console.log('✅ Database environment validation passed');
console.log(`   User: ${dbUser}`);
console.log(`   Database: ${dbName}`);
console.log(`   Host: ${dbHost} (${isContainerMode ? 'container' : 'host'} mode)`);

