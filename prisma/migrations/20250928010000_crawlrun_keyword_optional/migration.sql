-- Make CrawlRun.keywordId optional
ALTER TABLE "CrawlRun" ALTER COLUMN "keywordId" DROP NOT NULL;

-- Drop and recreate FK to allow NULLs (Postgres allows already, but be explicit)
ALTER TABLE "CrawlRun" DROP CONSTRAINT IF EXISTS "CrawlRun_keywordId_fkey";
ALTER TABLE "CrawlRun" ADD CONSTRAINT "CrawlRun_keywordId_fkey"
  FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE SET NULL ON UPDATE CASCADE;


