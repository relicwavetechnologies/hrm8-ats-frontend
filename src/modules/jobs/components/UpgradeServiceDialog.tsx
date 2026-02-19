import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Users, Star, Check, ArrowRight, Crown, Loader2, Briefcase } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { pricingService } from "@/shared/lib/pricingService";

interface UpgradeServiceDialogProps {
  open: boolean;
  onServiceTypeSelect: (serviceType: 'shortlisting' | 'full-service' | 'executive-search' | 'rpo') => void;
  onCancel?: () => void;
}

const services = [
  {
    id: 'shortlisting' as const,
    name: 'Shortlisting Service',
    description: 'We find and screen the best candidates for you',
    features: [
      'Job posting configuration',
      'Job board advertising plan',
      'Applicant screening and evaluation',
      'Prequalified shortlist delivered'
    ],
    icon: Users,
    recommended: false,
  },
  {
    id: 'full-service' as const,
    name: 'Full Recruitment Service',
    description: 'Complete recruitment from start to finish',
    features: [
      'End-to-end recruitment support',
      'Candidate shortlisting',
      'Interview & assessment coordination',
      'Offer negotiation support'
    ],
    icon: Star,
    recommended: true,
  },
  {
    id: 'executive-search' as const,
    name: 'Executive Search',
    description: 'Specialized search for leadership roles',
    features: [
      'Senior & C-level positions',
      'Confidential search process',
      'Market mapping & analysis',
      'Executive assessment',
      'Onboarding support'
    ],
    icon: Crown,
    recommended: false,
  },
  {
    id: 'rpo' as const,
    name: 'RPO Service',
    description: 'Dedicated recruitment process outsourcing delivery model',
    features: [
      'Dedicated hiring consultant',
      'Pipeline ownership and SLA tracking',
      'Coordination with hiring stakeholders',
      'Managed delivery over ongoing demand'
    ],
    icon: Briefcase,
    recommended: false,
  }
];

const normalizeCode = (value: string | undefined) =>
  String(value || '').toUpperCase().replace(/[\s-]/g, '_');

export function UpgradeServiceDialog({ open, onServiceTypeSelect, onCancel }: UpgradeServiceDialogProps) {
  const [selectedService, setSelectedService] = useState<'shortlisting' | 'full-service' | 'executive-search' | 'rpo' | null>(null);

  const { data: pricingData, isLoading: pricingLoading } = useQuery({
    queryKey: ['pricing', 'upgrade-service-dialog'],
    enabled: open,
    queryFn: async () => {
      const [servicePrices, executiveBands] = await Promise.all([
        pricingService.getRecruitmentServices(),
        pricingService.getExecutiveSearchBands(),
      ]);
      return { servicePrices, executiveBands };
    },
  });

  const shortlistingPrice = useMemo(
    () => pricingData?.servicePrices.find((s) => normalizeCode(s.serviceType).includes('SHORTLIST')),
    [pricingData]
  );

  const fullServicePrice = useMemo(
    () =>
      pricingData?.servicePrices.find((s) => {
        const code = normalizeCode(s.serviceType);
        return code === 'FULL' || code === 'FULL_SERVICE';
      }),
    [pricingData]
  );

  const executiveBands = useMemo(
    () => (pricingData?.executiveBands || []).slice().sort((a, b) => (a.salaryMin ?? 0) - (b.salaryMin ?? 0)),
    [pricingData]
  );

  const rpoPrice = useMemo(
    () => pricingData?.servicePrices.find((s) => normalizeCode(s.serviceType) === 'RPO'),
    [pricingData]
  );

  const handleContinue = () => {
    if (selectedService) {
      onServiceTypeSelect(selectedService);
    }
  };

  const selectedServiceDetails = services.find(s => s.id === selectedService);

  const renderServicePrice = (serviceId: 'shortlisting' | 'full-service' | 'executive-search' | 'rpo') => {
    if (pricingLoading) {
      return (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading price
        </div>
      );
    }

    if (serviceId === 'shortlisting' && shortlistingPrice) {
      return (
        <>
          <div className="text-3xl font-bold text-primary">
            {pricingService.formatPrice(shortlistingPrice.price, shortlistingPrice.currency)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Per job</div>
        </>
      );
    }

    if (serviceId === 'full-service' && fullServicePrice) {
      return (
        <>
          <div className="text-3xl font-bold text-primary">
            {pricingService.formatPrice(fullServicePrice.price, fullServicePrice.currency)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Per job</div>
        </>
      );
    }

    if (serviceId === 'executive-search' && executiveBands.length > 0) {
      const visibleBands = executiveBands.slice(0, 2);
      return (
        <div className="flex items-start justify-center gap-6">
          {visibleBands.map((band, index) => (
            <div key={band.productCode} className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-primary">
                  {pricingService.formatPrice(band.price, band.currency)}
                </div>
                <div className="text-xs text-muted-foreground mt-1 text-center">
                  {pricingService.formatSalaryRange(band.salaryMin, band.salaryMax, band.currency)}
                </div>
              </div>
              {index < visibleBands.length - 1 && (
                <div className="text-2xl font-light text-muted-foreground self-center">|</div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (serviceId === 'rpo' && rpoPrice) {
      return (
        <>
          <div className="text-3xl font-bold text-primary">
            {pricingService.formatPrice(rpoPrice.price, rpoPrice.currency)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Per job</div>
        </>
      );
    }

    return (
      <>
        <div className="text-2xl font-semibold text-muted-foreground">Pricing unavailable</div>
        <div className="text-xs text-muted-foreground mt-1">Please check pricing configuration</div>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="text-center space-y-3 pb-4">
          <DialogTitle className="text-3xl font-bold">Upgrade to HRM8 Recruitment Service</DialogTitle>
          <DialogDescription className="text-base">
            Select one of our recruitment services to get additional support for this job posting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {services.map((service) => {
            const Icon = service.icon;
            const isSelected = selectedService === service.id;

            return (
              <Card
                key={service.id}
                className={cn(
                  "relative cursor-pointer transition-all duration-200",
                  "border-l-4 px-6 py-5 hover:bg-muted/30 hover:scale-[1.01]",
                  isSelected
                    ? "border-l-primary bg-primary/5 shadow-md"
                    : "border-l-transparent hover:border-l-primary/50"
                )}
                onClick={() => setSelectedService(service.id)}
              >
                {service.recommended && (
                  <Badge className="absolute -top-2 right-3 z-10 bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    MOST POPULAR
                  </Badge>
                )}

                <div className="flex flex-col lg:flex-row items-start gap-6">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={cn(
                      "p-3 rounded-lg flex-shrink-0",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold whitespace-nowrap">{service.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-center lg:min-w-[280px] flex-shrink-0">
                    {renderServicePrice(service.id)}
                  </div>

                  <div className="flex-1 lg:max-w-[280px] w-full lg:pl-4">
                    <div className="grid grid-cols-1 gap-1.5">
                      {service.features.slice(0, 4).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-foreground leading-tight">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center gap-3 pt-6 border-t">
          <Button
            onClick={onCancel}
            variant="outline"
            size="lg"
            className="min-w-[150px] text-base h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedService}
            size="lg"
            className="min-w-[320px] text-base h-12"
          >
            {selectedService
              ? `Upgrade to ${selectedServiceDetails?.name}`
              : 'Select a Service to Continue'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
