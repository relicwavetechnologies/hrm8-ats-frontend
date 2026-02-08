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
import { Sparkles, X, ChevronRight } from 'lucide-react';
import { useJobCreateStore, WizardStepId, WIZARD_STEPS } from '@/modules/jobs/store/useJobCreateStore';
import { JobFormData } from '@/shared/types/job';
import { JobPreviewPanel } from '@/components/conversational/JobPreviewPanel';
import { JobSetupDrawer } from '@/components/setup/JobSetupDrawer';
import { useJobConversation } from './useJobConversation';
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
    ChatHiringTeamCard,
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
}

export const JobCreateDrawer: React.FC<JobCreateDrawerProps> = ({ open, onOpenChange, jobId, initialData }) => {
    const { currentStepId, jobData, nextStep, prevStep, jumpToStep, loadJobData, reset, setJobData, parsedFields } = useJobCreateStore();
    const { handleFileUpload } = useJobConversation();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [setupDrawerOpen, setSetupDrawerOpen] = useState(false);
    const [createdJobId, setCreatedJobId] = useState<string | null>(null);
    const [createdJobTitle, setCreatedJobTitle] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (open && initialData) {
            loadJobData(initialData);
        } else if (open && !jobId) {
            reset();
        }
    }, [open, initialData, jobId, loadJobData, reset]);

    // Auto-skip logic removed based on user feedback to allow editing of pre-filled fields.
    // The user can now review the parsed data and click "Continue".
    // useEffect(() => { ... }, []);

    const handleSubmitJob = async () => {
        setIsSubmitting(true);
        try {
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
                // Hiring Mode defaults
                hiringMode: 'SELF_MANAGED',
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

                // Handle Hiring Team Invites if any (role + optional roles[] for per-job roles)
                if (jobData.hiringTeam && jobData.hiringTeam.length > 0) {
                    await Promise.all(jobData.hiringTeam.map(member =>
                        import('@/shared/lib/jobService').then(m => m.jobService.inviteTeamMember(newJobId, {
                            email: member.email,
                            name: member.name,
                            role: member.role,
                            ...(member.roles?.length ? { roles: member.roles } : {}),
                        }))
                    ));
                }

                // Open Post-Job Setup drawer (production-grade flow)
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
            // Show error toast?
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
            case 'service-type':
                return (
                    <ChatServiceTypeCard
                        currentValue={jobData.serviceType}
                        onSelect={(val) => {
                            setJobData({ serviceType: val });
                            nextStep();
                        }}
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
                    />
                );
            case 'requirements':
                return (
                    <ChatListBuilderCard
                        title="Requirements"
                        subtitle="List what candidates need to qualify for this role."
                        items={(jobData.requirements || []).map(r => typeof r === 'string' ? r : r.text)}
                        onChange={(items) => setJobData({ requirements: items.map((text, i) => ({ id: `req-${i}`, text, order: i })) })}
                        onContinue={nextStep}
                        isParsed={isParsed('requirements')}
                        placeholder="e.g. 3+ years of experience in..."
                        minItems={1}
                    />
                );
            case 'responsibilities':
                return (
                    <ChatListBuilderCard
                        title="Responsibilities"
                        subtitle="Describe the key duties for this position."
                        items={(jobData.responsibilities || []).map(r => typeof r === 'string' ? r : r.text)}
                        onChange={(items) => setJobData({ responsibilities: items.map((text, i) => ({ id: `resp-${i}`, text, order: i })) })}
                        onContinue={nextStep}
                        isParsed={isParsed('responsibilities')}
                        placeholder="e.g. Lead a team of 5 engineers..."
                        minItems={1}
                    />
                );
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
            case 'screening-questions':
                return (
                    <ChatScreeningQuestionsCard
                        questions={(jobData.applicationForm?.questions || []).map(q => ({ id: q.id, text: q.label }))}
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
                                questions: questions.map((q, index) => ({
                                    id: q.id,
                                    label: q.text,
                                    type: 'short_text',
                                    required: true,
                                    order: index
                                }))
                            }
                        })}
                        onContinue={nextStep}
                    />
                );
            case 'hiring-team':
                return (
                    <ChatHiringTeamCard
                        teamMembers={jobData.hiringTeam || []}
                        onChange={(members) => setJobData({ hiringTeam: members })}
                        onContinue={nextStep}
                    />
                );
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
        <Drawer open={open} onOpenChange={onOpenChange}>
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
                    <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full hover:bg-muted">
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
                    <div className="w-[450px] border-l bg-white hidden lg:block flex flex-col min-h-0">
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
