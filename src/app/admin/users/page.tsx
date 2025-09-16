import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              TODO: User Management Interface
            </h3>
            <p className="text-sm text-muted-foreground">
              This interface needs to be implemented to manage user accounts and permissions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
