/**
 * Step 1: Management type (Self-Managed vs HRM8-Managed).
 * Step 2: Setup flow (Simple vs Advanced) when Self-Managed.
 */
import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { ArrowRight, Briefcase, Building2, Zap, Sliders, Users, Star, Crown, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface SetupFlowTypeCardProps {
  managementType?: 'self-managed' | 'hrm8-managed' | null;
  setupType?: 'simple' | 'advanced' | null;
  onManagementTypeSelect?: (value: 'self-managed' | 'hrm8-managed') => void;
  onSetupTypeSelect?: (value: 'simple' | 'advanced') => void;
  onManagedServiceSelect?: (value: 'shortlisting' | 'full-service' | 'executive-search') => void;
  onBack?: () => void;
}

const MANAGEMENT_OPTIONS = [
  {
    id: 'self-managed' as const,
    name: 'Self-Managed',
    description: 'You organize the hiring team and rounds. Choose a simple or advanced setup flow.',
    icon: Briefcase,
  },
  {
    id: 'hrm8-managed' as const,
    name: 'HRM8-Managed',
    description: 'HRM8 handles recruitment; you focus on interviews and decisions.',
    icon: Building2,
  },
];

const SETUP_OPTIONS = [
  {
    id: 'simple' as const,
    name: 'Simple',
    description: 'Rounds get a role; everyone with that role is auto-assigned as interviewer. Fast setup.',
    icon: Zap,
  },
  {
    id: 'advanced' as const,
    name: 'Advanced',
    description: 'Manually assign interviewers per round. Best for complex or custom workflows.',
    icon: Sliders,
  },
];

const MANAGED_SERVICE_OPTIONS = [
  {
    id: 'shortlisting' as const,
    name: 'Shortlisting Service',
    price: 'Wallet based',
    description: 'HRM8 consultants screen applicants and deliver a curated shortlist.',
    icon: Users,
  },
  {
    id: 'full-service' as const,
    name: 'Full Service Recruitment',
    price: 'Wallet based',
    description: 'HRM8 runs end-to-end recruitment and hands over qualified finalists.',
    icon: Star,
  },
  {
    id: 'executive-search' as const,
    name: 'Executive Search',
    price: 'Wallet based',
    description: 'Senior search process for leadership roles with consultant ownership.',
    icon: Crown,
  },
];

export const SetupFlowTypeCard: React.FC<SetupFlowTypeCardProps> = ({
  managementType,
  setupType,
  onManagementTypeSelect,
  onSetupTypeSelect,
  onManagedServiceSelect,
  onBack,
}) => {
  const isStep2 = onSetupTypeSelect != null && managementType === 'self-managed';
  const showManagedServices = managementType === 'hrm8-managed' && onManagedServiceSelect != null;

  if (isStep2) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
        <div>
          <h3 className="text-xl font-bold">Setup flow</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Choose how you want to assign interviewers to rounds.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {SETUP_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = setupType === opt.id;
            return (
              <Card
                key={opt.id}
                className={cn(
                  'relative cursor-pointer transition-all duration-300 p-5 hover:shadow-lg',
                  isSelected ? 'border-2 border-primary bg-primary/5 shadow-lg' : 'border hover:border-primary/50'
                )}
                onClick={() => onSetupTypeSelect(opt.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{opt.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{opt.description}</p>
                  </div>
                  {isSelected && <ArrowRight className="h-5 w-5 text-primary ml-auto shrink-0" />}
                </div>
              </Card>
            );
          })}
        </div>
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mt-4">
            Back
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
      <div>
        <h3 className="text-xl font-bold">Who manages this hire?</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Choose how you want to run recruitment for this job.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {MANAGEMENT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = managementType === opt.id;
          return (
            <Card
              key={opt.id}
              className={cn(
                'relative cursor-pointer transition-all duration-300 p-5 hover:shadow-lg',
                isSelected ? 'border-2 border-primary bg-primary/5 shadow-lg' : 'border hover:border-primary/50'
              )}
              onClick={() => onManagementTypeSelect?.(opt.id)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{opt.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{opt.description}</p>
                </div>
                {isSelected && <ArrowRight className="h-5 w-5 text-primary ml-auto shrink-0" />}
              </div>
            </Card>
          );
        })}
      </div>

      {showManagedServices && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Choose HRM8 managed service
          </p>
          <div className="flex flex-col gap-3">
            {MANAGED_SERVICE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <Card
                  key={opt.id}
                  className="relative cursor-pointer transition-all duration-300 p-5 hover:shadow-lg border hover:border-primary/50"
                  onClick={() => onManagedServiceSelect(opt.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{opt.name}</p>
                        <span className="text-xs font-medium text-primary">{opt.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{opt.description}</p>
                    </div>
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
