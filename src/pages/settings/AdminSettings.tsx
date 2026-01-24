import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/app/layouts/AtsPageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { useRBAC } from "@/shared/hooks/useRBAC";
import { isDevelopmentMode } from "@/shared/lib/rbacService";
import { AlertCircle } from "lucide-react";
import { AdminSettingsDashboard } from "@/modules/settings/components/admin/settings/AdminSettingsDashboard";
import { PricingManagementTab } from "@/modules/settings/components/admin/settings/PricingManagementTab";
import { CommissionsManagementTab } from "@/modules/settings/components/admin/settings/CommissionsManagementTab";
import { TerritoryRegionsTab } from "@/modules/settings/components/admin/settings/TerritoryRegionsTab";
import { CurrencyManagementTab } from "@/modules/settings/components/admin/settings/CurrencyManagementTab";
import { UserManagementTab } from "@/modules/settings/components/admin/settings/UserManagementTab";
import { SystemConfigurationTab } from "@/modules/settings/components/admin/settings/SystemConfigurationTab";
import { IntegrationsTab } from "@/modules/settings/components/admin/settings/IntegrationsTab";
import { SecurityComplianceTab } from "@/modules/settings/components/admin/settings/SecurityComplianceTab";
import { AuditLogsTab } from "@/modules/settings/components/admin/settings/AuditLogsTab";
import { PromoCodesTab } from "@/modules/settings/components/admin/settings/PromoCodesTab";

export default function AdminSettings() {
  const { isSuperAdmin, loading } = useRBAC();

  // In dev mode, bypass permission check - only enforce in production
  const hasAccess = isDevelopmentMode() || isSuperAdmin;

  // Don't show error while loading roles
  if (loading) {
    return (
      <DashboardPageLayout>
        <div className="p-6">Loading...</div>
      </DashboardPageLayout>
    );
  }

  if (!hasAccess) {
    return (
      <DashboardPageLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to access admin settings. Only super administrators can access this page.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <AtsPageHeader
          title="Admin Settings"
          subtitle="System-wide configuration and administration"
        />

        <Tabs defaultValue="dashboard" className="space-y-4">
          <div className="overflow-x-auto -mx-1 px-1">
            <TabsList className="inline-flex w-auto gap-1 rounded-full border bg-muted/40 px-1 py-1 shadow-sm">
              <TabsTrigger
                value="dashboard"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="pricing"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Pricing
              </TabsTrigger>
              <TabsTrigger
                value="commission"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Commission
              </TabsTrigger>
              <TabsTrigger
                value="territory"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Territory
              </TabsTrigger>
              <TabsTrigger
                value="currency"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Currency
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Users
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                System
              </TabsTrigger>
              <TabsTrigger
                value="integrations"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Integrations
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Security
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Audit Logs
              </TabsTrigger>
              <TabsTrigger
                value="promocodes"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Promo Codes
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="mt-6">
            <AdminSettingsDashboard />
          </TabsContent>

          <TabsContent value="pricing" className="mt-6">
            <PricingManagementTab />
          </TabsContent>

          <TabsContent value="commission" className="mt-6">
            <CommissionsManagementTab />
          </TabsContent>

          <TabsContent value="territory" className="mt-6">
            <TerritoryRegionsTab />
          </TabsContent>

          <TabsContent value="currency" className="mt-6">
            <CurrencyManagementTab />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagementTab />
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <SystemConfigurationTab />
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <IntegrationsTab />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SecurityComplianceTab />
          </TabsContent>


          <TabsContent value="audit" className="mt-6">
            <AuditLogsTab />
          </TabsContent>

          <TabsContent value="promocodes" className="mt-6">
            <PromoCodesTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
