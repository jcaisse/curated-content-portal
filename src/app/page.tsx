import { db } from "@/lib/db"
import { PostGrid } from "@/components/post-grid"
import { Header } from "@/components/header"

export default async function HomePage() {
  let posts: any[] = []
  
  try {
    posts = await db.post.findMany({
      where: {
        status: 'PUBLISHED'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50,
      include: {
        keyword: true,
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
  } catch (error) {
    // Database not available during build time - return empty posts
    console.warn('Database not available for homepage:', error)
    posts = []
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            Curated Content Portal
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto">
            Discover the best content on the web, curated by AI and organized by topic.
          </p>
        </div>
        
        <PostGrid posts={posts} />
      </main>
    </div>
  )
}
