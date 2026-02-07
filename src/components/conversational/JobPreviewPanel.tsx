import React from 'react';
import { JobFormData } from '@/shared/types/job';
import { Building2, MapPin, Clock, DollarSign, Users, Briefcase, FileText } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';

interface JobPreviewPanelProps {
    jobData: Partial<JobFormData>;
}

export const JobPreviewPanel: React.FC<JobPreviewPanelProps> = ({ jobData }) => {
    return (
        <div className="p-8 space-y-8 max-w-2xl mx-auto">
            {/* Header Info */}
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {jobData.title || <span className="text-muted-foreground/30 italic">Untilted Role</span>}
                </h1>

                <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4 text-primary/60" />
                        <span className="font-medium">{jobData.department || "No department selected"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary/60" />
                        <span className="font-medium">{jobData.location || "Remote / No location"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4 text-primary/60" />
                        <span className="font-medium">{jobData.numberOfVacancies || 1} Vacancy</span>
                    </div>
                </div>
            </div>

            <Separator className="opacity-50" />

            {/* Badges / Quick Info */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-muted/30 border border-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Role Type</span>
                    </div>
                    <p className="font-semibold capitalize">{jobData.employmentType || "Not specified"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Level</span>
                    </div>
                    <p className="font-semibold capitalize">{jobData.experienceLevel || "Not specified"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-muted/50 col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Compensation</span>
                    </div>
                    <p className="font-semibold">
                        {jobData.salaryMin ? `${jobData.salaryCurrency || '$'}${jobData.salaryMin} - ${jobData.salaryMax}` : "Salary not yet defined"}
                    </p>
                </div>
            </div>

            {/* Description Preview */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold tracking-tight">Role Description</h2>
                </div>
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                    {jobData.description ? (
                        <div dangerouslySetInnerHTML={{ __html: jobData.description }} />
                    ) : (
                        <div className="bg-muted/20 rounded-xl p-8 border border-dashed text-center">
                            <p className="text-muted-foreground italic">Your professional job description will appear here as you write it...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tags */}
            {jobData.tags && jobData.tags.length > 0 && (
                <div className="pt-4">
                    <div className="flex flex-wrap gap-2">
                        {jobData.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="px-3 py-1 rounded-full">{tag}</Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
