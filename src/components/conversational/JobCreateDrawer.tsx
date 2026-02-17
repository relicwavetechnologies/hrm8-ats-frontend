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
                const res = await jobService.saveDraft(jobId, payload);
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
                        await jobService.saveDraft(newId, { ...payload, draftStep: payload.draftStep });
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
                // Map requirements/responsibilities objects to string arrays if needed, 
                // but our backend service expects them as arrays. JobFormData has object array with IDs.
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
            };

            const response = await import('@/shared/lib/jobService').then(m => m.jobService.createJob(payload));

            if (response.success && response.data) {
                const job = (response.data as { job?: { id: string }; id?: string }).job ?? response.data;
                const newJobId = (job as { id?: string }).id ?? (response.data as { id?: string }).id;
                if (!newJobId) {
                    throw new Error('Failed to create job ID');
                }

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

                // Open setup only after job is published and OPEN.
                setCreatedJobId(newJobId);
                setCreatedJobTitle(jobData.title || undefined);
                setSetupDrawerOpen(true);
                reset();
                onOpenChange(false);
            } else {
                throw new Error(response.error || 'Failed to create job');
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

    return (
        <>
        <Drawer open={open} onOpenChange={(nextOpen) => { if (!nextOpen) handleRequestClose(); else onOpenChange(nextOpen); }}>
            <DrawerContent className="h-[95vh] rounded-t-[32px] border-none bg-background shadow-2xl flex flex-col overflow-hidden">
                <DrawerHeader className="border-b px-6 py-4 bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DrawerTitle className="text-xl font-bold tracking-tight">Smart Job Wizard</DrawerTitle>
                            <DrawerDescription className="text-sm text-muted-foreground font-medium">AI-guided job creation</DrawerDescription>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleRequestClose} className="rounded-full hover:bg-muted">
                        <X className="h-5 w-5" />
                    </Button>
                </DrawerHeader>

                <div className="flex-1 flex overflow-hidden">
                    {/* Wizard Step Section - Card Based */}
                    <div className="flex-1 flex flex-col min-w-0 bg-muted/30">
                        <ScrollArea className="flex-1 p-8" ref={scrollRef}>
                            <div className="max-w-2xl mx-auto pb-12">
                                {/* Step Card: rendered based on currentStepId */}
                                {renderStepCard()}
                            </div>
                        </ScrollArea>

                        {/* Back button for non-first steps */}
                        {currentStepId !== 'document-upload' && (
                            <div className="p-4 bg-background border-t flex justify-between items-center">
                                <Button variant="ghost" onClick={prevStep} className="gap-2">
                                    <ChevronRight className="h-4 w-4 rotate-180" />
                                    Back
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Step {WIZARD_STEPS.indexOf(currentStepId) + 1} of {WIZARD_STEPS.length}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Live Preview Section */}
                    <div className="w-[450px] border-l bg-white hidden lg:flex flex-col min-h-0">
                        <div className="p-4 border-b bg-muted/10 flex items-center justify-between">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Live Job Preview</h3>
                            <div className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">LIVE UPDATE</div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
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
            onOpenChange={(open) => {
                setSetupDrawerOpen(open);
                if (!open) {
                    setCreatedJobId(null);
                    setCreatedJobTitle(undefined);
                    window.location.reload();
                }
            }}
            jobId={createdJobId}
            jobTitle={createdJobTitle}
        />
        </>
    );
};
