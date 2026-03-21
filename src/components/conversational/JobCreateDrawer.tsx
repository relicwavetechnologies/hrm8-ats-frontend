import React, { useEffect, useState, useRef } from 'react';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/shared/components/ui/drawer';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Sparkles, X, ChevronRight, Loader2 } from 'lucide-react';
import { useJobCreateStore, WIZARD_STEPS, getWizardStepIdFromDraftStep } from '@/modules/jobs/store/useJobCreateStore';
import { Job, JobFormData } from '@/shared/types/job';
import { JobPreviewPanel } from '@/components/conversational/JobPreviewPanel';
import { JobSetupDrawer } from '@/components/setup/JobSetupDrawer';
import { PostPublishFlow } from '@/modules/jobs/components/PostPublishFlow';
import { useJobConversation } from './useJobConversation';
import { jobService } from '@/shared/lib/jobService';
import { jobDescriptionService } from '@/shared/lib/jobDescriptionService';
import { screeningQuestionService } from '@/shared/lib/screeningQuestionService';
import { jobTemplateService } from '@/shared/lib/jobTemplateService';
import { useToast } from '@/shared/hooks/use-toast';
import { useAuth } from '@/app/providers/AuthContext';
import { companyProfileService } from '@/shared/lib/companyProfileService';
import { mapBackendJobToFrontend } from '@/shared/lib/jobDataMapper';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from '@/shared/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import {
    ChatBasicDetailsCard,
    ChatLocationCard,
    ChatCompensationCard,
    ChatRoleDetailsCard,
    ChatVacanciesCard,
    ChatDocumentUploadCard,
    ChatDescriptionCard,
    ChatListBuilderCard,
    ChatTagsCard,
    ChatApplicationConfigCard,
    ChatScreeningQuestionsCard,
    ChatLogisticsCard,
    ChatReviewCard,
} from './steps';

interface JobCreateDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jobId?: string | null;
    initialData?: Partial<JobFormData> | null;
    /** When opening a draft, wizard starts at this step (1-based) */
    initialDraftStep?: number;
}

const DEFAULT_APPLICATION_FORM: NonNullable<Partial<JobFormData>['applicationForm']> = {
    id: 'default-app-form',
    name: 'Default Application Form',
    questions: [],
    includeStandardFields: {
        resume: { included: true, required: true },
        coverLetter: { included: true, required: false },
        portfolio: { included: false, required: false },
        linkedIn: { included: false, required: false },
        website: { included: false, required: false },
    },
};

const isSelfManagedService = (serviceType?: string) =>
    (serviceType || 'self-managed') === 'self-managed' || (serviceType || 'self-managed') === 'rpo';

export const JobCreateDrawer: React.FC<JobCreateDrawerProps> = ({ open, onOpenChange, jobId, initialData, initialDraftStep }) => {
    const { currentStepId, jobData, nextStep, prevStep, jumpToStep, loadJobData, reset, setJobData, parsedFields } = useJobCreateStore();
    const { handleFileUpload } = useJobConversation();
    const { toast } = useToast();
    const { user } = useAuth();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);
    const [companyContext, setCompanyContext] = useState<string>('');
    const [uploadComplete, setUploadComplete] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [setupDrawerOpen, setSetupDrawerOpen] = useState(false);
    const [createdJobId, setCreatedJobId] = useState<string | null>(null);
    const [createdJobTitle, setCreatedJobTitle] = useState<string | undefined>(undefined);
    const [postPublishOpen, setPostPublishOpen] = useState(false);
    const [publishedJob, setPublishedJob] = useState<Job | null>(null);
    const [showSaveDraftDialog, setShowSaveDraftDialog] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [saveAsTemplate, setSaveAsTemplate] = useState(false);
    const [showTemplateNameDialog, setShowTemplateNameDialog] = useState(false);
    const [templateNameInput, setTemplateNameInput] = useState('');

    useEffect(() => {
        if (open && initialData) {
            loadJobData(initialData);
            if (initialDraftStep != null && initialDraftStep >= 1) {
                jumpToStep(getWizardStepIdFromDraftStep(initialDraftStep));
            }
        } else if (open && !jobId) {
            reset();
        }
    }, [open, initialData, jobId, loadJobData, reset, initialDraftStep, jumpToStep]);

    // Build company context for AI (description step): from user + optional profile
    useEffect(() => {
        if (!open || !user?.companyId) {
            setCompanyContext('');
            return;
        }
        const parts: string[] = [];
        if (user.companyName) parts.push(`Company: ${user.companyName}`);
        if (user.companyWebsite) parts.push(`Website: ${user.companyWebsite}`);
        let base = parts.length ? parts.join('. ') : '';
        setCompanyContext(base);
        companyProfileService.getProfile(user.companyId).then((res) => {
            const profile = res?.data?.profile;
            if (profile?.profileData) {
                const d = profile.profileData;
                if (d.basicDetails?.overview) base += (base ? '\n' : '') + `About: ${d.basicDetails.overview}`;
                if (d.branding?.companyIntroduction) base += (base ? '\n' : '') + `Introduction: ${d.branding.companyIntroduction}`;
            }
            setCompanyContext(base);
        }).catch(() => { /* keep base from user */ });
    }, [open, user?.companyId, user?.companyName, user?.companyWebsite]);

    const draftStepIndex = WIZARD_STEPS.indexOf(currentStepId) + 1;

    const getGlobalPublishConfig = (scope: 'HRM8_ONLY' | 'GLOBAL' = (jobData.distributionScope as 'HRM8_ONLY' | 'GLOBAL') || 'HRM8_ONLY') => (
        scope === 'GLOBAL'
            ? {
                channels: jobData.globalPublishConfig?.channels || [],
                budgetTier: jobData.globalPublishConfig?.budgetTier || 'none',
                customBudget: jobData.globalPublishConfig?.customBudget,
                hrm8ServiceRequiresApproval: !isSelfManagedService(jobData.serviceType),
                hrm8ServiceApproved: jobData.globalPublishConfig?.hrm8ServiceApproved || false,
                easyApplyConfig: jobData.globalPublishConfig?.easyApplyConfig || {
                    enabled: false,
                    type: 'full',
                    hostedApply: false,
                    questionnaireEnabled: false,
                },
            }
            : {
                channels: [],
                budgetTier: 'none' as const,
                customBudget: undefined,
                hrm8ServiceRequiresApproval: false,
                hrm8ServiceApproved: false,
                easyApplyConfig: {
                    enabled: false,
                    type: 'full' as const,
                    hostedApply: false,
                    questionnaireEnabled: false,
                },
            }
    );

    const mapServiceTypeToHiringMode = (serviceType?: string): 'SELF_MANAGED' | 'SHORTLISTING' | 'FULL_SERVICE' | 'EXECUTIVE_SEARCH' => {
        switch (serviceType) {
            case 'shortlisting':
                return 'SHORTLISTING';
            case 'full-service':
            case 'rpo':
                return 'FULL_SERVICE';
            case 'executive-search':
                return 'EXECUTIVE_SEARCH';
            default:
                return 'SELF_MANAGED';
        }
    };

    const mapServiceTypeToServicePackage = (serviceType?: string): 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' => {
        switch (serviceType) {
            case 'shortlisting':
                return 'shortlisting';
            case 'full-service':
            case 'rpo':
                return 'full-service';
            case 'executive-search':
                return 'executive-search';
            default:
                return 'self-managed';
        }
    };

    const buildDraftPayload = () => ({
        title: jobData.title || 'Untitled draft',
        description: jobData.description || '',
        department: jobData.department,
        location: jobData.location || 'Remote',
        employmentType: jobData.employmentType || 'full-time',
        workArrangement: jobData.workArrangement || 'on-site',
        experienceLevel: jobData.experienceLevel,
        numberOfVacancies: jobData.numberOfVacancies ?? 1,
        salaryMin: jobData.salaryMin,
        salaryMax: jobData.salaryMax,
        salaryCurrency: jobData.salaryCurrency || 'USD',
        salaryPeriod: jobData.salaryPeriod || 'annual',
        salaryDescription: jobData.salaryDescription,
        requirements: jobData.requirements?.map((r: any) => (typeof r === 'string' ? r : r.text)) ?? [],
        responsibilities: jobData.responsibilities?.map((r: any) => (typeof r === 'string' ? r : r.text)) ?? [],
        tags: jobData.tags ?? [],
        applicationForm: jobData.applicationForm || DEFAULT_APPLICATION_FORM,
        visibility: jobData.visibility || 'public',
        stealth: jobData.stealth ?? false,
        closeDate: jobData.closeDate,
        termsAccepted: jobData.termsAccepted ?? false,
        draftStep: draftStepIndex,
        distributionScope: (jobData.distributionScope as 'HRM8_ONLY' | 'GLOBAL') || 'HRM8_ONLY',
        globalPublishConfig: getGlobalPublishConfig(),
    });

    const buildPublishPayload = () => {
        const hiringMode = mapServiceTypeToHiringMode(jobData.serviceType);
        const servicePackage = mapServiceTypeToServicePackage(jobData.serviceType);

        return {
            title: jobData.title || 'Untitled Job',
            description: jobData.description || '',
            department: jobData.department,
            location: jobData.location || 'Remote',
            employmentType: jobData.employmentType || 'full-time',
            workArrangement: jobData.workArrangement || 'on-site',
            experienceLevel: jobData.experienceLevel,
            numberOfVacancies: jobData.numberOfVacancies,
            salaryMin: jobData.salaryMin,
            salaryMax: jobData.salaryMax,
            salaryCurrency: jobData.salaryCurrency || 'USD',
            salaryPeriod: jobData.salaryPeriod || 'annual',
            salaryDescription: jobData.salaryDescription,
            requirements: jobData.requirements?.map(r => typeof r === 'string' ? r : r.text) || [],
            responsibilities: jobData.responsibilities?.map(r => typeof r === 'string' ? r : r.text) || [],
            tags: jobData.tags || [],
            applicationForm: jobData.applicationForm || DEFAULT_APPLICATION_FORM,
            hiringMode,
            servicePackage,
            visibility: jobData.visibility || 'public',
            stealth: jobData.stealth ?? false,
            closeDate: jobData.closeDate,
            termsAccepted: jobData.termsAccepted,
            termsAcceptedAt: jobData.termsAccepted ? new Date() : undefined,
            status: 'DRAFT' as const,
            distributionScope: (jobData.distributionScope as 'HRM8_ONLY' | 'GLOBAL') || 'HRM8_ONLY',
            globalPublishConfig: getGlobalPublishConfig(),
        };
    };

    const handleSaveDraftAndClose = async () => {
        setIsSavingDraft(true);
        try {
            const payload = buildDraftPayload();
            if (jobId) {
                const res = await jobService.saveDraft(jobId, payload as any);
                if (res.success) {
                    toast({ title: 'Draft saved', description: 'You can continue from the Drafts tab.' });
                    setShowSaveDraftDialog(false);
                    onOpenChange(false);
                } else {
                    toast({ title: 'Error', description: res.error || 'Failed to save draft', variant: 'destructive' });
                }
            } else {
                const createRes = await jobService.createJob({
                    ...buildPublishPayload(),
                    publishImmediately: false,
                } as any);
                if (createRes.success && createRes.data) {
                    const data = createRes.data as { job?: { id: string }; id?: string };
                    const newId = data.job?.id ?? data.id;
                    if (newId) {
                        await jobService.saveDraft(newId, payload as any);
                        toast({ title: 'Draft saved', description: 'You can continue from the Drafts tab.' });
                    }
                    setShowSaveDraftDialog(false);
                    onOpenChange(false);
                } else {
                    toast({ title: 'Error', description: (createRes as any).error || 'Failed to create draft', variant: 'destructive' });
                }
            }
        } catch (e) {
            console.error(e);
            toast({ title: 'Error', description: 'Failed to save draft', variant: 'destructive' });
        } finally {
            setIsSavingDraft(false);
        }
    };

    const handleDontSaveAndClose = () => {
        setShowSaveDraftDialog(false);
        onOpenChange(false);
    };

    const handleRequestClose = () => {
        setShowSaveDraftDialog(true);
    };

    const handleSubmitJob = async () => {
        // If saveAsTemplate is checked but no template name yet, show dialog first
        if (saveAsTemplate && !templateNameInput) {
            setTemplateNameInput(jobData.title ? `${jobData.title} Template` : '');
            setShowTemplateNameDialog(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const isGlobal = jobData.distributionScope === 'GLOBAL';
            const isSelfManaged = isSelfManagedService(jobData.serviceType);
            if (isGlobal && !isSelfManaged && !jobData.globalPublishConfig?.hrm8ServiceApproved) {
                toast({
                    title: 'Approval Required',
                    description: 'Approve the GLOBAL distribution handoff before publishing this HRM8-managed job.',
                    variant: 'destructive',
                });
                return;
            }

            const payload = buildPublishPayload();

            let publishJobId = jobId ?? null;
            let publishResponse;

            if (jobId) {
                const updateResponse = await jobService.updateJob(jobId, payload as any);
                if (!updateResponse.success) {
                    throw new Error(updateResponse.error || 'Failed to update draft before publishing');
                }
                publishResponse = await jobService.publishJob(jobId);
            } else {
                const createResponse = await jobService.createJob(payload as any);
                if (!createResponse.success || !createResponse.data) {
                    throw new Error(createResponse.error || 'Failed to create job');
                }

                const createdJob = (createResponse.data as { job?: { id: string }; id?: string }).job ?? createResponse.data;
                publishJobId = (createdJob as { id?: string }).id ?? (createResponse.data as { id?: string }).id ?? null;

                if (!publishJobId) {
                    throw new Error('Failed to get job ID');
                }

                publishResponse = await jobService.publishJob(publishJobId);
            }

            if (!publishJobId) {
                throw new Error('Failed to publish job');
            }

            if (!publishResponse.success) {
                const status = publishResponse.status;
                const errorMsg = (publishResponse as any).error || 'Failed to publish job';
                const errorCode = (publishResponse as { code?: string }).code;

                if (status === 402) {
                    const isPaygInvoiceRequired =
                        errorCode === 'PAYG_INVOICE_REQUIRED' ||
                        errorMsg.includes('Complete checkout to continue');

                    if (isPaygInvoiceRequired) {
                        try {
                            const checkoutRes = await jobService.initiatePaygJobCheckout(publishJobId);
                            if (checkoutRes.success && checkoutRes.data?.checkoutUrl) {
                                window.location.href = checkoutRes.data.checkoutUrl;
                                return;
                            }
                        } catch (checkoutErr) {
                            console.error('PAYG checkout failed:', checkoutErr);
                            toast({
                                title: 'Checkout Error',
                                description: 'Could not start payment. Please try again.',
                                variant: 'destructive',
                            });
                        }
                        return;
                    }

                    if (errorMsg.toLowerCase().includes('subscription required')) {
                        toast({
                            title: 'Subscription Required',
                            description: 'You need an active subscription to publish jobs.',
                            variant: 'destructive',
                        });
                        return;
                    }
                    if (errorMsg.toLowerCase().includes('quota exhausted')) {
                        toast({
                            title: 'Job Quota Exhausted',
                            description: 'Your subscription quota is full. Please upgrade your plan.',
                            variant: 'destructive',
                        });
                        return;
                    }
                    toast({
                        title: 'Payment Required',
                        description: 'Complete checkout to publish this job.',
                        variant: 'destructive',
                    });
                    return;
                }

                if (status === 503) {
                    toast({
                        title: 'No Consultant Available',
                        description: 'No consultant is currently available for this service. Please try again later.',
                        variant: 'destructive',
                    });
                    return;
                }

                throw new Error(errorMsg);
            }

            // Ensure the job status is OPEN (in case publishJob didn't update it)
            await jobService.updateJob(publishJobId, { status: 'OPEN' });

            // If user wants to save as template, create it now
            if (saveAsTemplate && templateNameInput) {
                try {
                    const category = jobData.department || undefined;
                    await jobTemplateService.createFromJob(
                        publishJobId,
                        templateNameInput.trim(),
                        undefined,
                        category
                    );
                    toast({
                        title: 'Template Saved',
                        description: `"${templateNameInput}" has been saved as a template.`,
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

            const publishedRaw = (publishResponse.data || {}) as Record<string, unknown>;
            const publishedBackend = ((publishedRaw.job || publishedRaw) as Record<string, unknown>) || {};
            const mappedPublished = mapBackendJobToFrontend({
                ...publishedBackend,
                id: (publishedBackend.id as string) || publishJobId,
                companyId: (publishedBackend.companyId as string) || user?.companyId || '',
                companyName: user?.companyName || '',
                createdBy: (publishedBackend.createdBy as string) || user?.id || '',
                createdByName: (publishedBackend.createdByName as string) || user?.name || 'User',
            });
            const published: Job = {
                ...mappedPublished,
                id: mappedPublished.id || publishJobId,
                title: mappedPublished.title || jobData.title || 'Untitled Job',
                distributionScope: mappedPublished.distributionScope || jobData.distributionScope,
                globalPublishConfig: mappedPublished.globalPublishConfig || jobData.globalPublishConfig,
            };

            // Success! Open post-publish flow first.
            setCreatedJobId(publishJobId);
            setCreatedJobTitle(jobData.title || undefined);
            setPublishedJob(published);
            setPostPublishOpen(true);
            reset();
            setSaveAsTemplate(false);
            setTemplateNameInput('');
            onOpenChange(false);
        } catch (error) {
            console.error('Job creation failed:', error);
            toast({
                title: 'Publish Failed',
                description: error instanceof Error ? error.message : 'Failed to create and publish job.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTemplateNameSubmit = async () => {
        if (!templateNameInput.trim()) {
            toast({
                title: 'Template Name Required',
                description: 'Please enter a name for your template',
                variant: 'destructive',
            });
            return;
        }

        setShowTemplateNameDialog(false);
        // Now proceed with publishing
        await handleSubmitJob();
    };

    const requirementsItems = (jobData.requirements || []).map((item) => typeof item === 'string' ? item : item.text);
    const responsibilitiesItems = (jobData.responsibilities || []).map((item) => typeof item === 'string' ? item : item.text);
    const applicationForm = jobData.applicationForm || DEFAULT_APPLICATION_FORM;
    const canContinueFromCurrentStep = (() => {
        switch (currentStepId) {
            case 'core-details':
                return (jobData.title || '').trim().length >= 3
                    && ((jobData.workArrangement || 'on-site') === 'remote' || (jobData.location || '').trim().length >= 2);
            case 'job-content':
                return (jobData.description || '').trim().length >= 50
                    && requirementsItems.length >= 1
                    && responsibilitiesItems.length >= 1;
            default:
                return true;
        }
    })();

    const renderStepAdvanceButton = (label = currentStepId === 'posting-settings' ? 'Continue to review' : 'Continue') => (
        <div className="flex justify-end pt-2">
            <Button
                onClick={nextStep}
                disabled={!canContinueFromCurrentStep}
                className="min-w-[180px] h-11 font-semibold rounded-lg"
            >
                {label}
                <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
    );

    const renderStepCard = () => {
        const isParsed = (field: string) => parsedFields.includes(field);
        switch (currentStepId) {
            case 'core-details':
                return (
                    <div className="space-y-8">
                        <section className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold tracking-tight">Quick start</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Upload a job description to prefill the role, or continue with manual entry below.
                                </p>
                            </div>
                            <ChatDocumentUploadCard
                                onFileUpload={async (file) => {
                                    setIsUploadingDoc(true);
                                    setUploadComplete(false);
                                    try {
                                        await handleFileUpload(file);
                                        setUploadComplete(true);
                                    } finally {
                                        setIsUploadingDoc(false);
                                    }
                                }}
                                onSkip={() => undefined}
                                isUploading={isUploadingDoc}
                                uploadComplete={uploadComplete}
                                showSkip={false}
                            />
                        </section>

                        <section className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold tracking-tight">Role basics</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Capture the core details candidates and distribution tools need first.
                                </p>
                            </div>
                            <ChatBasicDetailsCard
                                title={jobData.title || ''}
                                department={jobData.department || ''}
                                distributionScope={(jobData.distributionScope as 'HRM8_ONLY' | 'GLOBAL') || 'HRM8_ONLY'}
                                serviceType={jobData.serviceType as any}
                                onTitleChange={(v) => setJobData({ title: v })}
                                onDepartmentChange={(v) => setJobData({ department: v })}
                                onDistributionScopeChange={(v) => setJobData({
                                    distributionScope: v,
                                    globalPublishConfig: getGlobalPublishConfig(v),
                                })}
                                onContinue={nextStep}
                                showContinue={false}
                                isParsedTitle={isParsed('title')}
                                isParsedDept={isParsed('department')}
                            />
                            <ChatLocationCard
                                location={jobData.location || ''}
                                workArrangement={jobData.workArrangement || 'on-site'}
                                onLocationChange={(v) => setJobData({ location: v })}
                                onWorkArrangementChange={(v) => setJobData({ workArrangement: v })}
                                onContinue={nextStep}
                                showContinue={false}
                                isParsed={isParsed('location')}
                            />
                            <ChatRoleDetailsCard
                                employmentType={jobData.employmentType || 'full-time'}
                                experienceLevel={jobData.experienceLevel || 'mid'}
                                onEmploymentTypeChange={(v) => setJobData({ employmentType: v })}
                                onExperienceLevelChange={(v) => setJobData({ experienceLevel: v })}
                                onContinue={nextStep}
                                showContinue={false}
                            />
                            <ChatVacanciesCard
                                value={jobData.numberOfVacancies || 1}
                                onChange={(v) => setJobData({ numberOfVacancies: v })}
                                onContinue={nextStep}
                                showContinue={false}
                            />
                        </section>
                        {renderStepAdvanceButton()}
                    </div>
                );
            case 'job-content':
                return (
                    <div className="space-y-8">
                        <section className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold tracking-tight">Overview</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Write the core story of the role first, then add clear qualification and duty lists.
                                </p>
                            </div>
                            <ChatDescriptionCard
                                description={jobData.description || ''}
                                onChange={(v) => setJobData({ description: v })}
                                onContinue={nextStep}
                                showContinue={false}
                                isParsed={isParsed('description')}
                                jobData={jobData}
                                companyContext={companyContext}
                                onGenerateDescription={async (currentDescription) => {
                                    const additionalContext = [
                                        companyContext ? `Company context:\n${companyContext}` : '',
                                        currentDescription.trim() ? `User's current description (expand or improve this):\n${currentDescription}` : '',
                                    ].filter(Boolean).join('\n\n');
                                    const result = await jobDescriptionService.generateDescription(jobData as Partial<JobFormData>, additionalContext);
                                    return result.description;
                                }}
                            />
                        </section>

                        <section className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold tracking-tight">Requirements</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    List the must-have experience, skills, and certifications for the role.
                                </p>
                            </div>
                            <ChatListBuilderCard
                                title="Requirements"
                                subtitle="List what candidates need to qualify for this role."
                                items={requirementsItems}
                                onChange={(items) => setJobData({ requirements: items.map((text, i) => ({ id: `req-${i}`, text, order: i })) })}
                                onContinue={nextStep}
                                showContinue={false}
                                isParsed={isParsed('requirements')}
                                placeholder="e.g. 3+ years of experience in..."
                                minItems={1}
                                onGenerateList={async (currentItems) => {
                                    const additionalContext = [
                                        companyContext ? `Company context:\n${companyContext}` : '',
                                        'Generate only requirements/qualifications for this role. Return them as the requirements array.',
                                        currentItems.length > 0 ? `User's current requirements (expand or improve):\n${currentItems.map((r, i) => `${i + 1}. ${r}`).join('\n')}` : '',
                                    ].filter(Boolean).join('\n\n');
                                    const result = await jobDescriptionService.generateDescription(jobData as Partial<JobFormData>, additionalContext);
                                    return result.requirements ?? [];
                                }}
                            />
                        </section>

                        <section className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold tracking-tight">Responsibilities</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Make the day-to-day scope concrete so candidates understand the expectations.
                                </p>
                            </div>
                            <ChatListBuilderCard
                                title="Responsibilities"
                                subtitle="Describe the key duties for this position."
                                items={responsibilitiesItems}
                                onChange={(items) => setJobData({ responsibilities: items.map((text, i) => ({ id: `resp-${i}`, text, order: i })) })}
                                onContinue={nextStep}
                                showContinue={false}
                                isParsed={isParsed('responsibilities')}
                                placeholder="e.g. Lead a team of 5 engineers..."
                                minItems={1}
                                onGenerateList={async (currentItems) => {
                                    const additionalContext = [
                                        companyContext ? `Company context:\n${companyContext}` : '',
                                        'Generate only responsibilities/duties for this role. Return them as the responsibilities array.',
                                        currentItems.length > 0 ? `User's current responsibilities (expand or improve):\n${currentItems.map((r, i) => `${i + 1}. ${r}`).join('\n')}` : '',
                                    ].filter(Boolean).join('\n\n');
                                    const result = await jobDescriptionService.generateDescription(jobData as Partial<JobFormData>, additionalContext);
                                    return result.responsibilities ?? [];
                                }}
                            />
                        </section>

                        <section className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold tracking-tight">Tags</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Optional tags help search, filtering, and internal organization.
                                </p>
                            </div>
                            <ChatTagsCard
                                tags={jobData.tags || []}
                                onChange={(tags) => setJobData({ tags })}
                                onContinue={nextStep}
                                showContinue={false}
                            />
                        </section>
                        {renderStepAdvanceButton()}
                    </div>
                );
            case 'application':
                return (
                    <div className="space-y-8">
                        <section className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold tracking-tight">Application form</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Decide what every candidate should submit before they can apply.
                                </p>
                            </div>
                            <ChatApplicationConfigCard
                                config={applicationForm}
                                onChange={(config) => setJobData({ applicationForm: config })}
                                onContinue={nextStep}
                                showContinue={false}
                            />
                        </section>

                        <section className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold tracking-tight">Screening questions</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Add targeted questions only when they help you filter applicants earlier.
                                </p>
                            </div>
                            <ChatScreeningQuestionsCard
                                questions={applicationForm.questions || []}
                                onChange={(questions) => setJobData({
                                    applicationForm: {
                                        ...applicationForm,
                                        questions: questions.map((q, index) => ({ ...q, order: index })),
                                    }
                                })}
                                onContinue={nextStep}
                                showContinue={false}
                                jobData={jobData}
                                companyContext={companyContext}
                                onGenerateQuestions={async (existing) => {
                                    const generated = await screeningQuestionService.generateScreeningQuestions({
                                        jobTitle: (jobData.title as string) || 'Role',
                                        jobDescription: (jobData.description as string) || '',
                                        companyContext: companyContext || undefined,
                                        department: (jobData.department as string) || undefined,
                                        experienceLevel: (jobData.experienceLevel as string) || undefined,
                                        existingQuestions: existing.map((q) => ({ label: q.label, type: q.type })),
                                        count: 8,
                                    });
                                    return generated;
                                }}
                            />
                        </section>
                        {renderStepAdvanceButton()}
                    </div>
                );
            case 'posting-settings':
                return (
                    <div className="space-y-8">
                        <section className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold tracking-tight">Compensation</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Salary details are optional, but the range and pay period now persist end to end.
                                </p>
                            </div>
                            <ChatCompensationCard
                                salaryMin={jobData.salaryMin}
                                salaryMax={jobData.salaryMax}
                                salaryCurrency={jobData.salaryCurrency || 'AUD'}
                                salaryPeriod={jobData.salaryPeriod || 'annual'}
                                salaryDescription={jobData.salaryDescription}
                                onSalaryMinChange={(v) => setJobData({ salaryMin: v || undefined })}
                                onSalaryMaxChange={(v) => setJobData({ salaryMax: v || undefined })}
                                onCurrencyChange={(v) => setJobData({ salaryCurrency: v })}
                                onPeriodChange={(v) => setJobData({ salaryPeriod: v })}
                                onSalaryDescriptionChange={(v) => setJobData({ salaryDescription: v })}
                                onContinue={nextStep}
                                showContinue={false}
                                isParsed={isParsed('salaryMin') || isParsed('salaryMax')}
                            />
                        </section>

                        <section className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold tracking-tight">Visibility and timing</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Control when the role closes and whether company identity stays hidden on the post.
                                </p>
                            </div>
                            <ChatLogisticsCard
                                closeDate={jobData.closeDate}
                                visibility={jobData.visibility || 'public'}
                                stealth={jobData.stealth || false}
                                onCloseDateChange={(v) => setJobData({ closeDate: v })}
                                onVisibilityChange={(v) => setJobData({ visibility: v })}
                                onStealthChange={(v) => setJobData({ stealth: v })}
                                onContinue={nextStep}
                                showContinue={false}
                            />
                        </section>
                        {renderStepAdvanceButton()}
                    </div>
                );
            case 'review':
                return (
                    <ChatReviewCard
                        jobData={jobData}
                        onEdit={(stepId) => jumpToStep(stepId as any)}
                        onSubmit={handleSubmitJob}
                        isSubmitting={isSubmitting}
                        termsAccepted={jobData.termsAccepted}
                        onTermsAcceptedChange={(v) => setJobData({ termsAccepted: v })}
                        saveAsTemplate={saveAsTemplate}
                        onSaveAsTemplateChange={setSaveAsTemplate}
                        onGlobalPublishApprovalChange={(approved) => setJobData({
                            globalPublishConfig: {
                                ...getGlobalPublishConfig(),
                                hrm8ServiceApproved: approved,
                            },
                        })}
                    />
                );
            default:
                return null;
        }
    };

    const stepMeta: Record<string, { label: string; heading: string; description: string }> = {
        'core-details':     { label: 'Core details',      heading: 'Define the role basics',          description: 'Start with the JD if you have one, then confirm the fields needed to create the job.' },
        'job-content':      { label: 'Job content',       heading: 'Shape the candidate-facing copy', description: 'Group the job description, requirements, responsibilities, and tags into one focused step.' },
        'application':      { label: 'Application',       heading: 'Decide how candidates apply',     description: 'Configure the application form and screening questions together so this part is easier to reason about.' },
        'posting-settings': { label: 'Posting settings',  heading: 'Set pay, visibility, and timing', description: 'Keep salary details, close date, visibility, and stealth controls in one place.' },
        'review':           { label: 'Review & publish',  heading: 'Review before publishing',        description: 'Check the grouped summary, accept terms, and publish. JobTarget setup continues after publish.' },
    };
    const currentMeta = stepMeta[currentStepId] || { label: currentStepId, heading: currentStepId, description: '' };
    const currentStepIndex = WIZARD_STEPS.indexOf(currentStepId);
    const progressPct = ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100;

    return (
        <>
            <Drawer open={open} onOpenChange={(nextOpen) => { if (!nextOpen) handleRequestClose(); else onOpenChange(nextOpen); }}>
                <DrawerContent className="h-[95vh] rounded-t-[28px] border-none bg-background shadow-2xl flex flex-col overflow-hidden">

                    {/* ── Header ── */}
                    <DrawerHeader className="border-b px-6 py-3.5 bg-background sticky top-0 z-10 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <DrawerTitle className="text-base font-bold tracking-tight leading-none">Job Creation Wizard</DrawerTitle>
                                <DrawerDescription className="text-xs text-muted-foreground mt-0.5">
                                    Step {currentStepIndex + 1} of {WIZARD_STEPS.length} — {currentMeta.label}
                                </DrawerDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSaveDraftAndClose}
                                disabled={isSavingDraft}
                                className="hidden sm:flex items-center gap-1.5 text-xs h-8"
                            >
                                {isSavingDraft ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                                Save Draft
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleRequestClose} className="h-8 w-8 rounded-lg hover:bg-muted">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DrawerHeader>

                    {/* ── Progress Bar ── */}
                    <div className="h-[3px] bg-muted shrink-0">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>

                    <div className="flex-1 flex overflow-hidden min-h-0">

                        {/* ── Sidebar: Step Navigator ── */}
                        <div className="w-52 border-r bg-muted/10 hidden xl:flex flex-col shrink-0 overflow-y-auto py-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-5 mb-3">Steps</p>
                            <nav className="flex flex-col gap-px px-3">
                                {WIZARD_STEPS.map((stepId, index) => {
                                    const meta = stepMeta[stepId];
                                    const stepIndex = WIZARD_STEPS.indexOf(stepId);
                                    const isDone = stepIndex < currentStepIndex;
                                    const isCurrent = stepId === currentStepId;
                                    const isClickable = stepIndex <= currentStepIndex;
                                    return (
                                        <button
                                            key={stepId}
                                            onClick={() => isClickable ? jumpToStep(stepId) : undefined}
                                            className={cn(
                                                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150 text-xs w-full",
                                                isCurrent && "bg-primary/10 text-primary font-semibold",
                                                isDone && !isCurrent && "text-foreground/60 hover:bg-muted/60 cursor-pointer",
                                                !isClickable && "text-muted-foreground/35 cursor-default",
                                            )}
                                        >
                                            <div className={cn(
                                                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors text-[10px] font-bold",
                                                isCurrent && "bg-primary text-primary-foreground",
                                                isDone && "bg-green-500 text-white",
                                                !isCurrent && !isDone && "bg-border text-muted-foreground",
                                            )}>
                                                {isDone ? (
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                ) : (<span>{index + 1}</span>)}
                                            </div>
                                            <span className="truncate leading-tight">{meta?.label ?? stepId}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* ── Center: Step Content ── */}
                        <div className="flex-1 flex flex-col min-w-0 bg-muted/20">
                            <ScrollArea className="flex-1" ref={scrollRef}>
                                <div className="px-8 py-8 max-w-2xl mx-auto pb-20">
                                    {/* Step Header */}
                                    <div className="mb-7">
                                        <p className="text-xs font-bold text-primary/80 uppercase tracking-widest mb-1.5">
                                            Step {currentStepIndex + 1}
                                        </p>
                                        <h2 className="text-2xl font-bold tracking-tight">{currentMeta.heading}</h2>
                                        {currentMeta.description && (
                                            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{currentMeta.description}</p>
                                        )}
                                        <div className="mt-5 h-px bg-border/60" />
                                    </div>

                                    {/* Step Card */}
                                    <div className="space-y-6">
                                        {renderStepCard()}
                                    </div>
                                </div>
                            </ScrollArea>

                            {/* Bottom nav bar */}
                            {currentStepId !== 'review' && (
                                <div className="shrink-0 border-t bg-background px-8 py-3.5 flex justify-between items-center">
                                    <Button variant="ghost" onClick={prevStep} size="sm" className="gap-1.5">
                                        <ChevronRight className="h-4 w-4 rotate-180" />
                                        Back
                                    </Button>
                                    <span className="text-xs text-muted-foreground tabular-nums">
                                        {currentStepIndex + 1} / {WIZARD_STEPS.length}
                                    </span>
                                </div>
                            )}
                            {currentStepId === 'review' && (
                                <div className="shrink-0 border-t bg-background px-8 py-3.5 flex justify-between items-center">
                                    <Button variant="ghost" onClick={prevStep} size="sm" className="gap-1.5">
                                        <ChevronRight className="h-4 w-4 rotate-180" />
                                        Back
                                    </Button>
                                    <span className="text-xs text-muted-foreground">All steps complete</span>
                                </div>
                            )}
                        </div>

                        {/* ── Right: Live Preview ── */}
                        <div className="w-[380px] border-l bg-background hidden lg:flex flex-col min-h-0 shrink-0">
                            <div className="px-5 py-3.5 border-b flex items-center justify-between shrink-0 bg-muted/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <h3 className="font-semibold text-sm text-foreground">Live Preview</h3>
                                </div>
                                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50">Candidate View</span>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <JobPreviewPanel jobData={jobData} />
                            </div>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            <AlertDialog open={showSaveDraftDialog} onOpenChange={setShowSaveDraftDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Save as draft?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You can save this job as a draft and continue later from the Drafts tab. Your current step will be saved.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button variant="outline" onClick={handleDontSaveAndClose}>
                            Don&apos;t save
                        </Button>
                        <Button onClick={handleSaveDraftAndClose} disabled={isSavingDraft}>
                            {isSavingDraft ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : 'Save draft'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {publishedJob && (
                <PostPublishFlow
                    job={publishedJob}
                    open={postPublishOpen}
                    onOpenChange={(open) => {
                        setPostPublishOpen(open);
                        if (!open) {
                            setSetupDrawerOpen(true);
                        }
                    }}
                    onComplete={() => {
                        setPostPublishOpen(false);
                        setSetupDrawerOpen(true);
                    }}
                />
            )}

            <JobSetupDrawer
                open={setupDrawerOpen}
                onOpenChange={(open, meta) => {
                    setSetupDrawerOpen(open);
                    if (!open) {
                        if (meta?.reason === 'managed-checkout') {
                            return;
                        }
                        setPostPublishOpen(false);
                        setPublishedJob(null);
                        setCreatedJobId(null);
                        setCreatedJobTitle(undefined);
                        // Reload to refresh jobs list and remove draft
                        window.location.reload();
                    }
                }}
                jobId={createdJobId}
                jobTitle={createdJobTitle}
            />

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
        </>
    );
};
