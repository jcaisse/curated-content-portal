import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { getTheme } from "@/lib/themes"
import { ThemedPortal } from "@/components/portal/themed-portal"

interface PortalPageProps {
  params: Promise<{ subdomain: string }>
}

export default async function PortalPage({ params }: PortalPageProps) {
  const { subdomain } = await params

  const portal = await db.crawlerPortal.findUnique({
    where: { subdomain },
    include: {
      crawler: {
        select: { id: true },
      },
    },
  })

  if (!portal || !portal.crawler) {
    notFound()
  }

  const posts = await db.post.findMany({
    where: { crawlerId: portal.crawler.id, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 200,
  })

  // Get theme configuration
  const themeId = (portal.theme as any)?.id || 'modern-tech'
  const theme = getTheme(themeId)

  return (
    <ThemedPortal
      portal={{
        title: portal.title,
        description: portal.description,
        subdomain: subdomain
      }}
      posts={posts}
      theme={theme}
    />
  )
}


