import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Mail, Calendar, Link2, CreditCard } from "lucide-react";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/components/layouts/AtsPageHeader";
import { EmailIntegrationCard } from "@/components/integrations/EmailIntegrationCard";
import { CalendarIntegrationCard } from "@/components/integrations/CalendarIntegrationCard";
import { ATSIntegrationCard } from "@/components/integrations/ATSIntegrationCard";
import { StripeIntegrationCard } from "@/components/integrations/StripeIntegrationCard";
import { useSearchParams } from "react-router-dom";

export default function Integrations() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'email';

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <AtsPageHeader
          title="Integrations"
          subtitle="Manage and configure all system integrations"
        />

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <div className="overflow-x-auto -mx-1 px-1">
            <TabsList className="inline-flex w-auto gap-1 rounded-full border bg-muted/40 px-1 py-1 shadow-sm">
              <TabsTrigger
                value="email"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                Email
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                Calendar
              </TabsTrigger>
              <TabsTrigger
                value="ats"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Link2 className="h-3.5 w-3.5 flex-shrink-0" />
                ATS Systems
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <CreditCard className="h-3.5 w-3.5 flex-shrink-0" />
                Payments
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="email" className="space-y-4 mt-6">
            <div>
              <h2 className="text-base font-semibold mb-2">Email Integrations</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your email accounts to send and receive emails directly from the platform
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <EmailIntegrationCard
                provider="gmail"
                name="Gmail"
                description="Connect your Gmail account for email communications"
              />
              <EmailIntegrationCard
                provider="outlook"
                name="Outlook"
                description="Connect your Outlook account for email communications"
              />
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4 mt-6">
            <div>
              <h2 className="text-base font-semibold mb-2">Calendar Integrations</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Sync your calendar to schedule interviews and manage availability
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <CalendarIntegrationCard
                provider="google"
                name="Google Calendar"
                description="Sync with Google Calendar for scheduling"
              />
              <CalendarIntegrationCard
                provider="outlook"
                name="Outlook Calendar"
                description="Sync with Outlook Calendar for scheduling"
              />
            </div>
          </TabsContent>

          <TabsContent value="ats" className="space-y-4 mt-6">
            <div>
              <h2 className="text-base font-semibold mb-2">ATS System Integrations</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Connect to external ATS systems to sync candidates and job postings
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ATSIntegrationCard provider="greenhouse" />
              <ATSIntegrationCard provider="lever" />
              <ATSIntegrationCard provider="workday" />
              <ATSIntegrationCard provider="icims" />
              <ATSIntegrationCard provider="taleo" />
              <ATSIntegrationCard provider="jobvite" />
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4 mt-6">
            <div>
              <h2 className="text-base font-semibold mb-2">Payment Processing</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Connect Stripe to accept payments, process subscriptions, and manage billing
              </p>
            </div>
            <div className="max-w-2xl">
              <StripeIntegrationCard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
