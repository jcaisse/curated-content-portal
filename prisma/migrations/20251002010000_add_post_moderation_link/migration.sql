-- AlterTable
ALTER TABLE "Post" 
  ADD COLUMN "summary" TEXT,
  ADD COLUMN "author" TEXT,
  ADD COLUMN "language" TEXT,
  ADD COLUMN "metadata" JSONB,
  ADD COLUMN "moderationItemId" TEXT,
  ADD CONSTRAINT "Post_moderationItemId_key" UNIQUE ("moderationItemId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Post_moderationItemId_idx" ON "Post"("moderationItemId");

-- AddForeignKey
ALTER TABLE "Post" 
  ADD CONSTRAINT "Post_moderationItemId_fkey" 
  FOREIGN KEY ("moderationItemId") 
  REFERENCES "CrawlerModerationItem"("id") 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;
