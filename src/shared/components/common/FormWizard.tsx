import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form } from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { ArrowLeft, ArrowRight, Check, Save } from 'lucide-react';
import { DraftRestoreAlert } from './DraftRestoreAlert';
import { toast } from 'sonner';

export interface WizardStep<TFormData> {
  title: string;
  component: React.ComponentType<{ form: UseFormReturn<TFormData> }>;
  fields: (keyof TFormData)[];
}

interface FormWizardProps<TFormData extends Record<string, any>> {
  steps: WizardStep<TFormData>[];
  form: UseFormReturn<TFormData>;
  onSave: () => Promise<void>;
  onCancel: () => void;
  entityName: string;
  entityId?: string; // For edit mode
  enableAutosave?: boolean;
}

export function FormWizard<TFormData extends Record<string, any>>({
  steps,
  form,
  onSave,
  onCancel,
  entityName,
  entityId,
  enableAutosave = true,
}: FormWizardProps<TFormData>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null);
  const [autosaveTimeout, setAutosaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const draftKey = `${entityName.toLowerCase()}_form_draft_${entityId || 'new'}`;
  const CurrentStepComponent = steps[currentStep].component;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Check for existing draft on mount
  useEffect(() => {
    if (!enableAutosave || entityId) return; // Don't restore for edit mode
    
    try {
      const stored = localStorage.getItem(draftKey);
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        
        // Check if draft is not too old (24 hours)
        const age = Date.now() - new Date(timestamp).getTime();
        const maxAge = 24 * 60 * 60 * 1000;
        
        if (age < maxAge) {
          setDraftTimestamp(timestamp);
          setShowDraftAlert(true);
        } else {
          localStorage.removeItem(draftKey);
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }, [draftKey, entityId, enableAutosave]);

  // Auto-save form data
  useEffect(() => {
    if (!enableAutosave || entityId || showDraftAlert) return;

    const subscription = form.watch((data) => {
      // Clear existing timeout
      if (autosaveTimeout) {
        clearTimeout(autosaveTimeout);
      }

      // Set new timeout for debounced save
      const timeout = setTimeout(() => {
        try {
          localStorage.setItem(
            draftKey,
            JSON.stringify({
              data,
              timestamp: new Date().toISOString(),
              step: currentStep,
            })
          );
        } catch (error) {
          console.error('Failed to save draft:', error);
        }
      }, 2000); // 2 second debounce

      setAutosaveTimeout(timeout);
    });

    return () => {
      subscription.unsubscribe();
      if (autosaveTimeout) {
        clearTimeout(autosaveTimeout);
      }
    };
  }, [form, draftKey, enableAutosave, entityId, currentStep, showDraftAlert, autosaveTimeout]);

  const handleRestoreDraft = () => {
    try {
      const stored = localStorage.getItem(draftKey);
      if (stored) {
        const { data, step } = JSON.parse(stored);
        form.reset(data);
        setCurrentStep(step || 0);
        setShowDraftAlert(false);
        toast.success('Draft restored successfully');
      }
    } catch (error) {
      console.error('Failed to restore draft:', error);
      toast.error('Failed to restore draft');
    }
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(draftKey);
      setShowDraftAlert(false);
      toast.info('Draft discarded');
    } catch (error) {
      console.error('Failed to discard draft:', error);
    }
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(draftKey);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  const handleSaveDraft = () => {
    try {
      const data = form.getValues();
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          data,
          timestamp: new Date().toISOString(),
          step: currentStep,
        })
      );
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft');
    }
  };

  const handleNext = async () => {
    const currentFields = steps[currentStep].fields;
    const isValid = await form.trigger(currentFields as any);
    
    if (isValid) {
      if (isLastStep) {
        await handleSubmit();
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      await onSave();
      clearDraft(); // Clear draft on successful save
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Draft Restore Alert */}
      {showDraftAlert && draftTimestamp && (
        <DraftRestoreAlert
          timestamp={draftTimestamp}
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
        />
      )}

      {/* Progress Header */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </h3>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </Card>

      {/* Form Content */}
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <CurrentStepComponent form={form} />
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={currentStep === 0 ? onCancel : handleBack}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {currentStep === 0 ? 'Cancel' : 'Back'}
                </Button>
                
                {enableAutosave && !entityId && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSaveDraft}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                )}
              </div>

              <Button
                type="button"
                onClick={handleNext}
                disabled={isSaving}
              >
                {isSaving ? (
                  'Saving...'
                ) : isLastStep ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save {entityName}
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
