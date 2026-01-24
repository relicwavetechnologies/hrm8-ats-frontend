import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card";
import { UsersRound } from "lucide-react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";

export default function Users() {
  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage system users, roles, and permissions</p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <UsersRound className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Coming Soon</CardTitle>
                <CardDescription>User management features are under development</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This page will provide user administration, role management, and access control features.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
