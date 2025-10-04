"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ExternalLink, CheckCircle } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface UnmoderatedPost {
  id: string
  crawlerId: string
  url: string
  title: string
  summary: string | null
  imageUrl: string | null
  score: number
  discoveredAt: Date | string
  crawler: {
    id: string
    name: string
  }
}

interface UnmoderatedPostsProps {
  posts: UnmoderatedPost[]
}

export function UnmoderatedPosts({ posts }: UnmoderatedPostsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [publishing, setPublishing] = useState<string | null>(null)

  async function handlePublish(postId: string, crawlerId: string) {
    setPublishing(postId)
    try {
      const res = await fetch(`/api/admin/crawlers/${crawlerId}/moderation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "APPROVE",
          itemIds: [postId],
        }),
      })

      if (!res.ok) throw new Error("Failed to publish")

      toast({
        title: "Post published",
        description: "The post has been published to the portal",
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Failed to publish",
        description: error?.message,
        variant: "destructive",
      })
    } finally {
      setPublishing(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Unmoderated Posts ({posts.length})
          </CardTitle>
          {posts.length > 0 && (
            <Badge variant="secondary">
              {posts.length} pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No posts pending moderation
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-lg border p-4 hover:border-primary/50 transition-colors space-y-3"
              >
                {/* Header with crawler name and score */}
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/admin/crawlers/${post.crawlerId}`}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    {post.crawler.name}
                  </Link>
                  <Badge
                    variant="outline"
                    className={
                      post.score >= 0.5
                        ? "border-primary text-primary"
                        : "border-muted-foreground/30 text-muted-foreground"
                    }
                  >
                    {Math.round(post.score * 100)}% match
                  </Badge>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt=""
                        className="w-20 h-20 object-cover rounded border flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {post.title}
                      </h4>
                      {post.summary && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {post.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer with actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Source
                    </a>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.discoveredAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handlePublish(post.id, post.crawlerId)}
                    disabled={publishing === post.id}
                    className="h-8 px-3 text-xs"
                  >
                    {publishing === post.id ? (
                      "Publishing..."
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Publish
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

