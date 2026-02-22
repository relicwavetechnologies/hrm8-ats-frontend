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
import { useJobCreateStore, WizardStepId, WIZARD_STEPS } from '@/modules/jobs/store/useJobCreateStore';
import { JobFormData } from '@/shared/types/job';
import { JobPreviewPanel } from '@/components/conversational/JobPreviewPanel';
import { JobSetupDrawer } from '@/components/setup/JobSetupDrawer';
import { useJobConversation } from './useJobConversation';
import { jobService } from '@/shared/lib/jobService';
import { jobDescriptionService } from '@/shared/lib/jobDescriptionService';
import { screeningQuestionService } from '@/shared/lib/screeningQuestionService';
import { jobTemplateService } from '@/shared/lib/jobTemplateService';
import { useToast } from '@/shared/hooks/use-toast';
import { useAuth } from '@/app/providers/AuthContext';
import { companyProfileService } from '@/shared/lib/companyProfileService';
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
    ChatServiceTypeCard,
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
    ChatPlaceholderCard,
    stepTitles,
} from './steps';

interface JobCreateDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jobId?: string | null;
    initialData?: Partial<JobFormData> | null;
    /** When opening a draft, wizard starts at this step (1-based) */
    initialDraftStep?: number;
}

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
    const [showSaveDraftDialog, setShowSaveDraftDialog] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [saveAsTemplate, setSaveAsTemplate] = useState(false);
    const [showTemplateNameDialog, setShowTemplateNameDialog] = useState(false);
    const [templateNameInput, setTemplateNameInput] = useState('');

    useEffect(() => {
        if (open && initialData) {
            loadJobData(initialData);
            if (initialDraftStep != null && initialDraftStep >= 1) {
                const step = Math.min(initialDraftStep, WIZARD_STEPS.length);
                jumpToStep(WIZARD_STEPS[step - 1]);
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
        hideSalary: jobData.hideSalary ?? false,
        requirements: jobData.requirements?.map((r: any) => (typeof r === 'string' ? r : r.text)) ?? [],
        responsibilities: jobData.responsibilities?.map((r: any) => (typeof r === 'string' ? r : r.text)) ?? [],
        tags: jobData.tags ?? [],
        applicationForm: jobData.applicationForm,
        visibility: jobData.visibility || 'public',
        stealth: jobData.stealth ?? false,
        closeDate: jobData.closeDate,
        draftStep: draftStepIndex,
    });

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
                const hiringMode = mapServiceTypeToHiringMode(jobData.serviceType);
                const servicePackage = mapServiceTypeToServicePackage(jobData.serviceType);
                const createRes = await jobService.createJob({
                    title: payload.title,
                    description: payload.description,
                    department: payload.department ?? '',
                    location: payload.location,
                    hiringMode,
                    workArrangement: (payload.workArrangement ?? 'on-site').toUpperCase().replace('-', '_') as any,
                    employmentType: (payload.employmentType ?? 'full-time').toUpperCase().replace('-', '_') as any,
                    numberOfVacancies: payload.numberOfVacancies,
                    salaryMin: payload.salaryMin,
                    salaryMax: payload.salaryMax,
                    salaryCurrency: payload.salaryCurrency,
                    requirements: payload.requirements,
                    responsibilities: payload.responsibilities,
                    applicationForm: payload.applicationForm,
                    visibility: payload.visibility,
                    stealth: payload.stealth,
                    closeDate: payload.closeDate,
                    servicePackage,
                    publishImmediately: false,
                });
                if (createRes.success && createRes.data) {
                    const data = createRes.data as { job?: { id: string }; id?: string };
                    const newId = data.job?.id ?? data.id;
                    if (newId) {
                        await jobService.saveDraft(newId, { ...payload, draftStep: payload.draftStep } as any);
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
            const hiringMode = mapServiceTypeToHiringMode(jobData.serviceType);
            const servicePackage = mapServiceTypeToServicePackage(jobData.serviceType);

            // Transform JobFormData to CreateJobRequest
            const payload: any = {
                title: jobData.title || 'Untitled Job',
                description: jobData.description || '',
                department: jobData.department,
                location: jobData.location || 'Remote',
                employmentType: jobData.employmentType || 'full-time',
                workArrangement: jobData.workArrangement || 'on-site',
                experienceLevel: jobData.experienceLevel,
                numberOfVacancies: jobData.numberOfVacancies,

                // Salary
                salaryMin: jobData.salaryMin,
                salaryMax: jobData.salaryMax,
                salaryCurrency: jobData.salaryCurrency,
                salaryPeriod: jobData.salaryPeriod,
                salaryDescription: jobData.salaryDescription,
                hideSalary: jobData.hideSalary,

                // Content
                requirements: jobData.requirements?.map(r => typeof r === 'string' ? r : r.text) || [],
                responsibilities: jobData.responsibilities?.map(r => typeof r === 'string' ? r : r.text) || [],
                tags: jobData.tags || [],

                // Config
                applicationForm: jobData.applicationForm,
                hiringMode,
                servicePackage,
                visibility: jobData.visibility,
                stealth: jobData.stealth,
                closeDate: jobData.closeDate,
                termsAccepted: jobData.termsAccepted,
                termsAcceptedAt: jobData.termsAccepted ? new Date() : undefined,
                status: 'DRAFT', // Explicitly set as DRAFT initially
            };

            // Create the job first
            const createResponse = await import('@/shared/lib/jobService').then(m => m.jobService.createJob(payload));

            if (createResponse.success && createResponse.data) {
                const job = (createResponse.data as { job?: { id: string }; id?: string }).job ?? createResponse.data;
                const newJobId = (job as { id?: string }).id ?? (createResponse.data as { id?: string }).id;

                if (!newJobId) {
                    throw new Error('Failed to get job ID');
                }

                // Now publish the job (this will change status from DRAFT to OPEN)
                const publishResponse = await import('@/shared/lib/jobService').then(m => m.jobService.publishJob(newJobId));

                if (!publishResponse.success) {
                    const status = publishResponse.status;
                    const errorMsg = (publishResponse as any).error || 'Failed to publish job';

                    if (status === 402) {
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
                            title: 'Insufficient Wallet Balance',
                            description: 'Top up your wallet to use HRM8 managed services.',
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
                await jobService.updateJob(newJobId, { status: 'OPEN' });

                // If user wants to save as template, create it now
                if (saveAsTemplate && templateNameInput) {
                    try {
                        const category = jobData.department || undefined;
                        await jobTemplateService.createFromJob(
                            newJobId,
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

                // Success! Open Job Setup Drawer
                setCreatedJobId(newJobId);
                setCreatedJobTitle(jobData.title || undefined);
                setSetupDrawerOpen(true);
                reset();
                setSaveAsTemplate(false);
                setTemplateNameInput('');
                onOpenChange(false);
            } else {
                throw new Error(createResponse.error || 'Failed to create job');
            }
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

    const renderStepCard = () => {
        const isParsed = (field: string) => parsedFields.includes(field);

        switch (currentStepId) {
            case 'document-upload':
                return (
                    <ChatDocumentUploadCard
                        onFileUpload={async (file) => {
                            setIsUploadingDoc(true);
                            setUploadComplete(false);
                            try {
                                await handleFileUpload(file);
                                setUploadComplete(true);
                                // After parsing, move to next step
                                setTimeout(() => {
                                    nextStep();
                                    setIsUploadingDoc(false);
                                    setUploadComplete(false);
                                }, 1500);
                            } catch (err) {
                                setIsUploadingDoc(false);
                            }
                        }}
                        onSkip={nextStep}
                        isUploading={isUploadingDoc}
                        uploadComplete={uploadComplete}
                    />
                );
            case 'basic-details':
                return (
                    <ChatBasicDetailsCard
                        title={jobData.title || ''}
                        department={jobData.department || ''}
                        onTitleChange={(v) => setJobData({ title: v })}
                        onDepartmentChange={(v) => setJobData({ department: v })}
                        onContinue={nextStep}
                        isParsedTitle={isParsed('title')}
                        isParsedDept={isParsed('department')}
                    />
                );
            case 'location':
                return (
                    <ChatLocationCard
                        location={jobData.location || ''}
                        workArrangement={jobData.workArrangement || 'on-site'}
                        onLocationChange={(v) => setJobData({ location: v })}
                        onWorkArrangementChange={(v) => setJobData({ workArrangement: v })}
                        onContinue={nextStep}
                        isParsed={isParsed('location')}
                    />
                );
            case 'role-details':
                return (
                    <ChatRoleDetailsCard
                        employmentType={jobData.employmentType || 'full-time'}
                        experienceLevel={jobData.experienceLevel || 'mid'}
                        onEmploymentTypeChange={(v) => setJobData({ employmentType: v })}
                        onExperienceLevelChange={(v) => setJobData({ experienceLevel: v })}
                        onContinue={nextStep}
                    />
                );
            case 'vacancies':
                return (
                    <ChatVacanciesCard
                        value={jobData.numberOfVacancies || 1}
                        onChange={(v) => setJobData({ numberOfVacancies: v })}
                        onContinue={nextStep}
                    />
                );
            case 'compensation':
                return (
                    <ChatCompensationCard
                        salaryMin={jobData.salaryMin}
                        salaryMax={jobData.salaryMax}
                        salaryCurrency={jobData.salaryCurrency || 'AUD'}
                        salaryPeriod={jobData.salaryPeriod || 'annual'}
                        hideSalary={jobData.hideSalary || false}
                        onSalaryMinChange={(v) => setJobData({ salaryMin: v })}
                        onSalaryMaxChange={(v) => setJobData({ salaryMax: v })}
                        onCurrencyChange={(v) => setJobData({ salaryCurrency: v })}
                        onPeriodChange={(v) => setJobData({ salaryPeriod: v })}
                        onHideSalaryChange={(v) => setJobData({ hideSalary: v })}
                        onContinue={nextStep}
                        isParsed={isParsed('salaryMin') || isParsed('salaryMax')}
                    />
                );
            case 'description':
                return (
                    <ChatDescriptionCard
                        description={jobData.description || ''}
                        onChange={(v) => setJobData({ description: v })}
                        onContinue={nextStep}
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
                );
            case 'requirements': {
                const reqItems = (jobData.requirements || []).map(r => typeof r === 'string' ? r : r.text);
                return (
                    <ChatListBuilderCard
                        title="Requirements"
                        subtitle="List what candidates need to qualify for this role."
                        items={reqItems}
                        onChange={(items) => setJobData({ requirements: items.map((text, i) => ({ id: `req-${i}`, text, order: i })) })}
                        onContinue={nextStep}
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
                );
            }
            case 'responsibilities': {
                const respItems = (jobData.responsibilities || []).map(r => typeof r === 'string' ? r : r.text);
                return (
                    <ChatListBuilderCard
                        title="Responsibilities"
                        subtitle="Describe the key duties for this position."
                        items={respItems}
                        onChange={(items) => setJobData({ responsibilities: items.map((text, i) => ({ id: `resp-${i}`, text, order: i })) })}
                        onContinue={nextStep}
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
                );
            }
            case 'tags':
                return (
                    <ChatTagsCard
                        tags={jobData.tags || []}
                        onChange={(tags) => setJobData({ tags })}
                        onContinue={nextStep}
                    />
                );
            case 'application-config':
                return (
                    <ChatApplicationConfigCard
                        config={jobData.applicationForm || {
                            id: 'temp-id',
                            name: 'Default Form',
                            questions: [],
                            includeStandardFields: {
                                resume: { included: true, required: true },
                                coverLetter: { included: true, required: false },
                                portfolio: { included: false, required: false },
                                linkedIn: { included: false, required: false },
                                website: { included: false, required: false },
                            }
                        }}
                        onChange={(config) => setJobData({ applicationForm: config })}
                        onContinue={nextStep}
                    />
                );
            case 'screening-questions': {
                const formQuestions = jobData.applicationForm?.questions || [];
                return (
                    <ChatScreeningQuestionsCard
                        questions={formQuestions}
                        onChange={(questions) => setJobData({
                            applicationForm: {
                                ...jobData.applicationForm,
                                id: jobData.applicationForm?.id || 'temp-id',
                                name: jobData.applicationForm?.name || 'Default Form',
                                includeStandardFields: jobData.applicationForm?.includeStandardFields || {
                                    resume: { included: true, required: true },
                                    coverLetter: { included: true, required: false },
                                    portfolio: { included: false, required: false },
                                    linkedIn: { included: false, required: false },
                                    website: { included: false, required: false },
                                },
                                questions: questions.map((q, index) => ({ ...q, order: index })),
                            }
                        })}
                        onContinue={nextStep}
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
                );
            }
            case 'logistics':
                return (
                    <ChatLogisticsCard
                        closeDate={jobData.closeDate}
                        visibility={jobData.visibility || 'public'}
                        stealth={jobData.stealth || false}
                        onCloseDateChange={(v) => setJobData({ closeDate: v })}
                        onVisibilityChange={(v) => setJobData({ visibility: v })}
                        onStealthChange={(v) => setJobData({ stealth: v })}
                        onContinue={nextStep}
                    />
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
                    />
                );
            default:
                // Use placeholder card for any remaining unimplemented steps
                return (
                    <ChatPlaceholderCard
                        stepId={currentStepId}
                        stepTitle={stepTitles[currentStepId] || currentStepId}
                        onContinue={nextStep}
                    />
                );
        }
    };

    const stepMeta: Record<string, { label: string; heading: string; description: string }> = {
        'document-upload':      { label: 'Upload JD',     heading: 'Start with a Job Description',  description: 'Upload an existing JD to auto-fill the form, or skip to start from scratch.' },
        'basic-details':        { label: 'Basics',        heading: 'Job Title & Department',         description: 'The first thing candidates see — make it clear and specific.' },
        'location':             { label: 'Location',      heading: 'Where is this role?',            description: 'Set the work location and arrangement for this position.' },
        'role-details':         { label: 'Role Type',     heading: 'Role Type & Experience',         description: 'Define the employment arrangement and required seniority level.' },
        'vacancies':            { label: 'Vacancies',     heading: 'Open Positions',                 description: 'How many people are you looking to hire for this role?' },
        'compensation':         { label: 'Pay',           heading: 'Compensation Package',           description: 'Transparent salaries attract 30% more applicants.' },
        'description':          { label: 'Description',   heading: 'Write the Job Description',      description: 'A compelling overview of the role, team, and opportunity.' },
        'requirements':         { label: 'Requirements',  heading: 'Requirements',                   description: 'What must candidates have to be considered for this role?' },
        'responsibilities':     { label: 'Duties',        heading: 'Key Responsibilities',           description: 'What will this person be doing on a day-to-day basis?' },
        'tags':                 { label: 'Tags',          heading: 'Skills & Tags',                  description: 'Add keywords to help candidates discover your listing.' },
        'application-config':   { label: 'Application',  heading: 'Application Form',               description: 'Choose what information to collect from applicants.' },
        'screening-questions':  { label: 'Screening',    heading: 'Screening Questions',             description: 'Pre-screen applicants automatically with targeted questions.' },
        'logistics':            { label: 'Logistics',     heading: 'Closing Date & Visibility',      description: 'Control when the role closes and who can see it.' },
        'review':               { label: 'Review',        heading: 'Final Review',                   description: 'Double-check everything before publishing.' },
        'payment':              { label: 'Payment',       heading: 'Complete Payment',               description: 'Activate your service to reach the right candidates.' },
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
                                {WIZARD_STEPS.filter(s => s !== 'payment').map((stepId, index) => {
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
                            {currentStepId !== 'document-upload' && currentStepId !== 'review' && (
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

            <JobSetupDrawer
                open={setupDrawerOpen}
                onOpenChange={(open, meta) => {
                    setSetupDrawerOpen(open);
                    if (!open) {
                        if (meta?.reason === 'managed-checkout') {
                            return;
                        }
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
