import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Textarea } from '@/shared/components/ui/textarea';
import { HelpCircle, Plus, X, ArrowRight, Sparkles, Loader2, Save, FolderOpen } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import type { ApplicationQuestion, QuestionType } from '@/shared/types/applicationForm';
import { useToast } from '@/shared/hooks/use-toast';

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

interface ChatScreeningQuestionsCardProps {
  questions: ApplicationQuestion[];
  onChange: (questions: ApplicationQuestion[]) => void;
  onContinue: () => void;
  jobData?: Record<string, unknown>;
  companyContext?: string;
  onGenerateQuestions?: (existing: ApplicationQuestion[]) => Promise<ApplicationQuestion[]>;
}

export const ChatScreeningQuestionsCard: React.FC<ChatScreeningQuestionsCardProps> = ({
  questions,
  onChange,
  onContinue,
  jobData: _jobData,
  companyContext: _companyContext,
  onGenerateQuestions,
}) => {
  const { toast } = useToast();
  const [newQuestionLabel, setNewQuestionLabel] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<ApplicationQuestion[] | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const handleAddQuestion = () => {
    if (!newQuestionLabel.trim()) return;
    const newQ: ApplicationQuestion = {
      id: `q-${Date.now()}`,
      type: 'short_text',
      label: newQuestionLabel.trim(),
      required: true,
      order: questions.length,
    };
    onChange([...questions, newQ]);
    setNewQuestionLabel('');
  };

  const handleRemoveQuestion = (id: string) => {
    const next = questions.filter((q) => q.id !== id).map((q, i) => ({ ...q, order: i }));
    onChange(next);
  };

  const handleUpdateQuestion = (id: string, updates: Partial<ApplicationQuestion>) => {
    onChange(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const handleAiSuggest = async () => {
    if (!onGenerateQuestions) return;
    setIsGenerating(true);
    setAiSuggestions(null);
    try {
      const suggested = await onGenerateQuestions(questions);
      setAiSuggestions(suggested);
    } catch {
      setAiSuggestions([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReplaceWithAi = () => {
    if (aiSuggestions && aiSuggestions.length > 0) {
      onChange(aiSuggestions.map((q, i) => ({ ...q, order: i })));
      setAiSuggestions(null);
    }
  };

  const handleAppendAi = () => {
    if (aiSuggestions && aiSuggestions.length > 0) {
      const startOrder = questions.length;
      onChange([...questions, ...aiSuggestions.map((q, i) => ({ ...q, id: `q-${Date.now()}-${i}`, order: startOrder + i }))]);
      setAiSuggestions(null);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;
    setSavingTemplate(true);
    try {
      const { screeningQuestionService } = await import('@/shared/lib/screeningQuestionService');
      await screeningQuestionService.createTemplate({ name: templateName.trim(), questions });
      toast({ title: 'Template saved', description: `"${templateName}" is saved. You can load it later.` });
      setTemplateName('');
      setSaveDialogOpen(false);
    } catch (e) {
      toast({ title: 'Failed to save template', description: e instanceof Error ? e.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setSavingTemplate(false);
    }
  };

  const openLoadDialog = async () => {
    setLoadDialogOpen(true);
    setLoadingTemplates(true);
    try {
      const list = await (async () => {
        const { screeningQuestionService } = await import('@/shared/lib/screeningQuestionService');
        const t = await screeningQuestionService.getTemplates();
        return t.map((x) => ({ id: x.id, name: x.name }));
      })();
      setTemplates(list);
    } catch {
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleLoadTemplate = async (templateId: string) => {
    setLoadingTemplate(true);
    try {
      const { screeningQuestionService } = await import('@/shared/lib/screeningQuestionService');
      const { template } = await screeningQuestionService.getTemplateById(templateId);
      const qs = (template.questions as ApplicationQuestion[]) || [];
      onChange(qs.map((q, i) => ({ ...q, id: q.id || `q-${Date.now()}-${i}`, order: i })));
      toast({ title: 'Template loaded', description: `Loaded ${qs.length} questions from "${template.name}".` });
      setLoadDialogOpen(false);
    } catch (e) {
      toast({ title: 'Failed to load template', description: e instanceof Error ? e.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setLoadingTemplate(false);
    }
  };

  const needsOptions = (type: QuestionType) =>
    ['multiple_choice', 'dropdown', 'checkbox'].includes(type);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Screening Questions</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Ask candidates specific questions. Choose question type and add options for dropdown/multiple choice.
          </p>
        </div>
      </div>

      <Card className="p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium">{questions.length} questions</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setSaveDialogOpen(true)} disabled={questions.length === 0}>
              <Save className="h-3 w-3" />
              Save template
            </Button>
            <Button variant="ghost" size="sm" className="gap-1" onClick={openLoadDialog}>
              <FolderOpen className="h-3 w-3" />
              Load template
            </Button>
            {onGenerateQuestions && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary gap-1"
                onClick={handleAiSuggest}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                AI Assist
              </Button>
            )}
          </div>
        </div>

        {/* AI suggestions panel */}
        {aiSuggestions !== null && (
          <div className="p-3 bg-muted/30 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> AI suggestions
              </span>
              <Button variant="ghost" size="sm" className="h-6" onClick={() => setAiSuggestions(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            {aiSuggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No suggestions. Try again or add your own.</p>
            ) : (
              <>
                <ul className="text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto list-decimal list-inside">
                  {aiSuggestions.slice(0, 8).map((q, i) => (
                    <li key={q.id}>{q.label} <span className="text-xs">({q.type})</span></li>
                  ))}
                  {aiSuggestions.length > 8 && <li>… +{aiSuggestions.length - 8} more</li>}
                </ul>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={handleReplaceWithAi}>
                    Replace all
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={handleAppendAi}>
                    Append to list
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Question list */}
        {questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((q, index) => (
              <Card key={q.id} className="p-3 bg-muted/30 space-y-2">
                <div className="flex gap-2 items-start">
                  <span className="text-sm font-medium text-muted-foreground mt-2">{index + 1}.</span>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={q.label}
                      onChange={(e) => handleUpdateQuestion(q.id, { label: e.target.value })}
                      placeholder="Question text"
                      className="text-sm"
                    />
                    <div className="flex flex-wrap gap-2 items-center">
                      <Select
                        value={q.type}
                        onValueChange={(v) => handleUpdateQuestion(q.id, { type: v as QuestionType })}
                      >
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUESTION_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1.5">
                        <Checkbox
                          id={`required-${q.id}`}
                          checked={q.required}
                          onCheckedChange={(checked) => handleUpdateQuestion(q.id, { required: checked === true })}
                        />
                        <Label htmlFor={`required-${q.id}`} className="text-xs cursor-pointer">Required</Label>
                      </div>
                    </div>
                    {needsOptions(q.type) && (
                      <div className="text-xs">
                        <Label className="text-muted-foreground">Options (one per line)</Label>
                        <Textarea
                          className="mt-1 w-full min-h-[60px] text-xs resize-none"
                          value={(q.options || []).map((o) => o.label).join('\n')}
                          onChange={(e) => {
                            const labels = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean);
                            handleUpdateQuestion(q.id, {
                              options: labels.map((label, i) => ({ id: `opt-${i}`, label, value: label })),
                            });
                          }}
                          placeholder={"Option 1\nOption 2\nOption 3"}
                        />
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => handleRemoveQuestion(q.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
            <p className="text-sm">No questions yet. Add one below or use AI Assist / Load template.</p>
          </div>
        )}

        {/* Add new */}
        <div className="flex gap-2 pt-2">
          <Input
            value={newQuestionLabel}
            onChange={(e) => setNewQuestionLabel(e.target.value)}
            placeholder="Type a question..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
          />
          <Button onClick={handleAddQuestion} disabled={!newQuestionLabel.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onContinue} className="flex-1">
          Skip
        </Button>
        <Button onClick={onContinue} className="flex-1 gap-2" size="lg">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Save template dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as template</DialogTitle>
            <DialogDescription>Save this set of questions to reuse later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Template name</Label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Software Engineer screening"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate} disabled={!templateName.trim() || savingTemplate}>
              {savingTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load template dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load template</DialogTitle>
            <DialogDescription>Choose a saved template to load its questions.</DialogDescription>
          </DialogHeader>
          {loadingTemplates ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No saved templates. Save one from this step first.</p>
          ) : (
            <ul className="space-y-1 max-h-60 overflow-y-auto">
              {templates.map((t) => (
                <li key={t.id}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleLoadTemplate(t.id)}
                    disabled={loadingTemplate}
                  >
                    {loadingTemplate ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {t.name}
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoadDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
