import React from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { ChevronRight } from 'lucide-react';

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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
            <div className="space-y-2">
                <Label htmlFor="job-title" className="text-base font-semibold">
                    Job Title <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                    <Input
                        id="job-title"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="e.g., Senior Software Engineer"
                        className={cn(
                            "text-lg h-14 px-4 rounded-xl transition-all",
                            isParsedTitle && "border-green-500/50 bg-green-50 dark:bg-green-950/20"
                        )}
                        autoFocus
                    />
                    {isParsedTitle && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-green-600 font-bold">
                            From JD
                        </span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground pl-1">
                    Enter a clear, specific title. This is what candidates will see first!
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="department" className="text-base font-semibold">
                    Department
                </Label>
                <div className="relative">
                    <Input
                        id="department"
                        value={department}
                        onChange={(e) => onDepartmentChange(e.target.value)}
                        placeholder="e.g., Engineering, Marketing, Sales"
                        className={cn(
                            "text-base h-12 px-4 rounded-xl transition-all",
                            isParsedDept && "border-green-500/50 bg-green-50 dark:bg-green-950/20"
                        )}
                    />
                    {isParsedDept && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-green-600 font-bold">
                            From JD
                        </span>
                    )}
                </div>
            </div>

            <Button
                onClick={onContinue}
                disabled={!canContinue}
                className="w-full h-12 text-base rounded-xl font-semibold transition-all"
            >
                Continue <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
        </div>
    );
};
