import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const list = await db.crawlerSource.findMany({ where: { crawlerId: id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(list)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body?.url || !body?.type) return NextResponse.json({ error: 'url and type required' }, { status: 400 })
  
  const data: any = { 
    crawlerId: id, 
    url: body.url, 
    type: String(body.type), 
    enabled: body.enabled ?? true 
  }
  
  // Add web crawler options if type is 'web'
  if (body.type === 'web') {
    if (body.maxPages !== undefined) data.maxPages = parseInt(body.maxPages) || 10
    if (body.maxDepth !== undefined) data.maxDepth = parseInt(body.maxDepth) || 2
    if (body.followLinks !== undefined) data.followLinks = Boolean(body.followLinks)
  }
  
  const created = await db.crawlerSource.create({ data })
  return NextResponse.json(created)
}

