import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()
const INTERVAL_MIN = parseInt(process.env.CRAWL_INTERVAL_MIN || '15', 10)

function advisoryKeyFromId(id) {
  const hex = crypto.createHash('sha1').update(id).digest('hex').slice(0, 8)
  return parseInt(hex, 16)
}

async function withAdvisoryLock(id, fn) {
  const key = advisoryKeyFromId(id)
  await prisma.$executeRawUnsafe(`SELECT pg_advisory_lock(${key})`)
  try { return await fn() } finally {
    await prisma.$executeRawUnsafe(`SELECT pg_advisory_unlock(${key})`)
  }
}

function hashUrl(url) {
  return crypto.createHash('sha1').update(url).digest('hex')
}

async function processCrawler(c) {
  return withAdvisoryLock(c.id, async () => {
    const running = await prisma.crawlRun.findFirst({ where: { crawlerId: c.id, status: 'RUNNING' } })
    if (running) return

    const run = await prisma.crawlRun.create({
      data: { crawlerId: c.id, status: 'RUNNING', startedAt: new Date() }
    })
    let itemsFound = 0, itemsProcessed = 0
    try {
      // Load per-crawler sources and keywords
      const crawler = await prisma.crawler.findUnique({ where: { id: c.id }, include: { keywords: true, sources: true } })
      const enabledSources = (crawler?.sources || []).filter(s => s.enabled)
      const keywords = (crawler?.keywords || [])

      // Guard: if no sources or no keywords, just complete the run quickly
      if (enabledSources.length === 0 || keywords.length === 0) {
        await new Promise(r => setTimeout(r, 200))
      } else {
        // Simulate discovery: for each source, pair with up to N keywords and create placeholder posts if not existing
        const MAX_PER_SOURCE = parseInt(process.env.MAX_CRAWL_ITEMS_PER_RUN || '3', 10)
        for (const s of enabledSources) {
          let countForSource = 0
          for (const kw of keywords) {
            if (countForSource >= MAX_PER_SOURCE) break
            const syntheticUrl = `${s.url}#kw=${encodeURIComponent(kw.term)}`
            const urlHash = hashUrl(syntheticUrl)
            const existing = await prisma.post.findUnique({ where: { url: syntheticUrl } }).catch(() => null)
            if (!existing) {
              try {
                await prisma.post.create({
                  data: {
                    title: `${kw.term} · ${s.type}`,
                    description: null,
                    content: null,
                    url: syntheticUrl,
                    imageUrl: null,
                    source: s.url,
                    publishedAt: null,
                    status: 'REVIEW',
                    tags: [],
                    urlHash,
                    crawlerId: c.id,
                    runId: run.id,
                  }
                })
                itemsFound += 1
                itemsProcessed += 1
                countForSource += 1
              } catch (e) {
                // Unique constraint or other error - skip
              }
            }
          }
        }
      }
      await prisma.crawlRun.update({ where: { id: run.id }, data: { status: 'COMPLETED', completedAt: new Date(), itemsFound, itemsProcessed } })
      await prisma.crawler.update({ where: { id: c.id }, data: { lastRunAt: new Date() } })
    } catch (e) {
      await prisma.crawlRun.update({ where: { id: run.id }, data: { status: 'FAILED', completedAt: new Date(), error: (e?.message || String(e)).slice(0, 1000) } })
    }
  })
}

async function runLoop() {
  while (true) {
    try {
      const cutoff = new Date(Date.now() - INTERVAL_MIN * 60 * 1000)
      const crawlers = await prisma.crawler.findMany({
        where: { isActive: true, OR: [{ lastRunAt: null }, { lastRunAt: { lt: cutoff } }] },
        include: { keywords: true }
      })
      for (const c of crawlers) {
        await processCrawler(c)
      }
    } catch (e) {
      console.error('scheduler error', e)
    }
    await new Promise(r => setTimeout(r, INTERVAL_MIN * 60 * 1000))
  }
}

runLoop().catch((e) => { console.error(e); process.exit(1) })


