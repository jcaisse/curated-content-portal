-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "CrawlerPortal" (
    "id" TEXT NOT NULL,
    "crawlerId" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "theme" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrawlerPortal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawlerModerationItem" (
    "id" TEXT NOT NULL,
    "crawlerId" TEXT NOT NULL,
    "runId" TEXT,
    "url" TEXT NOT NULL,
    "urlHash" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "imageUrl" TEXT,
    "author" TEXT,
    "source" TEXT NOT NULL,
    "language" TEXT,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "decidedBy" TEXT,
    "rejectionReason" TEXT,
    "metadata" JSONB,

    CONSTRAINT "CrawlerModerationItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CrawlerPortal_crawlerId_key" ON "CrawlerPortal"("crawlerId");

-- CreateIndex
CREATE UNIQUE INDEX "CrawlerPortal_subdomain_key" ON "CrawlerPortal"("subdomain");

-- CreateIndex
CREATE INDEX "CrawlerModerationItem_crawlerId_status_idx" ON "CrawlerModerationItem"("crawlerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CrawlerModerationItem_crawlerId_urlHash_key" ON "CrawlerModerationItem"("crawlerId", "urlHash");

-- CreateIndex
CREATE INDEX "CrawlerModerationItem_status_discoveredAt_idx" ON "CrawlerModerationItem"("status", "discoveredAt");

-- AddForeignKey
ALTER TABLE "CrawlerPortal" ADD CONSTRAINT "CrawlerPortal_crawlerId_fkey" FOREIGN KEY ("crawlerId") REFERENCES "Crawler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawlerModerationItem" ADD CONSTRAINT "CrawlerModerationItem_crawlerId_fkey" FOREIGN KEY ("crawlerId") REFERENCES "Crawler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawlerModerationItem" ADD CONSTRAINT "CrawlerModerationItem_runId_fkey" FOREIGN KEY ("runId") REFERENCES "CrawlRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- TODO: add SQL for moderation schema changes (enum, tables, relations)
