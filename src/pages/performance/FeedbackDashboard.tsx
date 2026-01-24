import { DashboardPageLayout } from '@/app/layouts/DashboardPageLayout';
import { AtsPageHeader } from '@/app/layouts/AtsPageHeader';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { FeedbackRequestDashboard } from '@/modules/performance/components/FeedbackRequestDashboard';
import { FeedbackAnalyticsDashboard } from '@/modules/performance/components/FeedbackAnalyticsDashboard';
import { AutomationRulesManager } from '@/modules/performance/components/AutomationRulesManager';
import { TeamPerformanceAnalytics } from '@/modules/performance/components/TeamPerformanceAnalytics';

export default function FeedbackDashboard() {
  return (
    <DashboardPageLayout>
      <Helmet>
        <title>Feedback Dashboard - ATS</title>
      </Helmet>
      <div className="p-6 space-y-6">
        <AtsPageHeader 
          title="Feedback Dashboard" 
          subtitle="Monitor feedback requests, analytics, and team performance"
        />

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests">All Requests</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="performance">Team Performance</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-6">
            <FeedbackRequestDashboard />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <FeedbackAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <TeamPerformanceAnalytics />
          </TabsContent>

          <TabsContent value="automation" className="mt-6">
            <AutomationRulesManager />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
