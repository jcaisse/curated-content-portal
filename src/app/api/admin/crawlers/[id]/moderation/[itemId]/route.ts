import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { moderationRepository } from '@/lib/prisma/moderation'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: crawlerId, itemId } = await params
  const body = await req.json().catch(() => null)
  
  if (!body?.status || !['APPROVED', 'REJECTED', 'ARCHIVED'].includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  try {
    // Update moderation status
    const item = await moderationRepository.updateStatus({
      id: itemId,
      status: body.status,
      decidedBy: session.user.id,
      rejectionReason: body.rejectionReason,
    })

    // If approved, create a Post
    if (body.status === 'APPROVED') {
      await db.post.create({
        data: {
          title: item.title,
          summary: item.summary,
          content: item.content,
          imageUrl: item.imageUrl,
          author: item.author ?? 'Unknown',
          source: item.source,
          url: item.url,
          language: item.language,
          crawlerId: item.crawlerId,
          moderationItemId: item.id,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          metadata: item.metadata as any,
        },
      })
    }

    return NextResponse.json(item)
  } catch (error: any) {
    console.error('Moderation update error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to update moderation item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { itemId } = await params

  try {
    await db.crawlerModerationItem.delete({
      where: { id: itemId },
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Moderation delete error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete moderation item' },
      { status: 500 }
    )
  }
}

