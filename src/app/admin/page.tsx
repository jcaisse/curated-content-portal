import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UnmoderatedPosts } from "@/components/admin/unmoderated-posts"
import { RecentPosts } from "@/components/admin/recent-posts"

export default async function AdminDashboard() {
  const [unmoderatedPosts, posts, crawlRuns] = await Promise.all([
    db.crawlerModerationItem.findMany({
      where: {
        status: 'PENDING'
      },
      orderBy: {
        discoveredAt: 'desc'
      },
      include: {
        crawler: {
          select: {
            id: true,
            name: true
          }
        }
      }
    }),
    db.post.findMany({
      where: {
        status: 'PUBLISHED'
      },
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
    totalCrawlers: await db.crawler.count(),
    activeCrawlers: await db.crawler.count({ where: { isActive: true } }),
    itemsPublished: await db.post.count({ where: { status: 'PUBLISHED' } }),
    pendingModeration: unmoderatedPosts.length,
    crawlRunsToday: await db.crawlRun.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    itemsFoundToday: await db.crawlRun.aggregate({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      _sum: {
        itemsFound: true
      }
    }).then(result => result._sum.itemsFound || 0)
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Crawlers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCrawlers}</div>
            <p className="text-xs text-muted-foreground mt-1">Configured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCrawlers}</div>
            <p className="text-xs text-muted-foreground mt-1">Running crawlers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.itemsPublished}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.pendingModeration}</div>
            <p className="text-xs text-orange-700 mt-1">Needs moderation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Runs Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.crawlRunsToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed runs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.itemsFoundToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Found items</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UnmoderatedPosts posts={unmoderatedPosts} />
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
