import { db } from "@/lib/db"
import { PostGrid } from "@/components/post-grid"
import { Header } from "@/components/header"
import { notFound } from "next/navigation"

interface PortalPageProps {
  params: Promise<{
    crawlerId: string
  }>
}

export default async function CrawlerPortalPage({ params }: PortalPageProps) {
  const { crawlerId } = await params
  
  // Find the crawler
  const crawler = await db.crawler.findUnique({
    where: { id: crawlerId },
    include: {
      portal: true,
    },
  })

  if (!crawler) {
    notFound()
  }

  // Fetch published posts for this crawler
  const posts = await db.post.findMany({
    where: {
      crawlerId,
      status: 'PUBLISHED',
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 100,
    include: {
      keyword: true,
      authorUser: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  const portalTitle = crawler.portal?.title || crawler.name
  const portalDescription = crawler.portal?.description || `Curated content from ${crawler.name}`

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            {portalTitle}
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto">
            {portalDescription}
          </p>
          <div className="text-center mt-4">
            <span className="text-sm text-muted-foreground">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>
        </div>

        <PostGrid posts={posts} />
      </main>
    </div>
  )
}

// Generate static params for all crawler portals at build time
export async function generateStaticParams() {
  try {
    const crawlers = await db.crawler.findMany({
      where: {
        portal: {
          isNot: null,
        },
      },
      select: {
        id: true,
      },
    })

    return crawlers.map((crawler) => ({
      crawlerId: crawler.id,
    }))
  } catch (error) {
    console.warn('Could not generate static params for crawler portals:', error)
    return []
  }
}

// Revalidate every hour
export const revalidate = 3600

