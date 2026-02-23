import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { JobFormData } from '@/shared/types/job';

// ─── 5-Step Smart Wizard ──────────────────────────────────────────────────────
// Was 15 steps. Consolidated into:
//  1. document-upload  → Upload JD for AI parse (or skip)
//  2. job-overview     → Title + Dept + Location + Work Arrangement + Employment Type + Experience + Vacancies
//  3. content          → Compensation + Description + Requirements + Responsibilities + Tags
//  4. app-settings     → Application config + Screening questions + Close date + Visibility
//  5. review           → Full review + Publish (payment inline)
export const WIZARD_STEPS = [
  'document-upload',
  'job-overview',
  'content',
  'app-settings',
  'review',
] as const;

export type WizardStepId = typeof WIZARD_STEPS[number];

interface StepsState {
  currentStepId: WizardStepId;
  stepOrder: WizardStepId[];
  history: WizardStepId[];
  highestStepReached: WizardStepId;
}

interface JobCreateState extends StepsState {
  // Job Data
  jobData: Partial<JobFormData>;
  parsedFields: string[]; // Fields populated by AI

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  setJobData: (data: Partial<JobFormData>) => void;
  loadJobData: (data: Partial<JobFormData>) => void;
  ingestParsedData: (data: any, confidence: Record<string, number>) => void;

  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  jumpToStep: (stepId: WizardStepId) => void;
  reset: () => void;
}

const INITIAL_JOB_DATA: Partial<JobFormData> = {
  serviceType: 'self-managed',
  status: 'draft',
  employmentType: 'full-time',
  experienceLevel: 'mid',
  workArrangement: 'on-site',
  visibility: 'public',
  numberOfVacancies: 1,
  termsAccepted: false,
  applicationForm: {
    id: 'default-app-form',
    name: 'Default Application Form',
    includeStandardFields: {
      resume: { included: true, required: true },
      coverLetter: { included: true, required: false },
      portfolio: { included: false, required: false },
      linkedIn: { included: false, required: false },
      website: { included: false, required: false },
    },
    questions: []
  }
};

const storeImpl = (set: any, get: any) => ({
  // Initial State
  currentStepId: 'document-upload' as WizardStepId,
  stepOrder: [...WIZARD_STEPS],
  history: [] as WizardStepId[],
  highestStepReached: 'document-upload' as WizardStepId,
  jobData: INITIAL_JOB_DATA,
  parsedFields: [] as string[],
  isLoading: false,
  error: null,

  setJobData: (data: Partial<JobFormData>) => set((state: JobCreateState) => ({
    jobData: { ...state.jobData, ...data }
  })),

  loadJobData: (data: Partial<JobFormData>) => set({
    jobData: data,
    parsedFields: Object.keys(data).filter(key => {
      const val = data[key as keyof JobFormData];
      return val !== null && val !== undefined && val !== '';
    })
  }),

  ingestParsedData: (data: any, confidence: Record<string, number>) => {
    const state = get();
    const newJobData = { ...state.jobData, ...data };
    const reliableFields = Object.keys(data).filter(key => {
      const val = data[key as keyof JobFormData];
      return val !== null && val !== undefined && val !== '';
    });

    set({
      jobData: newJobData,
      parsedFields: reliableFields
    });
  },

  nextStep: () => {
    const { currentStepId, stepOrder, history, highestStepReached } = get();
    const currentIndex = stepOrder.indexOf(currentStepId);

    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      set({
        currentStepId: nextStep,
        history: [...history, currentStepId],
        highestStepReached: stepOrder.indexOf(nextStep) > stepOrder.indexOf(highestStepReached)
          ? nextStep
          : highestStepReached
      });
    }
  },

  prevStep: () => {
    const { history } = get();
    if (history.length > 0) {
      const prevStep = history[history.length - 1];
      set({
        currentStepId: prevStep,
        history: history.slice(0, -1)
      });
    }
  },

  jumpToStep: (stepId: WizardStepId) => {
    const { currentStepId, history } = get();
    if (stepId !== currentStepId) {
      set({
        currentStepId: stepId,
        history: [...history, currentStepId]
      });
    }
  },

  reset: () => set({
    currentStepId: 'document-upload' as WizardStepId,
    stepOrder: [...WIZARD_STEPS],
    history: [],
    highestStepReached: 'document-upload' as WizardStepId,
    jobData: INITIAL_JOB_DATA,
    parsedFields: [],
    error: null
  })
});

export const useJobCreateStore = create<JobCreateState>()(devtools(storeImpl));
