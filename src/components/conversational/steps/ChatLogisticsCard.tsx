import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Calendar, Eye, EyeOff, ArrowRight, Building, RefreshCcw, Home } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ChatLogisticsCardProps {
    closeDate?: string;
    visibility: 'public' | 'private';
    stealth: boolean;
    onCloseDateChange: (value: string) => void;
    onVisibilityChange: (value: 'public' | 'private') => void;
    onStealthChange: (value: boolean) => void;
    onContinue: () => void;
}

export const ChatLogisticsCard: React.FC<ChatLogisticsCardProps> = ({
    closeDate,
    visibility,
    stealth,
    onCloseDateChange,
    onVisibilityChange,
    onStealthChange,
    onContinue,
}) => {
    // Validate date is reasonable (e.g. not year 0069)
    const isValidDate = (dateStr?: string) => {
        if (!dateStr) return false;
        const year = parseInt(dateStr.split('-')[0]);
        return year > 2000;
    };

    const safeDate = isValidDate(closeDate) ? closeDate : '';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Close Date & Visibility</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                        Set when applications close and who can see this job.
                    </p>
                </div>
            </div>

            <Card className="p-5 space-y-6">
                {/* Close Date */}
                <div className="space-y-2">
                    <Label htmlFor="closeDate" className="text-base font-medium">
                        Application Deadline
                    </Label>
                    <Input
                        id="closeDate"
                        type="date"
                        value={safeDate}
                        onChange={(e) => onCloseDateChange(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full text-base h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                        Leave blank for no deadline
                    </p>
                </div>

                {/* Visibility */}
                <div className="space-y-3">
                    <Label className="text-base font-medium">Job Visibility</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <Card
                            className={cn(
                                "p-4 cursor-pointer transition-all border-2",
                                visibility === 'public'
                                    ? "border-primary bg-primary/5"
                                    : "border-muted hover:border-primary/30"
                            )}
                            onClick={() => onVisibilityChange('public')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                    <Eye className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium">Public</p>
                                    <p className="text-xs text-muted-foreground">Anyone can find</p>
                                </div>
                            </div>
                        </Card>
                        <Card
                            className={cn(
                                "p-4 cursor-pointer transition-all border-2",
                                visibility === 'private'
                                    ? "border-primary bg-primary/5"
                                    : "border-muted hover:border-primary/30"
                            )}
                            onClick={() => onVisibilityChange('private')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                                    <EyeOff className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium">Private</p>
                                    <p className="text-xs text-muted-foreground">Invite only</p>
                                </div>

                                {/* Stealth Mode */}
                                <div className="space-y-3 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium flex items-center gap-2">
                                                Stealth Mode
                                                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    Confidential
                                                </span>
                                            </Label>
                                            <p className="text-xs text-muted-foreground max-w-[80%]">
                                                Hide your company name and logo from the public job post.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={stealth}
                                            onCheckedChange={onStealthChange}
                                            className="data-[state=checked]:bg-slate-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </Card>

            <Button onClick={onContinue} className="w-full gap-2" size="lg">
                Continue <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
    );
};
