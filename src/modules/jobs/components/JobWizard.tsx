import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Job, JobFormData } from "@/shared/types/job";
import { jobFormSchema, jobBasicDetailsSchema, jobDescriptionSchema } from "@/shared/lib/validations/jobValidation";
import { Form } from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Card, CardContent } from "@/shared/components/ui/card";
import { JobWizardStep1 } from "./JobWizardStep1";
import { JobWizardStep2 } from "./JobWizardStep2";
import { JobWizardStep3 } from "./JobWizardStep3";
import { JobWizardStep4 } from "./JobWizardStep4";
import { JobWizardStep5 } from "./JobWizardStep5";
import { JobWizardStep6 } from "./JobWizardStep6";
import { ChevronLeft, ChevronRight, Eye, Briefcase, Users, Star, Crown, ArrowUp, CheckCircle2, Circle, AlertCircle, ChevronDown, FileText, Save, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { JobSetupDrawer } from "@/components/setup/JobSetupDrawer";
import { JobBoardPublicPreview } from "./JobBoardPublicPreview";
import { ExternalPromotionDialog } from "./ExternalPromotionDialog";
import { PostPublishFlow } from "./PostPublishFlow";
import { toast } from "@/shared/hooks/use-toast";
import { jobService } from "@/shared/lib/jobService";
import { jobTemplateService } from "@/shared/lib/jobTemplateService";
import { generateJobCode } from "@/shared/lib/jobUtils";
import { calculateServicePricing, processAccountPayment, processCreditCardPayment } from "@/shared/lib/paymentService";
import { createJobCheckoutSession } from "@/shared/lib/payments";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "@/app/providers/AuthContext";
import { transformJobFormDataToCreateRequest, transformRequirements, transformResponsibilities } from "@/shared/lib/jobFormTransformers";
import { companySettingsService, JobAssignmentMode } from "@/shared/lib/companySettingsService";
import { InsufficientBalanceModal } from "@/modules/wallet/components/InsufficientBalanceModal";
import { useWalletBalance } from "@/shared/hooks/useWalletBalance";
import { walletService } from "@/shared/services/walletService";


interface JobWizardProps {
  serviceType?: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | 'rpo';
  defaultValues?: Partial<JobFormData>;
  jobId?: string;
  onSuccess?: (jobData: Job) => void;
  onCancel?: () => void;
  embedded?: boolean;
}

export function JobWizard({ serviceType, defaultValues, jobId: initialJobId, onSuccess, onCancel, embedded = false }: JobWizardProps) {
  const { user, profileSummary } = useAuth();
  const [step, setStep] = useState(1);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showPostLaunchTools, setShowPostLaunchTools] = useState(false);
  const [savedJobData, setSavedJobData] = useState<Job | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(initialJobId || null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [companyAssignmentMode, setCompanyAssignmentMode] = useState<JobAssignmentMode>('AUTO_RULES_ONLY');
  const [showTemplateNameDialog, setShowTemplateNameDialog] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [showJobSetupDrawer, setShowJobSetupDrawer] = useState(false);

  const [loadingCompanySettings, setLoadingCompanySettings] = useState(true);

  // Wallet & Payment State
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceErrorData, setBalanceErrorData] = useState<{
    required: number;
    balance: number;
    shortfall: number;
    currency: string;
  } | null>(null);
  const { refetch: refetchBalance } = useWalletBalance();

  const findScrollContainer = (): HTMLElement | null => {
    const scrollAreaViewport = document.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (scrollAreaViewport) {
      return scrollAreaViewport;
    }
    return document.getElementById('main-scroll-container');
  };

  useEffect(() => {
    const scrollContainer = findScrollContainer();

    if (scrollContainer) {
      // Synchronous scroll reset
      scrollContainer.scrollTop = 0;
      scrollContainer.scrollLeft = 0;

      // Force browser to acknowledge
      void scrollContainer.offsetHeight;

      // Double-check with RAF
      requestAnimationFrame(() => {
        scrollContainer.scrollTop = 0;
        scrollContainer.scrollLeft = 0;
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [step]);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    mode: 'onChange', // Enable real-time validation
    reValidateMode: 'onChange', // Re-validate on change
    defaultValues: {
      serviceType: serviceType || defaultValues?.serviceType || 'self-managed',
      title: defaultValues?.title || "",
      numberOfVacancies: defaultValues?.numberOfVacancies || 1,
      department: defaultValues?.department || "",
      location: defaultValues?.location || "",
      employmentType: defaultValues?.employmentType || "full-time",
      experienceLevel: defaultValues?.experienceLevel || "mid",
      workArrangement: defaultValues?.workArrangement || "on-site",
      tags: defaultValues?.tags || [],
      description: defaultValues?.description || "",
      requirements: defaultValues?.requirements || [],
      responsibilities: defaultValues?.responsibilities || [],
      salaryCurrency: defaultValues?.salaryCurrency || "USD",
      salaryPeriod: defaultValues?.salaryPeriod || "annual",
      hideSalary: defaultValues?.hideSalary || false,
      visibility: defaultValues?.visibility || "public",
      stealth: defaultValues?.stealth || false,
      hiringTeam: defaultValues?.hiringTeam || [],
      applicationForm: defaultValues?.applicationForm || {
        id: `form-${Date.now()}`,
        name: "Application Form",
        questions: [],
        includeStandardFields: {
          resume: { included: true, required: true },
          coverLetter: { included: false, required: false },
          portfolio: { included: false, required: false },
          linkedIn: { included: false, required: false },
          website: { included: false, required: false },
        },
      },
      status: defaultValues?.status || "draft",
      jobBoardDistribution: defaultValues?.jobBoardDistribution || ["HRM8 Job Board"],
      termsAccepted: defaultValues?.termsAccepted || false,
      selectedPaymentMethod: defaultValues?.selectedPaymentMethod,
      paymentInvoiceRequested: defaultValues?.paymentInvoiceRequested || false,
      videoInterviewingEnabled: defaultValues?.videoInterviewingEnabled || false,
      assignmentMode: defaultValues?.assignmentMode,
      regionId: defaultValues?.regionId,
    },
  });

  // Load company assignment settings
  useEffect(() => {
    const loadCompanySettings = async () => {
      if (user?.companyId) {
        try {
          setLoadingCompanySettings(true);
          const settings = await companySettingsService.getJobAssignmentSettings(user.companyId);
          setCompanyAssignmentMode(settings.jobAssignmentMode);

          // Set default assignment mode based on company settings if not already set
          const currentAssignmentMode = form.getValues('assignmentMode');
          if (!currentAssignmentMode && !defaultValues?.assignmentMode) {
            const defaultMode = settings.jobAssignmentMode === 'AUTO_RULES_ONLY' ? 'AUTO' : 'MANUAL';
            form.setValue('assignmentMode', defaultMode as 'AUTO' | 'MANUAL');
          }
        } catch (error) {
          console.error('Failed to load company assignment settings:', error);
        } finally {
          setLoadingCompanySettings(false);
        }
      }
    };

    loadCompanySettings();
  }, [user?.companyId]);

  // Reset form when defaultValues change (e.g., when loading a draft)
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...form.getValues(),
        ...defaultValues,
      });
      // If we have a jobId, set it for auto-save
      if (initialJobId) {
        setCurrentJobId(initialJobId);
      }
    }
  }, [defaultValues, initialJobId, form]);

  const currentServiceType = form.watch('serviceType');
  const isHRM8Service = currentServiceType !== 'self-managed';
  // Show all steps including payment/terms step for paid packages
  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;
  const stepLabels = [
    "Basic Details",
    "Description",
    "Compensation",
    "Application",
    "Review",
    "Payment",
  ];

  // Step validation functions
  const validateStep = async (stepNumber: number): Promise<boolean> => {
    const formData = form.getValues();

    if (stepNumber === 1) {
      // Validate Step 1: Basic Details
      const step1Fields: (keyof JobFormData)[] = ['title', 'department', 'location', 'employmentType', 'experienceLevel', 'workArrangement', 'numberOfVacancies'];
      const result = await form.trigger(step1Fields);

      // Also check salary validation if both are provided
      if (formData.salaryMin && formData.salaryMax) {
        if (formData.salaryMax < formData.salaryMin) {
          form.setError('salaryMax', { message: 'Maximum salary must be greater than or equal to minimum salary' });
          return false;
        }
      }

      return result;
    } else if (stepNumber === 2) {
      // Validate Step 2: Job Description
      const step2Fields: (keyof JobFormData)[] = ['description', 'requirements', 'responsibilities'];
      const result = await form.trigger(step2Fields);

      // Manual check for requirements and responsibilities
      const requirements = formData.requirements || [];
      const responsibilities = formData.responsibilities || [];

      const validRequirements = requirements.filter((req: any) => {
        if (typeof req === 'string') return req.trim().length > 0;
        return req.text && req.text.trim().length > 0;
      });

      const validResponsibilities = responsibilities.filter((resp: any) => {
        if (typeof resp === 'string') return resp.trim().length > 0;
        return resp.text && resp.text.trim().length > 0;
      });

      if (validRequirements.length === 0) {
        form.setError('requirements', { message: 'At least one requirement is needed' });
        return false;
      }

      if (validResponsibilities.length === 0) {
        form.setError('responsibilities', { message: 'At least one responsibility is needed' });
        return false;
      }

      return result;
    }

    // Other steps don't require validation before navigation
    return true;
  };

  // Check if a step has errors (reactive to form state)
  const stepHasErrors = (stepNumber: number): boolean => {
    const errors = form.formState.errors;
    const formData = form.watch(); // Use watch to make it reactive

    if (stepNumber === 1) {
      return !!(
        errors.title ||
        errors.department ||
        errors.location ||
        errors.employmentType ||
        errors.experienceLevel ||
        errors.workArrangement ||
        errors.numberOfVacancies ||
        errors.salaryMin ||
        errors.salaryMax ||
        (formData.salaryMin && formData.salaryMax && formData.salaryMax < formData.salaryMin)
      );
    } else if (stepNumber === 2) {
      const requirements = formData.requirements || [];
      const responsibilities = formData.responsibilities || [];

      const validRequirements = requirements.filter((req: any) => {
        if (typeof req === 'string') return req.trim().length > 0;
        return req.text && req.text.trim().length > 0;
      });

      const validResponsibilities = responsibilities.filter((resp: any) => {
        if (typeof resp === 'string') return resp.trim().length > 0;
        return resp.text && resp.text.trim().length > 0;
      });

      // Check description length (strip HTML)
      const descriptionText = formData.description ? formData.description.replace(/<[^>]*>/g, '').trim() : '';
      const descriptionValid = descriptionText.length >= 50;

      return !!(
        errors.description ||
        errors.requirements ||
        errors.responsibilities ||
        !descriptionValid ||
        validRequirements.length === 0 ||
        validResponsibilities.length === 0
      );
    }

    return false;
  };

  // Auto-save functionality
  const autoSaveDraft = async () => {
    const formData = form.getValues();

    // Validate required fields: title and location are required for draft
    const missingFields: string[] = [];

    if (!formData.title || formData.title.trim().length === 0) {
      missingFields.push('job title');
      form.setError('title', {
        type: 'manual',
        message: 'Job title is required to save as draft'
      });
    }

    if (!formData.location || formData.location.trim().length === 0) {
      missingFields.push('location');
      form.setError('location', {
        type: 'manual',
        message: 'Location is required to save as draft'
      });
    }

    if (missingFields.length > 0) {
      const fieldList = missingFields.join(' and ');
      toast({
        title: "Cannot Save Draft",
        description: `Please add a ${fieldList} before saving as draft.`,
        variant: "destructive"
      });
      return false;
    }

    setAutoSaving(true);

    try {
      // Transform requirements and responsibilities from objects to strings
      const requirements = (formData.requirements || []).map((req: any) => {
        if (typeof req === 'string') return req;
        return req.text || '';
      }).filter((req: string) => req.trim().length > 0);

      const responsibilities = (formData.responsibilities || []).map((resp: any) => {
        if (typeof resp === 'string') return resp;
        return resp.text || '';
      }).filter((resp: string) => resp.trim().length > 0);

      // Convert form data to API format
      const jobRequest = {
        title: formData.title,
        description: formData.description,
        jobSummary: formData.description.substring(0, 150),
        hiringMode: formData.serviceType === 'self-managed' ? 'SELF_MANAGED' as const :
          formData.serviceType === 'shortlisting' ? 'SHORTLISTING' as const :
            formData.serviceType === 'full-service' ? 'FULL_SERVICE' as const :
              'EXECUTIVE_SEARCH' as const,
        location: formData.location,
        department: formData.department,
        workArrangement: formData.workArrangement.toUpperCase().replace('-', '_') as 'ON_SITE' | 'REMOTE' | 'HYBRID',
        employmentType: formData.employmentType.toUpperCase().replace('-', '_') as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'CASUAL',
        numberOfVacancies: formData.numberOfVacancies || 1,
        salaryMin: formData.salaryMin,
        salaryMax: formData.salaryMax,
        salaryCurrency: formData.salaryCurrency,
        salaryDescription: formData.salaryDescription,
        promotionalTags: formData.tags || [],
        stealth: formData.stealth,
        visibility: formData.visibility,
        requirements,
        responsibilities,
        termsAccepted: formData.termsAccepted || false,
        termsAcceptedAt: formData.termsAccepted ? new Date() : undefined,
        termsAcceptedBy: formData.termsAccepted ? user?.id : undefined,
        // Add missing fields
        hiringTeam: formData.hiringTeam || [],
        closeDate: formData.closeDate ? new Date(formData.closeDate).toISOString() : undefined,
        category: formData.experienceLevel || undefined, // Store experienceLevel in category field
        applicationForm: formData.applicationForm,
        assignmentMode: formData.assignmentMode || (companyAssignmentMode === 'AUTO_RULES_ONLY' ? 'AUTO' : 'MANUAL'),
        regionId: formData.regionId,
        servicePackage: formData.serviceType === 'rpo' ? 'self-managed' : formData.serviceType,
      };

      if (currentJobId) {
        // Update existing job
        const response = await jobService.updateJob(currentJobId, {
          ...jobRequest,
          status: 'DRAFT',
        });
        if (response.success) {
          setLastAutoSave(new Date());
          return true;
        }
      } else {
        // Create new job
        const response = await jobService.createJob(jobRequest);
        if (response.success && response.data) {
          // Store the job ID for future auto-saves
          setCurrentJobId(response.data.id);
          setLastAutoSave(new Date());
          return true;
        }
      }

      return false;
    } catch (error: any) {
      console.error('Auto-save failed:', error);

      // Check if error is from backend validation
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to save draft';

      // Check for specific validation errors
      if (errorMessage.includes('title') || errorMessage.includes('Title')) {
        form.setError('title', {
          type: 'manual',
          message: 'Job title is required'
        });
      }
      if (errorMessage.includes('location') || errorMessage.includes('Location')) {
        form.setError('location', {
          type: 'manual',
          message: 'Location is required'
        });
      }

      toast({
        title: "Save Failed",
        description: errorMessage || "Failed to save draft. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setAutoSaving(false);
    }
  };

  // Manual save draft handler
  const handleManualSaveDraft = async () => {
    const success = await autoSaveDraft();
    if (success) {
      toast({
        title: "Draft Saved",
        description: "Your job posting has been saved as a draft. You can publish it anytime from the Jobs page.",
      });
    }
  };

  // Set up auto-save interval (every 30 seconds)
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      autoSaveDraft();
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [form]);

  // Format last save time
  const getLastSaveText = () => {
    if (!lastAutoSave) return null;

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastAutoSave.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 120) return '1 minute ago';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    return lastAutoSave.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Service type display configuration
  const serviceTypeConfig = {
    'self-managed': {
      name: 'Self-Managed',
      price: 'Subscription quota',
      icon: Briefcase,
      color: 'text-muted-foreground'
    },
    'shortlisting': {
      name: 'Shortlisting Service',
      price: 'Dynamic wallet pricing',
      icon: Users,
      color: 'text-blue-600'
    },
    'full-service': {
      name: 'Full Service',
      price: 'Dynamic wallet pricing',
      icon: Star,
      color: 'text-primary'
    },
    'executive-search': {
      name: 'Executive Search',
      price: 'Dynamic wallet pricing',
      icon: Crown,
      color: 'text-amber-600'
    },
    'rpo': {
      name: 'RPO',
      price: 'Dynamic wallet pricing',
      icon: Briefcase,
      color: 'text-purple-600'
    }
  };

  const currentService = serviceTypeConfig[currentServiceType] || serviceTypeConfig['self-managed'];
  const ServiceIcon = currentService.icon;

  const onSubmit = async (data: JobFormData) => {
    console.log('📋 Form submitted!', { step, totalSteps, data: { ...data, description: data.description?.substring(0, 50) + '...' } });

    // If saveAsTemplate is checked but no template name yet, show dialog first
    if (data.saveAsTemplate && !data.templateName) {
      setTemplateNameInput(data.title ? `${data.title} Template` : '');
      setShowTemplateNameDialog(true);
      return; // Don't proceed with publish yet
    }

    setIsPublishing(true);

    try {
      // Transform requirements and responsibilities from objects to strings for validation
      const requirements = transformRequirements(data.requirements);
      const responsibilities = transformResponsibilities(data.responsibilities);

      // Check if this is an HRM8 paid service (which skips steps 2-5)
      const isHRM8PaidService = data.serviceType !== 'self-managed' && data.serviceType !== 'rpo';

      // Manual validation for requirements and responsibilities - only for self-managed jobs
      // Paid HRM8 services (shortlisting, full-service, executive-search) skip steps 2-5,
      // so they won't have requirements/responsibilities filled in
      if (!isHRM8PaidService) {
        if (!requirements || requirements.length === 0) {
          toast({
            title: "Please Fix Form Errors",
            description: "At least one requirement is needed",
            variant: "destructive",
            duration: 5000,
          });
          setIsPublishing(false);
          return;
        }

        if (!responsibilities || responsibilities.length === 0) {
          toast({
            title: "Please Fix Form Errors",
            description: "At least one responsibility is needed",
            variant: "destructive",
            duration: 5000,
          });
          setIsPublishing(false);
          return;
        }
      }

      // Check form validation errors first
      const errors = form.formState.errors;
      if (Object.keys(errors).length > 0) {
        console.log('❌ Form validation errors:', errors);

        // Build user-friendly error messages
        const errorMessages: string[] = [];

        if (errors.description) {
          errorMessages.push(errors.description.message || 'Job description is required (at least 50 characters)');
        }
        if (errors.title) {
          errorMessages.push(errors.title.message || 'Job title is required (at least 5 characters)');
        }
        if (errors.location) {
          errorMessages.push(errors.location.message || 'Location is required');
        }
        if (errors.department) {
          errorMessages.push(errors.department.message || 'Department is required');
        }
        if (errors.termsAccepted) {
          errorMessages.push('You must accept the Terms & Conditions');
        }

        // Add any other validation errors (excluding requirements/responsibilities as we handle them above)
        Object.keys(errors).forEach((key) => {
          if (!['requirements', 'responsibilities', 'description', 'title', 'location', 'department', 'termsAccepted'].includes(key)) {
            const error = errors[key as keyof typeof errors];
            if (error && 'message' in error) {
              errorMessages.push(error.message as string);
            }
          }
        });

        if (errorMessages.length > 0) {
          toast({
            title: "Please Fix Form Errors",
            description: errorMessages.join('. '),
            variant: "destructive",
            duration: 5000,
          });
          setIsPublishing(false);
          return;
        }
      }

      if (!data.termsAccepted) {
        console.log('❌ Terms not accepted');
        toast({
          title: "Terms & Conditions Required",
          description: "Please accept the Terms & Conditions to proceed",
          variant: "destructive"
        });
        setIsPublishing(false);
        return;
      }

      console.log('✅ Terms accepted, proceeding with publish...');

      // Convert to API format using utility function
      const jobRequest = transformJobFormDataToCreateRequest(data, {
        includeTerms: true,
        userId: user?.id,
        status: 'DRAFT',
      });

      // Add servicePackage to job request
      console.log('🔍 DEBUG servicePackage:', {
        serviceType: data.serviceType,
      });
      const servicePackage = data.serviceType === 'rpo' ? 'self-managed' : data.serviceType;
      (jobRequest as any).servicePackage = servicePackage;
      console.log('📦 servicePackage set to:', servicePackage);

      // Create or update job first (always as DRAFT)
      console.log('🚀 Creating/updating job...', { currentJobId, jobRequest });
      let finalJobId = currentJobId;

      try {
        if (currentJobId) {
          console.log('📝 Updating existing job:', currentJobId);
          const updateResponse = await jobService.updateJob(currentJobId, jobRequest);
          console.log('✅ Update response:', updateResponse);
          if (updateResponse.success && updateResponse.data) {
            finalJobId = updateResponse.data.id;
          } else {
            console.error('❌ Update failed:', updateResponse);
            throw new Error(updateResponse.error || 'Failed to update job');
          }
        } else {
          console.log('🆕 Creating new job...');
          const createResponse = await jobService.createJob(jobRequest);
          console.log('✅ Create response:', createResponse);
          if (createResponse.success && createResponse.data) {
            finalJobId = createResponse.data.id;
            setCurrentJobId(finalJobId);
          } else {
            console.error('❌ Create failed:', createResponse);
            throw new Error(createResponse.error || 'Failed to create job');
          }
        }

        // Always publish via the API - the backend now handles payment deduction if required
        console.log('📢 Publishing job (backend handles payment):', finalJobId);

        try {
          const publishResponse = await jobService.publishJob(finalJobId!);
          console.log('✅ Publish response:', publishResponse);

          // Check for failure (ApiClient catches errors and returns success: false)
          if (!publishResponse.success) {
            const status = publishResponse.status;
            const errorMsg = publishResponse.error || 'Failed to publish job';

            // Handle 402 — Subscription Required or Quota Exhausted
            if (status === 402) {
              // Check if this is a wallet balance issue (HRM8 managed) or subscription issue
              if (errorMsg.toLowerCase().includes('subscription required')) {
                toast({
                  title: 'Subscription Required',
                  description: 'You need an active subscription to publish jobs. Please subscribe first.',
                  variant: 'destructive',
                });
                setIsPublishing(false);
                return;
              }
              if (errorMsg.toLowerCase().includes('quota exhausted')) {
                toast({
                  title: 'Job Quota Exhausted',
                  description: 'Your subscription job posting quota is full. Please upgrade your plan.',
                  variant: 'destructive',
                });
                setIsPublishing(false);
                return;
              }
              // Wallet insufficient balance (HRM8 managed services)
              const errorData: any = publishResponse.data || {};
              setBalanceErrorData({
                required: errorData.required || 0,
                balance: errorData.balance || 0,
                shortfall: errorData.shortfall || 0,
                currency: errorData.currency || 'USD'
              });
              setShowBalanceModal(true);
              setIsPublishing(false);
              return;
            }

            // Handle 503 — No consultant available
            if (status === 503) {
              toast({
                title: 'No Consultant Available',
                description: 'No consultant is currently available for this service. Please try again later.',
                variant: 'destructive',
              });
              setIsPublishing(false);
              return;
            }

            throw new Error(errorMsg);
          }

          // Success flow
          const publishedJob = publishResponse.data;
          if (!publishedJob) throw new Error('No data received from publish endpoint');

          // Ensure the job status is OPEN (in case publishJob didn't update it)
          await jobService.updateJob(finalJobId!, { status: 'OPEN' });

          // If user wants to save as template, create it now
          if (data.saveAsTemplate && data.templateName) {
            try {
              const category = data.department || undefined;
              await jobTemplateService.createFromJob(
                finalJobId!,
                data.templateName.trim(),
                undefined,
                category
              );
              toast({
                title: 'Template Saved',
                description: `"${data.templateName}" has been saved as a template.`,
              });
            } catch (error) {
              console.error('Failed to save template:', error);
              toast({
                title: 'Template Save Failed',
                description: 'Job was published but template could not be saved.',
                variant: 'destructive',
              });
            }
          }

          // Get company name from auth context
          const companyName = user?.companyName || "Your Company";

          // Transform requirements and responsibilities from objects to strings
          const requirements = transformRequirements(data.requirements);
          const responsibilities = transformResponsibilities(data.responsibilities);

          const jobData: Job = {
            id: publishedJob.id,
            ...data,
            requirements,
            responsibilities,
            employerId: user?.companyId || "",
            employerName: companyName,
            createdBy: user?.id || "",
            createdByName: user?.name || "User",
            jobCode: publishedJob.jobCode || generateJobCode(),
            aiGeneratedDescription: false,
            serviceType: data.serviceType,
            applicantsCount: 0,
            viewsCount: 0,
            postingDate: publishedJob.postingDate?.toString() || new Date().toISOString(),
            createdAt: publishedJob.createdAt?.toString() || new Date().toISOString(),
            updatedAt: publishedJob.updatedAt?.toString() || new Date().toISOString(),
            hasJobTargetPromotion: false,
            jobTargetBudget: 0,
            jobTargetBudgetRemaining: 0,
            requiresPayment: false,  // Changed to false as it's now paid/free
            paymentStatus: 'paid',
            termsAccepted: data.termsAccepted,
            termsAcceptedAt: data.termsAccepted ? new Date() : undefined,
            termsAcceptedBy: data.termsAccepted ? user?.id : undefined,
            status: 'open',
          };

          console.log('✅ Job published successfully!');

          // Refresh wallet balance just in case
          refetchBalance();

          // Store job data for post-launch tools
          setSavedJobData(jobData);

          // Open Job Setup Drawer instead of post-launch tools
          setShowJobSetupDrawer(true);
          setIsPublishing(false);
          return;

        } catch (publishError: any) {
          console.error('❌ Publish failed:', publishError);

          // Handle 402 (wallet insufficient) coming from catch
          if (publishError.status === 402 || publishError.response?.status === 402) {
            const errorMsg = publishError.response?.data?.error || publishError.message || '';

            if (errorMsg.toLowerCase().includes('subscription required')) {
              toast({ title: 'Subscription Required', description: 'You need an active subscription.', variant: 'destructive' });
              setIsPublishing(false);
              return;
            }
            if (errorMsg.toLowerCase().includes('quota exhausted')) {
              toast({ title: 'Quota Exhausted', description: 'Upgrade your subscription plan.', variant: 'destructive' });
              setIsPublishing(false);
              return;
            }

            const errorData = publishError.response?.data?.data || {};
            setBalanceErrorData({
              required: errorData.required || 0,
              balance: errorData.balance || 0,
              shortfall: errorData.shortfall || 0,
              currency: errorData.currency || 'USD'
            });
            setShowBalanceModal(true);
            setIsPublishing(false);
            return;
          }

          // Handle 503 (no consultant)
          if (publishError.status === 503 || publishError.response?.status === 503) {
            toast({ title: 'No Consultant Available', description: 'Please try again later.', variant: 'destructive' });
            setIsPublishing(false);
            return;
          }

          throw new Error(publishError.response?.data?.error || publishError.message || 'Failed to publish job');
        }
      } catch (error: any) {
        console.error('❌ Error processing job:', error);
        toast({
          title: "Job Processing Failed",
          description: error?.message || "Failed to process job. Please try again.",
          variant: "destructive"
        });
        setIsPublishing(false);
        return;
      }
    } finally {
      // Only set false if not stopped early by modal (though modal case sets it false too)
      if (!showBalanceModal) {
        setIsPublishing(false);
      }
    }
  };

  const handleSaveAsTemplate = async (data: JobFormData) => {
    console.log('💾 Saving as template...', { data: { ...data, description: data.description?.substring(0, 50) + '...' } });

    setIsSavingTemplate(true);

    try {
      // Validate form first
      const isValid = await form.trigger();
      const requirements = transformRequirements(data.requirements);
      const responsibilities = transformResponsibilities(data.responsibilities);

      const errorMessages: string[] = [];
      if (!isValid) {
        const errors = form.formState.errors;
        if (errors.title) errorMessages.push(errors.title.message || 'Job title is required');
        if (errors.description) errorMessages.push(errors.description.message || 'Job description is required');
      }
      if (!requirements || requirements.length === 0) {
        errorMessages.push('At least one requirement is needed');
      }
      if (!responsibilities || responsibilities.length === 0) {
        errorMessages.push('At least one responsibility is needed');
      }

      if (errorMessages.length > 0) {
        toast({
          title: "Please Fix Form Errors",
          description: errorMessages.join('. '),
          variant: "destructive",
          duration: 5000,
        });
        setIsSavingTemplate(false);
        return;
      }

      // Transform to API format for template creation
      const jobRequest = transformJobFormDataToCreateRequest(data);

      // Create template name from job title
      const templateName = data.title || 'Untitled Template';
      const templateDescription = data.description?.substring(0, 200) || undefined;
      const category = data.department || undefined;

      let response;
      if (currentJobId) {
        // Create template from existing job
        response = await jobTemplateService.createFromJob(
          currentJobId,
          templateName,
          templateDescription,
          category
        );
      } else {
        // Create template from scratch with current form data
        response = await jobTemplateService.createTemplate({
          name: templateName,
          description: templateDescription,
          category: category,
          jobData: jobRequest, // Send job data as JSON object
        });
      }

      if (response.success && response.data) {
        toast({
          title: "Template Saved",
          description: `"${response.data.name}" has been saved as a template.`,
        });
        if (onSuccess) {
          // Return the job data if we have it, otherwise return template data
          if (currentJobId) {
            const jobResponse = await jobService.getJobById(currentJobId);
            if (jobResponse.success && jobResponse.data) {
              onSuccess(jobResponse.data);
            }
          }
        }
      } else {
        throw new Error(response.error || 'Failed to save template');
      }
    } catch (error: any) {
      console.error('❌ Error saving template:', error);
      toast({
        title: "Save Template Failed",
        description: error?.message || "Failed to save job as template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const goToStep = async (targetStep: number) => {
    // If going forward, validate current step first
    if (targetStep > step) {
      const isValid = await validateStep(step);
      if (!isValid) {
        toast({
          title: "Please Fix Errors",
          description: "Please fix the errors in the current step before proceeding.",
          variant: "destructive",
        });
        return;
      }
    }

    // Allow going back to any previous step without validation
    const scrollContainer = findScrollContainer();
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
      scrollContainer.scrollLeft = 0;
    }
    setStep(targetStep);
  };

  const nextStep = async () => {
    const isValid = await validateStep(step);
    if (!isValid) {
      toast({
        title: "Please Fix Errors",
        description: "Please fix the errors in the current step before proceeding.",
        variant: "destructive",
      });
      return;
    }

    const scrollContainer = findScrollContainer();
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
      scrollContainer.scrollLeft = 0;
    }

    // For HRM8 services (paid packages), skip steps 2-5 and go directly to step 6 (payment/terms)
    if (isHRM8Service && step === 1) {
      setStep(6);
    } else {
      setStep(Math.min(step + 1, totalSteps));
    }
  };

  const prevStep = () => {
    const scrollContainer = findScrollContainer();
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
      scrollContainer.scrollLeft = 0;
    }
    setStep(Math.max(step - 1, 1));
  };

  const handleTemplateNameSubmit = async () => {
    if (!templateNameInput.trim()) {
      toast({
        title: "Template Name Required",
        description: "Please enter a name for your template",
        variant: "destructive",
      });
      return;
    }

    // Set the template name in the form
    form.setValue('templateName', templateNameInput.trim());
    setShowTemplateNameDialog(false);

    // Now proceed with publishing
    const formData = form.getValues();
    await onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-[1140px] mx-auto pb-6">
        <Card className="border-border/80 shadow-none sticky top-0 z-20 bg-background/95 backdrop-blur">
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground">
                Step <span className="font-medium text-foreground">{step}</span> of {totalSteps}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {autoSaving ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>Saving draft...</span>
                  </>
                ) : lastAutoSave ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Saved {getLastSaveText()}</span>
                  </>
                ) : null}
              </div>
            </div>

            <Progress value={progress} className="h-1.5" />

            {!isHRM8Service && (
              <Tabs value={step.toString()} onValueChange={(value) => goToStep(parseInt(value))}>
                <TabsList className="w-full h-auto p-1 bg-muted/20 border rounded-md overflow-x-auto flex justify-start gap-1">
                  {[1, 2, 3, 4, 5, 6].map((stepNum) => {
                    const hasErrors = stepHasErrors(stepNum);
                    const isCompleted = stepNum < step;
                    const isCurrent = stepNum === step;

                    return (
                      <TabsTrigger
                        key={stepNum}
                        value={stepNum.toString()}
                        className={cn(
                          "min-w-[132px] h-10 px-2 justify-start rounded-md border border-transparent data-[state=active]:bg-background data-[state=active]:shadow-none",
                          isCompleted ? "text-emerald-700" : "",
                        )}
                      >
                        <div className="flex items-center gap-2 text-left">
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : hasErrors && !isCurrent ? (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div className="leading-tight">
                            <p className="text-[10px] text-muted-foreground">Step {stepNum}</p>
                            <p className="text-xs font-medium">{stepLabels[stepNum - 1]}</p>
                          </div>
                        </div>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            )}

            <div className="flex items-center justify-between px-2 py-2 rounded-md border bg-muted/20">
              <div className="flex items-center gap-2">
                <div
                  key={currentServiceType}
                  className={cn("h-7 w-7 rounded-md border bg-background flex items-center justify-center", currentService.color)}
                >
                  <ServiceIcon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Service</p>
                  <p className="text-xs font-semibold">{currentService.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Fee</p>
                <p className="text-sm font-semibold text-primary">{currentService.price}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-none">
          <CardContent className="p-4 md:p-5">
            {step === 1 && <JobWizardStep1 form={form} companyAssignmentMode={companyAssignmentMode} loadingCompanySettings={loadingCompanySettings} />}
            {step === 2 && !isHRM8Service && <JobWizardStep2 form={form} />}
            {!isHRM8Service && step === 3 && <JobWizardStep3 form={form} jobId={currentJobId} />}
            {!isHRM8Service && step === 4 && <JobWizardStep4 form={form} jobId={currentJobId} />}
            {!isHRM8Service && step === 5 && <JobWizardStep5 form={form} />}
            {step === 6 && <JobWizardStep6 form={form} />}
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-3 border-t sticky bottom-0 z-20 bg-background/95 backdrop-blur px-1">
          <div className="flex gap-2">
            {step === 1 && embedded && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex gap-2">
            {!isHRM8Service && step <= 5 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Job Board
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleManualSaveDraft}
              disabled={autoSaving}
            >
              {autoSaving ? "Saving..." : "Save Draft"}
            </Button>
            {step < totalSteps ? (
              <Button type="button" onClick={nextStep}>
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    disabled={(() => {
                      const formData = form.watch();
                      const isSelfManaged = formData.serviceType === 'self-managed' || formData.serviceType === 'rpo';
                      // For paid packages, allow submission if terms are accepted OR if we're redirecting to Stripe
                      // For self-managed, require terms acceptance
                      if (isSelfManaged) {
                        return !formData.termsAccepted || isPublishing || isSavingTemplate;
                      }
                      // For paid packages, allow if terms accepted (Step 6 will handle this)
                      return !formData.termsAccepted || isPublishing || isSavingTemplate;
                    })()}
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : isSavingTemplate ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        {(() => {
                          const formData = form.watch();
                          const isSelfManagedJob = formData.serviceType === 'self-managed' || formData.serviceType === 'rpo';
                          const needsPayment = !isSelfManagedJob;

                          if (needsPayment) {
                            // For paid packages, always show "Pay & Publish"
                            return 'Pay & Publish';
                          } else {
                            // For free/self-managed packages
                            return 'Publish Job';
                          }
                        })()}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={async (e) => {
                      e.preventDefault();
                      const formData = form.getValues();
                      await form.handleSubmit(onSubmit)();
                    }}
                    disabled={isPublishing || isSavingTemplate}
                  >
                    {isPublishing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowUp className="h-4 w-4 mr-2" />
                    )}
                    {(() => {
                      const formData = form.watch();
                      const isSelfManagedJob = formData.serviceType === 'self-managed' || formData.serviceType === 'rpo';
                      return isSelfManagedJob ? 'Publish Job' : 'Pay & Publish';
                    })()}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async (e) => {
                      e.preventDefault();
                      await handleManualSaveDraft();
                    }}
                    disabled={isPublishing || isSavingTemplate}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async (e) => {
                      e.preventDefault();
                      const formData = form.getValues();
                      await form.handleSubmit(handleSaveAsTemplate)();
                    }}
                    disabled={isPublishing || isSavingTemplate}
                  >
                    {isSavingTemplate ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Save as Template
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto p-0"
          >
            <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
              <SheetHeader>
                <SheetTitle>Job Board Preview</SheetTitle>
                <SheetDescription>
                  This is how your job posting will appear to candidates on the job board
                </SheetDescription>
              </SheetHeader>
            </div>
            <div className="p-6">
              <JobBoardPublicPreview formData={form.watch()} />
            </div>
          </SheetContent>
        </Sheet>

        <InsufficientBalanceModal
          open={showBalanceModal}
          onOpenChange={setShowBalanceModal}
          requiredAmount={balanceErrorData?.required ?? 0}
          currentBalance={balanceErrorData?.balance ?? 0}
          shortfall={balanceErrorData?.shortfall ?? 0}
          currency={balanceErrorData?.currency ?? 'USD'}
        />

        {savedJobData && (
          <PostPublishFlow
            job={savedJobData}
            open={showPostLaunchTools}
            onOpenChange={(open) => {
              setShowPostLaunchTools(open);
              if (!open && onSuccess) {
                onSuccess(savedJobData);
              }
            }}
            onSaveTemplate={async (templateName, templateDescription) => {
              try {
                const category = savedJobData.department || undefined;
                await jobTemplateService.createFromJob(
                  savedJobData.id,
                  templateName,
                  templateDescription,
                  category
                );
              } catch (error) {
                console.error('Failed to save template:', error);
              }
            }}
            onComplete={() => {
              if (onSuccess) {
                onSuccess(savedJobData);
              }
            }}
          />
        )}

        {/* Template Name Dialog */}
        <Dialog open={showTemplateNameDialog} onOpenChange={setShowTemplateNameDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as Template</DialogTitle>
              <DialogDescription>
                Enter a name for this job template. This will help you quickly create similar jobs in the future.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="e.g., Senior Frontend Engineer Template"
                  value={templateNameInput}
                  onChange={(e) => setTemplateNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTemplateNameSubmit();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTemplateNameDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleTemplateNameSubmit}
                disabled={!templateNameInput.trim()}
              >
                Continue to Publish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Job Setup Drawer */}
        {savedJobData && (
          <JobSetupDrawer
            open={showJobSetupDrawer}
            onOpenChange={(open, meta) => {
              setShowJobSetupDrawer(open);
              if (!open) {
                if (meta?.reason === 'managed-checkout') {
                  return;
                }
                if (onSuccess) {
                  onSuccess(savedJobData);
                }
                // Reload to refresh jobs list and remove draft
                window.location.reload();
              }
            }}
            jobId={savedJobData.id}
            jobTitle={savedJobData.title}
          />
        )}
      </form>
    </Form>
  );
}
