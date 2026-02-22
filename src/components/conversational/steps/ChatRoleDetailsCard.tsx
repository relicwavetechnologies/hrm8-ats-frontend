import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import { ChevronRight, Clock, GraduationCap, Briefcase } from 'lucide-react';

interface ChatRoleDetailsCardProps {
    employmentType: 'full-time' | 'part-time' | 'contract' | 'casual';
    experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
    onEmploymentTypeChange: (value: 'full-time' | 'part-time' | 'contract' | 'casual') => void;
    onExperienceLevelChange: (value: 'entry' | 'mid' | 'senior' | 'executive') => void;
    onContinue: () => void;
}

const employmentTypes: { value: 'full-time' | 'part-time' | 'contract' | 'casual'; label: string; description: string }[] = [
    { value: 'full-time',  label: 'Full-Time',  description: 'Permanent role' },
    { value: 'part-time',  label: 'Part-Time',  description: 'Reduced hours' },
    { value: 'contract',   label: 'Contract',   description: 'Fixed term' },
    { value: 'casual',     label: 'Casual',     description: 'Flexible shifts' },
];

const experienceLevels: { value: 'entry' | 'mid' | 'senior' | 'executive'; label: string; years: string; description: string }[] = [
    { value: 'entry',     label: 'Entry',     years: '0 – 2 yrs',  description: 'Junior or graduate level' },
    { value: 'mid',       label: 'Mid',       years: '3 – 5 yrs',  description: 'Independent contributor' },
    { value: 'senior',    label: 'Senior',    years: '6+ yrs',     description: 'Technical or team lead' },
    { value: 'executive', label: 'Executive', years: '10+ yrs',    description: 'Director / C-suite level' },
];

export const ChatRoleDetailsCard: React.FC<ChatRoleDetailsCardProps> = ({
    employmentType,
    experienceLevel,
    onEmploymentTypeChange,
    onExperienceLevelChange,
    onContinue,
}) => {
    return (
        <div className="space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-400">
            {/* Employment Type */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                    Employment Type
                </Label>
                <div className="grid grid-cols-2 gap-2.5">
                    {employmentTypes.map((type) => {
                        const isSelected = employmentType === type.value;
                        return (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => onEmploymentTypeChange(type.value)}
                                className={cn(
                                    "flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-150",
                                    isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/30 bg-background"
                                )}
                            >
                                <div className={cn(
                                    "w-4 h-4 rounded-full border-2 mt-0.5 transition-colors shrink-0",
                                    isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                                )}>
                                    {isSelected && <div className="w-full h-full rounded-full bg-primary-foreground scale-50" />}
                                </div>
                                <div>
                                    <p className={cn("text-sm font-semibold", isSelected && "text-primary")}>{type.label}</p>
                                    <p className="text-xs text-muted-foreground">{type.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-primary" />
                    Experience Level
                </Label>
                <div className="grid grid-cols-2 gap-2.5">
                    {experienceLevels.map((level) => {
                        const isSelected = experienceLevel === level.value;
                        return (
                            <button
                                key={level.value}
                                type="button"
                                onClick={() => onExperienceLevelChange(level.value)}
                                className={cn(
                                    "flex flex-col gap-1 p-3.5 rounded-xl border-2 text-left transition-all duration-150",
                                    isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/30 bg-background"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={cn("font-semibold text-sm", isSelected && "text-primary")}>{level.label}</span>
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                        isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                    )}>
                                        {level.years}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground leading-tight">{level.description}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <Button
                onClick={onContinue}
                className="w-full h-11 font-semibold rounded-lg"
            >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
    );
};
