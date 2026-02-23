import React from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { cn } from '@/shared/lib/utils';
import {
    ChevronRight, Sparkles, MapPin, Building2, Home, ArrowLeftRight,
    Briefcase, GraduationCap, Users, Minus, Plus,
} from 'lucide-react';
import { LocationAutocomplete } from '../LocationAutocomplete';

interface ChatJobOverviewCardProps {
    // Basic details
    title: string;
    department: string;
    onTitleChange: (v: string) => void;
    onDepartmentChange: (v: string) => void;
    isParsedTitle?: boolean;
    isParsedDept?: boolean;

    // Location
    location: string;
    workArrangement: 'on-site' | 'remote' | 'hybrid';
    onLocationChange: (v: string) => void;
    onWorkArrangementChange: (v: 'on-site' | 'remote' | 'hybrid') => void;
    isParsedLocation?: boolean;

    // Role details
    employmentType: 'full-time' | 'part-time' | 'contract' | 'casual';
    experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
    onEmploymentTypeChange: (v: 'full-time' | 'part-time' | 'contract' | 'casual') => void;
    onExperienceLevelChange: (v: 'entry' | 'mid' | 'senior' | 'executive') => void;

    // Vacancies
    numberOfVacancies: number;
    onNumberOfVacanciesChange: (v: number) => void;

    onContinue: () => void;
}

const workArrangements = [
    { value: 'on-site' as const, label: 'On-Site', icon: Building2 },
    { value: 'hybrid' as const, label: 'Hybrid', icon: ArrowLeftRight },
    { value: 'remote' as const, label: 'Remote', icon: Home },
];

const employmentTypes = [
    { value: 'full-time' as const, label: 'Full-Time', description: 'Permanent role' },
    { value: 'part-time' as const, label: 'Part-Time', description: 'Reduced hours' },
    { value: 'contract' as const, label: 'Contract', description: 'Fixed term' },
    { value: 'casual' as const, label: 'Casual', description: 'Flexible shifts' },
];

const experienceLevels = [
    { value: 'entry' as const, label: 'Entry', years: '0–2 yrs' },
    { value: 'mid' as const, label: 'Mid', years: '3–5 yrs' },
    { value: 'senior' as const, label: 'Senior', years: '6+ yrs' },
    { value: 'executive' as const, label: 'Executive', years: '10+ yrs' },
];

function AiChip() {
    return (
        <Badge variant="outline" className="text-[10px] gap-1 text-green-600 border-green-500/40 bg-green-50 dark:bg-green-950/30">
            <Sparkles className="h-2.5 w-2.5" /> Auto-filled
        </Badge>
    );
}

export const ChatJobOverviewCard: React.FC<ChatJobOverviewCardProps> = ({
    title, department, onTitleChange, onDepartmentChange, isParsedTitle, isParsedDept,
    location, workArrangement, onLocationChange, onWorkArrangementChange, isParsedLocation,
    employmentType, experienceLevel, onEmploymentTypeChange, onExperienceLevelChange,
    numberOfVacancies, onNumberOfVacanciesChange,
    onContinue,
}) => {
    const canContinue =
        title.trim().length >= 3 &&
        (workArrangement === 'remote' || location.trim().length >= 2);

    return (
        <div className="space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-400">

            {/* ── Job Title + Department ─────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="job-title" className="text-sm font-semibold">
                            Job Title <span className="text-destructive">*</span>
                        </Label>
                        {isParsedTitle && <AiChip />}
                    </div>
                    <Input
                        id="job-title"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="e.g., Senior Software Engineer"
                        className={cn(
                            'h-10 rounded-lg',
                            isParsedTitle && 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20',
                            !isParsedTitle && canContinue && 'border-primary/40'
                        )}
                        autoFocus
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="department" className="text-sm font-semibold">Department</Label>
                        {isParsedDept && <AiChip />}
                    </div>
                    <Input
                        id="department"
                        value={department}
                        onChange={(e) => onDepartmentChange(e.target.value)}
                        placeholder="e.g., Engineering"
                        className={cn('h-10 rounded-lg', isParsedDept && 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20')}
                    />
                </div>
            </div>

            <Separator />

            {/* ── Work Arrangement + Location ───────────────────────── */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold">Work Arrangement</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {workArrangements.map((item) => {
                            const Icon = item.icon;
                            const active = workArrangement === item.value;
                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => onWorkArrangementChange(item.value)}
                                    className={cn(
                                        'flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all text-center',
                                        active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                                    )}
                                >
                                    <div className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                                        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    )}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span className={cn('font-semibold text-xs', active && 'text-primary')}>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            Location {workArrangement !== 'remote' && <span className="text-destructive">*</span>}
                        </Label>
                        {isParsedLocation && <AiChip />}
                    </div>
                    <LocationAutocomplete
                        value={location}
                        onChange={onLocationChange}
                        placeholder={workArrangement === 'remote' ? 'Optional — e.g., Remote – APAC' : 'e.g., Sydney, NSW'}
                        isParsed={isParsedLocation}
                    />
                </div>
            </div>

            <Separator />

            {/* ── Employment Type + Experience Level ────────────────── */}
            <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-primary" />
                        Employment Type
                    </Label>
                    <div className="grid grid-cols-2 gap-1.5">
                        {employmentTypes.map((t) => {
                            const active = employmentType === t.value;
                            return (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => onEmploymentTypeChange(t.value)}
                                    className={cn(
                                        'flex flex-col gap-0.5 p-2.5 rounded-lg border-2 text-left transition-all',
                                        active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                                    )}
                                >
                                    <span className={cn('text-xs font-semibold', active && 'text-primary')}>{t.label}</span>
                                    <span className="text-[10px] text-muted-foreground">{t.description}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-primary" />
                        Experience Level
                    </Label>
                    <div className="grid grid-cols-2 gap-1.5">
                        {experienceLevels.map((l) => {
                            const active = experienceLevel === l.value;
                            return (
                                <button
                                    key={l.value}
                                    type="button"
                                    onClick={() => onExperienceLevelChange(l.value)}
                                    className={cn(
                                        'flex flex-col gap-0.5 p-2.5 rounded-lg border-2 text-left transition-all',
                                        active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                                    )}
                                >
                                    <span className={cn('text-xs font-semibold', active && 'text-primary')}>{l.label}</span>
                                    <span className="text-[10px] text-muted-foreground">{l.years}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Separator />

            {/* ── Vacancies ─────────────────────────────────────────── */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    Number of Vacancies
                </Label>
                <div className="flex items-center gap-4">
                    <Button
                        type="button" variant="outline" size="icon"
                        onClick={() => onNumberOfVacanciesChange(Math.max(1, numberOfVacancies - 1))}
                        disabled={numberOfVacancies <= 1}
                        className="h-9 w-9 rounded-full shrink-0"
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-3xl font-bold tabular-nums w-10 text-center">{numberOfVacancies}</span>
                    <Button
                        type="button" variant="outline" size="icon"
                        onClick={() => onNumberOfVacanciesChange(numberOfVacancies + 1)}
                        className="h-9 w-9 rounded-full shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1.5 ml-2">
                        {[1, 2, 3, 5, 10].map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => onNumberOfVacanciesChange(n)}
                                className={cn(
                                    'text-xs px-2.5 py-1 rounded-full border transition-all font-medium',
                                    numberOfVacancies === n
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border text-muted-foreground hover:border-primary/40'
                                )}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <Button
                onClick={onContinue}
                disabled={!canContinue}
                className="w-full h-11 font-semibold rounded-lg"
            >
                Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
    );
};
