import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/components/layouts/AtsPageHeader";
import { Settings as SettingsIcon, DollarSign, Bell, Globe, Eye, Shield, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import { useCurrencyFormat } from "@/app/providers/CurrencyFormatContext";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { companySettingsService, JobAssignmentMode } from "@/shared/lib/api/companySettingsService";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";

export default function Settings() {
  const { currencyFormat, setCurrencyFormat, formatCurrency } = useCurrencyFormat();
  const { user } = useAuth();
  const [jobAssignmentMode, setJobAssignmentMode] = useState<JobAssignmentMode>('AUTO_RULES_ONLY');
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (user?.companyId) {
      loadJobAssignmentSettings();
    }
  }, [user?.companyId]);

  const loadJobAssignmentSettings = async () => {
    if (!user?.companyId) return;
    
    try {
      setLoadingSettings(true);
      const settings = await companySettingsService.getJobAssignmentSettings(user.companyId);
      setJobAssignmentMode(settings.jobAssignmentMode);
    } catch (error) {
      console.error('Failed to load job assignment settings:', error);
      toast.error('Failed to load job assignment settings');
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleJobAssignmentModeChange = async (mode: JobAssignmentMode) => {
    if (!user?.companyId) return;

    try {
      setSavingSettings(true);
      await companySettingsService.updateJobAssignmentMode(user.companyId, mode);
      setJobAssignmentMode(mode);
      toast.success('Job assignment mode updated successfully', {
        description: `Jobs will now be ${mode === 'AUTO_RULES_ONLY' ? 'automatically assigned' : 'manually assigned'}`,
      });
    } catch (error) {
      console.error('Failed to update job assignment mode:', error);
      toast.error('Failed to update job assignment mode', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCurrencyFormatChange = (checked: boolean) => {
    const newFormat = checked ? 'decimal' : 'whole';
    setCurrencyFormat(newFormat);
    toast.success(
      `Currency format updated to ${newFormat === 'whole' ? 'whole numbers' : 'decimals'}`,
      {
        description: `Example: ${formatCurrency(1234567.89)}`,
      }
    );
  };


  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div className="max-w-4xl space-y-6">
          <AtsPageHeader
            title="Settings"
            subtitle="Manage your application preferences and configurations"
          />

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Payment & Billing
              </CardTitle>
              <CardDescription className="text-sm">
                Payment is now handled per job posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="font-medium mb-2">Job-Specific Payments</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  HRM8 now uses a pay-per-job model. When you create a job posting, you can choose:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Self-Managed:</strong> Free - Post and manage the job yourself</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Shortlisting:</strong> $1,990 - We provide pre-screened candidates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Full Service:</strong> $5,990 - End-to-end recruitment support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span><strong>Executive Search:</strong> $9,990 - Premium executive recruitment</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Payment is required before publishing paid service jobs. You can view payment status on each job's detail page.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Display & Formatting */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Display & Formatting
              </CardTitle>
              <CardDescription className="text-sm">
                Customize how information is displayed throughout the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="currency-format" className="text-base">
                    Currency Format
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display currency values with or without decimal places
                  </p>
                  <div className="flex gap-4 mt-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Whole: </span>
                      <span className="font-medium">{formatCurrency(1234567.89, 'USD').replace(/\.\d+$/, '')}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Decimal: </span>
                      <span className="font-medium">$1,234,567.89</span>
                    </div>
                  </div>
                </div>
                <Switch
                  id="currency-format"
                  checked={currencyFormat === 'decimal'}
                  onCheckedChange={handleCurrencyFormatChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Regional Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Regional Settings
              </CardTitle>
              <CardDescription className="text-sm">
                Configure language, timezone, and regional preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Regional settings coming soon...</p>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </CardTitle>
              <CardDescription className="text-sm">
                Manage how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Notification preferences coming soon...</p>
            </CardContent>
          </Card>

          {/* Job Assignment Settings */}
          {user?.companyId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Job Assignment Settings
                </CardTitle>
                <CardDescription className="text-sm">
                  Configure how jobs are assigned to consultants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingSettings ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="job-assignment-mode" className="text-base">
                        Assignment Mode
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Choose how jobs are assigned to consultants
                      </p>
                      <Select
                        value={jobAssignmentMode}
                        onValueChange={(value) => handleJobAssignmentModeChange(value as JobAssignmentMode)}
                        disabled={savingSettings}
                      >
                        <SelectTrigger id="job-assignment-mode" className="w-full max-w-md">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AUTO_RULES_ONLY">
                            Auto Assignment by Rules
                          </SelectItem>
                          <SelectItem value="MANUAL_ONLY">
                            Manual Assignment Only
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-2">
                        {jobAssignmentMode === 'AUTO_RULES_ONLY' 
                          ? 'Jobs will be automatically assigned to consultants based on region, expertise, and availability.'
                          : 'All jobs must be manually assigned by administrators.'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy & Security
              </CardTitle>
              <CardDescription className="text-sm">
                Control your privacy and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Privacy and security settings coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>

    </DashboardPageLayout>
  );
}
