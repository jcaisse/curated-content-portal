-- Add CrawlerSource table
CREATE TABLE "CrawlerSource" (
  "id" TEXT NOT NULL,
  "crawlerId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "lastStatus" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

ALTER TABLE "CrawlerSource"
  ADD CONSTRAINT "CrawlerSource_pkey" PRIMARY KEY ("id");

ALTER TABLE "CrawlerSource"
  ADD CONSTRAINT "CrawlerSource_crawlerId_fkey"
  FOREIGN KEY ("crawlerId") REFERENCES "Crawler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "CrawlerSource_crawlerId_url_key" ON "CrawlerSource"("crawlerId", "url");
CREATE INDEX "CrawlerSource_crawlerId_enabled_idx" ON "CrawlerSource"("crawlerId", "enabled");

-- Add crawlerId to Post
ALTER TABLE "Post" ADD COLUMN "crawlerId" TEXT;
CREATE INDEX "Post_crawlerId_idx" ON "Post"("crawlerId");
ALTER TABLE "Post"
  ADD CONSTRAINT "Post_crawlerId_fkey"
  FOREIGN KEY ("crawlerId") REFERENCES "Crawler"("id") ON DELETE SET NULL ON UPDATE CASCADE;


