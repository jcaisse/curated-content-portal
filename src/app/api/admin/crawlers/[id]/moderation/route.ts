import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { moderationRepository } from '@/lib/prisma/moderation'
import { generateUrlHash } from '@/lib/url-utils'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: crawlerId } = await params
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'PENDING'

  try {
    const items = await db.crawlerModerationItem.findMany({
      where: {
        crawlerId,
        status: status as any,
      },
      orderBy: { discoveredAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(items)
  } catch (error: any) {
    console.error('Fetch moderation items error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch moderation items' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: crawlerId } = await params
  const body = await req.json().catch(() => null)
  
  if (!body?.itemIds || !Array.isArray(body.itemIds) || body.itemIds.length === 0) {
    return NextResponse.json({ error: 'itemIds array required' }, { status: 400 })
  }

  if (!body?.action || !['APPROVE', 'REJECT', 'ARCHIVE'].includes(body.action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const statusMap: Record<string, string> = {
    APPROVE: 'APPROVED',
    REJECT: 'REJECTED',
    ARCHIVE: 'ARCHIVED',
  }

  try {
    const items = await db.crawlerModerationItem.findMany({
      where: {
        id: { in: body.itemIds },
        crawlerId,
      },
    })

    if (items.length === 0) {
      return NextResponse.json({ error: 'No items found' }, { status: 404 })
    }

    // Update all items
    for (const item of items) {
      await moderationRepository.updateStatus({
        id: item.id,
        status: statusMap[body.action] as any,
        decidedBy: session.user.id,
      })

      // If approved, create a Post
      if (body.action === 'APPROVE') {
        const urlHash = generateUrlHash(item.url)
        
        await db.post.upsert({
          where: { urlHash },
          update: {
            title: item.title,
            summary: item.summary,
            content: item.content,
            imageUrl: item.imageUrl,
            author: item.author ?? 'Unknown',
            source: item.source,
            language: item.language,
            crawlerId: item.crawlerId,
            moderationItemId: item.id,
            status: 'PUBLISHED',
            publishedAt: new Date(),
            metadata: item.metadata as any,
          },
          create: {
            title: item.title,
            summary: item.summary,
            content: item.content,
            imageUrl: item.imageUrl,
            author: item.author ?? 'Unknown',
            source: item.source,
            url: item.url,
            urlHash,
            language: item.language,
            crawlerId: item.crawlerId,
            moderationItemId: item.id,
            status: 'PUBLISHED',
            publishedAt: new Date(),
            metadata: item.metadata as any,
          },
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: items.length,
      action: body.action,
    })
  } catch (error: any) {
    console.error('Bulk moderation error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to process bulk action' },
      { status: 500 }
    )
  }
}
