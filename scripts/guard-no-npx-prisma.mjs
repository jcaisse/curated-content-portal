import { execSync } from 'child_process';

console.log('🔍 Checking for "npx prisma" usage at runtime...');

try {
  // Only check src directory for runtime code
  const out = execSync(`grep -RIn -E "npx\\s+prisma" src/ || true`, { encoding: 'utf-8' });
  
  if (out.trim().length > 0) {
    console.error('❌ Found "npx prisma" usage in runtime code:\n' + out);
    console.error('   💡 Use node node_modules/.bin/prisma instead of npx prisma');
    process.exit(1);
  }
  
  console.log('✅ No "npx prisma" usage detected in runtime code.');
} catch (error) {
  console.error('❌ Error running grep:', error.message);
  process.exit(1);
}
