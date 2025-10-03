import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

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

  console.log(`🚀 Starting crawler ${crawlerId}`)

  try {
    // IMPORTANT: Use dynamic import to avoid loading crawler code at build time
    // This is necessary because the crawler runner checks environment variables
    // on module load, which aren't available during Docker build
    const crawlerModule = await import('@/lib/services/ingestion/crawl-runner')
    const { runCrawler } = crawlerModule
    
    // Start the crawler in the background
    // Note: This is a simple implementation. For production, you'd want to use a job queue
    runCrawler({ crawlerId }).catch((error) => {
      console.error('❌ Crawler background error:', error)
    })

    console.log(`✓ Crawler ${crawlerId} queued successfully`)
    return NextResponse.json({ 
      success: true, 
      message: 'Crawler started',
      crawlerId,
    })
  } catch (error: any) {
    console.error('❌ Failed to load/start crawler:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to start crawler' },
      { status: 500 }
    )
  }
}
