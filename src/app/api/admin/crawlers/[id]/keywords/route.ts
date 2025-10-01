import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/api/guards"
import { crawlerIdParam } from "@/lib/api/validators"
import { z } from "zod"

const addKeywordsSchema = z.object({
  keywords: z.array(z.object({
    term: z.string().min(1).max(100),
    source: z.enum(["ai", "manual"]).default("manual").optional(),
  })).min(1).max(200),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin()
    if (!guard.authorized) return guard.response

    const { id } = crawlerIdParam.parse(await params)
    const crawler = await db.crawler.findUnique({ where: { id } })
    if (!crawler) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const items = await db.crawlerKeyword.findMany({
      where: { crawlerId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error listing crawler keywords:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin()
    if (!guard.authorized) return guard.response

    const { id } = crawlerIdParam.parse(await params)
    const body = await request.json()
    const parsed = addKeywordsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { keywords } = parsed.data
    const uniqueTerms = Array.from(new Set(keywords.map((k) => k.term.trim()).filter(Boolean)))

    const created: any[] = []
    const skipped: string[] = []
    for (const term of uniqueTerms) {
      try {
        const item = await db.crawlerKeyword.create({
          data: {
            crawlerId: id,
            term,
            source: (keywords.find(k => k.term === term)?.source ?? "manual") as "ai" | "manual",
          },
        });
        created.push(item)
      } catch (e: any) {
        // Unique violation -> already exists
        if (e?.message?.includes("Unique constraint")) {
          skipped.push(term)
        } else {
          throw e
        }
      }
    }

    return NextResponse.json({ createdCount: created.length, skipped, items: created }, { status: 201 })
  } catch (error) {
    console.error("Error adding crawler keywords:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


