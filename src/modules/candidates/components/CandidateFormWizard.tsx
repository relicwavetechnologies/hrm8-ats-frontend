import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { ArrowLeft, ArrowRight, Save, Check } from 'lucide-react';
import { BasicInfoStep } from './forms/BasicInfoStep';
import { ProfessionalDetailsStep } from './forms/ProfessionalDetailsStep';
import { PreferencesStep } from './forms/PreferencesStep';
import { DocumentsStep} from './forms/DocumentsStep';
import { DraftRestoreAlert } from '@/shared/components/common/DraftRestoreAlert';
import { Candidate } from '@/shared/types/entities';
import { toast } from 'sonner';

const candidateFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  photo: z.string().optional(),
  linkedInUrl: z.string().optional(),
  
  currentPosition: z.string().optional(),
  desiredPosition: z.string().optional(),
  experienceYears: z.number().min(0),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  education: z.string().optional(),
  source: z.enum(['job_board', 'referral', 'direct', 'linkedin', 'agency', 'career_fair', 'other']),
  sourceDetails: z.string().optional(),
  githubUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  
  salaryCurrency: z.string(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryRange: z.tuple([z.number(), z.number()]).optional(),
  workArrangement: z.enum(['remote', 'hybrid', 'onsite', 'flexible']),
  employmentTypePreferences: z.array(z.enum(['full-time', 'part-time', 'contract'])).min(1),
  noticePeriod: z.string().optional(),
  availabilityDate: z.date().optional(),
  
  resumeFile: z.any().optional(),
  coverLetterFile: z.any().optional(),
  portfolioFiles: z.array(z.any()).optional(),
});

type CandidateFormData = z.infer<typeof candidateFormSchema>;

const STEPS = [
  { title: 'Basic Info', component: BasicInfoStep },
  { title: 'Professional', component: ProfessionalDetailsStep },
  { title: 'Preferences', component: PreferencesStep },
  { title: 'Documents', component: DocumentsStep },
];

interface CandidateFormWizardProps {
  candidate?: Candidate;
  onSave: (data: Partial<Candidate>) => Promise<void>;
  onCancel: () => void;
}

export function CandidateFormWizard({ candidate, onSave, onCancel }: CandidateFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null);
  const [autosaveTimeout, setAutosaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const draftKey = `candidate_form_draft_${candidate?.id || 'new'}`;

  const form = useForm<CandidateFormData>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      firstName: candidate?.firstName || '',
      lastName: candidate?.lastName || '',
      email: candidate?.email || '',
      phone: candidate?.phone || '',
      city: candidate?.city || '',
      state: candidate?.state || '',
      country: candidate?.country || 'United States',
      photo: candidate?.photo || '',
      linkedInUrl: candidate?.linkedInUrl || '',
      currentPosition: candidate?.currentPosition || '',
      desiredPosition: candidate?.desiredPosition || '',
      experienceYears: candidate?.experienceYears || 0,
      experienceLevel: candidate?.experienceLevel || 'mid',
      skills: candidate?.skills || [],
      education: candidate?.education || '',
      source: candidate?.source || 'direct',
      sourceDetails: candidate?.sourceDetails || '',
      githubUrl: candidate?.githubUrl || '',
      portfolioUrl: candidate?.portfolioUrl || '',
      salaryCurrency: candidate?.salaryCurrency || 'USD',
      salaryMin: candidate?.salaryMin || 50000,
      salaryMax: candidate?.salaryMax || 150000,
      salaryRange: [candidate?.salaryMin || 50000, candidate?.salaryMax || 150000],
      workArrangement: candidate?.workArrangement || 'flexible',
      employmentTypePreferences: candidate?.employmentTypePreferences || ['full-time'],
      noticePeriod: candidate?.noticePeriod || '2-weeks',
      availabilityDate: candidate?.availabilityDate,
    },
  });

  // Check for existing draft on mount
  useEffect(() => {
    if (candidate?.id) return; // Don't restore for edit mode
    
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
  }, [draftKey, candidate?.id]);

  // Auto-save form data
  useEffect(() => {
    if (candidate?.id || showDraftAlert) return;

    const subscription = form.watch((data) => {
      if (autosaveTimeout) {
        clearTimeout(autosaveTimeout);
      }

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
      }, 2000);

      setAutosaveTimeout(timeout);
    });

    return () => {
      subscription.unsubscribe();
      if (autosaveTimeout) {
        clearTimeout(autosaveTimeout);
      }
    };
  }, [form, draftKey, candidate?.id, currentStep, showDraftAlert, autosaveTimeout]);

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

  const { clearDraft: _unusedClearDraft, saveDraft: _unusedSaveDraft } = { clearDraft: () => {}, saveDraft: () => {} };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const validateCurrentStep = async (): Promise<boolean> => {
    const fieldsToValidate = {
      0: ['firstName', 'lastName', 'email', 'phone', 'city', 'country'],
      1: ['experienceYears', 'experienceLevel', 'skills', 'source'],
      2: ['workArrangement', 'employmentTypePreferences'],
      3: [],
    };

    const fields = fieldsToValidate[currentStep as keyof typeof fieldsToValidate];
    const result = await form.trigger(fields as any);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CandidateFormData) => {
    setIsSaving(true);
    try {
      // Transform form data to Candidate format
      const candidateData: Partial<Candidate> = {
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        photo: data.photo,
        city: data.city,
        state: data.state,
        country: data.country,
        location: `${data.city}, ${data.state || data.country}`,
        linkedInUrl: data.linkedInUrl,
        
        currentPosition: data.currentPosition,
        desiredPosition: data.desiredPosition,
        position: data.currentPosition || data.desiredPosition || '',
        experienceYears: data.experienceYears,
        experience: `${data.experienceYears} years`,
        experienceLevel: data.experienceLevel,
        skills: data.skills,
        education: data.education,
        githubUrl: data.githubUrl,
        portfolioUrl: data.portfolioUrl,
        
        salaryCurrency: data.salaryCurrency,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        workArrangement: data.workArrangement,
        employmentTypePreferences: data.employmentTypePreferences,
        noticePeriod: data.noticePeriod,
        availabilityDate: data.availabilityDate,
        
        source: data.source,
        sourceDetails: data.sourceDetails,
        tags: [],
        status: 'active',
      };

      await onSave(candidateData);
      clearDraft();
      toast.success(candidate ? 'Candidate updated successfully' : 'Candidate created successfully');
    } catch (error) {
      toast.error('Failed to save candidate');
    } finally {
      setIsSaving(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            <h2 className="text-2xl font-bold">
              {candidate ? 'Edit Candidate' : 'Add New Candidate'}
            </h2>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between text-sm">
            {STEPS.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 ${
                  index === currentStep
                    ? 'text-primary font-medium'
                    : index < currentStep
                    ? 'text-success'
                    : 'text-muted-foreground'
                }`}
              >
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="flex items-center justify-center h-6 w-6 rounded-full border-2 border-current text-xs">
                    {index + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Form Content */}
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CurrentStepComponent form={form} />

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                {!candidate && (
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

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                
                {currentStep < STEPS.length - 1 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : candidate ? 'Update Candidate' : 'Create Candidate'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}