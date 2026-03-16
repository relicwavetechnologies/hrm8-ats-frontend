/**
 * Step 1: Management type (Self-Managed vs HRM8-Managed).
 * Step 2: Setup flow (Simple vs Advanced) when Self-Managed.
 */
import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ArrowRight, Briefcase, Building2, Loader2, Sliders, Wallet, Zap } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface SetupFlowTypeCardProps {
  managementType?: 'self-managed' | 'hrm8-managed' | null;
  setupType?: 'simple' | 'advanced' | null;
  selfManagedMode?: 'loading' | 'simple-only' | 'full';
  onManagementTypeSelect?: (value: 'self-managed' | 'hrm8-managed') => void;
  onSetupTypeSelect?: (value: 'simple' | 'advanced') => void;
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
    description: 'Choose a managed service. After payment, the job stays pending until admin confirms the consultant, then continues with simple setup.',
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

export const SetupFlowTypeCard: React.FC<SetupFlowTypeCardProps> = ({
  managementType,
  setupType,
  selfManagedMode = 'full',
  onManagementTypeSelect,
  onSetupTypeSelect,
  onBack,
}) => {
  const isStep2 = onSetupTypeSelect != null && managementType === 'self-managed';

  if (isStep2) {
    if (selfManagedMode === 'loading') {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
          <div>
            <h3 className="text-xl font-bold">Setup flow</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Checking which setup options are available for this company.
            </p>
          </div>
          <Card className="p-5 border-dashed">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
              <div>
                <p className="font-semibold">Loading setup options</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  We are checking plan access before showing the available setup flow.
                </p>
              </div>
            </div>
          </Card>
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mt-4">
              Back
            </Button>
          )}
        </div>
      );
    }

    if (selfManagedMode === 'simple-only') {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
          <div>
            <h3 className="text-xl font-bold">Setup flow</h3>
            <p className="text-muted-foreground text-sm mt-1">
              This company is on a no-AI path, so this job uses the simple setup flow.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Card
              className="relative cursor-pointer transition-all duration-300 p-5 border-2 border-primary bg-primary/5 shadow-lg"
              onClick={() => onSetupTypeSelect('simple')}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Simple</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Fast setup with role-based interviewer assignment. Continue with the simple job setup flow.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary ml-auto shrink-0" />
              </div>
            </Card>
            <Card className="relative p-5 border-dashed opacity-70">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Sliders className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">Advanced</p>
                    <Badge variant="secondary">Upgrade required</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Advanced setup stays locked until the company has an active AI-enabled paid plan.
                  </p>
                </div>
              </div>
            </Card>
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

      {managementType === 'hrm8-managed' && (
        <Card className="border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Next step: managed service checkout</p>
              <p className="text-xs text-muted-foreground mt-1">
                You will review managed service options, complete checkout, then wait for consultant assignment before simple setup opens.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
