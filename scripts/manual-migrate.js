const { PrismaClient } = require('@prisma/client');

async function runMigrations() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Running manual migrations...');
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('User', 'Account', 'Session', 'Keyword', 'Post', 'CrawlRun')
    `;
    
    if (tables.length === 0) {
      console.log('📋 Creating database schema...');
      
      // Create User table
      await prisma.$executeRaw`
        CREATE TABLE "User" (
          "id" TEXT NOT NULL,
          "name" TEXT,
          "email" TEXT NOT NULL,
          "emailVerified" TIMESTAMP(3),
          "image" TEXT,
          "password" TEXT,
          "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
        )
      `;
      
      // Create Account table
      await prisma.$executeRaw`
        CREATE TABLE "Account" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "provider" TEXT NOT NULL,
          "providerAccountId" TEXT NOT NULL,
          "refresh_token" TEXT,
          "access_token" TEXT,
          "expires_at" INTEGER,
          "token_type" TEXT,
          "scope" TEXT,
          "id_token" TEXT,
          "session_state" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
        )
      `;
      
      // Create Session table
      await prisma.$executeRaw`
        CREATE TABLE "Session" (
          "id" TEXT NOT NULL,
          "sessionToken" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "expires" TIMESTAMP(3) NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
        )
      `;
      
      // Create Keyword table
      await prisma.$executeRaw`
        CREATE TABLE "Keyword" (
          "id" TEXT NOT NULL,
          "keyword" TEXT NOT NULL,
          "userId" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
        )
      `;
      
      // Create Post table
      await prisma.$executeRaw`
        CREATE TABLE "Post" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "url" TEXT NOT NULL,
          "urlHash" TEXT NOT NULL,
          "imageUrl" TEXT,
          "source" TEXT NOT NULL,
          "publishedAt" TIMESTAMP(3),
          "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
          "tags" TEXT[],
          "embedding" vector(1536),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
        )
      `;
      
      // Create CrawlRun table
      await prisma.$executeRaw`
        CREATE TABLE "CrawlRun" (
          "id" TEXT NOT NULL,
          "status" "CrawlStatus" NOT NULL DEFAULT 'PENDING',
          "startedAt" TIMESTAMP(3),
          "completedAt" TIMESTAMP(3),
          "postsFound" INTEGER NOT NULL DEFAULT 0,
          "postsProcessed" INTEGER NOT NULL DEFAULT 0,
          "error" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "CrawlRun_pkey" PRIMARY KEY ("id")
        )
      `;
      
      // Create enums
      await prisma.$executeRaw`CREATE TYPE "UserRole" AS ENUM ('VIEWER', 'EDITOR', 'ADMIN')`;
      await prisma.$executeRaw`CREATE TYPE "CrawlStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')`;
      await prisma.$executeRaw`CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'REJECTED')`;
      
      // Create indexes
      await prisma.$executeRaw`CREATE UNIQUE INDEX "User_email_key" ON "User"("email")`;
      await prisma.$executeRaw`CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId")`;
      await prisma.$executeRaw`CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken")`;
      await prisma.$executeRaw`CREATE UNIQUE INDEX "Post_urlHash_key" ON "Post"("urlHash")`;
      await prisma.$executeRaw`CREATE INDEX "Post_status_idx" ON "Post"("status")`;
      await prisma.$executeRaw`CREATE INDEX "Post_urlHash_idx" ON "Post"("urlHash")`;
      await prisma.$executeRaw`CREATE INDEX "Post_publishedAt_idx" ON "Post"("publishedAt")`;
      await prisma.$executeRaw`CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt")`;
      
      // Create foreign key constraints
      await prisma.$executeRaw`ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
      await prisma.$executeRaw`ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`;
      await prisma.$executeRaw`ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE`;
      
      // Create vector index
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS post_embedding_idx ON "Post" USING HNSW ("embedding" vector_l2_ops)`;
      
      console.log('✅ Database schema created successfully!');
    } else {
      console.log('✅ Database schema already exists');
    }
    
    // Check pgvector extension
    const vectorExt = await prisma.$queryRaw`SELECT extname FROM pg_extension WHERE extname='vector'`;
    if (vectorExt.length === 0) {
      console.log('📦 Enabling pgvector extension...');
      await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`;
      console.log('✅ pgvector extension enabled');
    } else {
      console.log('✅ pgvector extension already enabled');
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runMigrations()
  .then(() => {
    console.log('🎉 Migrations completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migrations failed:', error);
    process.exit(1);
  });
