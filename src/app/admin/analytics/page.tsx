import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          View performance metrics and insights
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              TODO: Analytics Dashboard
            </h3>
            <p className="text-sm text-muted-foreground">
              This interface needs to be implemented to show content performance metrics and insights.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
