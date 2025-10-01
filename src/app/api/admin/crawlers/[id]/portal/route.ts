import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api/guards"
import { crawlerIdParam } from "@/lib/api/validators"
import { db } from "@/lib/db"
import { z } from "zod"

const portalUpdateSchema = z.object({
  subdomain: z
    .union([z.string().regex(/^[a-z0-9-]+$/i, "Invalid subdomain"), z.literal(""), z.null()])
    .optional()
    .transform((value) => (value === "" ? undefined : value ?? undefined)),
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  theme: z.record(z.any()).optional(),
  subdomainOnHold: z.boolean().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin()
    if (!guard.authorized) return guard.response

    const { id } = crawlerIdParam.parse(await params)
    const portal = await db.crawlerPortal.findUnique({ where: { crawlerId: id } })
    if (!portal) return NextResponse.json({ error: "Portal not configured" }, { status: 404 })
    return NextResponse.json(portal)
  } catch (error) {
    console.error("Error fetching portal config:", error)
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
    const parsed = portalUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const existing = await db.crawlerPortal.findUnique({ where: { crawlerId: id } })
    const data = parsed.data

    const portal = existing
      ? await db.crawlerPortal.update({
          where: { crawlerId: id },
          data: {
            subdomain: data.subdomain ?? existing.subdomain,
            title: data.title,
            description: data.description,
            theme: data.theme,
            subdomainOnHold: data.subdomainOnHold ?? existing.subdomainOnHold,
          },
        })
      : await db.crawlerPortal.create({
          data: {
            crawlerId: id,
            subdomain: data.subdomain ?? `${id.slice(0, 8)}-portal`,
            title: data.title,
            description: data.description,
            theme: data.theme,
            subdomainOnHold: data.subdomainOnHold ?? false,
          },
        })

    return NextResponse.json(portal)
  } catch (error) {
    console.error("Error updating portal config:", error)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Subdomain already in use" }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

