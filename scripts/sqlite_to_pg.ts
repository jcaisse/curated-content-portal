#!/usr/bin/env ts-node

/**
 * Import SQLite data to PostgreSQL
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface ImportData {
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

async function importToPostgreSQL() {
  console.log('📥 Importing data to PostgreSQL...');
  
  const pgDb = new PrismaClient();
  
  try {
    // Find the latest export file
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      console.error('❌ No exports directory found. Run export:sqlite first.');
      process.exit(1);
    }

    const exportFiles = await glob('sqlite-export-*.json', { cwd: exportsDir });
    if (exportFiles.length === 0) {
      console.error('❌ No export files found. Run export:sqlite first.');
      process.exit(1);
    }

    const latestExport = exportFiles.sort().pop()!;
    const exportFile = path.join(exportsDir, latestExport);
    
    console.log(`📄 Using export file: ${latestExport}`);
    
    const exportData: ImportData = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
    
    // Import in dependency order
    console.log('👥 Importing users...');
    for (const user of exportData.users) {
      await pgDb.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          role: user.role as any,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
          image: user.image,
          updatedAt: new Date()
        },
        create: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as any,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
          image: user.image,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }
      });
    }

    console.log('🏷️  Importing keywords...');
    for (const keyword of exportData.keywords) {
      await pgDb.keyword.upsert({
        where: { name: keyword.name },
        update: {
          description: keyword.description,
          isActive: keyword.isActive,
          updatedAt: new Date()
        },
        create: {
          id: keyword.id,
          name: keyword.name,
          description: keyword.description,
          isActive: keyword.isActive,
          createdBy: keyword.createdBy,
          createdAt: new Date(keyword.createdAt),
          updatedAt: new Date(keyword.updatedAt)
        }
      });
    }

    console.log('🏃 Importing crawl runs...');
    for (const run of exportData.crawlRuns) {
      await pgDb.crawlRun.upsert({
        where: { id: run.id },
        update: {
          status: run.status as any,
          startedAt: run.startedAt ? new Date(run.startedAt) : null,
          completedAt: run.completedAt ? new Date(run.completedAt) : null,
          itemsFound: run.itemsFound,
          itemsProcessed: run.itemsProcessed,
          error: run.error
        },
        create: {
          id: run.id,
          keywordId: run.keywordId,
          status: run.status as any,
          startedAt: run.startedAt ? new Date(run.startedAt) : null,
          completedAt: run.completedAt ? new Date(run.completedAt) : null,
          itemsFound: run.itemsFound,
          itemsProcessed: run.itemsProcessed,
          error: run.error,
          createdAt: new Date(run.createdAt)
        }
      });
    }

    console.log('📝 Importing posts...');
    for (const post of exportData.posts) {
      await pgDb.post.upsert({
        where: { url: post.url },
        update: {
          title: post.title,
          description: post.description,
          content: post.content,
          imageUrl: post.imageUrl,
          source: post.source,
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
          status: post.status as any,
          tags: Array.isArray(post.tags) ? post.tags : JSON.parse(post.tags || '[]'),
          updatedAt: new Date()
        },
        create: {
          id: post.id,
          title: post.title,
          description: post.description,
          content: post.content,
          url: post.url,
          imageUrl: post.imageUrl,
          source: post.source,
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
          status: post.status as any,
          tags: Array.isArray(post.tags) ? post.tags : JSON.parse(post.tags || '[]'),
          urlHash: post.urlHash,
          keywordId: post.keywordId,
          runId: post.runId,
          authorId: post.authorId,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt)
        }
      });
    }

    console.log('🔗 Importing related posts...');
    for (const related of exportData.relatedPosts) {
      await pgDb.relatedPost.upsert({
        where: { postId_relatedId: { postId: related.postId, relatedId: related.relatedId } },
        update: {
          similarity: related.similarity
        },
        create: {
          id: related.id,
          postId: related.postId,
          relatedId: related.relatedId,
          similarity: related.similarity
        }
      });
    }

    console.log('⚙️  Importing source configs...');
    for (const config of exportData.sourceConfigs) {
      await pgDb.sourceConfig.upsert({
        where: { domain: config.domain },
        update: {
          isAllowed: config.isAllowed,
          rateLimit: config.rateLimit,
          updatedAt: new Date()
        },
        create: {
          id: config.id,
          domain: config.domain,
          isAllowed: config.isAllowed,
          rateLimit: config.rateLimit,
          createdAt: new Date(config.createdAt),
          updatedAt: new Date(config.updatedAt)
        }
      });
    }

    console.log('✅ Import completed successfully!');
    console.log(`📊 Imported data:`);
    console.log(`   - Users: ${exportData.users.length}`);
    console.log(`   - Keywords: ${exportData.keywords.length}`);
    console.log(`   - Crawl Runs: ${exportData.crawlRuns.length}`);
    console.log(`   - Posts: ${exportData.posts.length}`);
    console.log(`   - Related Posts: ${exportData.relatedPosts.length}`);
    console.log(`   - Source Configs: ${exportData.sourceConfigs.length}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await pgDb.$disconnect();
  }
}

if (require.main === module) {
  importToPostgreSQL();
}
