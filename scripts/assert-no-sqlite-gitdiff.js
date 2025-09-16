#!/usr/bin/env node

const { execSync } = require('child_process');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function logError(message) {
  console.error(`${colors.red}${colors.bold}❌ Git Diff Violation:${colors.reset} ${colors.red}${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}${colors.bold}✅ ${message}${colors.reset}`);
}

function checkGitDiff() {
  try {
    // Get the staged changes
    const stagedChanges = execSync('git diff --cached', { encoding: 'utf8' });
    
    // Get the unstaged changes (for pre-commit)
    const unstagedChanges = execSync('git diff', { encoding: 'utf8' });
    
    const allChanges = stagedChanges + unstagedChanges;
    
    // Forbidden patterns that indicate SQLite usage
    const forbiddenPatterns = [
      'provider = "sqlite"',
      'sqlite3',
      'better-sqlite3',
      'file:./',
      'file://',
      'DATABASE_URL="file:',
      'DATABASE_URL=file:'
    ];
    
    const violations = [];
    
    for (const pattern of forbiddenPatterns) {
      if (allChanges.includes(pattern)) {
        violations.push(pattern);
      }
    }
    
    if (violations.length > 0) {
      logError('SQLite-related changes detected in git diff:');
      violations.forEach(violation => {
        console.error(`  - ${violation}`);
      });
      
      console.log(`\n${colors.yellow}To override this check, create ARCH_CHANGE_REQUEST.md with:${colors.reset}`);
      console.log(`${colors.yellow}ARCH_CHANGE_APPROVED: true${colors.reset}\n`);
      
      return false;
    }
    
    logSuccess('Git diff validation passed - no SQLite changes detected');
    return true;
    
  } catch (error) {
    // If not in a git repository, skip the check
    if (error.message.includes('not a git repository')) {
      logSuccess('Not in a git repository - skipping git diff validation');
      return true;
    }
    
    logError(`Git diff check failed: ${error.message}`);
    return false;
  }
}

function main() {
  console.log(`${colors.yellow}${colors.bold}🔍 Git Diff Validation${colors.reset}\n`);
  
  const passed = checkGitDiff();
  
  if (passed) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main();
