import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { FileText, Sparkles, ArrowRight, X, Loader2 } from 'lucide-react';

interface ChatDescriptionCardProps {
    description: string;
    onChange: (value: string) => void;
    onContinue: () => void;
    isParsed?: boolean;
    /** All job fields filled so far (for AI context) */
    jobData?: Record<string, unknown>;
    /** Company context string for AI (name, about, etc.) */
    companyContext?: string;
    /** Generate description with AI using context; returns suggested description text */
    onGenerateDescription?: (currentDescription: string) => Promise<string>;
}

export const ChatDescriptionCard: React.FC<ChatDescriptionCardProps> = ({
    description,
    onChange,
    onContinue,
    isParsed,
    jobData: _jobData,
    companyContext: _companyContext,
    onGenerateDescription,
}) => {
    const [showAiSuggestion, setShowAiSuggestion] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const canContinue = description.trim().length >= 50;

    const handleAiAssist = async () => {
        if (!onGenerateDescription) {
            setAiSuggestion('We are looking for a passionate individual to join our growing team. You will be responsible for driving key initiatives and collaborating with cross-functional teams to deliver high-quality results...');
            setShowAiSuggestion(true);
            return;
        }
        setAiLoading(true);
        setAiError(null);
        setShowAiSuggestion(true);
        setAiSuggestion(null);
        try {
            const suggested = await onGenerateDescription(description);
            setAiSuggestion(suggested || null);
        } catch (e) {
            setAiError(e instanceof Error ? e.message : 'Failed to generate suggestion');
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-foreground" />
                </div>
                <div>
                    <h3 className="text-base font-semibold">Job Description</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">
                        Describe the role, responsibilities, and what makes this opportunity exciting.
                    </p>
                </div>
            </div>

            <Card className="p-3.5 space-y-3 rounded-md shadow-none border">
                <div className="flex items-center justify-between">
                    <Label htmlFor="description" className="text-sm font-medium">
                        Description
                    </Label>
                    <div className="flex items-center gap-2">
                        {isParsed && (
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                From JD
                            </Badge>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={handleAiAssist}
                            disabled={aiLoading}
                        >
                            {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                            AI Assist
                        </Button>
                    </div>
                </div>

                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Describe what this role involves, what the day-to-day looks like, and why candidates should be excited about this opportunity..."
                    className="min-h-[150px] resize-none text-sm"
                />

                {showAiSuggestion && (
                    <div className="p-2.5 bg-muted/20 border rounded-md space-y-2 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-foreground flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> AI Suggestion
                            </span>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => { setShowAiSuggestion(false); setAiError(null); }}>
                                <span className="sr-only">Dismiss</span>
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                        {aiLoading && (
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Generating using company context and your job details...
                            </p>
                        )}
                        {aiError && (
                            <p className="text-xs text-destructive">{aiError}</p>
                        )}
                        {!aiLoading && aiSuggestion && (
                            <>
                                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{aiSuggestion}</p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="flex-1 text-xs h-8"
                                        onClick={() => {
                                            onChange(aiSuggestion);
                                            setShowAiSuggestion(false);
                                            setAiSuggestion(null);
                                        }}
                                    >
                                        Replace Description
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 text-xs h-8"
                                        onClick={() => {
                                            onChange(description + (description ? "\n\n" : "") + aiSuggestion);
                                            setShowAiSuggestion(false);
                                            setAiSuggestion(null);
                                        }}
                                    >
                                        Append to Description
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{description.length} characters</span>
                    <span>{description.length < 50 ? `${50 - description.length} more needed` : '✓ Good length'}</span>
                </div>
            </Card>

            <Button
                onClick={onContinue}
                disabled={!canContinue}
                className="w-full h-10 text-sm rounded-md font-medium gap-1.5"
            >
                Continue <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
    );
};
