/**
 * Post-Job Setup Drawer — production-grade flow after job creation.
 * Lets users choose Self-Managed vs HRM8-Managed, Simple vs Advanced setup,
 * define hiring roles/team per job, and configure rounds with optional role-based interviewer assignment.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/shared/components/ui/drawer';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { X, Settings2 } from 'lucide-react';
import { useJobSetupStore } from '@/modules/jobs/store/useJobSetupStore';
import { jobService } from '@/shared/lib/jobService';
import { useToast } from '@/shared/hooks/use-toast';
import { SetupFlowTypeCard } from './steps/SetupFlowTypeCard';
import { SetupRolesCard } from './steps/SetupRolesCard';
import { SetupTeamCard } from './steps/SetupTeamCard';
import { SetupRoleDistributionCard } from './steps/SetupRoleDistributionCard';
import { SetupRoundsCard } from './steps/SetupRoundsCard';
import { SetupReviewCard } from './steps/SetupReviewCard';

interface JobSetupDrawerProps {
  open: boolean;
  onOpenChange: (
    open: boolean,
    meta?: { reason: 'open' | 'close' | 'managed-checkout' }
  ) => void;
  jobId: string | null;
  jobTitle?: string;
  forceChoiceOnOpen?: boolean;
}

const SETUP_STEPS = [
  { id: 1, title: 'Setup flow' },
  { id: 2, title: 'Create roles' },
  { id: 3, title: 'Add team' },
  { id: 4, title: 'Distribute roles' },
  { id: 5, title: 'Configure rounds' },
  { id: 6, title: 'Review' },
];

export const JobSetupDrawer: React.FC<JobSetupDrawerProps> = ({
  open,
  onOpenChange,
  jobId,
  jobTitle,
  forceChoiceOnOpen = false,
}) => {
  const navigate = useNavigate();
  const {
    currentStep,
    managementType,
    setupType,
    roles,
    team,
    rounds,
    setIsOpen,
    setManagementType,
    setSetupType,
    setRoles,
    setTeam,
    setRounds,
    setCurrentStep,
    nextStep,
    prevStep,
    reset,
    jobId: storeJobId,
  } = useJobSetupStore();

  useEffect(() => {
    setIsOpen(open, jobId ?? undefined);
    if (!open) reset();
  }, [open, jobId, setIsOpen, reset]);

  useEffect(() => {
    if (!open || !forceChoiceOnOpen) return;
    // Explicitly reset to step-1 choice screen when returning from a cancelled managed checkout.
    reset();
    setIsOpen(true, jobId ?? undefined);
    setCurrentStep(1);
  }, [open, forceChoiceOnOpen, jobId, reset, setIsOpen, setCurrentStep]);

  // Load job roles when drawer opens with a jobId
  useEffect(() => {
    if (!open || !jobId) return;
    const load = async () => {
      try {
        const { jobService } = await import('@/shared/lib/jobService');
        const res = await jobService.getJobRoles(jobId);
        if (res.success && res.data?.roles?.length) {
          setRoles(res.data.roles);
        }
      } catch (e) {
        console.warn('Could not load job roles:', e);
      }
    };
    load();
  }, [open, jobId, setRoles]);

  useEffect(() => {
    if (!open || !jobId || forceChoiceOnOpen) return;
    const loadJobSetup = async () => {
      try {
        const res = await jobService.getJobById(jobId);
        const job = res.success ? res.data?.job : null;
        if (!job) return;

        const isManaged = job.managementType === 'hrm8-managed' || (job.serviceType && job.serviceType !== 'self-managed');
        if (isManaged) {
          setManagementType('hrm8-managed');
          setSetupType('advanced');
          // If managed payment is completed, skip step-1 and continue directly
          // into advanced setup steps.
          if (String(job.paymentStatus || '').toUpperCase() === 'PAID') {
            setCurrentStep(2);
          } else {
            setCurrentStep(1);
          }
          return;
        }

        if (job.managementType === 'self-managed') {
          setManagementType('self-managed');
        }
        if (job.setupType === 'simple' || job.setupType === 'advanced') {
          setSetupType(job.setupType);
        }
        setCurrentStep(1);
      } catch (e) {
        console.warn('Could not load job setup metadata:', e);
      }
    };
    loadJobSetup();
  }, [open, jobId, forceChoiceOnOpen, setManagementType, setSetupType, setCurrentStep]);

  useEffect(() => {
    if (managementType === 'hrm8-managed' && setupType !== 'advanced') {
      setSetupType('advanced');
    }
  }, [managementType, setupType, setSetupType]);

  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    onOpenChange(false, { reason: 'close' });
    reset();
  };

  const handleReviewDone = async () => {
    const id = jobId ?? storeJobId ?? null;
    if (id && (setupType || managementType)) {
      setSaving(true);
      try {
        const res = await jobService.updateJob(id, {
          setupType: setupType ?? undefined,
          managementType: managementType ?? undefined,
        });
        if (!res.success) throw new Error(res.error);
        toast({ title: 'Setup saved', description: 'Your setup has been saved.' });
      } catch (e) {
        toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to save setup', variant: 'destructive' });
      } finally {
        setSaving(false);
      }
    }
    handleClose();
  };

  const effectiveJobId = jobId ?? storeJobId ?? null;

  const handleManagementTypeSelect = (type: 'self-managed' | 'hrm8-managed') => {
    setManagementType(type);

    if (type === 'self-managed') {
      return;
    }

    if (!effectiveJobId) {
      toast({
        title: 'Job not found',
        description: 'Cannot continue to managed services without a valid job.',
        variant: 'destructive',
      });
      return;
    }

    onOpenChange(false, { reason: 'managed-checkout' });
    navigate(`/ats/jobs/${effectiveJobId}/managed-recruitment-checkout?fromSetup=1`);
  };

  const renderStep = () => {
    // Step 1: Setup Flow Type (Simple vs Advanced)
    if (currentStep === 1) {
      return (
        <SetupFlowTypeCard
          managementType={managementType}
          setupType={setupType}
          onManagementTypeSelect={handleManagementTypeSelect}
          onSetupTypeSelect={(t) => {
            setSetupType(t);
            if (!managementType) setManagementType('self-managed');
            nextStep();
          }}
        />
      );
    }

    // Step 2: Create Roles
    if (currentStep === 2) {
      if (!effectiveJobId) {
        return (
          <div className="space-y-4 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Job not found</p>
            <p className="text-sm text-muted-foreground">Setup could not find the job. Close and open the job from the list to continue setup, or create a new job.</p>
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </div>
        );
      }
      return (
        <SetupRolesCard
          jobId={effectiveJobId}
          roles={roles}
          onRolesChange={setRoles}
          onContinue={nextStep}
        />
      );
    }

    // Step 3: Add Team Members
    if (currentStep === 3) {
      if (!effectiveJobId) {
        return (
          <div className="space-y-4 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Job not found</p>
            <p className="text-sm text-muted-foreground">Setup could not find the job. Close and open the job from the list to continue setup, or create a new job.</p>
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </div>
        );
      }
      return (
        <SetupTeamCard
          jobId={effectiveJobId}
          team={team}
          onTeamChange={setTeam}
          onContinue={nextStep}
          onBack={prevStep}
        />
      );
    }

    // Step 4: Distribute Roles
    if (currentStep === 4) {
      if (!effectiveJobId) {
        return (
          <div className="space-y-4 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Job not found</p>
            <p className="text-sm text-muted-foreground">Setup could not find the job. Close and open the job from the list to continue setup, or create a new job.</p>
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </div>
        );
      }
      return (
        <SetupRoleDistributionCard
          jobId={effectiveJobId}
          team={team}
          roles={roles}
          onTeamChange={setTeam}
          onContinue={nextStep}
          onBack={prevStep}
        />
      );
    }

    // Step 5: Configure Rounds
    if (currentStep === 5) {
      if (!effectiveJobId) {
        return (
          <div className="space-y-4 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Job not found</p>
            <p className="text-sm text-muted-foreground">Close and open the job from the list to configure rounds.</p>
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </div>
        );
      }
      return (
        <SetupRoundsCard
          jobId={effectiveJobId}
          roles={roles}
          rounds={rounds}
          onRoundsChange={setRounds}
          onContinue={nextStep}
          onBack={prevStep}
          setupType={setupType ?? undefined}
          jobTitle={jobTitle}
        />
      );
    }

    // Step 6: Review
    if (currentStep === 6) {
      return (
        <SetupReviewCard
          managementType={managementType}
          setupType={setupType}
          roles={roles}
          team={team}
          rounds={rounds}
          onDone={handleReviewDone}
          onBack={prevStep}
          saving={saving}
        />
      );
    }
    return null;
  };

  const stepInfo = SETUP_STEPS[currentStep - 1];

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen, { reason: nextOpen ? 'open' : 'close' });
      }}
    >
      <DrawerContent className="h-[90vh] rounded-t-[24px] border-none bg-background shadow-2xl flex flex-col overflow-hidden">
        <DrawerHeader className="border-b px-6 py-4 bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DrawerTitle className="text-xl font-bold tracking-tight">Post-Job Setup</DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground">
                {jobTitle ? `"${jobTitle}"` : storeJobId ? 'Organize your hiring team and rounds' : ''}
                {stepInfo && ` · ${stepInfo.title}`}
              </DrawerDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </Button>
        </DrawerHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="max-w-2xl mx-auto pb-12">
            {renderStep()}
          </div>
        </ScrollArea>

        <div className="p-4 bg-background border-t flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {SETUP_STEPS.length}
          </span>
          {currentStep > 1 && currentStep < 6 && (
            <Button variant="ghost" onClick={prevStep}>Back</Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
