import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { crawlerIdParam, updateCrawlerSchema } from "@/lib/api/validators"
import { requireAdmin } from "@/lib/api/guards"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin()
    if (!guard.authorized) return guard.response

    const { id } = crawlerIdParam.parse(await params)
    const crawler = await db.crawler.findUnique({
      where: { id },
      include: {
        keywords: true,
        _count: { select: { keywords: true, runs: true } },
      },
    })
    if (!crawler) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(crawler)
  } catch (error) {
    console.error("Error fetching crawler:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin()
    if (!guard.authorized) return guard.response

    const { id } = crawlerIdParam.parse(await params)
    const body = await request.json()
    const parsed = updateCrawlerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const exists = await db.crawler.findUnique({ where: { id } })
    if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const updated = await db.crawler.update({
      where: { id },
      data: parsed.data,
      include: {
        portal: true,
        _count: { select: { keywords: true, runs: true } },
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating crawler:", error)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Crawler with this name already exists" },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin()
    if (!guard.authorized) return guard.response

    const { id } = crawlerIdParam.parse(await params)

    const existing = await db.crawler.findUnique({
      where: { id },
      include: { _count: { select: { keywords: true, runs: true } } },
    })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (existing._count.runs > 0) {
      return NextResponse.json(
        { error: "Cannot delete crawler with runs. Consider disabling instead." },
        { status: 409 },
      )
    }

    await db.crawler.delete({ where: { id } })
    return NextResponse.json({ message: "Deleted" })
  } catch (error) {
    console.error("Error deleting crawler:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


