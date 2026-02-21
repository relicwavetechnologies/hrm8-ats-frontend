import React from 'react';
import { JobFormData } from '@/shared/types/job';
import { Building2, MapPin, Users, Briefcase, Clock, DollarSign, FileText, Tag } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';

interface JobPreviewPanelProps {
    jobData: Partial<JobFormData>;
}

export const JobPreviewPanel: React.FC<JobPreviewPanelProps> = ({ jobData }) => {
    const hasSalary = jobData.salaryMin || jobData.salaryMax;
    const salaryStr = hasSalary
        ? `${jobData.salaryCurrency || 'USD'} ${jobData.salaryMin?.toLocaleString() ?? '—'} – ${jobData.salaryMax?.toLocaleString() ?? '—'} / ${jobData.salaryPeriod || 'yr'}`
        : null;

    return (
        <div className="p-6 space-y-6">
            {/* Title */}
            <div className="space-y-1">
                {jobData.title ? (
                    <h1 className="text-xl font-bold tracking-tight text-foreground leading-tight">{jobData.title}</h1>
                ) : (
                    <div className="h-6 w-48 rounded bg-muted/60 animate-pulse" />
                )}

                {/* Meta pills */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {jobData.department && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                            {jobData.department}
                        </span>
                    )}
                    {(jobData.location || jobData.workArrangement) && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                            {jobData.workArrangement === 'remote' ? 'Remote' : jobData.location || 'No location'}
                        </span>
                    )}
                    {jobData.numberOfVacancies && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                            {jobData.numberOfVacancies} {jobData.numberOfVacancies === 1 ? 'vacancy' : 'vacancies'}
                        </span>
                    )}
                </div>
            </div>

            <Separator className="opacity-40" />

            {/* Quick info chips */}
            <div className="flex flex-wrap gap-2">
                {jobData.employmentType && (
                    <Badge variant="secondary" className="gap-1.5 rounded-full text-xs font-medium">
                        <Briefcase className="h-3 w-3" />
                        {jobData.employmentType.replace('-', ' ')}
                    </Badge>
                )}
                {jobData.experienceLevel && (
                    <Badge variant="secondary" className="gap-1.5 rounded-full text-xs font-medium">
                        <Clock className="h-3 w-3" />
                        {jobData.experienceLevel}
                    </Badge>
                )}
                {jobData.workArrangement && (
                    <Badge variant="outline" className="rounded-full text-xs font-medium capitalize">
                        {jobData.workArrangement.replace('-', ' ')}
                    </Badge>
                )}
                {jobData.hideSalary ? (
                    <Badge variant="outline" className="rounded-full text-xs font-medium text-muted-foreground">
                        Salary Confidential
                    </Badge>
                ) : salaryStr ? (
                    <Badge variant="outline" className="gap-1.5 rounded-full text-xs font-medium">
                        <DollarSign className="h-3 w-3" />
                        {salaryStr}
                    </Badge>
                ) : null}
            </div>

            {/* Description preview */}
            {jobData.description ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-primary/70" />
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</span>
                    </div>
                    <div
                        className="text-xs text-muted-foreground leading-relaxed line-clamp-8 prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: jobData.description }}
                    />
                </div>
            ) : (
                <div className="rounded-xl border-2 border-dashed border-muted p-6 text-center space-y-1.5">
                    <FileText className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                    <p className="text-xs text-muted-foreground/60 italic">
                        Description will appear here as you write
                    </p>
                </div>
            )}

            {/* Tags */}
            {jobData.tags && jobData.tags.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-primary/70" />
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {jobData.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs rounded-full px-2.5 py-0.5">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Placeholder state when no data yet */}
            {!jobData.title && !jobData.description && (
                <div className="pt-4 text-center">
                    <p className="text-xs text-muted-foreground/50 italic">
                        Your job preview will build as you fill in the steps.
                    </p>
                </div>
            )}
        </div>
    );
};
