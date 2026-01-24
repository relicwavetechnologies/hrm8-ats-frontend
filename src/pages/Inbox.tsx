import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card";
import { Mail } from "lucide-react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";

export default function Inbox() {
  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Inbox</h1>
          <p className="text-muted-foreground">Manage messages, notifications, and communications</p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Mail className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Coming Soon</CardTitle>
                <CardDescription>Inbox and messaging features are under development</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This page will provide message center, notifications, and internal communication tools.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
