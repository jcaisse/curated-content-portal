#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

/**
 * Scan source files for TODO, FIXME, XXX comments
 */

const TODO_PATTERNS = [
  /TODO:?\s*(.+)/gi,
  /FIXME:?\s*(.+)/gi,
  /XXX:?\s*(.+)/gi,
  /HACK:?\s*(.+)/gi,
  /NOTE:?\s*(.+)/gi,
  /BUG:?\s*(.+)/gi,
];

const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.md', '.yml', '.yaml', '.json'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '.git', 'coverage'];
const EXCLUDE_FILES = ['package-lock.json', 'yarn.lock'];

class TodoScanner {
  constructor() {
    this.todos = [];
    this.stats = {
      total: 0,
      byType: {},
      byFile: {},
    };
  }

  /**
   * Scan a directory recursively for TODO comments
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
   * Scan a single file for TODO comments
   */
  scanFile(filePath, relativePath) {
    const ext = extname(filePath);
    
    if (!FILE_EXTENSIONS.includes(ext)) {
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
        const trimmedLine = line.trim();
        
        // Skip empty lines and pure comments
        if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('*')) {
          return;
        }
        
        for (const pattern of TODO_PATTERNS) {
          const matches = [...line.matchAll(pattern)];
          
          for (const match of matches) {
            const type = match[0].split(':')[0].toUpperCase();
            const description = match[1]?.trim() || '';
            
            this.todos.push({
              file: relativePath,
              line: lineNumber,
              type,
              description,
              fullLine: line.trim(),
            });
            
            this.stats.total++;
            this.stats.byType[type] = (this.stats.byType[type] || 0) + 1;
            this.stats.byFile[relativePath] = (this.stats.byFile[relativePath] || 0) + 1;
          }
        }
      });
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error.message);
    }
  }

  /**
   * Generate a formatted report
   */
  generateReport() {
    console.log('📋 TODO/FIXME/XXX Report');
    console.log('=' .repeat(50));
    console.log('');
    
    // Summary
    console.log('📊 Summary:');
    console.log(`   Total items: ${this.stats.total}`);
    console.log('   By type:');
    Object.entries(this.stats.byType)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`     ${type}: ${count}`);
      });
    console.log('');
    
    if (this.stats.total === 0) {
      console.log('✅ No TODO/FIXME/XXX items found!');
      return;
    }
    
    // Group by file
    const todosByFile = {};
    for (const todo of this.todos) {
      if (!todosByFile[todo.file]) {
        todosByFile[todo.file] = [];
      }
      todosByFile[todo.file].push(todo);
    }
    
    console.log('📁 By File:');
    Object.entries(todosByFile)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([file, todos]) => {
        console.log(`\n   ${file}:`);
        todos.forEach(todo => {
          console.log(`     Line ${todo.line}: [${todo.type}] ${todo.description}`);
          if (todo.fullLine.length > 100) {
            console.log(`       ${todo.fullLine.substring(0, 97)}...`);
          } else {
            console.log(`       ${todo.fullLine}`);
          }
        });
      });
    
    console.log('');
    console.log('🔍 Most TODO-heavy files:');
    Object.entries(this.stats.byFile)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([file, count]) => {
        console.log(`   ${file}: ${count} items`);
      });
  }

  /**
   * Check if any TODOs remain (for CI)
   */
  hasTodos() {
    return this.stats.total > 0;
  }

  /**
   * Get TODOs that should block production
   */
  getBlockingTodos() {
    return this.todos.filter(todo => {
      const description = todo.description.toLowerCase();
      
      // Block production if TODO contains certain keywords
      const blockingKeywords = [
        'security',
        'password',
        'secret',
        'auth',
        'database',
        'migration',
        'production',
        'deploy',
        'critical',
        'vulnerability',
        'exploit',
      ];
      
      return blockingKeywords.some(keyword => description.includes(keyword));
    });
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const scanner = new TodoScanner();
  scanner.scanDirectory(process.cwd());
  
  switch (command) {
    case 'check':
      // For CI - exit with error if TODOs found
      if (scanner.hasTodos()) {
        console.log('❌ TODOs found in codebase');
        scanner.generateReport();
        
        const blockingTodos = scanner.getBlockingTodos();
        if (blockingTodos.length > 0) {
          console.log('\n🚨 Blocking TODOs (production blockers):');
          blockingTodos.forEach(todo => {
            console.log(`   ${todo.file}:${todo.line} - [${todo.type}] ${todo.description}`);
          });
        }
        
        process.exit(1);
      } else {
        console.log('✅ No TODOs found');
        process.exit(0);
      }
      break;
      
    case 'report':
    default:
      scanner.generateReport();
      
      const blockingTodos = scanner.getBlockingTodos();
      if (blockingTodos.length > 0) {
        console.log('\n🚨 Blocking TODOs (production blockers):');
        blockingTodos.forEach(todo => {
          console.log(`   ${todo.file}:${todo.line} - [${todo.type}] ${todo.description}`);
        });
      }
      break;
  }
}

main();
