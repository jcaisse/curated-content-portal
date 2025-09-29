-- Crawler and CrawlerKeyword models, plus CrawlRun.crawlerId

-- CreateTable Crawler
CREATE TABLE "Crawler" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "minMatchScore" DOUBLE PRECISION NOT NULL DEFAULT 0.75,
    "lastRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Crawler_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for Crawler.name
CREATE UNIQUE INDEX "Crawler_name_key" ON "Crawler"("name");

-- CreateTable CrawlerKeyword
CREATE TABLE "CrawlerKeyword" (
    "id" TEXT NOT NULL,
    "crawlerId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrawlerKeyword_pkey" PRIMARY KEY ("id")
);

-- FKs for CrawlerKeyword
ALTER TABLE "CrawlerKeyword"
  ADD CONSTRAINT "CrawlerKeyword_crawlerId_fkey"
  FOREIGN KEY ("crawlerId") REFERENCES "Crawler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Uniques and indexes for CrawlerKeyword
CREATE UNIQUE INDEX "CrawlerKeyword_crawlerId_term_key" ON "CrawlerKeyword"("crawlerId", "term");
CREATE INDEX "CrawlerKeyword_crawlerId_idx" ON "CrawlerKeyword"("crawlerId");

-- Add column to CrawlRun for optional crawler linkage
ALTER TABLE "CrawlRun" ADD COLUMN "crawlerId" TEXT;

-- FK from CrawlRun.crawlerId to Crawler.id
ALTER TABLE "CrawlRun"
  ADD CONSTRAINT "CrawlRun_crawlerId_fkey"
  FOREIGN KEY ("crawlerId") REFERENCES "Crawler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Ensure updatedAt on Crawler updates automatically
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_crawler_updated_at ON "Crawler";
CREATE TRIGGER set_crawler_updated_at
BEFORE UPDATE ON "Crawler"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


