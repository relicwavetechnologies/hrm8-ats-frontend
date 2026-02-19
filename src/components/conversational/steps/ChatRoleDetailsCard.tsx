import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import { ChevronRight, Briefcase, GraduationCap } from 'lucide-react';

interface ChatRoleDetailsCardProps {
    employmentType: 'full-time' | 'part-time' | 'contract' | 'casual';
    experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
    onEmploymentTypeChange: (value: 'full-time' | 'part-time' | 'contract' | 'casual') => void;
    onExperienceLevelChange: (value: 'entry' | 'mid' | 'senior' | 'executive') => void;
    onContinue: () => void;
}

const employmentTypes = [
    { value: 'full-time' as const, label: 'Full-Time' },
    { value: 'part-time' as const, label: 'Part-Time' },
    { value: 'contract' as const, label: 'Contract' },
    { value: 'casual' as const, label: 'Casual' },
];

const experienceLevels = [
    { value: 'entry' as const, label: 'Entry Level', description: '0-2 years' },
    { value: 'mid' as const, label: 'Mid Level', description: '3-5 years' },
    { value: 'senior' as const, label: 'Senior', description: '6+ years' },
    { value: 'executive' as const, label: 'Executive', description: 'Leadership' },
];

export const ChatRoleDetailsCard: React.FC<ChatRoleDetailsCardProps> = ({
    employmentType,
    experienceLevel,
    onEmploymentTypeChange,
    onExperienceLevelChange,
    onContinue,
}) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
            {/* Employment Type */}
            <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Employment Type
                </Label>
                <div className="grid grid-cols-4 gap-2">
                    {employmentTypes.map((type) => (
                        <Button
                            key={type.value}
                            type="button"
                            variant="ghost"
                            onClick={() => onEmploymentTypeChange(type.value)}
                            className={cn(
                                "py-3 px-2 h-auto rounded-xl text-sm font-medium border-2 transition-all duration-200",
                                employmentType === type.value
                                    ? "border-primary bg-primary/10 text-primary hover:bg-primary/10"
                                    : "border-muted hover:border-primary/30"
                            )}
                        >
                            {type.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Experience Level
                </Label>
                <div className="grid grid-cols-2 gap-3">
                    {experienceLevels.map((level) => (
                        <Button
                            key={level.value}
                            type="button"
                            variant="ghost"
                            onClick={() => onExperienceLevelChange(level.value)}
                            className={cn(
                                "py-4 px-4 h-auto rounded-xl text-left border-2 transition-all duration-200 flex-col items-start",
                                experienceLevel === level.value
                                    ? "border-primary bg-primary/10 hover:bg-primary/10"
                                    : "border-muted hover:border-primary/30"
                            )}
                        >
                            <span className="font-semibold text-sm block">{level.label}</span>
                            <span className="text-xs text-muted-foreground">{level.description}</span>
                        </Button>
                    ))}
                </div>
            </div>

            <Button
                onClick={onContinue}
                className="w-full h-12 text-base rounded-xl font-semibold transition-all"
            >
                Continue <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
        </div>
    );
};
