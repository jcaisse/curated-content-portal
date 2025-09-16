import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure system settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              TODO: Settings Interface
            </h3>
            <p className="text-sm text-muted-foreground">
              This interface needs to be implemented to configure system settings and preferences.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
