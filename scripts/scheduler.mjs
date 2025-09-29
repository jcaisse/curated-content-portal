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

async function processCrawler(c) {
  return withAdvisoryLock(c.id, async () => {
    const running = await prisma.crawlRun.findFirst({ where: { crawlerId: c.id, status: 'RUNNING' } })
    if (running) return

    const run = await prisma.crawlRun.create({
      data: { crawlerId: c.id, status: 'RUNNING', startedAt: new Date() }
    })
    let itemsFound = 0, itemsProcessed = 0
    try {
      // TODO: Implement real crawling using Crawlee and RSS; here we no-op
      // Simulate brief processing
      await new Promise(r => setTimeout(r, 250))
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


