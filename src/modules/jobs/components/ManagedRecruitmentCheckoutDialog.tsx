import { type ComponentType, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Check, CreditCard, Loader2, AlertCircle, Users, Star, Crown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { jobService, type ManagedServicePendingPayment } from '@/shared/lib/jobService';
import { pricingService, type ExecutiveSearchBand, type RecruitmentService } from '@/shared/lib/pricingService';
import { useToast } from '@/shared/hooks/use-toast';
import type { Job } from '@/shared/types/job';

function isManagedServicePending(data: unknown): data is ManagedServicePendingPayment {
  return (
    !!data &&
    typeof data === 'object' &&
    (data as Record<string, unknown>).status === 'PENDING_PAYMENT' &&
    typeof (data as Record<string, unknown>).checkoutUrl === 'string'
  );
}

type ManagedServiceType = 'shortlisting' | 'full-service' | 'rpo' | 'executive-search';

interface ManagedRecruitmentCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  initialServiceType?: ManagedServiceType;
  onSuccess?: (job?: Job) => void;
}

interface ServiceQuote {
  price: number;
  currency: string;
  bandName?: string;
}

interface ServiceMeta {
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  recommended?: boolean;
  perks: string[];
}

const SERVICE_ORDER: ManagedServiceType[] = ['shortlisting', 'full-service', 'rpo', 'executive-search'];

const EMPTY_QUOTES: Record<ManagedServiceType, ServiceQuote | null> = {
  shortlisting: null,
  'full-service': null,
  rpo: null,
  'executive-search': null,
};

const SERVICE_META: Record<ManagedServiceType, ServiceMeta> = {
  shortlisting: {
    label: 'Shortlisting Service',
    description: 'HRM8 consultants screen applicants and deliver a curated shortlist.',
    icon: Users,
    perks: [
      'Consultant screening and candidate qualification',
      'Curated shortlist with hiring notes',
      'Faster shortlisting with recruiter ownership',
    ],
  },
  'full-service': {
    label: 'Full Service Recruitment',
    description: 'End-to-end consultant-led hiring from sourcing to handover.',
    icon: Star,
    recommended: true,
    perks: [
      'End-to-end consultant delivery',
      'Pipeline coordination and follow-ups',
      'Finalist handover with recommendations',
    ],
  },
  rpo: {
    label: 'RPO Service',
    description: 'Embedded HRM8 hiring delivery with dedicated recruiter ownership.',
    icon: Star,
    perks: [
      'Dedicated recruiter aligned to your hiring plan',
      'Ongoing pipeline management and progress tracking',
      'Invoice-based managed delivery with consultant ownership',
    ],
  },
  'executive-search': {
    label: 'Executive Search',
    description: 'Leadership hiring with market mapping and confidential outreach.',
    icon: Crown,
    perks: [
      'Senior and C-level talent search',
      'Confidential outreach and market mapping',
      'Dedicated consultant ownership',
    ],
  },
};

function normalizeServiceCode(value?: string): string {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/^RECRUIT_/, '');
}

function isShortlistingCode(value?: string): boolean {
  return normalizeServiceCode(value).includes('SHORTLIST');
}

function isFullServiceCode(value?: string): boolean {
  const normalized = normalizeServiceCode(value);
  return normalized === 'FULL' || normalized === 'FULL_SERVICE';
}

function isExecutiveBandCode(value?: string): boolean {
  return normalizeServiceCode(value).startsWith('EXEC_BAND_');
}

function isRpoCode(value?: string): boolean {
  return normalizeServiceCode(value) === 'RPO';
}

function chooseMatchingBand(
  bands: Array<{ salaryMin?: number | null; salaryMax?: number | null; price: number; currency: string; bandName?: string }>,
  salary: number
): ServiceQuote | null {
  if (!bands.length) return null;

  const sorted = [...bands].sort((a, b) => Number(a.salaryMin ?? 0) - Number(b.salaryMin ?? 0));
  const targetSalary = salary > 0 ? salary : Number(sorted[0]?.salaryMin ?? 0);

  const matched =
    sorted.find((band) => {
      const min = Number(band.salaryMin ?? 0);
      const max = band.salaryMax == null ? Number.POSITIVE_INFINITY : Number(band.salaryMax);
      return targetSalary >= min && targetSalary <= max;
    }) ?? sorted[sorted.length - 1];

  return {
    price: Number(matched.price ?? 0),
    currency: String(matched.currency || 'USD'),
    bandName: matched.bandName,
  };
}

export function ManagedRecruitmentCheckoutDialog({
  open,
  onOpenChange,
  jobId,
  initialServiceType = 'full-service',
  onSuccess,
}: ManagedRecruitmentCheckoutDialogProps) {
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [executiveBands, setExecutiveBands] = useState<ExecutiveSearchBand[]>([]);
  const [serviceQuotes, setServiceQuotes] = useState<Record<ManagedServiceType, ServiceQuote | null>>(EMPTY_QUOTES);
  const [selectedService, setSelectedService] = useState<ManagedServiceType>(initialServiceType);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedService(initialServiceType);
  }, [open, initialServiceType]);

  useEffect(() => {
    if (!open || !jobId) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      setServiceQuotes(EMPTY_QUOTES);
      setExecutiveBands([]);

      try {
        const jobRes = await jobService.getJobById(jobId);
        if (!jobRes.success || !jobRes.data?.job) {
          throw new Error(jobRes.error || 'Failed to load job details');
        }

        const loadedJob = jobRes.data.job;
        const salaryForPricing = Number(loadedJob.salaryMax ?? loadedJob.salaryMin ?? 0);
        setJob(loadedJob);

        const [servicesResult, execBandsResult] = await Promise.allSettled([
          pricingService.getRecruitmentServices(),
          pricingService.getExecutiveSearchBands(),
        ]);

        const services: RecruitmentService[] =
          servicesResult.status === 'fulfilled' ? servicesResult.value : [];
        const execBands: ExecutiveSearchBand[] =
          execBandsResult.status === 'fulfilled' ? execBandsResult.value : [];
        setExecutiveBands(
          [...execBands].sort((a, b) => Number(a.salaryMin ?? 0) - Number(b.salaryMin ?? 0))
        );

        const quotes: Record<ManagedServiceType, ServiceQuote | null> = { ...EMPTY_QUOTES };

        const shortlistingTier = services.find((tier) => isShortlistingCode(tier.serviceType));
        if (shortlistingTier) {
          quotes.shortlisting = {
            price: Number(shortlistingTier.price || 0),
            currency: String(shortlistingTier.currency || loadedJob.salaryCurrency || 'USD'),
          };
        }

        const fullServiceTier = services.find((tier) => isFullServiceCode(tier.serviceType));
        if (fullServiceTier) {
          quotes['full-service'] = {
            price: Number(fullServiceTier.price || 0),
            currency: String(fullServiceTier.currency || loadedJob.salaryCurrency || 'USD'),
          };
        }

        const rpoTier = services.find((tier) => isRpoCode(tier.serviceType));
        if (rpoTier) {
          quotes.rpo = {
            price: Number(rpoTier.price || 0),
            currency: String(rpoTier.currency || loadedJob.salaryCurrency || 'USD'),
          };
        }

        const resolvedExec = chooseMatchingBand(
          execBands.map((band) => ({
            salaryMin: band.salaryMin,
            salaryMax: band.salaryMax,
            price: band.price,
            currency: band.currency,
            bandName: band.bandName,
          })),
          salaryForPricing
        );

        if (resolvedExec) {
          quotes['executive-search'] = resolvedExec;
        } else {
          const execTiers = services
            .filter((tier) => isExecutiveBandCode(tier.serviceType))
            .map((tier) => ({
              salaryMin: tier.salaryMin,
              salaryMax: tier.salaryMax,
              price: tier.price,
              currency: tier.currency,
              bandName: tier.bandName,
            }));
          quotes['executive-search'] = chooseMatchingBand(execTiers, salaryForPricing);
        }

        setServiceQuotes(quotes);
        setSelectedService((current) => {
          if (quotes[current]) return current;
          return SERVICE_ORDER.find((service) => Boolean(quotes[service])) ?? current;
        });
        if (!SERVICE_ORDER.some((service) => Boolean(quotes[service]))) {
          setError('No managed service pricing is available for your company. Please contact HRM8 admin.');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load managed service checkout';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, jobId]);

  const selectedQuote = useMemo(() => serviceQuotes[selectedService], [selectedService, serviceQuotes]);

  const formatJobSalary = (targetJob: Job): string | null => {
    const min = targetJob.salaryMin != null ? Number(targetJob.salaryMin) : null;
    const max = targetJob.salaryMax != null ? Number(targetJob.salaryMax) : null;
    const currency = targetJob.salaryCurrency || selectedQuote?.currency || 'USD';

    if (min == null && max == null) return null;
    if (min != null && max != null) {
      return `${pricingService.formatPrice(min, currency)} - ${pricingService.formatPrice(max, currency)}`;
    }
    if (max != null) return `Up to ${pricingService.formatPrice(max, currency)}`;
    return `${pricingService.formatPrice(min!, currency)}+`;
  };

  const handleConfirm = async () => {
    if (!selectedQuote) return;

    setProcessing(true);
    setError(null);
    try {
      const res = await jobService.upgradeManagedService(jobId, selectedService);
      if (!res.success) {
        const err: any = new Error(res.error || 'Failed to activate HRM8 managed service');
        err.status = res.status;
        throw err;
      }

      const payload = res.data;

      if (isManagedServicePending(payload)) {
        toast({
          title: 'Redirecting to payment',
          description: 'Invoice created. Completing payment with Airwallex.',
        });
        window.location.href = payload.checkoutUrl;
        return;
      }

      toast({
        title: 'Managed service activated',
        description: 'Invoice payment completed. Continuing to advanced setup.',
      });

      const completedJob = (payload as { job?: Job })?.job;
      onSuccess?.(completedJob);
      onOpenChange(false);
    } catch (err: any) {
      const status = err?.status;
      const message = err?.message || 'Failed to activate managed service';

      if (status === 402) {
        const paymentMessage =
          message || 'Payment is required to activate HRM8 managed service.';
        setError(paymentMessage);
        toast({
          title: 'Payment required',
          description: paymentMessage,
          variant: 'destructive',
        });
      } else if (status === 503) {
        const assignmentMessage =
          message ||
          'No consultant is currently available. Payment was reversed automatically. Please retry later.';
        setError(assignmentMessage);
        toast({
          title: 'Consultant unavailable',
          description: assignmentMessage,
          variant: 'destructive',
        });
      } else {
        setError(message);
        toast({
          title: 'Activation failed',
          description: message,
          variant: 'destructive',
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold">Choose HRM8 managed service</DialogTitle>
          <DialogDescription className="text-sm">
            Job publishing uses subscription quota. HRM8 managed service is paid through invoice checkout, then you continue into advanced setup.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-14 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {job && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{job.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Posting: Subscription quota</Badge>
                    <Badge variant="outline">Managed delivery: Invoice payment</Badge>
                  </div>
                  {formatJobSalary(job) && (
                    <p className="text-muted-foreground">
                      Salary range used for pricing context: <span className="font-medium text-foreground">{formatJobSalary(job)}</span>
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {SERVICE_ORDER.map((service) => {
                const meta = SERVICE_META[service];
                const Icon = meta.icon;
                const quote = serviceQuotes[service];
                const isSelected = selectedService === service;

                return (
                  <Card
                    key={service}
                    className={cn(
                      'relative cursor-pointer transition-all duration-200',
                      'border-l-4 px-6 py-5 hover:bg-muted/30 hover:scale-[1.01]',
                      !quote && 'opacity-70',
                      isSelected
                        ? 'border-l-primary bg-primary/5 shadow-md'
                        : 'border-l-transparent hover:border-l-primary/50'
                    )}
                    onClick={() => {
                      if (!quote) return;
                      setSelectedService(service);
                    }}
                  >
                    {meta.recommended && (
                      <Badge className="absolute -top-2 right-3 z-10 bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        MOST POPULAR
                      </Badge>
                    )}

                    <div className="flex flex-col lg:flex-row items-start gap-6">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div
                          className={cn(
                            'p-3 rounded-lg flex-shrink-0',
                            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          )}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold">{meta.label}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{meta.description}</p>
                        </div>
                      </div>

                      <div className="text-center lg:min-w-[240px] flex-shrink-0">
                        {quote ? (
                          <>
                            <div className="text-3xl font-bold text-primary">
                              {pricingService.formatPrice(quote.price, quote.currency)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Invoice payment
                              {quote.bandName ? ` · ${quote.bandName}` : ''}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-xl font-semibold text-muted-foreground">
                              Pricing unavailable
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Ask admin to configure this service tier
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex-1 lg:max-w-[320px] w-full lg:pl-4">
                        {service === 'executive-search' && executiveBands.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-1">
                            {executiveBands.map((band) => (
                              <Badge key={band.productCode} variant="outline" className="text-[10px] px-2 py-0.5">
                                {band.bandName}: {pricingService.formatPrice(band.price, band.currency)}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="grid grid-cols-1 gap-1.5">
                          {meta.perks.map((perk) => (
                            <div key={perk} className="flex items-start gap-2">
                              <Check className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-foreground leading-tight">{perk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Selected service</span>
                  <span className="font-medium">{SERVICE_META[selectedService].label}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Service price</span>
                  <span className="font-semibold">
                    {selectedQuote
                      ? pricingService.formatPrice(selectedQuote.price, selectedQuote.currency)
                      : 'Unavailable'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment rail</span>
                  <span className="font-medium">Airwallex + Xero Invoice</span>
                </div>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Unable to continue</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={processing || loading || !selectedQuote}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing invoice payment
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay & Continue
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
