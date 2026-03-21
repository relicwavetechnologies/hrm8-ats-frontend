import React from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { cn } from '@/shared/lib/utils';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';

interface ChatBasicDetailsCardProps {
    title: string;
    department: string;
    distributionScope: 'HRM8_ONLY' | 'GLOBAL';
    serviceType?: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | 'rpo';
    onTitleChange: (title: string) => void;
    onDepartmentChange: (department: string) => void;
    onDistributionScopeChange: (scope: 'HRM8_ONLY' | 'GLOBAL') => void;
    onContinue: () => void;
    showContinue?: boolean;
    isParsedTitle?: boolean;
    isParsedDept?: boolean;
}

export const ChatBasicDetailsCard: React.FC<ChatBasicDetailsCardProps> = ({
    title,
    department,
    distributionScope,
    serviceType,
    onTitleChange,
    onDepartmentChange,
    onDistributionScopeChange,
    onContinue,
    showContinue = true,
    isParsedTitle,
    isParsedDept
}) => {
    const canContinue = title.trim().length >= 3;
    const isSelfManaged = serviceType === 'self-managed' || serviceType === 'rpo';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
            {/* Job Title */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="job-title" className="text-sm font-semibold">
                        Job Title <span className="text-destructive">*</span>
                    </Label>
                    {isParsedTitle && (
                        <Badge variant="outline" className="text-[10px] gap-1 text-green-600 border-green-500/40 bg-green-50 dark:bg-green-950/30">
                            <Sparkles className="h-2.5 w-2.5" />
                            Auto-filled from JD
                        </Badge>
                    )}
                </div>
                <Input
                    id="job-title"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className={cn(
                        "text-base h-11 rounded-lg transition-all",
                        isParsedTitle && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20",
                        canContinue && !isParsedTitle && "border-primary/40"
                    )}
                    autoFocus
                />
                <p className="text-xs text-muted-foreground">
                    Be specific — e.g. "Senior Backend Engineer" beats "Engineer"
                </p>
            </div>

            {/* Department */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="department" className="text-sm font-semibold">
                        Department
                    </Label>
                    {isParsedDept && (
                        <Badge variant="outline" className="text-[10px] gap-1 text-green-600 border-green-500/40 bg-green-50 dark:bg-green-950/30">
                            <Sparkles className="h-2.5 w-2.5" />
                            Auto-filled from JD
                        </Badge>
                    )}
                </div>
                <Input
                    id="department"
                    value={department}
                    onChange={(e) => onDepartmentChange(e.target.value)}
                    placeholder="e.g., Engineering, Marketing, Sales"
                    className={cn(
                        "text-base h-11 rounded-lg transition-all",
                        isParsedDept && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                    )}
                />
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-semibold">
                    Where should this job be published?
                </Label>
                <RadioGroup
                    value={distributionScope}
                    onValueChange={(v) => onDistributionScopeChange(v as 'HRM8_ONLY' | 'GLOBAL')}
                    className="grid gap-2"
                >
                    <label className={cn("flex items-start gap-3 rounded-md border p-3 cursor-pointer", distributionScope === 'HRM8_ONLY' && "border-primary bg-primary/5")}>
                        <RadioGroupItem value="HRM8_ONLY" className="mt-0.5" />
                        <div>
                            <p className="text-sm font-medium">HRM8 only</p>
                            <p className="text-xs text-muted-foreground">Publish internally on HRM8 and your careers page.</p>
                        </div>
                    </label>
                    <label className={cn("flex items-start gap-3 rounded-md border p-3 cursor-pointer", distributionScope === 'GLOBAL' && "border-primary bg-primary/5")}>
                        <RadioGroupItem value="GLOBAL" className="mt-0.5" />
                        <div>
                            <p className="text-sm font-medium">Publish globally through JobTarget</p>
                            <p className="text-xs text-muted-foreground">Publish first, then configure channels, budget, and launch JobTarget in the post-publish flow.</p>
                        </div>
                    </label>
                </RadioGroup>
                {distributionScope === 'GLOBAL' && (
                    <p className="text-xs text-muted-foreground">
                        {isSelfManaged
                            ? 'GLOBAL + self-managed: customer manages hiring and finishes external promotion after publish.'
                            : 'GLOBAL + HRM8 service: HRM8 manages hiring and user approval is required before the post-publish distribution handoff.'}
                    </p>
                )}
            </div>

            {showContinue && (
                <Button
                    onClick={onContinue}
                    disabled={!canContinue}
                    className="w-full h-11 font-semibold rounded-lg"
                >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    );
};
