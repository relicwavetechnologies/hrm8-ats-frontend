import React from 'react';
import { LocationAutocomplete } from '../LocationAutocomplete';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { MapPin, ChevronRight, Building2, Home, ArrowLeftRight, Sparkles } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';

interface ChatLocationCardProps {
    location: string;
    workArrangement: 'on-site' | 'remote' | 'hybrid';
    onLocationChange: (location: string) => void;
    onWorkArrangementChange: (value: 'on-site' | 'remote' | 'hybrid') => void;
    onContinue: () => void;
    isParsed?: boolean;
}

const workArrangements = [
    {
        value: 'on-site' as const,
        label: 'On-Site',
        description: 'Work from the office',
        icon: Building2,
    },
    {
        value: 'hybrid' as const,
        label: 'Hybrid',
        description: 'Mix of office & remote',
        icon: ArrowLeftRight,
    },
    {
        value: 'remote' as const,
        label: 'Remote',
        description: 'Work from anywhere',
        icon: Home,
    },
];

export const ChatLocationCard: React.FC<ChatLocationCardProps> = ({
    location,
    workArrangement,
    onLocationChange,
    onWorkArrangementChange,
    onContinue,
    isParsed
}) => {
    const isLocationValid = workArrangement === 'remote' ? true : location.trim().length >= 2;
    const canContinue = isLocationValid;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
            {/* Work Arrangement — shown first for better flow */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold">Work Arrangement</Label>
                <div className="grid grid-cols-3 gap-3">
                    {workArrangements.map((item) => {
                        const Icon = item.icon;
                        const isSelected = workArrangement === item.value;
                        return (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => onWorkArrangementChange(item.value)}
                                className={cn(
                                    "group flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 text-center",
                                    isSelected
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-border hover:border-primary/30 bg-background"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10"
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className={cn("font-semibold text-sm", isSelected && "text-primary")}>{item.label}</p>
                                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{item.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Location Field */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="location" className="text-sm font-semibold flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        Location {workArrangement !== 'remote' && <span className="text-destructive">*</span>}
                    </Label>
                    {isParsed && (
                        <Badge variant="outline" className="text-[10px] gap-1 text-green-600 border-green-500/40 bg-green-50 dark:bg-green-950/30">
                            <Sparkles className="h-2.5 w-2.5" />
                            Auto-filled
                        </Badge>
                    )}
                </div>
                <LocationAutocomplete
                    value={location}
                    onChange={onLocationChange}
                    placeholder={workArrangement === 'remote' ? 'Optional — e.g., Remote – APAC' : 'e.g., Sydney, NSW'}
                    isParsed={isParsed}
                />
                {workArrangement === 'remote' && (
                    <p className="text-xs text-muted-foreground">
                        For fully remote roles, you can specify a preferred region or leave this blank.
                    </p>
                )}
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
