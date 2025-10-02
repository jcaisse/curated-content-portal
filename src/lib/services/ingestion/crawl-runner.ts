import "dotenv/config"
import rssParser from "rss-parser"
import { CheerioCrawler } from "crawlee"
import { db } from "@/lib/db"
import { generateUrlHash, normalizeUrl } from "@/lib/url-utils"
import { moderationRepository } from "@/lib/prisma/moderation"
import { scoreContentAgainstKeywords } from "@/lib/services/scoring-service"
import { extractKeywords } from "@/lib/services/keyword-service"
import { crawlSource, type SourceFetchResult } from "@/lib/services/source-fetchers"

export interface CrawlRunContext {
  crawlerId: string
  runId: string
  minMatchScore: number
  keywords: string[]
}

export interface CrawlOptions {
  crawlerId: string
  limit?: number
  dryRun?: boolean
}

export async function createRunContext(crawlerId: string): Promise<CrawlRunContext> {
  const crawler = await db.crawler.findUnique({
    where: { id: crawlerId },
    include: { keywords: true },
  })
  if (!crawler) throw new Error(`Crawler ${crawlerId} not found`)
  const run = await db.crawlRun.create({
    data: { crawlerId, status: "PENDING", startedAt: new Date() },
  })
  return {
    crawlerId,
    runId: run.id,
    minMatchScore: crawler.minMatchScore ?? 0.75,
    keywords: crawler.keywords.map((k) => k.term),
  }
}

export async function finalizeRun(runId: string, updates: Partial<{ status: string; error: string | null; itemsFound: number; itemsProcessed: number }>) {
  await db.crawlRun.update({
    where: { id: runId },
    data: {
      ...updates,
      status: updates.status ?? "COMPLETED",
      completedAt: new Date(),
    },
  })
}

export async function processSourceResult(context: CrawlRunContext, result: SourceFetchResult, dryRun = false) {
  const normalizedUrl = normalizeUrl(result.url)
  const urlHash = generateUrlHash(normalizedUrl)

  const existingModeration = await db.crawlerModerationItem.findUnique({
    where: {
      crawlerId_urlHash: {
        crawlerId: context.crawlerId,
        urlHash,
      },
    },
  })
  if (existingModeration) {
    return { skip: true, reason: "duplicate" as const }
  }

  const score = await scoreContentAgainstKeywords({
    title: result.title ?? "",
    summary: result.summary ?? "",
    content: result.content ?? "",
    keywords: context.keywords,
  })
  if (score < context.minMatchScore) {
    return { skip: true, reason: "below_threshold" as const, score }
  }

  const extractedKeywords = await extractKeywords({
    text: `${result.title ?? ""}\n${result.summary ?? ""}\n${result.content ?? ""}`,
    existingKeywords: context.keywords,
  })

  if (!dryRun) {
    await moderationRepository.queuePost({
      crawlerId: context.crawlerId,
      runId: context.runId,
      url: normalizedUrl,
      urlHash,
      title: result.title ?? "Untitled",
      summary: result.summary ?? null,
      content: result.content ?? null,
      imageUrl: result.imageUrl ?? null,
      author: result.author ?? null,
      source: result.source ?? new URL(normalizedUrl).hostname,
      language: result.language ?? null,
      score,
      metadata: {
        keywords: extractedKeywords,
        raw: {
          publishedAt: result.publishedAt ?? null,
        },
      },
    })
  }

  return { skip: false, score }
}

export async function runCrawler(options: CrawlOptions) {
  const limit = options.limit ?? Number(process.env.CRAWLER_MAX_REQUESTS ?? 100)
  const context = await createRunContext(options.crawlerId)

  await db.crawlRun.update({ where: { id: context.runId }, data: { status: "RUNNING" } })

  try {
    const sources = await db.crawlerSource.findMany({
      where: { crawlerId: context.crawlerId, enabled: true },
      orderBy: { createdAt: "asc" },
    })

    let itemsFound = 0
    let itemsQueued = 0

    for (const source of sources) {
      try {
        const webOptions = source.type === 'web' ? {
          maxPages: source.maxPages ?? 10,
          maxDepth: source.maxDepth ?? 2,
          followLinks: source.followLinks ?? true,
        } : undefined
        
        const fetched = await crawlSource({ source, limit, webOptions })
        for (const item of fetched.items) {
          itemsFound += 1
          if (itemsFound > limit) break
          const outcome = await processSourceResult(context, item, options.dryRun)
          if (!outcome.skip) {
            itemsQueued += 1
          }
        }
      } catch (error: any) {
        // Log error but continue with other sources
        console.error(`Failed to crawl source ${source.url}:`, error.message)
        // Update source status to show error
        await db.crawlerSource.update({
          where: { id: source.id },
          data: { lastStatus: `Error: ${error.message}` }
        }).catch(() => {}) // Ignore if update fails
      }
    }

    await finalizeRun(context.runId, {
      itemsFound,
      itemsProcessed: itemsQueued,
    })
  } catch (error: any) {
    await finalizeRun(context.runId, {
      status: "FAILED",
      error: error?.message ?? "Unknown error",
    })
    throw error
  }
}

