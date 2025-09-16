#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

/**
 * Check for hardcoded secrets and weak defaults in the codebase
 */

const WEAK_PATTERNS = [
  // Database credentials
  /postgres\/postgres/gi,
  /postgresql:\/\/postgres:postgres/gi,
  /admin:admin/gi,
  
  // Common weak passwords
  /password.*=.*['"]?(password|admin|admin123|123456|changeme|secret)/gi,
  /admin.*password.*=.*['"]?(admin|admin123|password|123456)/gi,
  
  // TODO placeholders that should be replaced
  /TODO:\s*Set\s+(admin\s+)?password/gi,
  /your-secret-key/gi,
  /your-password/gi,
  /your-admin-ingest-key/gi,
  
  // SQLite references (not allowed)
  /provider\s*=\s*['"]sqlite['"]/gi,
  /file:\.\/.*\.db/gi,
  /better-sqlite3/gi,
  /sqlite3/gi,
  
  // Weak secret patterns
  /NEXTAUTH_SECRET.*=.*['"]?(test|dev|your-secret|123)/gi,
  /JWT_SECRET.*=.*['"]?(test|dev|your-secret|123)/gi,
  /ADMIN_INGEST_KEY.*=.*['"]?(test|dev|your-key|123)/gi,
];

const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '.git', 'coverage', '.secrets'];
const EXCLUDE_FILES = ['package-lock.json', 'yarn.lock', '.env.local', '.env.production', '.env.staging'];

class SecretScanner {
  constructor() {
    this.violations = [];
    this.stats = {
      total: 0,
      byType: {},
      byFile: {},
    };
  }

  /**
   * Scan a directory recursively for secret violations
   */
  scanDirectory(dirPath, relativePath = '') {
    try {
      const items = readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = join(dirPath, item);
        const relativeItemPath = join(relativePath, item);
        
        if (EXCLUDE_DIRS.includes(item)) {
          continue;
        }
        
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          this.scanDirectory(fullPath, relativeItemPath);
        } else if (stat.isFile()) {
          this.scanFile(fullPath, relativeItemPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error.message);
    }
  }

  /**
   * Scan a single file for secret violations
   */
  scanFile(filePath, relativePath) {
    const ext = extname(filePath);
    
    // Check all text files
    if (!['.ts', '.tsx', '.js', '.jsx', '.md', '.yml', '.yaml', '.json', '.sh', '.sql', '.env'].includes(ext)) {
      return;
    }
    
    if (EXCLUDE_FILES.includes(relativePath.split('/').pop())) {
      return;
    }
    
    try {
      const content = readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        
        for (const pattern of WEAK_PATTERNS) {
          const matches = [...line.matchAll(pattern)];
          
          for (const match of matches) {
            const violationType = this.getViolationType(pattern);
            
            this.violations.push({
              file: relativePath,
              line: lineNumber,
              type: violationType,
              content: line.trim(),
              match: match[0],
            });
            
            this.stats.total++;
            this.stats.byType[violationType] = (this.stats.byType[violationType] || 0) + 1;
            this.stats.byFile[relativePath] = (this.stats.byFile[relativePath] || 0) + 1;
          }
        }
      });
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error.message);
    }
  }

  /**
   * Get violation type from pattern
   */
  getViolationType(pattern) {
    const patternStr = pattern.toString();
    
    if (patternStr.includes('postgres') || patternStr.includes('sqlite')) {
      return 'Database';
    } else if (patternStr.includes('password') || patternStr.includes('admin')) {
      return 'Authentication';
    } else if (patternStr.includes('TODO') || patternStr.includes('your-')) {
      return 'Placeholder';
    } else if (patternStr.includes('SECRET') || patternStr.includes('JWT')) {
      return 'Secret';
    } else {
      return 'Other';
    }
  }

  /**
   * Generate a formatted report
   */
  generateReport() {
    console.log('🔒 Secret Security Scan Report');
    console.log('=' .repeat(50));
    console.log('');
    
    // Summary
    console.log('📊 Summary:');
    console.log(`   Total violations: ${this.stats.total}`);
    console.log('   By type:');
    Object.entries(this.stats.byType)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`     ${type}: ${count}`);
      });
    console.log('');
    
    if (this.stats.total === 0) {
      console.log('✅ No security violations found!');
      return;
    }
    
    // Group by file
    const violationsByFile = {};
    for (const violation of this.violations) {
      if (!violationsByFile[violation.file]) {
        violationsByFile[violation.file] = [];
      }
      violationsByFile[violation.file].push(violation);
    }
    
    console.log('🚨 Violations by File:');
    Object.entries(violationsByFile)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([file, violations]) => {
        console.log(`\n   📁 ${file}:`);
        violations.forEach(violation => {
          console.log(`     Line ${violation.line}: [${violation.type}] ${violation.match}`);
          console.log(`       ${violation.content}`);
        });
      });
    
    console.log('');
    console.log('🔍 Most problematic files:');
    Object.entries(this.stats.byFile)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([file, count]) => {
        console.log(`   ${file}: ${count} violations`);
      });
  }

  /**
   * Check if any violations found (for CI)
   */
  hasViolations() {
    return this.stats.total > 0;
  }

  /**
   * Get critical violations that should block deployment
   */
  getCriticalViolations() {
    return this.violations.filter(violation => {
      return ['Database', 'Authentication', 'Secret'].includes(violation.type);
    });
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const scanner = new SecretScanner();
  scanner.scanDirectory(process.cwd());
  
  switch (command) {
    case 'check':
      // For CI - exit with error if violations found
      if (scanner.hasViolations()) {
        console.log('❌ Security violations found in codebase');
        scanner.generateReport();
        
        const criticalViolations = scanner.getCriticalViolations();
        if (criticalViolations.length > 0) {
          console.log('\n🚨 Critical violations (deployment blockers):');
          criticalViolations.forEach(violation => {
            console.log(`   ${violation.file}:${violation.line} - [${violation.type}] ${violation.match}`);
          });
        }
        
        process.exit(1);
      } else {
        console.log('✅ No security violations found');
        process.exit(0);
      }
      break;
      
    case 'report':
    default:
      scanner.generateReport();
      
      const criticalViolations = scanner.getCriticalViolations();
      if (criticalViolations.length > 0) {
        console.log('\n🚨 Critical violations (deployment blockers):');
        criticalViolations.forEach(violation => {
          console.log(`   ${violation.file}:${violation.line} - [${violation.type}] ${violation.match}`);
        });
      }
      break;
  }
}

main();
