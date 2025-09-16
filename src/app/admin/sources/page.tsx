import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SourcesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Source Management</h1>
        <p className="text-muted-foreground">
          Configure content sources and crawling settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              TODO: Source Management Interface
            </h3>
            <p className="text-sm text-muted-foreground">
              This interface needs to be implemented to configure content sources and crawling settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
