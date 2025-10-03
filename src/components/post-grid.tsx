"use client"

import { Post } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"

interface PostWithRelations extends Post {
  keyword?: {
    name: string
  } | null
  author?: {
    name: string | null
    email: string | null
  } | null
}

interface PostGridProps {
  posts: PostWithRelations[]
}

export function PostGrid({ posts }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground">
          No posts available yet
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Content is being curated and will appear here soon.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <Link href={`/posts/${post.id}`}>
            {post.imageUrl && (
              <div className="relative h-48 w-full">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <CardHeader className="pb-2">
              <CardTitle className="line-clamp-2 text-base">
                {post.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-0">
              {(post.summary || post.description) && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {post.summary || post.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{post.source}</span>
                {post.publishedAt && (
                  <span>
                    {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              
              {post.keyword && (
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                    {post.keyword.name}
                  </span>
                </div>
              )}
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  )
}
