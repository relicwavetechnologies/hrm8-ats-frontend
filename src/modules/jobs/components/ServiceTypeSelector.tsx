import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Briefcase, Users, Star, Check, Crown, Sparkles, UserCheck } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ServiceTypeSelectorProps {
  value: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | 'rpo';
  onChange: (value: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search') => void;
}

const managedServices = [
  {
    id: 'shortlisting' as const,
    name: 'Shortlisting Service',
    price: '$1,990',
    description: 'We screen candidates and send a curated shortlist.',
    features: [
      'Candidate screening',
      'Curated shortlist',
      'Fast turnaround'
    ],
    icon: Users,
    recommended: false,
  },
  {
    id: 'full-service' as const,
    name: 'Full Service Recruitment',
    price: '$5,990',
    description: 'Complete end-to-end recruitment support.',
    features: [
      'Sourcing and screening',
      'Interview coordination',
      'Offer closure support'
    ],
    icon: Star,
    recommended: true,
  },
  {
    id: 'executive-search' as const,
    name: 'Executive Search',
    price: 'Custom',
    description: 'Confidential search for senior and C-level roles.',
    features: [
      'Headhunting',
      'Executive assessment',
      'Board-level expertise'
    ],
    icon: Crown,
    recommended: false,
  }
];

export function ServiceTypeSelector({ value, onChange }: ServiceTypeSelectorProps) {
  const selectedGroup =
    value === 'self-managed' || value === 'rpo' ? 'self-managed' : 'hrm8-managed';

  const selectGroup = (group: 'self-managed' | 'hrm8-managed') => {
    if (group === 'self-managed') {
      onChange('self-managed');
      return;
    }
    if (value === 'shortlisting' || value === 'full-service' || value === 'executive-search') {
      onChange(value);
      return;
    }
    onChange('shortlisting');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className={cn(
            "relative cursor-pointer transition-all duration-300 p-4 hover:shadow-md",
            selectedGroup === 'self-managed'
              ? "border-2 border-primary bg-primary/5 shadow-md"
              : "border hover:border-primary/50"
          )}
          onClick={() => selectGroup('self-managed')}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={cn(
                "p-2 rounded-lg transition-all duration-300",
                selectedGroup === 'self-managed' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <Briefcase className="h-5 w-5" />
              </div>
              {selectedGroup === 'self-managed' && (
                <div className="bg-primary rounded-full p-1">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-0.5">Self-Managed</h4>
              <div className="text-lg font-bold text-primary">FREE</div>
              <p className="text-xs text-muted-foreground mt-1">
                Publish and manage hiring directly using ATS workflow.
              </p>
            </div>
          </div>
        </Card>

        <Card
          className={cn(
            "relative cursor-pointer transition-all duration-300 p-4 hover:shadow-md",
            selectedGroup === 'hrm8-managed'
              ? "border-2 border-primary bg-primary/5 shadow-md"
              : "border hover:border-primary/50"
          )}
          onClick={() => selectGroup('hrm8-managed')}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={cn(
                "p-2 rounded-lg transition-all duration-300",
                selectedGroup === 'hrm8-managed' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <UserCheck className="h-5 w-5" />
              </div>
              {selectedGroup === 'hrm8-managed' && (
                <div className="bg-primary rounded-full p-1">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-0.5">HRM8 Managed</h4>
              <div className="text-lg font-bold text-primary">Wallet Based</div>
              <p className="text-xs text-muted-foreground mt-1">
                HRM8 consultants run the hiring process after publish/open.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {selectedGroup === 'hrm8-managed' && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
            Select HRM8 Managed Service
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {managedServices.map((service) => {
              const Icon = service.icon;
              const isSelected = value === service.id;

              return (
                <Card
                  key={service.id}
                  className={cn(
                    "relative cursor-pointer transition-all duration-300 p-4 hover:shadow-md hover:scale-[1.01]",
                    isSelected
                      ? "border-2 border-primary bg-primary/5 shadow-md scale-[1.01]"
                      : "border hover:border-primary/50"
                  )}
                  onClick={() => onChange(service.id)}
                >
                  {service.recommended && (
                    <Badge
                      className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground text-[10px] px-2 py-0.5"
                    >
                      <Sparkles className="h-2.5 w-2.5 mr-1" />
                      POPULAR
                    </Badge>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "p-2 rounded-lg transition-all duration-300",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {isSelected && (
                        <div className="bg-primary rounded-full p-1">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-0.5">{service.name}</h4>
                      <div className="text-lg font-bold text-primary">{service.price}</div>
                      <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                    </div>

                    <div className="space-y-1">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <Check className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-foreground leading-tight">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
