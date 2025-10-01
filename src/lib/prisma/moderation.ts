import { db } from "@/lib/db"
import type { ModerationStatus } from "@prisma/client"

export const moderationRepository = {
  async queuePost(input: {
    crawlerId: string
    runId?: string
    url: string
    urlHash: string
    title: string
    summary?: string
    content?: string
    imageUrl?: string
    author?: string
    source: string
    language?: string
    score: number
    metadata?: Record<string, unknown>
  }) {
    return db.crawlerModerationItem.upsert({
      where: {
        crawlerId_urlHash: {
          crawlerId: input.crawlerId,
          urlHash: input.urlHash,
        },
      },
      update: {
        title: input.title,
        summary: input.summary,
        content: input.content,
        imageUrl: input.imageUrl,
        author: input.author,
        source: input.source,
        language: input.language,
        score: input.score,
        runId: input.runId,
        metadata: input.metadata,
        status: "PENDING",
        rejectionReason: null,
        decidedAt: null,
        decidedBy: null,
      },
      create: {
        crawlerId: input.crawlerId,
        runId: input.runId,
        url: input.url,
        urlHash: input.urlHash,
        title: input.title,
        summary: input.summary,
        content: input.content,
        imageUrl: input.imageUrl,
        author: input.author,
        source: input.source,
        language: input.language,
        score: input.score,
        metadata: input.metadata,
      },
    })
  },

  async updateStatus(input: {
    id: string
    status: ModerationStatus
    decidedBy: string
    rejectionReason?: string
  }) {
    return db.crawlerModerationItem.update({
      where: { id: input.id },
      data: {
        status: input.status,
        decidedBy: input.decidedBy,
        decidedAt: new Date(),
        rejectionReason: input.rejectionReason ?? null,
      },
    })
  },

  async listQueue(crawlerId: string, status: ModerationStatus = "PENDING") {
    return db.crawlerModerationItem.findMany({
      where: { crawlerId, status },
      orderBy: { discoveredAt: "desc" },
    })
  },
}


