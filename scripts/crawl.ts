#!/usr/bin/env ts-node

import 'dotenv/config'
import rssParser from 'rss-parser'
import { CheerioCrawler } from 'crawlee'
import { db } from '../src/lib/db'
import { generateUrlHash, normalizeUrl } from '../src/lib/url-utils'
import { moderationRepository } from '../src/lib/prisma/moderation'
import { scoreContentAgainstKeywords } from '../src/lib/services/scoring-service'
import { extractKeywords } from '../src/lib/services/keyword-service'
import { crawlSource, type SourceFetchResult } from '../src/lib/services/source-fetchers'

interface CrawlRunContext {
  crawlerId: string
  runId: string
  minMatchScore: number
  keywords: string[]
}

interface CrawlOptions {
  crawlerId: string
  limit?: number
  dryRun?: boolean
}

async function createRunContext(crawlerId: string): Promise<CrawlRunContext> {
  const crawler = await db.crawler.findUnique({
    where: { id: crawlerId },
    include: {
      keywords: true,
    },
  })

  if (!crawler) {
    throw new Error(`Crawler ${crawlerId} not found`)
  }

  const run = await db.crawlRun.create({
    data: {
      crawlerId,
      status: 'PENDING',
      startedAt: new Date(),
    },
  })

  return {
    crawlerId,
    runId: run.id,
    minMatchScore: crawler.minMatchScore ?? 0.75,
    keywords: crawler.keywords.map((k) => k.term),
  }
}

async function finalizeRun(runId: string, updates: Partial<{ status: string; error: string | null; itemsFound: number; itemsProcessed: number }>) {
  await db.crawlRun.update({
    where: { id: runId },
    data: {
      ...updates,
      status: updates.status ?? 'COMPLETED',
      completedAt: new Date(),
    },
  })
}

async function processSourceResult(context: CrawlRunContext, result: SourceFetchResult, dryRun = false) {
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
    return { skip: true, reason: 'duplicate' as const }
  }

  const score = await scoreContentAgainstKeywords({
    title: result.title ?? '',
    summary: result.summary ?? '',
    content: result.content ?? '',
    keywords: context.keywords,
  })

  if (score < context.minMatchScore) {
    return { skip: true, reason: 'below_threshold' as const, score }
  }

  const extractedKeywords = await extractKeywords({
    text: `${result.title ?? ''}
${result.summary ?? ''}
${result.content ?? ''}`,
    existingKeywords: context.keywords,
  })

  if (!dryRun) {
    await moderationRepository.queuePost({
      crawlerId: context.crawlerId,
      runId: context.runId,
      url: normalizedUrl,
      urlHash,
      title: result.title ?? 'Untitled',
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

async function crawlCrawler(options: CrawlOptions) {
  const limit = options.limit ?? Number(process.env.CRAWLER_MAX_REQUESTS ?? 100)
  const context = await createRunContext(options.crawlerId)

  console.log(`🚀 Crawl run ${context.runId} for crawler ${context.crawlerId}`)
  await db.crawlRun.update({ where: { id: context.runId }, data: { status: 'RUNNING' } })

  try {
    const sources = await db.crawlerSource.findMany({
      where: { crawlerId: context.crawlerId, enabled: true },
      orderBy: { createdAt: 'asc' },
    })

    let itemsFound = 0
    let itemsQueued = 0

    for (const source of sources) {
      console.log(`📰 Fetching source ${source.type} :: ${source.url}`)
      const fetched = await crawlSource({ source, limit })

      for (const item of fetched.items) {
        itemsFound += 1
        if (itemsFound > limit) break

        const outcome = await processSourceResult(context, item, options.dryRun)
        if (!outcome.skip) {
          itemsQueued += 1
          console.log(`✅ queued (${(outcome.score ?? 0).toFixed(2)}) ${item.url}`)
        } else {
          console.log(`↷ skipped ${item.url} (${outcome.reason}${outcome.score ? ` ${outcome.score.toFixed(2)}` : ''})`)
        }
      }
    }

    await finalizeRun(context.runId, {
      itemsFound,
      itemsProcessed: itemsQueued,
    })

    console.log(`🎉 Crawl complete. queued=${itemsQueued}/${itemsFound}`)
  } catch (error: any) {
    console.error('❌ crawl failed', error)
    await finalizeRun(context.runId, {
      status: 'FAILED',
      error: error?.message ?? 'Unknown error',
    })
    throw error
  }
}

async function main() {
  const args = process.argv.slice(2)
  const crawlerId = args.find((arg) => arg.startsWith('--crawler='))?.split('=')[1]
  const limit = args.find((arg) => arg.startsWith('--limit='))?.split('=')[1]
  const dryRun = args.includes('--dry-run')

  if (!crawlerId) {
    console.error('❌ Crawler ID is required. Usage: npm run crawl -- --crawler="<crawlerId>" --limit=50 --dry-run')
    process.exit(1)
  }

  await crawlCrawler({ crawlerId, limit: limit ? parseInt(limit, 10) : undefined, dryRun })
  await db.$disconnect()
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
