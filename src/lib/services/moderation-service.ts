import { db } from "@/lib/db"
import { moderationRepository } from "@/lib/prisma/moderation"
import { ModerationStatus } from "@prisma/client"

export async function listModerationItems(opts: { crawlerId: string; status?: ModerationStatus }) {
  const status = opts.status ?? "PENDING"
  return moderationRepository.listQueue(opts.crawlerId, status)
}

export async function approveModerationItems(opts: { itemIds: string[]; moderatorId: string }) {
  const results = []
  for (const itemId of opts.itemIds) {
    const item = await db.crawlerModerationItem.findUnique({ where: { id: itemId } })
    if (!item) continue

    const post = await db.post.upsert({
      where: { urlHash: item.urlHash },
      update: {
        title: item.title,
        description: item.summary?.slice(0, 500),
        content: item.content?.slice(0, 4000),
        imageUrl: item.imageUrl,
        source: item.source,
        status: "PUBLISHED",
        publishedAt: new Date(),
        crawlerId: item.crawlerId,
        url: item.url,
        tags: [],
      },
      create: {
        title: item.title,
        description: item.summary?.slice(0, 500),
        content: item.content?.slice(0, 4000),
        url: item.url,
        imageUrl: item.imageUrl,
        source: item.source,
        status: "PUBLISHED",
        publishedAt: new Date(),
        urlHash: item.urlHash,
        crawlerId: item.crawlerId,
        tags: [],
      },
    })

    const updated = await moderationRepository.updateStatus({
      id: itemId,
      status: "APPROVED",
      decidedBy: opts.moderatorId,
    })

    if (updated.metadata) {
      await db.crawlerModerationItem.update({
        where: { id: itemId },
        data: {
          metadata: { ...updated.metadata, postId: post.id },
        },
      })
    }

    results.push(updated)
  }
  return results
}

export async function rejectModerationItems(opts: { itemIds: string[]; moderatorId: string; reason?: string }) {
  const results = []
  for (const itemId of opts.itemIds) {
    const item = await db.crawlerModerationItem.findUnique({ where: { id: itemId } })
    if (!item) continue

    const updated = await moderationRepository.updateStatus({
      id: itemId,
      status: "REJECTED",
      decidedBy: opts.moderatorId,
      rejectionReason: opts.reason,
    })
    results.push(updated)
  }
  return results
}

export async function archiveModerationItems(opts: { itemIds: string[]; moderatorId: string }) {
  const results = []
  for (const itemId of opts.itemIds) {
    const item = await db.crawlerModerationItem.findUnique({ where: { id: itemId } })
    if (!item) continue

    const updated = await moderationRepository.updateStatus({
      id: itemId,
      status: "ARCHIVED",
      decidedBy: opts.moderatorId,
    })
    results.push(updated)
  }
  return results
}


