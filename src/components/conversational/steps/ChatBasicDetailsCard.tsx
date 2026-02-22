import React from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';

interface ChatBasicDetailsCardProps {
    title: string;
    department: string;
    onTitleChange: (title: string) => void;
    onDepartmentChange: (department: string) => void;
    onContinue: () => void;
    isParsedTitle?: boolean;
    isParsedDept?: boolean;
}

export const ChatBasicDetailsCard: React.FC<ChatBasicDetailsCardProps> = ({
    title,
    department,
    onTitleChange,
    onDepartmentChange,
    onContinue,
    isParsedTitle,
    isParsedDept
}) => {
    const canContinue = title.trim().length >= 3;

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

            <Button
                onClick={onContinue}
                disabled={!canContinue}
                className="w-full h-11 font-semibold rounded-lg"
            >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
    );
};
