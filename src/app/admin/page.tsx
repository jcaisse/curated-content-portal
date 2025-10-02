import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { KeywordStats } from "@/components/admin/keyword-stats"
import { RecentPosts } from "@/components/admin/recent-posts"

export default async function AdminDashboard() {
  const [keywords, posts, crawlRuns] = await Promise.all([
    db.keyword.findMany({
      include: {
        _count: {
          select: {
            posts: true,
            runs: true
          }
        }
      }
    }),
    db.post.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      include: {
        keyword: true,
        authorUser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    }),
    db.crawlRun.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      include: {
        keyword: true
      }
    })
  ])

  const stats = {
    totalKeywords: keywords.length,
    totalPosts: await db.post.count(),
    publishedPosts: await db.post.count({ where: { status: 'PUBLISHED' } }),
    draftPosts: await db.post.count({ where: { status: 'DRAFT' } }),
    reviewPosts: await db.post.count({ where: { status: 'REVIEW' } })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your curated content platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalKeywords}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reviewPosts}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <KeywordStats keywords={keywords} />
        <RecentPosts posts={posts} />
      </div>

      {/* Recent Crawl Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Crawl Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {crawlRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{run.keyword?.name ?? 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">
                    {run.itemsFound} items found, {run.itemsProcessed} processed
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      run.status === 'COMPLETED' ? 'default' :
                      run.status === 'FAILED' ? 'destructive' :
                      run.status === 'RUNNING' ? 'secondary' : 'outline'
                    }
                  >
                    {run.status}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {new Date(run.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
