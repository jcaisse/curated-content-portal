import { notFound } from "next/navigation"
import { db } from "@/lib/db"

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8">
          <div>
            <h1 className="text-3xl font-bold">{portal.title ?? subdomain}</h1>
            {portal.description && (
              <p className="text-muted-foreground">{portal.description}</p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {posts.length === 0 ? (
          <div className="rounded-lg border bg-card p-10 text-center">
            <h2 className="text-lg font-semibold">No posts yet</h2>
            <p className="text-sm text-muted-foreground">Approved posts will appear here once published.</p>
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {posts.map((post) => (
              <article key={post.id} className="mb-4 break-inside-avoid">
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-lg">
                  {post.imageUrl && (
                    <div className="aspect-[4/3] w-full bg-muted">
                      <img
                        src={post.imageUrl}
                        alt={post.title ?? ""}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="space-y-3 p-4">
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold leading-tight">{post.title}</h2>
                      <p className="text-sm text-muted-foreground line-clamp-3">{post.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{post.source}</span>
                      {post.publishedAt && (
                        <time dateTime={post.publishedAt.toISOString()}>
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </time>
                      )}
                    </div>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-md border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                      View Source
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}


