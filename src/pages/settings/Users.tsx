import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card";
import { UsersRound, UserPlus } from "lucide-react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { SignupRequestsList } from "@/modules/settings/components/SignupRequestsList";

export default function Users() {
  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage system users, roles, and access requests</p>
          </div>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <UsersRound className="h-4 w-4" />
              Active Users
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Access Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <UsersRound className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">System Users</CardTitle>
                    <CardDescription>Manage users who already have access to your organization</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                  <h3 className="text-lg font-medium">User management coming soon</h3>
                  <p className="text-muted-foreground">Detailed user and role administration is currently under development.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Pending Access Requests</h2>
                <p className="text-sm text-muted-foreground">
                  Review and approve employees who have requested to join your company instance.
                </p>
              </div>

              <SignupRequestsList />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
