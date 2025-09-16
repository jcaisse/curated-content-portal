#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

async function migrate() {
  console.log('🔄 Starting database migration...');
  
  const prisma = new PrismaClient();
  
  try {
    // Enable pgvector extension
    console.log('📦 Enabling pgvector extension...');
    await prisma.$queryRaw`CREATE EXTENSION IF NOT EXISTS vector;`;
    console.log('✅ pgvector extension enabled');
    
    // Run Prisma migrations
    console.log('🔄 Running Prisma migrations...');
    const { execSync } = await import('child_process');
    execSync('node node_modules/.bin/prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Prisma migrations completed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('🎉 Database migration completed successfully');
}

migrate();
