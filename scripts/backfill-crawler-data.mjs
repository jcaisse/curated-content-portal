#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function ensureLegacyCrawler() {
  const name = 'Legacy'
  let crawler = await prisma.crawler.findUnique({ where: { name } })
  if (!crawler) {
    crawler = await prisma.crawler.create({ data: { name, description: 'Legacy crawler for backfilled data', isActive: false, minMatchScore: 0.75 } })
  }
  return crawler
}

async function backfillKeywords(targetCrawlerId) {
  const keywords = await prisma.keyword.findMany({})
  let created = 0, skipped = 0
  for (const kw of keywords) {
    try {
      await prisma.crawlerKeyword.create({ data: { crawlerId: targetCrawlerId, term: kw.name, source: 'manual' } })
      created++
    } catch (e) {
      // unique constraint -> skip
      skipped++
    }
  }
  return { created, skipped, total: keywords.length }
}

async function backfillPosts(targetCrawlerId) {
  const posts = await prisma.post.findMany({ where: { crawlerId: null }, select: { id: true } })
  let updated = 0
  const BATCH = 100
  for (let i = 0; i < posts.length; i += BATCH) {
    const chunk = posts.slice(i, i + BATCH)
    await prisma.$transaction(
      chunk.map((p) => prisma.post.update({ where: { id: p.id }, data: { crawlerId: targetCrawlerId } }))
    )
    updated += chunk.length
  }
  return { updated, total: posts.length }
}

async function main() {
  const dryRun = process.env.DRY_RUN === '1'
  const legacy = await ensureLegacyCrawler()

  console.log('Legacy crawler:', legacy)

  if (dryRun) {
    const kwCount = await prisma.keyword.count()
    const postsCount = await prisma.post.count({ where: { crawlerId: null } })
    console.log(`[DRY RUN] Would backfill ${kwCount} keywords and ${postsCount} posts -> crawlerId=${legacy.id}`)
    return
  }

  const kwRes = await backfillKeywords(legacy.id)
  console.log(`Keywords backfilled: created=${kwRes.created} skipped=${kwRes.skipped} total=${kwRes.total}`)

  const postRes = await backfillPosts(legacy.id)
  console.log(`Posts backfilled: updated=${postRes.updated} total=${postRes.total}`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })


