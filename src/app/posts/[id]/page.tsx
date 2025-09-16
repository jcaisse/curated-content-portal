import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface PostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params
  const post = await db.post.findUnique({
    where: {
      id: id
    },
    include: {
      keyword: true,
      author: {
        select: {
          name: true,
          email: true
        }
      },
      related: {
        include: {
          related: {
            include: {
              keyword: true
            }
          }
        },
        take: 6
      }
    }
  })

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <article className="prose prose-lg max-w-none">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                ← Back to feed
              </Link>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span>{post.source}</span>
              {post.publishedAt && (
                <span>
                  {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                </span>
              )}
            </div>

            {post.keyword && (
              <Badge variant="secondary" className="mb-4">
                {post.keyword.name}
              </Badge>
            )}

            <div className="flex items-center gap-4 text-sm">
              <a 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View original →
              </a>
              {post.author && (
                <span className="text-muted-foreground">
                  Curated by {post.author.name || post.author.email}
                </span>
              )}
            </div>
          </header>

          {post.imageUrl && (
            <div className="relative h-96 w-full mb-8">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}

          {post.description && (
            <div className="mb-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                {post.description}
              </p>
            </div>
          )}

          {post.content && (
            <div className="mb-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          )}

          {post.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {post.related.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-semibold mb-6">Related Content</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {post.related.map((related) => (
                  <Card key={related.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <Link href={`/posts/${related.related.id}`}>
                      {related.related.imageUrl && (
                        <div className="relative h-32 w-full">
                          <Image
                            src={related.related.imageUrl}
                            alt={related.related.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      
                      <CardHeader className="pb-2">
                        <CardTitle className="line-clamp-2 text-sm">
                          {related.related.title}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="text-xs text-muted-foreground mb-2">
                          Similarity: {(related.similarity * 100).toFixed(1)}%
                        </div>
                        
                        {related.related.keyword && (
                          <Badge variant="outline" className="text-xs">
                            {related.related.keyword.name}
                          </Badge>
                        )}
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  )
}
