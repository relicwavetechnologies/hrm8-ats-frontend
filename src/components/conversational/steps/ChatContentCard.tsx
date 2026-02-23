import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import {
    Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { cn } from '@/shared/lib/utils';
import {
    DollarSign, EyeOff, FileText, List, Tag, Plus, X,
    ChevronRight, Sparkles, Loader2, ArrowRight,
} from 'lucide-react';

// ─── Compensation ────────────────────────────────────────────────────────────
const currencies = [
    { value: 'AUD', label: 'AUD ($)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'INR', label: 'INR (₹)' },
    { value: 'SGD', label: 'SGD ($)' },
];
const periods = [
    { value: 'hourly', label: 'Per Hour' },
    { value: 'daily', label: 'Per Day' },
    { value: 'weekly', label: 'Per Week' },
    { value: 'monthly', label: 'Per Month' },
    { value: 'annual', label: 'Per Year' },
];
const STANDARD_TAGS = ['Urgent', 'Remote', 'High Priority', 'Entry Level', 'Senior', 'Contract', 'Confidential'];

interface ListBuilderProps {
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
    isParsed?: boolean;
    onGenerateList?: (current: string[]) => Promise<string[]>;
    minItems?: number;
}

function ListBuilder({ items, onChange, placeholder, isParsed, onGenerateList, minItems = 1 }: ListBuilderProps) {
    const [newItem, setNewItem] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string[] | null>(null);
    const [showAi, setShowAi] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const add = () => { if (newItem.trim()) { onChange([...items, newItem.trim()]); setNewItem(''); } };
    const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

    const runAi = async () => {
        if (!onGenerateList) return;
        setAiLoading(true); setAiError(null); setShowAi(true); setAiSuggestion(null);
        try { setAiSuggestion(await onGenerateList(items)); }
        catch (e) { setAiError(e instanceof Error ? e.message : 'Failed'); }
        finally { setAiLoading(false); }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''} added</span>
                <div className="flex gap-2 items-center">
                    {isParsed && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">From JD</Badge>}
                    {onGenerateList && (
                        <Button variant="ghost" size="sm" className="text-primary gap-1 h-7 text-xs" onClick={runAi} disabled={aiLoading}>
                            {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} AI Assist
                        </Button>
                    )}
                </div>
            </div>

            {showAi && (
                <div className="p-3 bg-muted/30 border rounded-lg space-y-2 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI Suggestion</span>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => { setShowAi(false); setAiError(null); }}>
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                    {aiLoading && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Generating…</p>}
                    {aiError && <p className="text-sm text-destructive">{aiError}</p>}
                    {!aiLoading && aiSuggestion && aiSuggestion.length > 0 && (
                        <>
                            <ul className="text-sm text-muted-foreground space-y-0.5 max-h-36 overflow-y-auto list-decimal list-inside">
                                {aiSuggestion.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => { onChange(aiSuggestion); setShowAi(false); setAiSuggestion(null); }}>Replace</Button>
                                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => { onChange([...items, ...aiSuggestion]); setShowAi(false); setAiSuggestion(null); }}>Append</Button>
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 bg-muted/50 rounded-lg group">
                        <span className="text-xs text-muted-foreground mt-0.5">{i + 1}.</span>
                        <span className="flex-1 text-sm">{item}</span>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-5 w-5 p-0" onClick={() => remove(i)}>
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ))}
                {items.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No items yet</p>}
            </div>

            <div className="flex gap-2">
                <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
                    placeholder={placeholder}
                    className="flex-1 h-9 text-sm"
                />
                <Button onClick={add} disabled={!newItem.trim()} size="icon" className="h-9 w-9"><Plus className="h-4 w-4" /></Button>
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface ChatContentCardProps {
    // Compensation
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency: string;
    salaryPeriod: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual';
    salaryDescription?: string;
    hideSalary: boolean;
    onSalaryMinChange: (v: number) => void;
    onSalaryMaxChange: (v: number) => void;
    onCurrencyChange: (v: string) => void;
    onPeriodChange: (v: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual') => void;
    onSalaryDescriptionChange?: (v: string) => void;
    onHideSalaryChange: (v: boolean) => void;
    isParsedSalary?: boolean;

    // Description
    description: string;
    onDescriptionChange: (v: string) => void;
    isParsedDescription?: boolean;
    onGenerateDescription?: (current: string) => Promise<string>;

    // Requirements
    requirements: string[];
    onRequirementsChange: (v: string[]) => void;
    isParsedRequirements?: boolean;
    onGenerateRequirements?: (current: string[]) => Promise<string[]>;

    // Responsibilities
    responsibilities: string[];
    onResponsibilitiesChange: (v: string[]) => void;
    isParsedResponsibilities?: boolean;
    onGenerateResponsibilities?: (current: string[]) => Promise<string[]>;

    // Tags
    tags: string[];
    onTagsChange: (v: string[]) => void;

    onContinue: () => void;
}

export const ChatContentCard: React.FC<ChatContentCardProps> = ({
    salaryMin, salaryMax, salaryCurrency, salaryPeriod, salaryDescription, hideSalary,
    onSalaryMinChange, onSalaryMaxChange, onCurrencyChange, onPeriodChange,
    onSalaryDescriptionChange, onHideSalaryChange, isParsedSalary,
    description, onDescriptionChange, isParsedDescription, onGenerateDescription,
    requirements, onRequirementsChange, isParsedRequirements, onGenerateRequirements,
    responsibilities, onResponsibilitiesChange, isParsedResponsibilities, onGenerateResponsibilities,
    tags, onTagsChange,
    onContinue,
}) => {
    const [showDescAi, setShowDescAi] = useState(false);
    const [descAiSuggestion, setDescAiSuggestion] = useState<string | null>(null);
    const [descAiLoading, setDescAiLoading] = useState(false);
    const [descAiError, setDescAiError] = useState<string | null>(null);
    const [newTag, setNewTag] = useState('');

    const canContinue = description.trim().length >= 50 && requirements.length >= 1 && responsibilities.length >= 1;

    const runDescAi = async () => {
        setDescAiLoading(true); setDescAiError(null); setShowDescAi(true); setDescAiSuggestion(null);
        try {
            if (onGenerateDescription) {
                setDescAiSuggestion(await onGenerateDescription(description));
            } else {
                setDescAiSuggestion('We are looking for a passionate individual to join our growing team...');
            }
        } catch (e) { setDescAiError(e instanceof Error ? e.message : 'Failed'); }
        finally { setDescAiLoading(false); }
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            onTagsChange([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const toggleTag = (tag: string) => {
        if (tags.includes(tag)) onTagsChange(tags.filter(t => t !== tag));
        else onTagsChange([...tags, tag]);
    };

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400">

            <Accordion type="multiple" defaultValue={['compensation', 'description', 'requirements', 'responsibilities']} className="space-y-3">

                {/* ── Compensation ──────────────────────────────────── */}
                <AccordionItem value="compensation" className="border rounded-xl overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/10">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                            <DollarSign className="h-4 w-4 text-primary" />
                            Compensation
                            <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-0 space-y-4 border-t">
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Currency</Label>
                                <Select value={salaryCurrency} onValueChange={onCurrencyChange}>
                                    <SelectTrigger className="h-9 rounded-lg"><SelectValue /></SelectTrigger>
                                    <SelectContent>{currencies.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Pay Period</Label>
                                <Select value={salaryPeriod} onValueChange={(v) => onPeriodChange(v as any)}>
                                    <SelectTrigger className="h-9 rounded-lg"><SelectValue /></SelectTrigger>
                                    <SelectContent>{periods.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Min</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input type="number" value={salaryMin ?? ''} onChange={(e) => onSalaryMinChange(e.target.value ? parseInt(e.target.value) : 0)}
                                        placeholder="80000" className={cn('h-9 pl-8 rounded-lg', isParsedSalary && 'border-green-500/50 bg-green-50 dark:bg-green-950/20')} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Max</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input type="number" value={salaryMax ?? ''} onChange={(e) => onSalaryMaxChange(e.target.value ? parseInt(e.target.value) : 0)}
                                        placeholder="120000" className={cn('h-9 pl-8 rounded-lg', isParsedSalary && 'border-green-500/50 bg-green-50 dark:bg-green-950/20')} />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border">
                            <div className="flex items-center gap-2">
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <span className="text-xs font-semibold">Hide salary from candidates</span>
                                    <p className="text-[10px] text-muted-foreground">Visible to your team only</p>
                                </div>
                            </div>
                            <Switch checked={hideSalary} onCheckedChange={onHideSalaryChange} />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* ── Description ───────────────────────────────────── */}
                <AccordionItem value="description" className="border rounded-xl overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/10">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                            <FileText className="h-4 w-4 text-primary" />
                            Job Description <span className="text-destructive ml-0.5">*</span>
                            {isParsedDescription && <Badge variant="outline" className="text-[10px] gap-1 text-green-600 border-green-500/40 bg-green-50 dark:bg-green-950/30"><Sparkles className="h-2.5 w-2.5" /> Auto-filled</Badge>}
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-0 space-y-3 border-t">
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-muted-foreground">
                                {description.length < 50 ? `${50 - description.length} more characters needed` : '✓ Good length'}
                            </span>
                            <Button variant="ghost" size="sm" className="text-primary gap-1 h-7 text-xs" onClick={runDescAi} disabled={descAiLoading}>
                                {descAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} AI Assist
                            </Button>
                        </div>
                        <Textarea
                            value={description}
                            onChange={(e) => onDescriptionChange(e.target.value)}
                            placeholder="Describe what this role involves, the day-to-day, and why it's exciting..."
                            className="min-h-[160px] resize-none text-sm"
                        />
                        {showDescAi && (
                            <div className="p-3 bg-muted/30 border rounded-lg space-y-2 animate-in fade-in zoom-in-95">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-primary flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI Suggestion</span>
                                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => { setShowDescAi(false); setDescAiError(null); }}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                                {descAiLoading && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Generating…</p>}
                                {descAiError && <p className="text-sm text-destructive">{descAiError}</p>}
                                {!descAiLoading && descAiSuggestion && (
                                    <>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">{descAiSuggestion}</p>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => { onDescriptionChange(descAiSuggestion!); setShowDescAi(false); setDescAiSuggestion(null); }}>Replace</Button>
                                            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => { onDescriptionChange(description + '\n\n' + descAiSuggestion); setShowDescAi(false); setDescAiSuggestion(null); }}>Append</Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>

                {/* ── Requirements ─────────────────────────────────── */}
                <AccordionItem value="requirements" className="border rounded-xl overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/10">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                            <List className="h-4 w-4 text-primary" />
                            Requirements <span className="text-destructive ml-0.5">*</span>
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{requirements.length}</Badge>
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-3 border-t">
                        <ListBuilder
                            items={requirements}
                            onChange={onRequirementsChange}
                            placeholder="Add a requirement and press Enter..."
                            isParsed={isParsedRequirements}
                            onGenerateList={onGenerateRequirements}
                            minItems={1}
                        />
                    </AccordionContent>
                </AccordionItem>

                {/* ── Responsibilities ─────────────────────────────── */}
                <AccordionItem value="responsibilities" className="border rounded-xl overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/10">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                            <List className="h-4 w-4 text-primary" />
                            Responsibilities <span className="text-destructive ml-0.5">*</span>
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{responsibilities.length}</Badge>
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-3 border-t">
                        <ListBuilder
                            items={responsibilities}
                            onChange={onResponsibilitiesChange}
                            placeholder="Add a responsibility and press Enter..."
                            isParsed={isParsedResponsibilities}
                            onGenerateList={onGenerateResponsibilities}
                            minItems={1}
                        />
                    </AccordionContent>
                </AccordionItem>

                {/* ── Tags ─────────────────────────────────────────── */}
                <AccordionItem value="tags" className="border rounded-xl overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/10">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                            <Tag className="h-4 w-4 text-primary" />
                            Tags
                            <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-3 border-t space-y-4">
                        <div className="flex flex-wrap gap-1.5">
                            {STANDARD_TAGS.map(tag => (
                                <Badge
                                    key={tag}
                                    variant={tags.includes(tag) ? 'default' : 'outline'}
                                    className="cursor-pointer transition-all text-xs"
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Custom tag..."
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                className="h-9 text-sm"
                            />
                            <Button onClick={addTag} disabled={!newTag.trim()} size="icon" className="h-9 w-9"><Plus className="h-4 w-4" /></Button>
                        </div>
                        {tags.filter(t => !STANDARD_TAGS.includes(t)).length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {tags.filter(t => !STANDARD_TAGS.includes(t)).map(tag => (
                                    <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                                        {tag}
                                        <button onClick={() => toggleTag(tag)} className="ml-0.5 hover:text-destructive transition-colors">
                                            <X className="h-2.5 w-2.5" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>

            </Accordion>

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
