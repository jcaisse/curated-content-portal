import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/api/guards"
import { crawlerIdParam, moderationStatusSchema } from "@/lib/api/validators"
import { listModerationItems, approveModerationItems, rejectModerationItems, archiveModerationItems } from "@/lib/services/moderation-service"
import { z } from "zod"

const bulkActionSchema = z.object({
  itemIds: z.array(z.string().cuid()).min(1),
  action: z.enum(["APPROVE", "REJECT", "ARCHIVE"]),
  reason: z.string().max(500).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin()
    if (!guard.authorized) return guard.response

    const { id } = crawlerIdParam.parse(await params)
    const statusParam = request.nextUrl.searchParams.get("status")
    const status = statusParam ? moderationStatusSchema.parse(statusParam) : undefined

    const items = await listModerationItems({ crawlerId: id, status })
    return NextResponse.json(items)
  } catch (error) {
    console.error("Error listing moderation queue:", error)
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
    const parsed = bulkActionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    let result
    if (parsed.data.action === "APPROVE") {
      result = await approveModerationItems({ itemIds: parsed.data.itemIds, moderatorId: guard.user.id })
    } else if (parsed.data.action === "REJECT") {
      result = await rejectModerationItems({ itemIds: parsed.data.itemIds, moderatorId: guard.user.id, reason: parsed.data.reason })
    } else {
      result = await archiveModerationItems({ itemIds: parsed.data.itemIds, moderatorId: guard.user.id })
    }

    return NextResponse.json({ updated: result.length })
  } catch (error) {
    console.error("Error processing moderation action:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

