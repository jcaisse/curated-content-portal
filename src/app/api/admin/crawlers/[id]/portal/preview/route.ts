import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api/guards"
import { crawlerIdParam } from "@/lib/api/validators"
import { db } from "@/lib/db"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (!guard.authorized) return guard.response

  const { id } = crawlerIdParam.parse(await params)

  const portal = await db.crawlerPortal.findUnique({
    where: { crawlerId: id },
  })

  const posts = await db.post.findMany({
    where: { crawlerId: id, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 12,
  })

  return NextResponse.json({ portal, posts })
}


