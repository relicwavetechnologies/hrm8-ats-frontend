import React from 'react';
import { Input } from '@/shared/components/ui/input';
import { LocationAutocomplete } from '../LocationAutocomplete';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { cn } from '@/shared/lib/utils';
import { MapPin, ChevronRight, Building, Home, RefreshCcw } from 'lucide-react';

interface ChatLocationCardProps {
    location: string;
    workArrangement: 'on-site' | 'remote' | 'hybrid';
    onLocationChange: (location: string) => void;
    onWorkArrangementChange: (value: 'on-site' | 'remote' | 'hybrid') => void;
    onContinue: () => void;
    isParsed?: boolean;
}

const workArrangements = [
    { value: 'on-site' as const, label: 'On-Site', description: 'Work from the office', icon: Building },
    { value: 'hybrid' as const, label: 'Hybrid', description: 'Mix of office and remote', icon: RefreshCcw },
    { value: 'remote' as const, label: 'Remote', description: 'Work from anywhere', icon: Home },
];

export const ChatLocationCard: React.FC<ChatLocationCardProps> = ({
    location,
    workArrangement,
    onLocationChange,
    onWorkArrangementChange,
    onContinue,
    isParsed
}) => {
    // Validation: Required for On-Site/Hybrid, Optional (but recommended) for Remote
    const isLocationValid = workArrangement === 'remote' ? true : location.trim().length >= 2;
    const canContinue = isLocationValid;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
            <div className="space-y-2">
                <Label htmlFor="location" className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Location {workArrangement !== 'remote' && <span className="text-destructive">*</span>}
                </Label>
                <div className="relative">
                    <LocationAutocomplete
                        value={location}
                        onChange={onLocationChange}
                        placeholder={workArrangement === 'remote' ? "Optional for Remote roles" : "e.g., Sydney, NSW"}
                        isParsed={isParsed}
                        disabled={workArrangement === 'remote' && !location} // Optional: disable if remote and empty? No, let them add HQ if they want.
                    />
                    {isParsed && (
                        <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-green-600 font-bold">
                            From JD
                        </span>
                    )}
                </div>
                {workArrangement === 'remote' && (
                    <p className="text-xs text-muted-foreground pl-1">
                        For remote roles, you can specify "Remote" or a specific region (e.g. "Remote - APAC").
                    </p>
                )}
            </div>

            <div className="space-y-3">
                <Label className="text-base font-semibold">Work Arrangement</Label>
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
                                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                                    isSelected
                                        ? "border-primary bg-primary/5 shadow-md"
                                        : "border-muted hover:border-primary/30"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-full transition-colors",
                                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className="font-semibold text-sm">{item.label}</span>
                                <span className="text-[10px] text-muted-foreground leading-tight text-center">{item.description}</span>
                            </button>
                        );
                    })}
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
