#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🔍 Scanning for .state directory writes and auth.fpr file operations...');

// Patterns to detect file-based state operations
const forbiddenPatterns = [
  // mkdir operations on .state
  /mkdir.*\.state/i,
  /mkdirSync.*\.state/i,
  /fs\.mkdir.*\.state/i,
  
  // writeFile operations on auth.fpr or .state
  /writeFile.*auth\.fpr/i,
  /writeFileSync.*auth\.fpr/i,
  /writeFile.*\.state/i,
  /writeFileSync.*\.state/i,
  
  // Path references to auth.fpr
  /auth\.fpr/i,
  
  // Environment variable for auth fingerprint path
  /AUTH_FPR_PATH/i,
  
  // Dockerfile operations on .state
  /RUN.*mkdir.*\.state/i,
  /COPY.*\.state/i,
];

let hasErrors = false;

try {
  // Search for TypeScript/JavaScript files with forbidden patterns
  const jsFiles = execSync('find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "Dockerfile*" | grep -v node_modules | grep -v .next | grep -v .git', { 
    encoding: 'utf-8',
    cwd: process.cwd()
  }).trim().split('\n').filter(f => f.length > 0);

  for (const file of jsFiles) {
    try {
      const content = execSync(`cat "${file}"`, { encoding: 'utf-8' });
      
      forbiddenPatterns.forEach(pattern => {
        const matches = content.match(new RegExp(pattern.source, 'gmi'));
        if (matches) {
          matches.forEach(match => {
            const lines = content.split('\n');
            const lineIndex = lines.findIndex(line => line.toLowerCase().includes(match.toLowerCase()));
            if (lineIndex !== -1) {
              console.error(`❌ ${file}:${lineIndex + 1}: Found forbidden pattern: ${match.trim()}`);
              console.error(`   Line: ${lines[lineIndex].trim()}`);
              console.error('   💡 Auth fingerprint should use database, not filesystem');
              hasErrors = true;
            }
          });
        }
      });
    } catch (error) {
      // Skip files that can't be read
    }
  }

  // Special check for Dockerfile .state directory creation
  try {
    const dockerfileContent = execSync('find . -name "Dockerfile*" -exec cat {} \\;', { encoding: 'utf-8' });
    if (/mkdir.*\.state/i.test(dockerfileContent)) {
      console.error('❌ Dockerfile: Found .state directory creation');
      console.error('   💡 Remove RUN mkdir .state and RUN chown ... .state from Dockerfile');
      hasErrors = true;
    }
  } catch (error) {
    // No Dockerfiles found, that's okay
  }

} catch (error) {
  console.error('❌ Error scanning files:', error.message);
  hasErrors = true;
}

if (hasErrors) {
  console.error('\n❌ Found forbidden file-based state operations');
  console.error('💡 Fix: Use database-backed auth fingerprint instead of filesystem');
  console.error('   - Auth fingerprint should be stored in AppConfig table');
  console.error('   - Validation should happen during migrate step');
  console.error('   - No .state directory or auth.fpr files should be created');
  process.exit(1);
} else {
  console.log('\n✅ No forbidden file-based state operations found');
  console.log('🔒 Auth fingerprint is properly database-backed');
}

