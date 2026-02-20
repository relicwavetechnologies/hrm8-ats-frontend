import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Switch } from '@/shared/components/ui/switch';
import { Calendar, Eye, EyeOff, ArrowRight } from 'lucide-react';
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
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-foreground" />
                </div>
                <div>
                    <h3 className="text-base font-semibold">Close Date & Visibility</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">
                        Set when applications close and who can see this job.
                    </p>
                </div>
            </div>

            <Card className="p-3.5 space-y-4 rounded-md shadow-none border">
                {/* Close Date */}
                <div className="space-y-2">
                    <Label htmlFor="closeDate" className="text-sm font-medium">
                        Application Deadline
                    </Label>
                    <Input
                        id="closeDate"
                        type="date"
                        value={safeDate}
                        onChange={(e) => onCloseDateChange(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full text-sm h-10"
                    />
                    <p className="text-[11px] text-muted-foreground">
                        Leave blank for no deadline
                    </p>
                </div>

                {/* Visibility */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Job Visibility</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Card
                            className={cn(
                                "p-2.5 cursor-pointer transition-all border",
                                visibility === 'public'
                                    ? "border-primary bg-primary/5"
                                    : "border-muted hover:border-primary/30"
                            )}
                            onClick={() => onVisibilityChange('public')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-foreground">
                                    <Eye className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Public</p>
                                    <p className="text-xs text-muted-foreground">Anyone can find</p>
                                </div>
                            </div>
                        </Card>
                        <Card
                            className={cn(
                                "p-2.5 cursor-pointer transition-all border",
                                visibility === 'private'
                                    ? "border-primary bg-primary/5"
                                    : "border-muted hover:border-primary/30"
                            )}
                            onClick={() => onVisibilityChange('private')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-foreground">
                                    <EyeOff className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Private</p>
                                    <p className="text-xs text-muted-foreground">Invite only</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Stealth Mode */}
                <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium">
                                Stealth Mode
                            </Label>
                            <p className="text-[11px] text-muted-foreground">
                                Hide company name/logo on public job posting.
                            </p>
                        </div>
                        <Switch checked={stealth} onCheckedChange={onStealthChange} />
                    </div>
                </div>
            </Card>

            <Button onClick={onContinue} className="w-full h-10 text-sm rounded-md font-medium gap-1.5">
                Continue <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
    );
};
