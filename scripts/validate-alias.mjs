#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join, resolve, extname } from 'path';
import { execSync } from 'child_process';

console.log('🔍 Validating import aliases...');

// Read tsconfig.json to get path mappings
const tsconfigPath = join(process.cwd(), 'tsconfig.json');
if (!existsSync(tsconfigPath)) {
  console.error('❌ tsconfig.json not found');
  process.exit(1);
}

const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
const paths = tsconfig.compilerOptions?.paths || {};

if (!paths['@/*']) {
  console.error('❌ No @/* path mapping found in tsconfig.json');
  process.exit(1);
}

const baseUrl = tsconfig.compilerOptions?.baseUrl || '.';
const aliasRoot = resolve(process.cwd(), baseUrl, paths['@/*'][0].replace('/*', ''));

console.log(`📁 Alias root: ${aliasRoot}`);
console.log(`🔗 @/* maps to: ${paths['@/*'][0]}`);

// Find all TypeScript/JavaScript files with @/ imports
let filesWithAliasImports;
try {
  const gitGrepOutput = execSync('git grep -nE "from [\\\'\\\"]@/|import.*[\\\'\\\"]@/" -- "*.ts" "*.tsx" "*.js" "*.jsx" || true', { 
    encoding: 'utf-8',
    cwd: process.cwd()
  });
  filesWithAliasImports = gitGrepOutput.trim().split('\n').filter(line => line.length > 0);
} catch (error) {
  console.error('❌ Failed to run git grep:', error.message);
  process.exit(1);
}

if (filesWithAliasImports.length === 0) {
  console.log('✅ No @/ imports found');
  process.exit(0);
}

console.log(`📄 Found ${filesWithAliasImports.length} files with @/ imports`);

let hasErrors = false;

for (const line of filesWithAliasImports) {
  const [filePath, lineNum, ...rest] = line.split(':');
  const fullLine = rest.join(':');
  
    // Extract import paths
    const importMatches = fullLine.match(/['"]@\/([^'"]+)['"]/g);
    if (!importMatches) continue;
    
    for (const importMatch of importMatches) {
      const importPath = importMatch.slice(2, -1).replace(/^\/+/, ''); // Remove @/ and quotes, clean leading slashes
    
    // Resolve the actual file path
    const resolvedPath = resolve(aliasRoot, importPath);
    
    // Check if file exists with common extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
    let found = false;
    
    for (const ext of extensions) {
      const testPath = ext.startsWith('/') ? resolve(resolvedPath, ext.slice(1)) : `${resolvedPath}${ext}`;
      if (existsSync(testPath)) {
        found = true;
        break;
      }
    }
    
    if (!found) {
      console.error(`❌ ${filePath}:${lineNum}: Unresolved import: @/${importPath}`);
      console.error(`   Expected at: ${resolvedPath} (with common extensions)`);
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  console.error('\n❌ Import validation failed');
  console.error('💡 Fix: Ensure all @/ imports resolve to existing files or update tsconfig.json paths');
  process.exit(1);
} else {
  console.log('\n✅ All import aliases resolved successfully');
}
