import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { JobFormData } from '@/shared/types/job';
import { TermsAndConditions } from './TermsAndConditions';
import { pricingService, type JobPriceCalculation } from '@/shared/lib/pricingService';
import { Rocket, DollarSign, Info, Megaphone, CheckCircle2, Loader2, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { RECRUITMENT_SERVICES } from '@/shared/lib/subscriptionConfig';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';

interface JobWizardStep6Props {
  form: UseFormReturn<JobFormData>;
}

function mapServiceTypeToApi(serviceType: string): string {
  const map: Record<string, string> = {
    'shortlisting': 'SHORTLISTING',
    'full-service': 'FULL',
    'executive-search': 'EXECUTIVE_SEARCH',
  };
  return map[serviceType] || 'FULL';
}

export function JobWizardStep6({ form }: JobWizardStep6Props) {
  const formData = form.watch();
  const globalPublishConfig = form.watch('globalPublishConfig');

  const [termsAccepted, setTermsAccepted] = useState(formData.termsAccepted || false);
  const [jobPriceCalc, setJobPriceCalc] = useState<JobPriceCalculation | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  const isSelfManaged = formData.serviceType === 'self-managed' || formData.serviceType === 'rpo';
  const isGlobalScope = formData.distributionScope === 'GLOBAL';

  const updateGlobalConfig = (patch: Partial<NonNullable<typeof globalPublishConfig>>) => {
    const current = globalPublishConfig || {
      channels: [],
      budgetTier: 'none',
      customBudget: undefined,
      hrm8ServiceRequiresApproval: !isSelfManaged,
      hrm8ServiceApproved: false,
    };
    form.setValue('globalPublishConfig', { ...current, ...patch }, { shouldValidate: true, shouldDirty: true });
  };

  useEffect(() => {
    if (!globalPublishConfig) {
      updateGlobalConfig({
        channels: [],
        budgetTier: 'none',
        customBudget: undefined,
        hrm8ServiceRequiresApproval: !isSelfManaged,
        hrm8ServiceApproved: false,
      });
      return;
    }
    if (globalPublishConfig.hrm8ServiceRequiresApproval !== !isSelfManaged) {
      updateGlobalConfig({ hrm8ServiceRequiresApproval: !isSelfManaged });
    }
  }, [isSelfManaged]);

  // Fetch recruitment price from pricing API when not self-managed
  useEffect(() => {
    if (isSelfManaged) {
      setJobPriceCalc(null);
      return;
    }
    const salaryMax = formData.salaryMax || formData.salaryMin || 50000;
    if (!salaryMax || salaryMax <= 0) {
      setJobPriceCalc(null);
      return;
    }
    setPriceLoading(true);
    pricingService
      .calculateJobPrice(salaryMax, mapServiceTypeToApi(formData.serviceType))
      .then((result) => {
        setJobPriceCalc(result);
      })
      .catch(() => {
        setJobPriceCalc(null);
      })
      .finally(() => {
        setPriceLoading(false);
      });
  }, [formData.serviceType, formData.salaryMax, formData.salaryMin, isSelfManaged]);

  const recruitmentCost = !isSelfManaged && jobPriceCalc ? jobPriceCalc.price : 0;
  const recruitmentCurrency = jobPriceCalc?.currency || formData.salaryCurrency || 'USD';
  const totalDueNow = isSelfManaged ? 0 : recruitmentCost;

  const serviceName = RECRUITMENT_SERVICES[formData.serviceType as keyof typeof RECRUITMENT_SERVICES]?.name || '';

  const handleTermsAcceptChange = (accepted: boolean) => {
    setTermsAccepted(accepted);
    form.setValue('termsAccepted', accepted);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Submit & Activate
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Publish using your subscription quota. If you selected an HRM8 managed service, wallet funds are also required.
        </p>
      </div>

      {/* Activation Info */}
      <Alert className="border-2 border-primary/30 bg-primary/5">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <AlertTitle className="text-base font-semibold">What happens next?</AlertTitle>
        <AlertDescription className="text-base mt-2">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Job will be activated and visible on HRM8 internal job board</li>
            <li>Job will be published on your corporate careers page</li>
            <li>You'll receive access to post-launch tools (alerts, sharing, templates)</li>
            {isGlobalScope ? (
              <li>GLOBAL publish requires JobTarget sync and internal distribution-plan review before launch.</li>
            ) : (
              <li>No JobTarget sync is performed for HRM8_ONLY jobs.</li>
            )}
          </ul>
        </AlertDescription>
      </Alert>

      {isGlobalScope && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">Global Distribution Review (Required)</CardTitle>
            <CardDescription>
              Review channels and budget in HRM8 before launching JobTarget Marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Selected Channels</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['indeed', 'linkedin', 'glassdoor', 'ziprecruiter', 'monster', 'seek'].map((channel) => {
                  const checked = !!globalPublishConfig?.channels?.includes(channel);
                  return (
                    <label key={channel} className="flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(next) => {
                          const current = globalPublishConfig?.channels || [];
                          const channels = next
                            ? Array.from(new Set([...current, channel]))
                            : current.filter((c) => c !== channel);
                          updateGlobalConfig({ channels });
                        }}
                      />
                      <span className="capitalize">{channel}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <FormLabel>Budget Tier</FormLabel>
                <Select
                  value={globalPublishConfig?.budgetTier || 'none'}
                  onValueChange={(value: any) => updateGlobalConfig({ budgetTier: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No external budget</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {globalPublishConfig?.budgetTier === 'custom' && (
                <div className="space-y-2">
                  <FormLabel>Custom Budget</FormLabel>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Enter custom budget"
                    value={globalPublishConfig?.customBudget ?? ''}
                    onChange={(e) => updateGlobalConfig({ customBudget: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              )}
            </div>

            {!isSelfManaged && (
              <FormField
                control={form.control}
                name="globalPublishConfig.hrm8ServiceApproved"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-3">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>I approve the HRM8-managed global distribution plan</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Required for GLOBAL jobs when HRM8 manages hiring.
                      </p>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Managed service quote (dynamic only) */}
      {!isSelfManaged && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Service Payment (HRM8 Managed)
            </CardTitle>
            <CardDescription>
              Publishing uses quota. Wallet is charged only for managed services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Job Posting Cost */}
            <div className="flex justify-between items-center pb-3 border-b">
              <div>
                <p className="font-medium">Job Posting</p>
                <p className="text-sm text-muted-foreground">
                  Included in your active subscription quota
                </p>
              </div>
              <p className="text-lg font-semibold">FREE</p>
            </div>

            <div className="flex justify-between items-center pb-3 border-b">
              <div>
                <p className="font-medium">Recruitment Service</p>
                <p className="text-sm text-muted-foreground">
                  {serviceName}
                  {jobPriceCalc?.isExecutiveSearch && jobPriceCalc?.band && (
                    <> · Executive Search {jobPriceCalc.band}</>
                  )}
                </p>
              </div>
              <p className="text-lg font-semibold">
                {priceLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : jobPriceCalc ? (
                  pricingService.formatPrice(recruitmentCost, recruitmentCurrency)
                ) : (
                  'Calculated at checkout'
                )}
              </p>
            </div>

            {/* Total Due Now */}
            <div className="flex justify-between items-center pt-3">
              <p className="text-lg font-semibold">Total Due Now</p>
              <p className="text-2xl font-bold text-primary">
                {priceLoading
                  ? '...'
                  : jobPriceCalc
                    ? pricingService.formatPrice(totalDueNow, recruitmentCurrency)
                    : 'Calculated at checkout'}
              </p>
            </div>


          </CardContent>
        </Card>
      )}

      {/* Payment Info for Paid Packages */}
      {!isSelfManaged && (
        <Alert className="border-2 border-primary/30 bg-primary/5">
          <Info className="h-5 w-5 text-primary" />
          <AlertTitle className="text-base font-semibold">Managed Service Payment</AlertTitle>
          <AlertDescription className="text-base mt-2">
            <p className="mb-2">
              HRM8 managed services are paid from your wallet balance at publish time.
            </p>
            <p className="text-sm text-muted-foreground">
              If wallet balance is low, top up and retry. Subscription quota is still required for publishing.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Free Job Posting Info */}
      {isSelfManaged && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              No Payment Required
            </CardTitle>
          </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Publishing uses subscription quota with no extra service charge for self-managed jobs.
              </p>
            </CardContent>
          </Card>
        )}

      <TermsAndConditions
        accepted={termsAccepted}
        onAcceptChange={handleTermsAcceptChange}
        required={true}
      />

      {isSelfManaged && !isGlobalScope && (
        <Alert className="border-2 border-primary/30 bg-primary/5">
          <Megaphone className="h-5 w-5 text-primary" />
          <AlertTitle className="text-base font-semibold">Free Job Posting Activated</AlertTitle>
          <AlertDescription className="text-base">
            Your HRM8_ONLY job will be posted at no additional service cost.
          </AlertDescription>
        </Alert>
      )}

      {/* Save as Template Option */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Save as Template</CardTitle>
          </div>
          <CardDescription>
            Save this job configuration as a template to reuse for future postings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="saveAsTemplate"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium cursor-pointer">
                    Save this job as a template
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    When publishing, you'll be asked to provide a template name.
                  </p>
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
