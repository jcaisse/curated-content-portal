import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; sourceId: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, sourceId } = await params
  const body = await req.json().catch(() => null)
  const data: any = {}
  if (body?.enabled !== undefined) data.enabled = !!body.enabled
  if (body?.url) data.url = String(body.url)
  if (body?.type) data.type = String(body.type)
  const updated = await db.crawlerSource.update({ where: { id: sourceId }, data })
  if (updated.crawlerId !== id) return NextResponse.json({ error: 'Mismatch' }, { status: 400 })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; sourceId: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, sourceId } = await params
  const src = await db.crawlerSource.findUnique({ where: { id: sourceId } })
  if (!src || src.crawlerId !== id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await db.crawlerSource.delete({ where: { id: sourceId } })
  return NextResponse.json({ ok: true })
}


