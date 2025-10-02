import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { runCrawler } from '@/lib/services/ingestion/crawl-runner'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: crawlerId } = await params

  try {
    // Start the crawler in the background
    // Note: This is a simple implementation. For production, you'd want to use a job queue
    runCrawler({ crawlerId }).catch((error) => {
      console.error('Crawler error:', error)
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Crawler started',
      crawlerId,
    })
  } catch (error: any) {
    console.error('Failed to start crawler:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to start crawler' },
      { status: 500 }
    )
  }
}
