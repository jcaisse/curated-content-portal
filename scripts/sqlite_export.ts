#!/usr/bin/env ts-node

/**
 * Export SQLite data to JSON for migration to PostgreSQL
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const sqliteDb = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

interface ExportData {
  users: any[];
  keywords: any[];
  crawlRuns: any[];
  posts: any[];
  relatedPosts: any[];
  sourceConfigs: any[];
  accounts: any[];
  sessions: any[];
  verificationTokens: any[];
}

async function exportSQLiteData() {
  console.log('📤 Exporting SQLite data...');
  
  try {
    const exportData: ExportData = {
      users: [],
      keywords: [],
      crawlRuns: [],
      posts: [],
      relatedPosts: [],
      sourceConfigs: [],
      accounts: [],
      sessions: [],
      verificationTokens: []
    };

    // Export all tables
    exportData.users = await sqliteDb.user.findMany();
    exportData.keywords = await sqliteDb.keyword.findMany();
    exportData.crawlRuns = await sqliteDb.crawlRun.findMany();
    exportData.posts = await sqliteDb.post.findMany();
    exportData.relatedPosts = await sqliteDb.relatedPost.findMany();
    exportData.sourceConfigs = await sqliteDb.sourceConfig.findMany();
    exportData.accounts = await sqliteDb.account.findMany();
    exportData.sessions = await sqliteDb.session.findMany();
    exportData.verificationTokens = await sqliteDb.verificationToken.findMany();

    // Create exports directory
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }

    // Write JSON files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportFile = path.join(exportsDir, `sqlite-export-${timestamp}.json`);
    
    fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Export completed: ${exportFile}`);
    console.log(`📊 Exported data:`);
    console.log(`   - Users: ${exportData.users.length}`);
    console.log(`   - Keywords: ${exportData.keywords.length}`);
    console.log(`   - Crawl Runs: ${exportData.crawlRuns.length}`);
    console.log(`   - Posts: ${exportData.posts.length}`);
    console.log(`   - Related Posts: ${exportData.relatedPosts.length}`);
    console.log(`   - Source Configs: ${exportData.sourceConfigs.length}`);
    console.log(`   - Accounts: ${exportData.accounts.length}`);
    console.log(`   - Sessions: ${exportData.sessions.length}`);
    console.log(`   - Verification Tokens: ${exportData.verificationTokens.length}`);

  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  } finally {
    await sqliteDb.$disconnect();
  }
}

if (require.main === module) {
  exportSQLiteData();
}
