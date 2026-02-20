import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { CheckCircle2, Edit2, Send, MapPin, Briefcase, DollarSign, Users, FileText, FileCheck } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";
import { JobFormData } from '@/shared/types/job';

interface ChatReviewCardProps {
    jobData: Partial<JobFormData>;
    onEdit: (stepId: string) => void;
    onSubmit: () => void;
    isSubmitting?: boolean;
    termsAccepted?: boolean;
    onTermsAcceptedChange?: (accepted: boolean) => void;
    saveAsTemplate?: boolean;
    onSaveAsTemplateChange?: (checked: boolean) => void;
}

export const ChatReviewCard: React.FC<ChatReviewCardProps> = ({
    jobData,
    onEdit,
    onSubmit,
    isSubmitting,
    termsAccepted,
    onTermsAcceptedChange,
    saveAsTemplate,
    onSaveAsTemplateChange,
}) => {
    const sections = [
        {
            id: 'basic-details',
            title: 'Basic Information',
            icon: Briefcase,
            items: [
                { label: 'Title', value: jobData.title },
                { label: 'Department', value: jobData.department },
                { label: 'Employment Type', value: jobData.employmentType },
                { label: 'Experience Level', value: jobData.experienceLevel },
            ],
        },
        {
            id: 'location',
            title: 'Location',
            icon: MapPin,
            items: [
                { label: 'Location', value: jobData.location },
                { label: 'Work Arrangement', value: jobData.workArrangement },
            ],
        },
        {
            id: 'compensation',
            title: 'Compensation',
            icon: DollarSign,
            items: [
                {
                    label: 'Salary Range',
                    value: jobData.salaryMin && jobData.salaryMax
                        ? `${jobData.salaryCurrency || '$'} ${jobData.salaryMin?.toLocaleString()} - ${jobData.salaryMax?.toLocaleString()} ${jobData.salaryPeriod || 'annual'}`
                        : jobData.hideSalary ? 'Hidden from candidates' : 'Not specified',
                },
            ],
        },
        {
            id: 'description',
            title: 'Description',
            icon: FileText,
            items: [
                { label: 'Description', value: jobData.description ? `${jobData.description.slice(0, 100)}...` : 'Not provided' },
                { label: 'Requirements', value: `${jobData.requirements?.length || 0} items` },
                { label: 'Responsibilities', value: `${jobData.responsibilities?.length || 0} items` },
            ],
        },
        {
            id: 'vacancies',
            title: 'Positions',
            icon: Users,
            items: [
                { label: 'Number of Vacancies', value: jobData.numberOfVacancies?.toString() || '1' },
            ],
        },
    ];

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-foreground" />
                </div>
                <div>
                    <h3 className="text-base font-semibold">Review Job Post</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">
                        Double-check everything before publishing.
                    </p>
                </div>
            </div>

            <div className="space-y-2.5">
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <Card key={section.id} className="p-3 rounded-md shadow-none border">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-medium text-xs">{section.title}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[11px] gap-1"
                                    onClick={() => onEdit(section.id)}
                                >
                                    <Edit2 className="h-3 w-3" /> Edit
                                </Button>
                            </div>
                            <div className="space-y-1.5">
                                {section.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-xs gap-2">
                                        <span className="text-muted-foreground">{item.label}</span>
                                        <span className="font-medium text-right">{item.value || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Card className="p-3 bg-muted/20 border rounded-md shadow-none">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-muted border flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-foreground" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">Ready to publish?</p>
                        <p className="text-xs text-muted-foreground">
                            Your job will be visible based on your visibility settings.
                        </p>
                    </div>
                </div>
            </Card>

            <div className="space-y-4">
                <div className="flex items-start gap-2.5 px-0.5">
                    <Checkbox
                        id="terms"
                        className="mt-0.5"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => onTermsAcceptedChange?.(checked === true)}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <label
                            htmlFor="terms"
                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            I accept the Terms and Conditions
                        </label>
                        <div className="text-xs text-muted-foreground">
                            By publishing this job, you agree to our{' '}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" className="underline text-primary hover:text-primary/80 font-medium h-auto p-0 text-xs">Terms of Service</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <FileCheck className="h-5 w-5 text-primary" />
                                            HRM8 Terms & Conditions
                                        </DialogTitle>
                                        <DialogDescription>
                                            Please review our policies for job postings.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex-1 overflow-y-auto pr-4 mt-2 border rounded-md p-4 bg-muted/30">
                                        <div className="space-y-4 text-sm text-foreground/80">
                                            <h4 className="font-bold text-foreground">1. Job Posting Accuracy</h4>
                                            <p>By posting a job on HRM8, you agree to provide accurate, truthful, and up-to-date information about the role, company, and compensation. Misleading postings may be removed without refund.</p>

                                            <h4 className="font-bold text-foreground">2. Compliance with Laws</h4>
                                            <p>You confirm that your job posting complies with all applicable employment laws and regulations in your jurisdiction, including but not limited to minimum wage laws, anti-discrimination laws, and privacy regulations.</p>

                                            <h4 className="font-bold text-foreground">3. Prohibited Content</h4>
                                            <p>Job postings must not contain:</p>
                                            <ul className="list-disc list-inside pl-2 space-y-1">
                                                <li>Discriminatory language or requirements based on race, gender, religion, age, or disability.</li>
                                                <li>Content unrelated to the specific job opportunity.</li>
                                                <li>Requests for direct payments from candidates.</li>
                                                <li>Links to competitor platforms or malicious sites.</li>
                                            </ul>

                                            <h4 className="font-bold text-foreground">4. Fees & Payments</h4>
                                            <p>For paid services (e.g., Sponsored Posts, Shortlisting Services), you agree to pay all applicable fees. Fees are non-refundable once the service has commenced or the job has been published to external boards.</p>

                                            <h4 className="font-bold text-foreground">5. Data Privacy</h4>
                                            <p>You agree to handle all candidate data collected through HRM8 in accordance with our Privacy Policy and applicable data protection laws (e.g., GDPR, CCPA). Candidate data should only be used for recruitment purposes.</p>

                                            <h4 className="font-bold text-foreground">6. External Job Boards</h4>
                                            <p>If you opt for external distribution (e.g., LinkedIn, Indeed), you acknowledge that these platforms have their own review processes and timelines. HRM8 is not responsible for delays or rejections by third-party boards.</p>

                                            <h4 className="font-bold text-foreground">7. Right to Remove</h4>
                                            <p>HRM8 reserves the right to remove any job posting that violates these terms or our community guidelines at any time, with or without prior notice.</p>
                                        </div>
                                    </div>
                                    <div className="pt-2 text-xs text-muted-foreground text-center">
                                        Last updated: January 2025
                                    </div>
                                </DialogContent>
                            </Dialog>
                            {' '}and Privacy Policy.
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-2.5 px-0.5">
                    <Checkbox
                        id="save-template"
                        className="mt-0.5"
                        checked={saveAsTemplate}
                        onCheckedChange={(checked) => onSaveAsTemplateChange?.(checked === true)}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <label
                            htmlFor="save-template"
                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            Save this job as a template
                        </label>
                        <div className="text-xs text-muted-foreground">
                            When publishing, you'll be asked to provide a template name for reuse.
                        </div>
                    </div>
                </div>
            </div>

            <Button
                onClick={onSubmit}
                disabled={isSubmitting || !termsAccepted}
                className="w-full h-10 text-sm rounded-md font-medium gap-1.5"
            >
                {isSubmitting ? 'Publishing...' : 'Publish Job'}
                <Send className="h-4 w-4" />
            </Button>
        </div >
    );
};
