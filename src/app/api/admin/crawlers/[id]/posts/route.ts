import { NextRequest, NextResponse } from "next/server"
import { PostStatus } from "@prisma/client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { crawlerIdParam } from "@/lib/api/validators"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = crawlerIdParam.parse(await params)
  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get("status")
  const status = statusParam && PostStatus[statusParam as keyof typeof PostStatus]
  const where: any = { crawlerId: id }
  if (status) where.status = status
  const posts = await db.post.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 })
  return NextResponse.json(posts)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role === "VIEWER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = crawlerIdParam.parse(await params)
  const body = await req.json().catch(() => null)
  if (!body?.postId) return NextResponse.json({ error: "postId required" }, { status: 400 })

  const data: any = {}
  if (body.status) data.status = body.status
  if (body.title) data.title = body.title
  if (body.description !== undefined) data.description = body.description

  const updated = await db.post.update({ where: { id: body.postId, crawlerId: id }, data })
  return NextResponse.json(updated)
}

