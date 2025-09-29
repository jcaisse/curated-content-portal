import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || undefined
  const posts = await db.post.findMany({ where: { crawler: { id }, ...(status ? { status } : {}) }, orderBy: { createdAt: 'desc' }, take: 100 })
  return NextResponse.json(posts)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role === 'VIEWER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body?.postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })
  const data: any = {}
  if (body.status) data.status = body.status
  if (body.title) data.title = body.title
  if (body.description !== undefined) data.description = body.description
  const updated = await db.post.update({ where: { id: body.postId, }, data })
  return NextResponse.json(updated)
}

