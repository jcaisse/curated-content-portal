import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Post, PostStatus, Keyword, User } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"

interface PostWithRelations extends Post {
  keyword?: Keyword | null
  authorUser?: Pick<User, 'name' | 'email'> | null
}

interface RecentPostsProps {
  posts: PostWithRelations[]
}

export function RecentPosts({ posts }: RecentPostsProps) {
  const getStatusVariant = (status: PostStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return 'default'
      case 'REVIEW':
        return 'secondary'
      case 'DRAFT':
        return 'outline'
      case 'REJECTED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="flex-1 space-y-1">
                <Link 
                  href={`/admin/posts/${post.id}`}
                  className="font-medium hover:underline line-clamp-2"
                >
                  {post.title}
                </Link>
                <div className="text-sm text-muted-foreground">
                  {post.source} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </div>
                {post.keyword && (
                  <Badge variant="outline" className="text-xs">
                    {post.keyword.name}
                  </Badge>
                )}
              </div>
              <Badge variant={getStatusVariant(post.status)}>
                {post.status}
              </Badge>
            </div>
          ))}
          
          {posts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No posts found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
