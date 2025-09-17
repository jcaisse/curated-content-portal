import { readFileSync, readdirSync } from 'fs';

console.log('🔍 Checking for Alpine/musl bases in Dockerfiles...');

const files = readdirSync('.', { withFileTypes: true })
  .filter(d => d.isFile() && d.name.startsWith('Dockerfile'))
  .map(d => d.name);

let bad = [];

for (const f of files) {
  const t = readFileSync(f, 'utf8');
  if (/\balpine\b/i.test(t) || /\bmusl\b/i.test(t)) {
    bad.push(f);
  }
}

if (bad.length) {
  console.error('❌ Alpine/musl detected in:', bad.join(', '));
  console.error('   💡 Use node:*-bookworm-slim instead of node:*-alpine');
  process.exit(1);
}

console.log('✅ No Alpine/musl bases detected.');

