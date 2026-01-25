import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Activity, TrendingUp, Users, AlertCircle } from "lucide-react";

export function AdminSettingsDashboard() {
  const stats = [
    { label: "System Health", value: "98%", icon: Activity, color: "text-green-500" },
    { label: "Active Users", value: "1,234", icon: Users, color: "text-blue-500" },
    { label: "Revenue Growth", value: "+12%", icon: TrendingUp, color: "text-purple-500" },
    { label: "Pending Issues", value: "3", icon: AlertCircle, color: "text-orange-500" },
  ];

  const recentChanges = [
    { user: "John Doe", action: "Updated pricing tier", time: "2 hours ago" },
    { user: "Jane Smith", action: "Modified commission rates", time: "5 hours ago" },
    { user: "Mike Johnson", action: "Added new territory", time: "1 day ago" },
    { user: "Sarah Wilson", action: "Changed security settings", time: "2 days ago" },
    { user: "Tom Brown", action: "Updated integration config", time: "3 days ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Changes</CardTitle>
          <CardDescription>Latest administrative actions across the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentChanges.map((change, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{change.user}</p>
                  <p className="text-sm text-muted-foreground">{change.action}</p>
                </div>
                <Badge variant="secondary">{change.time}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
