import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { JobFormData } from '@/shared/types/job';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { TermsAndConditions } from './TermsAndConditions';
import { calculateTotalJobCost } from '@/shared/lib/paymentService';
import { pricingService, type JobPriceCalculation } from '@/shared/lib/pricingService';
import { Rocket, DollarSign, Info, Megaphone, CheckCircle2, Loader2, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { RECRUITMENT_SERVICES } from '@/shared/lib/subscriptionConfig';
import { useAuth } from '@/app/providers/AuthContext';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { FormField, FormItem, FormLabel, FormControl } from '@/shared/components/ui/form';

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
  const { user } = useAuth();

  const [termsAccepted, setTermsAccepted] = useState(formData.termsAccepted || false);
  const [jobPriceCalc, setJobPriceCalc] = useState<JobPriceCalculation | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  const isSelfManaged = formData.serviceType === 'self-managed' || formData.serviceType === 'rpo';

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

  const legacyCostBreakdown = calculateTotalJobCost(
    user?.companyId || '',
    formData.serviceType,
    { min: formData.salaryMin || 0, max: formData.salaryMax || 0 }
  );

  // Use API price for recruitment cost when available, else fall back to legacy
  const recruitmentCost = jobPriceCalc ? jobPriceCalc.price : legacyCostBreakdown.upfrontRecruitmentCost;
  const recruitmentCurrency = jobPriceCalc?.currency || 'USD';
  const costBreakdown = {
    ...legacyCostBreakdown,
    upfrontRecruitmentCost: recruitmentCost,
    recruitmentServiceCost: recruitmentCost,
    totalUpfront: legacyCostBreakdown.jobPostingCost + recruitmentCost,
  };

  const serviceName = RECRUITMENT_SERVICES[formData.serviceType as keyof typeof RECRUITMENT_SERVICES]?.name || '';

  const handlePaymentMethodSelect = (method: 'account' | 'credit_card', invoiceRequested?: boolean) => {
    form.setValue('selectedPaymentMethod', method);
    form.setValue('paymentInvoiceRequested', invoiceRequested);
  };

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
            <li>Option to promote externally via JobTarget will be available</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Cost Breakdown - Only show if payment required */}
      {costBreakdown.totalUpfront > 0 && (
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
                  {costBreakdown.jobPostingCost === 0
                    ? 'Included in your plan'
                    : '30-day HRM8 posting'}
                </p>
              </div>
              <p className="text-lg font-semibold">
                {costBreakdown.jobPostingCost === 0 ? 'FREE' : `$${costBreakdown.jobPostingCost}`}
              </p>
            </div>

            {/* Recruitment Service Cost (if not self-managed) */}
            {!isSelfManaged && costBreakdown.recruitmentServiceCost > 0 && (
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
                  ) : (
                    pricingService.formatPrice(costBreakdown.upfrontRecruitmentCost, recruitmentCurrency)
                  )}
                </p>
              </div>
            )}

            {/* Total Due Now */}
            <div className="flex justify-between items-center pt-3">
              <p className="text-lg font-semibold">Total Due Now</p>
              <p className="text-2xl font-bold text-primary">
                {costBreakdown.totalUpfront === 0
                  ? 'FREE'
                  : priceLoading
                    ? '...'
                    : pricingService.formatPrice(costBreakdown.totalUpfront, recruitmentCurrency)}
              </p>
            </div>


          </CardContent>
        </Card>
      )}

      {/* Payment Info for Paid Packages */}
      {costBreakdown.totalUpfront > 0 && !isSelfManaged && (
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

      {/* Payment Method (only for self-managed jobs with payment) */}
      {costBreakdown.totalUpfront > 0 && isSelfManaged && (
        <PaymentMethodSelector
          employerId={user?.companyId || ''}
          amount={costBreakdown.totalUpfront}
          selectedMethod={formData.selectedPaymentMethod}
          onMethodSelect={handlePaymentMethodSelect}
        />
      )}

      {/* Free Job Posting Info */}
      {costBreakdown.totalUpfront === 0 && (
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

      {isSelfManaged && costBreakdown.jobPostingCost === 0 && (
        <Alert className="border-2 border-primary/30 bg-primary/5">
          <Megaphone className="h-5 w-5 text-primary" />
          <AlertTitle className="text-base font-semibold">🎉 Free Job Posting Activated!</AlertTitle>
          <AlertDescription className="text-base">
            Your job will be posted to HRM8 at <span className="font-semibold text-primary">no cost</span>. Want to reach 10x more candidates? After publishing, you'll have the option to <span className="font-semibold text-primary">promote to external job boards</span> for maximum visibility.
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
