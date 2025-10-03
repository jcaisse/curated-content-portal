-- AlterTable
ALTER TABLE "CrawlerSource" 
  ADD COLUMN "maxPages" INTEGER DEFAULT 10,
  ADD COLUMN "maxDepth" INTEGER DEFAULT 2,
  ADD COLUMN "followLinks" BOOLEAN DEFAULT true;
