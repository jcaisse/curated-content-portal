import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'prisma', 'migrations');

console.log('🔍 Validating Prisma migrations...');

try {
  const dirs = readdirSync(root);
  
  if (dirs.length === 0) {
    console.log('✅ No migrations found (this is OK for new projects)');
    process.exit(0);
  }
  
  for (const d of dirs) {
    const dir = join(root, d);
    try {
      const f = join(dir, 'migration.sql');
      const s = statSync(f);
      if (!s.isFile() || s.size === 0) {
        console.error(`❌ Invalid migration: ${d} (missing or empty migration.sql)`);
        process.exit(1);
      }
      console.log(`✅ Migration ${d}: OK (${s.size} bytes)`);
    } catch {
      console.error(`❌ Invalid migration: ${d} (missing migration.sql)`);
      process.exit(1);
    }
  }
  
  console.log(`✅ All ${dirs.length} migrations validated successfully`);
} catch (error) {
  console.error(`❌ Error reading migrations directory: ${error.message}`);
  process.exit(1);
}

