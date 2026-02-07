import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { FileText, Sparkles, ArrowRight, X } from 'lucide-react';

interface ChatDescriptionCardProps {
    description: string;
    onChange: (value: string) => void;
    onContinue: () => void;
    isParsed?: boolean;
}

export const ChatDescriptionCard: React.FC<ChatDescriptionCardProps> = ({
    description,
    onChange,
    onContinue,
    isParsed,
}) => {
    const [showAiSuggestion, setShowAiSuggestion] = useState(false);

    const canContinue = description.trim().length >= 50;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Job Description</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                        Describe the role, responsibilities, and what makes this opportunity exciting.
                    </p>
                </div>
            </div>

            <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="description" className="text-base font-medium">
                        Description
                    </Label>
                    <div className="flex items-center gap-2">
                        {isParsed && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                From JD
                            </Badge>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary gap-1"
                            onClick={() => setShowAiSuggestion(true)}
                        >
                            <Sparkles className="h-3 w-3" />
                            AI Assist
                        </Button>
                    </div>
                </div>

                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Describe what this role involves, what the day-to-day looks like, and why candidates should be excited about this opportunity..."
                    className="min-h-[200px] resize-none"
                />

                {showAiSuggestion && (
                    <div className="p-3 bg-muted/30 border rounded-lg space-y-2 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-primary flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> AI Suggestion
                            </span>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => setShowAiSuggestion(false)}>
                                <span className="sr-only">Dismiss</span>
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground italic">
                            "We are looking for a passionate individual to join our growing team. You will be responsible for driving key initiatives and collaborating with cross-functional teams to deliver high-quality results..."
                        </p>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="w-full text-xs"
                            onClick={() => {
                                onChange(description + (description ? "\n\n" : "") + "We are looking for a passionate individual to join our growing team. You will be responsible for driving key initiatives and collaborating with cross-functional teams to deliver high-quality results...");
                                setShowAiSuggestion(false);
                            }}
                        >
                            Append to Description
                        </Button>
                    </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{description.length} characters</span>
                    <span>{description.length < 50 ? `${50 - description.length} more needed` : '✓ Good length'}</span>
                </div>
            </Card>

            <Button
                onClick={onContinue}
                disabled={!canContinue}
                className="w-full gap-2"
                size="lg"
            >
                Continue <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
    );
};
