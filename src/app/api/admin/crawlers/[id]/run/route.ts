import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from 'crypto'

function advisoryKeyFromId(id: string) {
  const hex = crypto.createHash('sha1').update(id).digest('hex').slice(0, 8)
  return parseInt(hex, 16)
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params
    const crawler = await db.crawler.findUnique({ where: { id }, include: { keywords: true } })
    if (!crawler) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const key = advisoryKeyFromId(id)
    await db.$executeRawUnsafe(`SELECT pg_advisory_lock(${key})`)
    try {
      const running = await db.crawlRun.findFirst({ where: { crawlerId: id, status: 'RUNNING' } })
      if (running) return NextResponse.json({ message: 'Already running', runId: running.id })

      const run = await db.crawlRun.create({
        data: { crawlerId: id, status: 'RUNNING', startedAt: new Date(), keywordId: null as any }
      })
      // Kick off minimal processing (non-blocking or quick inline)
      // Here we do quick inline simulation
      await new Promise(r => setTimeout(r, 200))
      await db.crawlRun.update({ where: { id: run.id }, data: { status: 'COMPLETED', completedAt: new Date(), itemsFound: 0, itemsProcessed: 0 } })
      await db.crawler.update({ where: { id }, data: { lastRunAt: new Date() } })
      return NextResponse.json({ message: 'Run completed', runId: run.id })
    } finally {
      await db.$executeRawUnsafe(`SELECT pg_advisory_unlock(${key})`)
    }
  } catch (error) {
    console.error('Run-now error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


