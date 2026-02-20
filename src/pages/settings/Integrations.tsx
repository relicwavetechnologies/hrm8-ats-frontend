import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/app/layouts/AtsPageHeader";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";
import { Mail, CreditCard, CheckCircle2 } from "lucide-react";
import { EmailIntegrationCard } from "@/modules/settings/components/integrations/EmailIntegrationCard";
import { CalendarIntegrationCard } from "@/modules/settings/components/integrations/CalendarIntegrationCard";
import { StripeIntegrationCard } from "@/modules/settings/components/integrations/StripeIntegrationCard";
import {
  BrandIconPlate,
  GmailBrandIcon,
  GoogleMeetBrandIcon,
  StripeBrandIcon,
} from "@/modules/settings/components/integrations/BrandIcons";

export default function Integrations() {
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab") || "email";
  const defaultTab = useMemo(() => {
    const allowed = new Set(["email", "calendar", "payments"]);
    return allowed.has(requestedTab) ? requestedTab : "email";
  }, [requestedTab]);

  return (
    <DashboardPageLayout>
      <div className="p-4 md:p-5 space-y-4">
        <AtsPageHeader
          title="Integrations"
          subtitle="Connect essential services for communication, scheduling, and payments"
        />

        <div className="grid gap-3 md:grid-cols-4">
          <Card className="shadow-none border-border/80">
            <CardContent className="p-2.5">
              <p className="text-[11px] text-muted-foreground">Email</p>
              <p className="text-sm font-semibold mt-1 flex items-center gap-1.5">
                <BrandIconPlate className="h-6 w-6 rounded-md">
                  <GmailBrandIcon className="h-4 w-4" />
                </BrandIconPlate>
                Gmail
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-none border-border/80">
            <CardContent className="p-2.5">
              <p className="text-[11px] text-muted-foreground">Calendar</p>
              <p className="text-sm font-semibold mt-1 flex items-center gap-1.5">
                <BrandIconPlate className="h-6 w-6 rounded-md">
                  <GoogleMeetBrandIcon className="h-4 w-4" />
                </BrandIconPlate>
                Google Meet
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-none border-border/80">
            <CardContent className="p-2.5">
              <p className="text-[11px] text-muted-foreground">Payments</p>
              <p className="text-sm font-semibold mt-1 flex items-center gap-1.5">
                <BrandIconPlate className="h-6 w-6 rounded-md">
                  <StripeBrandIcon className="h-4 w-4" />
                </BrandIconPlate>
                Stripe
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-none border-border/80">
            <CardContent className="p-2.5">
              <p className="text-[11px] text-muted-foreground">Scope</p>
              <p className="text-sm font-semibold mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Core Integrations
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-3">
          <TabsList className="inline-flex w-auto gap-1 rounded-md border bg-muted/25 p-1">
            <TabsTrigger value="email" className="h-7 px-3 text-xs">
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              Email
            </TabsTrigger>
            <TabsTrigger value="calendar" className="h-7 px-3 text-xs">
              <BrandIconPlate className="h-[18px] w-[18px] rounded-sm mr-1.5">
                <GoogleMeetBrandIcon className="h-3 w-3" />
              </BrandIconPlate>
              Calendar
            </TabsTrigger>
            <TabsTrigger value="payments" className="h-7 px-3 text-xs">
              <CreditCard className="h-3.5 w-3.5 mr-1.5" />
              Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Email Integration</h2>
              <Badge variant="outline" className="text-[10px] h-5 px-1.5">Gmail only</Badge>
            </div>
            <div className="max-w-2xl">
              <EmailIntegrationCard
                provider="gmail"
                name="Gmail"
                description="Connect Gmail for candidate thread sync and replies"
              />
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Calendar Integration</h2>
              <Badge variant="outline" className="text-[10px] h-5 px-1.5">Google Meet</Badge>
            </div>
            <div className="max-w-2xl">
              <CalendarIntegrationCard
                provider="google"
                name="Google Meet"
                description="Sync interview schedules and video meetings"
              />
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Payment Integration</h2>
              <Badge variant="outline" className="text-[10px] h-5 px-1.5">Stripe</Badge>
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
