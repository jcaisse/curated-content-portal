import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Keyword } from "@prisma/client"

interface KeywordWithCounts extends Keyword {
  _count: {
    posts: number
    runs: number
  }
}

interface KeywordStatsProps {
  keywords: KeywordWithCounts[]
}

export function KeywordStats({ keywords }: KeywordStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Keywords Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {keywords.map((keyword) => (
            <div key={keyword.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <div className="font-medium">{keyword.name}</div>
                {keyword.description && (
                  <div className="text-sm text-muted-foreground">
                    {keyword.description}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {keyword._count.posts} posts
                </Badge>
                <Badge variant={keyword.isActive ? "default" : "secondary"}>
                  {keyword.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          ))}
          
          {keywords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No keywords configured yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
