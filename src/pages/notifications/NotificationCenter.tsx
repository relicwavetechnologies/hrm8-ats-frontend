import { NotificationSettings } from '@/modules/performance/components/NotificationSettings';
import { PendingFeedbackRequests } from '@/modules/performance/components/PendingFeedbackRequests';
import { NotificationCenter as NotificationCenterComponent } from '@/modules/performance/components/NotificationCenter';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { FileText, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationCenter() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-base font-semibold flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notification Center</h1>
          <p className="text-muted-foreground">
            Manage notifications, feedback requests and email preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/feedback-templates">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </Button>
          </Link>
          <Link to="/feedback-dashboard">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="requests">Pending Requests</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="mt-6">
          <NotificationCenterComponent />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <PendingFeedbackRequests />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
