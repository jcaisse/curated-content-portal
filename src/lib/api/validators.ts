import { z } from "zod"

export const crawlerIdParam = z.object({ id: z.string().min(1) })

export const moderationStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED", "ARCHIVED"])

export const updateCrawlerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
  minMatchScore: z.number().min(0).max(1).optional(),
  subdomain: z
    .string()
    .regex(/^[a-z0-9-]+$/i, "Invalid subdomain")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
})


