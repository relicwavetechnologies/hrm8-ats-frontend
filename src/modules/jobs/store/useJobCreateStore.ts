import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { JobFormData } from '@/shared/types/job';

// Define the conversational wizard steps in grouped order.
export const WIZARD_STEPS = [
  'core-details',
  'job-content',
  'application',
  'posting-settings',
  'review',
] as const;

export type WizardStepId = typeof WIZARD_STEPS[number];

export function normalizeDraftStepIndex(step: number | null | undefined): number {
  const safeStep = Number.isFinite(step) ? Math.max(1, Math.floor(Number(step))) : 1;

  // Legacy 14/15-step drafts map into the new grouped flow.
  if (safeStep <= 5) return 1;
  if (safeStep <= 10) return 2;
  if (safeStep <= 12) return 3;
  if (safeStep === 13) return 4;
  if (safeStep >= 14) return 5;

  return safeStep > WIZARD_STEPS.length ? WIZARD_STEPS.length : safeStep;
}

export function getWizardStepIdFromDraftStep(step: number | null | undefined): WizardStepId {
  return WIZARD_STEPS[normalizeDraftStepIndex(step) - 1];
}

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
  distributionScope: 'HRM8_ONLY',
  globalPublishConfig: {
    channels: [],
    budgetTier: 'none',
    customBudget: undefined,
    hrm8ServiceRequiresApproval: false,
    hrm8ServiceApproved: false,
    easyApplyConfig: {
      enabled: false,
      type: 'full',
      hostedApply: false,
      questionnaireEnabled: false,
    },
  },
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
        currentStepId: 'core-details',
        stepOrder: [...WIZARD_STEPS],
        history: [],
        highestStepReached: 'core-details',
        jobData: INITIAL_JOB_DATA,
        parsedFields: [],
        isLoading: false,
        error: null,

        setJobData: (data) => set((state) => ({
          jobData: { ...state.jobData, ...data }
        })),

        loadJobData: (data) => set({
          jobData: data,
          parsedFields: Object.keys(data).filter(key => {
            const val = data[key as keyof JobFormData];
            return val !== null && val !== undefined && val !== '';
          })
        }),

        ingestParsedData: (data, confidence) => {
          const state = get();

          // 1. Merge data
          const newJobData = { ...state.jobData, ...data };

          // 2. Identify reliable fields (simplified logic for now)
          // In a real scenario, we'd check confidence scores > threshold
          const reliableFields = Object.keys(data).filter(key => {
            const val = data[key as keyof JobFormData];
            return val !== null && val !== undefined && val !== '';
          });

          // 3. Logic to remove steps if data is present?
          // For now, we keeps all steps to allow review, but we could mark them as "filled"
          // Or we could re-order to put filled steps at the end (Review phase)

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

        jumpToStep: (stepId) => {
          const { currentStepId, history } = get();
          if (stepId !== currentStepId) {
            set({
              currentStepId: stepId,
              history: [...history, currentStepId]
            });
          }
        },

        reset: () => set({
          currentStepId: 'core-details',
          stepOrder: [...WIZARD_STEPS],
          history: [],
          highestStepReached: 'core-details',
          jobData: INITIAL_JOB_DATA,
          parsedFields: [],
          error: null
        })
      });

export const useJobCreateStore = create<JobCreateState>()(devtools(storeImpl));
