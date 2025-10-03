import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/api/guards"
import { updateCrawlerSchema } from "@/lib/api/validators"
import { z } from "zod"

const createCrawlerSchema = updateCrawlerSchema.extend({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
}).strict()

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin()
    if (!guard.authorized) return guard.response

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")?.trim()
    const take = Number(searchParams.get("take") ?? "50")
    const skip = Number(searchParams.get("skip") ?? "0")

    const crawlers = await db.crawler.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        portal: true,
        _count: { select: { keywords: true, runs: true, posts: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    })

    return NextResponse.json(crawlers)
  } catch (error) {
    console.error("Error fetching crawlers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin()
    if (!guard.authorized) return guard.response

    const body = await request.json()
    const parsed = createCrawlerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const crawler = await db.crawler.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        isActive: parsed.data.isActive ?? true,
        minMatchScore: parsed.data.minMatchScore ?? 0.75,
        portal: parsed.data.subdomain
          ? { create: { subdomain: parsed.data.subdomain } }
          : undefined,
      },
      include: {
        portal: true,
        _count: { select: { keywords: true, runs: true } },
      },
    })

    return NextResponse.json(crawler, { status: 201 })
  } catch (error) {
    console.error("Error creating crawler:", error)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Crawler with this name already exists" },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


