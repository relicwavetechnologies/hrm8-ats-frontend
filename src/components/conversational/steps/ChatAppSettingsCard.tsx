import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Settings, FileText, Globe, Linkedin, Briefcase, Calendar, Eye, EyeOff, Plus, X, ArrowRight, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ApplicationFormConfig, ApplicationQuestion, QuestionType } from '@/shared/types/applicationForm';

// ─── Application Config ──────────────────────────────────────────────────────
const standardFields = [
    { id: 'resume', label: 'Resume / CV', icon: FileText },
    { id: 'coverLetter', label: 'Cover Letter', icon: FileText },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'linkedIn', label: 'LinkedIn', icon: Linkedin },
    { id: 'website', label: 'Website', icon: Globe },
] as const;

// ─── Questions ───────────────────────────────────────────────────────────────
const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
    { value: 'short_text', label: 'Short text' },
    { value: 'long_text', label: 'Long text' },
    { value: 'yes_no', label: 'Yes / No' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'multiple_choice', label: 'Multiple choice' },
    { value: 'checkbox', label: 'Checkbox (multi-select)' },
    { value: 'file_upload', label: 'File upload' },
];

function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

// ─── Main Component ──────────────────────────────────────────────────────────
interface ChatAppSettingsCardProps {
    // App Config
    config: ApplicationFormConfig;
    onConfigChange: (c: ApplicationFormConfig) => void;

    // Screening Questions
    questions: ApplicationQuestion[];
    onQuestionsChange: (q: ApplicationQuestion[]) => void;
    onGenerateQuestions?: (existing: ApplicationQuestion[]) => Promise<ApplicationQuestion[]>;

    // Logistics
    closeDate?: string;
    visibility: 'public' | 'private';
    stealth: boolean;
    onCloseDateChange: (v: string) => void;
    onVisibilityChange: (v: 'public' | 'private') => void;
    onStealthChange: (v: boolean) => void;

    onContinue: () => void;
}

export const ChatAppSettingsCard: React.FC<ChatAppSettingsCardProps> = ({
    config, onConfigChange,
    questions, onQuestionsChange, onGenerateQuestions,
    closeDate, visibility, stealth, onCloseDateChange, onVisibilityChange, onStealthChange,
    onContinue
}) => {
    // Check Date
    const isValidDate = (d?: string) => d ? parseInt(d.split('-')[0]) > 2000 : false;
    const safeDate = isValidDate(closeDate) ? closeDate : '';

    // Field toggles
    const handleFieldToggle = (fieldId: string, type: 'included' | 'required') => {
        const field = fieldId as keyof typeof config.includeStandardFields;
        const current = config.includeStandardFields?.[field] || { included: false, required: false };
        const updated = { ...current, [type]: !current[type] };
        if (type === 'required' && updated.required) updated.included = true;
        if (type === 'included' && !updated.included) updated.required = false;

        onConfigChange({
            ...config,
            includeStandardFields: { ...config.includeStandardFields, [field]: updated }
        });
    };

    // Question State
    const [newQuestionStr, setNewQuestionStr] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const addQuestion = () => {
        if (!newQuestionStr.trim()) return;
        onQuestionsChange([...questions, {
            id: generateId(),
            label: newQuestionStr.trim(),
            type: 'short_text',
            required: false,
            options: [], // for select/checkbox
            order: questions.length
        }]);
        setNewQuestionStr('');
    };

    const runQuestionAi = async () => {
        if (!onGenerateQuestions) return;
        setAiLoading(true); setAiError(null);
        try {
            const suggested = await onGenerateQuestions(questions);
            if (suggested && suggested.length > 0) onQuestionsChange([...questions, ...suggested]);
        } catch (e) { setAiError(e instanceof Error ? e.message : 'Error generating'); }
        finally { setAiLoading(false); }
    };

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400">
            <Accordion type="multiple" defaultValue={['application', 'questions', 'logistics']} className="space-y-4">

                {/* ── 1. Application Config ──────────────────────────────── */}
                <AccordionItem value="application" className="border rounded-xl bg-card overflow-hidden">
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/10">
                        <span className="flex items-center gap-2.5 font-semibold">
                            <Settings className="h-4 w-4 text-primary" />
                            Application Settings
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="p-0 border-t">
                        <div className="bg-muted/30 px-5 py-2.5 flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            <span>Standard Field</span>
                            <div className="flex gap-11 px-3">
                                <span>Include</span>
                                <span>Require</span>
                            </div>
                        </div>
                        <div className="divide-y">
                            {standardFields.map((f) => {
                                const Icon = f.icon;
                                const state = config.includeStandardFields?.[f.id as any] || { included: false, required: false };
                                return (
                                    <div key={f.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-background border flex items-center justify-center text-muted-foreground">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium text-sm">{f.label}</span>
                                        </div>
                                        <div className="flex items-center gap-[52px] mr-1">
                                            <Switch checked={state.included} onCheckedChange={() => handleFieldToggle(f.id, 'included')} />
                                            <Switch checked={state.required} onCheckedChange={() => handleFieldToggle(f.id, 'required')}
                                                disabled={!state.included} className="data-[state=checked]:bg-destructive" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* ── 2. Screening Questions ───────────────────────────────── */}
                <AccordionItem value="questions" className="border rounded-xl bg-card overflow-hidden">
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/10">
                        <span className="flex items-center gap-2.5 font-semibold">
                            <HelpCircle className="h-4 w-4 text-primary" />
                            Screening Questions
                            <div className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                                {questions.length}
                            </div>
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="p-5 border-t space-y-4">
                        {questions.length > 0 ? (
                            <div className="space-y-3">
                                {questions.map((q, idx) => (
                                    <div key={q.id || idx} className="p-4 border rounded-xl bg-muted/20 relative group space-y-3">
                                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                            onClick={() => onQuestionsChange(questions.filter(x => x.id !== q.id))}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                        <div className="space-y-1.5 pr-8">
                                            <Label className="text-xs">Question Label</Label>
                                            <Input value={q.label} onChange={e => {
                                                const newQ = [...questions]; newQ[idx].label = e.target.value; onQuestionsChange(newQ);
                                            }} className="h-9 font-medium" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 items-end">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs">Type</Label>
                                                <Select value={q.type} onValueChange={(v: any) => {
                                                    const newQ = [...questions]; newQ[idx].type = v;
                                                    if (['dropdown', 'multiple_choice', 'checkbox'].includes(v) && (!q.options || q.options.length === 0)) {
                                                        newQ[idx].options = [{ id: 'opt-0', label: 'Option 1', value: 'Option 1' }];
                                                    }
                                                    onQuestionsChange(newQ);
                                                }}>
                                                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent>{QUESTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex items-center space-x-2 h-9">
                                                <Checkbox id={`req-${q.id}`} checked={q.required} onCheckedChange={checked => {
                                                    const newQ = [...questions]; newQ[idx].required = !!checked; onQuestionsChange(newQ);
                                                }} />
                                                <Label htmlFor={`req-${q.id}`} className="text-xs font-normal cursor-pointer">Required field</Label>
                                            </div>
                                        </div>
                                        {['dropdown', 'multiple_choice', 'checkbox'].includes(q.type) && (
                                            <div className="space-y-1.5 pt-2 border-t">
                                                <Label className="text-xs">Options (comma separated)</Label>
                                                <Input value={(q.options || []).map(o => o.label).join(', ')} onChange={e => {
                                                    const newQ = [...questions]; 
                                                    newQ[idx].options = e.target.value.split(',').map(s => s.trim()).filter(Boolean).map((label, i) => ({ id: `opt-${i}`, label, value: label }));
                                                    onQuestionsChange(newQ);
                                                }} className="h-9 text-xs placeholder:text-muted-foreground/50" placeholder="Yes, No, Maybe" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 border-2 border-dashed rounded-xl bg-muted/20">
                                <p className="text-sm text-muted-foreground">No questions added yet.</p>
                            </div>
                        )}

                        <div className="space-y-3 pt-2">
                            {aiError && <p className="text-xs text-destructive">{aiError}</p>}
                            <div className="flex gap-2">
                                <Input value={newQuestionStr} onChange={e => setNewQuestionStr(e.target.value)}
                                    placeholder="Enter a new question..." onKeyDown={e => e.key === 'Enter' && addQuestion()} className="h-10" />
                                <Button size="icon" className="h-10 w-10 shrink-0" onClick={addQuestion} disabled={!newQuestionStr.trim()}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {onGenerateQuestions && (
                                <Button variant="outline" className="w-full h-10 gap-2 font-medium" onClick={runQuestionAi} disabled={aiLoading}>
                                    {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
                                    Auto-generate based on JD
                                </Button>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* ── 3. Logistics ─────────────────────────────────────────── */}
                <AccordionItem value="logistics" className="border rounded-xl bg-card overflow-hidden">
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/10">
                        <span className="flex items-center gap-2.5 font-semibold">
                            <Calendar className="h-4 w-4 text-primary" />
                            Posting Logistics
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="p-5 border-t space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Application Deadline</Label>
                            <Input type="date" value={safeDate} onChange={e => onCloseDateChange(e.target.value)}
                                min={new Date().toISOString().split('T')[0]} className="h-10" />
                            <p className="text-[10px] text-muted-foreground">Leave empty for open-ended.</p>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Job Visibility</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => onVisibilityChange('public')}
                                    className={cn("p-3 rounded-xl border-2 text-left transition-all", visibility === 'public' ? "border-primary bg-primary/5" : "hover:border-primary/30")}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600"><Eye className="h-4 w-4" /></div>
                                        <div><p className="text-sm font-semibold">Public</p><p className="text-[10px] text-muted-foreground">Visible on board</p></div>
                                    </div>
                                </button>
                                <button type="button" onClick={() => onVisibilityChange('private')}
                                    className={cn("p-3 rounded-xl border-2 text-left transition-all", visibility === 'private' ? "border-primary bg-primary/5" : "hover:border-primary/30")}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><EyeOff className="h-4 w-4" /></div>
                                        <div><p className="text-sm font-semibold">Private</p><p className="text-[10px] text-muted-foreground">Invite only</p></div>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3.5 border rounded-xl bg-muted/20">
                            <div>
                                <Label className="flex items-center gap-2 text-sm font-medium">Stealth Mode</Label>
                                <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px]">Hide company name and logo.</p>
                            </div>
                            <Switch checked={stealth} onCheckedChange={onStealthChange} />
                        </div>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>

            <Button onClick={onContinue} className="w-full h-12 text-base font-semibold rounded-xl gap-2 mt-4" size="lg">
                Continue to Review <ArrowRight className="h-5 w-5" />
            </Button>
        </div>
    );
};
