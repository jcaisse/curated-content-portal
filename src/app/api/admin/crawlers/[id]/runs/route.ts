import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: crawlerId } = await params

  try {
    const runs = await db.crawlRun.findMany({
      where: { crawlerId },
      orderBy: { startedAt: 'desc' },
      take: 10,
    })

    return NextResponse.json(runs)
  } catch (error: any) {
    console.error('Failed to fetch crawler runs:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch runs' },
      { status: 500 }
    )
  }
}

