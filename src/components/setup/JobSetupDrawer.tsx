/**
 * Post-Job Setup Drawer — production-grade flow after job creation.
 * Lets users choose Self-Managed vs HRM8-Managed, Simple vs Advanced setup,
 * define hiring roles/team per job, and configure rounds with optional role-based interviewer assignment.
 */
import React, { useEffect, useState } from 'react';
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
import { SetupRolesAndTeamCard } from './steps/SetupRolesAndTeamCard';
import { SetupRoundsCard } from './steps/SetupRoundsCard';
import { SetupReviewCard } from './steps/SetupReviewCard';

interface JobSetupDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string | null;
  jobTitle?: string;
}

const SETUP_STEPS = [
  { id: 1, title: 'Management type' },
  { id: 2, title: 'Setup flow' },
  { id: 3, title: 'Roles & team' },
  { id: 4, title: 'Rounds' },
  { id: 5, title: 'Review' },
];

export const JobSetupDrawer: React.FC<JobSetupDrawerProps> = ({
  open,
  onOpenChange,
  jobId,
  jobTitle,
}) => {
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
    nextStep,
    prevStep,
    reset,
    jobId: storeJobId,
  } = useJobSetupStore();

  useEffect(() => {
    setIsOpen(open, jobId ?? undefined);
    if (!open) reset();
  }, [open, jobId, setIsOpen, reset]);

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

  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
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

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <SetupFlowTypeCard
          managementType={managementType}
          onManagementTypeSelect={(t) => {
            setManagementType(t);
            nextStep();
          }}
        />
      );
    }
    if (currentStep === 2) {
      return (
        <SetupFlowTypeCard
          managementType={managementType ?? 'self-managed'}
          setupType={setupType}
          onSetupTypeSelect={(t) => {
            setSetupType(t);
            nextStep();
          }}
          onBack={prevStep}
        />
      );
    }
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
        <SetupRolesAndTeamCard
          jobId={effectiveJobId}
          roles={roles}
          team={team}
          onTeamChange={setTeam}
          onRolesLoaded={setRoles}
          onContinue={nextStep}
          onBack={prevStep}
        />
      );
    }
    if (currentStep === 4) {
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
        />
      );
    }
    if (currentStep === 5) {
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
    <Drawer open={open} onOpenChange={onOpenChange}>
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
          {currentStep > 1 && currentStep < 5 && (
            <Button variant="ghost" onClick={prevStep}>Back</Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
