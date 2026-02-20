import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from '@/shared/lib/utils';
import { ChevronRight, DollarSign, EyeOff } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';

interface ChatCompensationCardProps {
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency: string;
    salaryPeriod: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual';
    salaryDescription?: string;
    hideSalary: boolean;
    onSalaryMinChange: (value: number) => void;
    onSalaryMaxChange: (value: number) => void;
    onCurrencyChange: (value: string) => void;
    onPeriodChange: (value: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual') => void;
    onSalaryDescriptionChange?: (value: string) => void;
    onHideSalaryChange: (value: boolean) => void;
    onContinue: () => void;
    isParsed?: boolean;
}

const currencies = [
    { value: 'AUD', label: 'AUD ($)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'EUR', label: 'EUR (€)' },
];

const periods = [
    { value: 'hourly', label: 'Per Hour' },
    { value: 'daily', label: 'Per Day' },
    { value: 'weekly', label: 'Per week' },
    { value: 'monthly', label: 'Per Month' },
    { value: 'annual', label: 'Per Year' },
];

export const ChatCompensationCard: React.FC<ChatCompensationCardProps> = ({
    salaryMin,
    salaryMax,
    salaryCurrency,
    salaryPeriod,
    salaryDescription,
    hideSalary,
    onSalaryMinChange,
    onSalaryMaxChange,
    onCurrencyChange,
    onPeriodChange,
    onSalaryDescriptionChange,
    onHideSalaryChange,
    onContinue,
    isParsed
}) => {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-base font-semibold">Compensation</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">
                        Providing a salary range can significantly increase application rates.
                    </p>
                </div>
            </div>

            <div className="space-y-4 p-0.5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                        <Select value={salaryCurrency} onValueChange={onCurrencyChange}>
                            <SelectTrigger id="currency" className="h-10 rounded-md">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {currencies.map(c => (
                                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="period" className="text-sm font-medium">Pay Period</Label>
                        <Select value={salaryPeriod} onValueChange={(v) => onPeriodChange(v as any)}>
                            <SelectTrigger id="period" className="h-10 rounded-md">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {periods.map(p => (
                                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="min-salary" className="text-sm font-medium">Minimum</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="min-salary"
                                type="number"
                                value={salaryMin ?? ''}
                                onChange={(e) => onSalaryMinChange(e.target.value ? parseInt(e.target.value) : 0)}
                                placeholder="e.g., 80000"
                                className={cn(
                                    "h-10 pl-9 rounded-md",
                                    isParsed && "border-green-500/50 bg-green-50 dark:bg-green-950/20"
                                )}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="max-salary" className="text-sm font-medium">Maximum</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="max-salary"
                                type="number"
                                value={salaryMax ?? ''}
                                onChange={(e) => onSalaryMaxChange(e.target.value ? parseInt(e.target.value) : 0)}
                                placeholder="e.g., 120000"
                                className={cn(
                                    "h-10 pl-9 rounded-md",
                                    isParsed && "border-green-500/50 bg-green-50 dark:bg-green-950/20"
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Salary Description */}
                <div className="space-y-2 pt-2 border-t">
                    <Label htmlFor="salaryDescription" className="text-sm font-medium">
                        Additional Details <span className="text-muted-foreground font-normal text-sm">(Optional)</span>
                    </Label>
                    <Textarea
                        id="salaryDescription"
                        value={salaryDescription || ''}
                        onChange={(e) => onSalaryDescriptionChange && onSalaryDescriptionChange(e.target.value)}
                        placeholder="e.g. Plus annual performance bonus and stock options..."
                        className="resize-none min-h-[72px]"
                    />
                </div>

                <div className="flex items-center justify-between p-3 rounded-md bg-muted/40 border">
                    <div className="flex items-center gap-3">
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <span className="font-medium text-xs">Hide Salary on Job Post?</span>
                            <p className="text-xs text-muted-foreground">Salary won't be visible to candidates</p>
                        </div>
                    </div>
                    <Switch checked={hideSalary} onCheckedChange={onHideSalaryChange} />
                </div>
            </div>

            <Button
                onClick={onContinue}
                className="w-full h-10 text-sm rounded-md font-medium transition-all gap-1.5"
            >
                Continue <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
};
