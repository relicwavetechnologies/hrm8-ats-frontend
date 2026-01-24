import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useToast } from '@/shared/hooks/use-toast';
import { ArrowLeft, Plus, Save, Eye, Library, Upload } from 'lucide-react';
import type { QuestionnaireTemplate, QuestionnaireQuestion, QuestionType } from '@/shared/types/questionnaireBuilder';
import { getQuestionnaireTemplateById, saveQuestionnaireTemplate } from '@/shared/lib/assessments/questionnaireTemplateStorage';
import QuestionEditor from '@/components/assessments/questionnaire-builder/QuestionEditor';
import QuestionnairePreview from '@/components/assessments/questionnaire-builder/QuestionnairePreview';
import QuestionTemplatesLibrary from '@/components/assessments/questionnaire-builder/QuestionTemplatesLibrary';
import { BulkImportDialog } from '@/components/assessments/questionnaire-builder/BulkImportDialog';

interface SortableQuestionProps {
  question: QuestionnaireQuestion;
  onUpdate: (question: QuestionnaireQuestion) => void;
  onDelete: () => void;
}

function SortableQuestion({ question, onUpdate, onDelete }: SortableQuestionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <QuestionEditor
        question={question}
        onUpdate={onUpdate}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function QuestionnaireBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [template, setTemplate] = useState<QuestionnaireTemplate>({
    id: id || `questionnaire-${Date.now()}`,
    name: '',
    description: '',
    category: 'custom',
    questions: [],
    estimatedDuration: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  });
  const [activeTab, setActiveTab] = useState('edit');
  const [autoSaving, setAutoSaving] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id && id !== 'new') {
      const existingTemplate = getQuestionnaireTemplateById(id);
      if (existingTemplate) {
        setTemplate(existingTemplate);
      } else {
        toast({
          title: "Template not found",
          description: "Starting with a new template instead.",
          variant: "destructive",
        });
      }
    }
  }, [id, toast]);

  // Auto-save functionality
  useEffect(() => {
    if (!template.name) return;

    const autoSaveTimeout = setTimeout(() => {
      setAutoSaving(true);
      saveQuestionnaireTemplate(template);
      setTimeout(() => setAutoSaving(false), 1000);
    }, 2000);

    return () => clearTimeout(autoSaveTimeout);
  }, [template]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = template.questions.findIndex((q) => q.id === active.id);
      const newIndex = template.questions.findIndex((q) => q.id === over.id);

      const reorderedQuestions = arrayMove(template.questions, oldIndex, newIndex).map((q, index) => ({
        ...q,
        order: index,
      }));

      setTemplate({ ...template, questions: reorderedQuestions });
    }
  };

  const handleAddQuestion = (type: QuestionType = 'short-text') => {
    const newQuestion: QuestionnaireQuestion = {
      id: `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      text: '',
      required: false,
      order: template.questions.length,
      options: type === 'multiple-choice' ? [] : undefined,
      ratingConfig: type === 'rating-scale' ? { min: 1, max: 5 } : undefined,
    };

    setTemplate({
      ...template,
      questions: [...template.questions, newQuestion],
    });
  };

  const handleAddQuestionFromTemplate = (question: QuestionnaireQuestion) => {
    setTemplate({
      ...template,
      questions: [...template.questions, question],
    });
    toast({
      title: "Question added",
      description: "Template question has been added to your questionnaire.",
    });
  };

  const handleImportQuestions = (importedQuestions: QuestionnaireQuestion[]) => {
    // Adjust order numbers for imported questions
    const adjustedQuestions = importedQuestions.map((q, idx) => ({
      ...q,
      order: template.questions.length + idx,
    }));
    
    setTemplate(prev => ({
      ...prev,
      questions: [...prev.questions, ...adjustedQuestions],
    }));
  };

  const handleUpdateQuestion = (updatedQuestion: QuestionnaireQuestion) => {
    const updatedQuestions = template.questions.map((q) =>
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    setTemplate({ ...template, questions: updatedQuestions });
  };

  const handleDeleteQuestion = (questionId: string) => {
    const updatedQuestions = template.questions
      .filter((q) => q.id !== questionId)
      .map((q, index) => ({ ...q, order: index }));
    setTemplate({ ...template, questions: updatedQuestions });
  };

  const handleSave = () => {
    if (!template.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the questionnaire template.",
        variant: "destructive",
      });
      return;
    }

    saveQuestionnaireTemplate(template);
    toast({
      title: "Template saved",
      description: "Questionnaire template has been saved successfully.",
    });
    navigate('/assessment-templates');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="text-base font-semibold flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/assessment-templates')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Questionnaire Builder</h1>
                <p className="text-sm text-muted-foreground">
                  {autoSaving ? 'Saving...' : 'Auto-saved'}
                </p>
              </div>
            </div>
            <div className="text-base font-semibold flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowTemplateLibrary(!showTemplateLibrary)}
              >
                <Library className="h-4 w-4 mr-2" />
                {showTemplateLibrary ? 'Hide' : 'Show'} Templates
              </Button>
              <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import Questions
              </Button>
              <Button variant="outline" onClick={() => setActiveTab(activeTab === 'edit' ? 'preview' : 'edit')}>
                <Eye className="h-4 w-4 mr-2" />
                {activeTab === 'edit' ? 'Preview' : 'Edit'}
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save & Exit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="edit">Edit Questions</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6">
            <div className="grid gap-6" style={{ gridTemplateColumns: showTemplateLibrary ? '1fr 2fr 1fr' : '1fr 2fr' }}>
              {/* Left Panel - Template Settings */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Template Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Template Name *</Label>
                    <Input
                      value={template.name}
                      onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                      placeholder="e.g., Technical Assessment"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={template.description}
                      onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                      placeholder="Describe the purpose of this questionnaire..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={template.category}
                      onValueChange={(value) => setTemplate({ ...template, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="cognitive">Cognitive</SelectItem>
                        <SelectItem value="personality">Personality</SelectItem>
                        <SelectItem value="skills">Skills</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Estimated Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={template.estimatedDuration}
                      onChange={(e) =>
                        setTemplate({ ...template, estimatedDuration: parseInt(e.target.value) || 10 })
                      }
                      min={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Passing Score (optional)</Label>
                    <Input
                      type="number"
                      value={template.passingScore || ''}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          passingScore: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="e.g., 70"
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="mb-3 block">Add Question</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleAddQuestion('multiple-choice')}>
                        Multiple Choice
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddQuestion('rating-scale')}>
                        Rating Scale
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddQuestion('yes-no')}>
                        Yes/No
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddQuestion('short-text')}>
                        Short Text
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddQuestion('long-text')}>
                        Long Text
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddQuestion('numeric')}>
                        Numeric
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Middle Panel - Questions List */}
              <div>
                <Card>
                  <CardHeader>
                    <div className="text-base font-semibold flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">Questions ({template.questions.length})</CardTitle>
                      <Button onClick={() => handleAddQuestion('short-text')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[700px] pr-4">
                      {template.questions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <p className="mb-4">No questions added yet.</p>
                          <Button variant="outline" onClick={() => handleAddQuestion('short-text')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Question
                          </Button>
                        </div>
                      ) : (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                          <SortableContext
                            items={template.questions.map((q) => q.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-4">
                              {template.questions.map((question) => (
                                <SortableQuestion
                                  key={question.id}
                                  question={question}
                                  onUpdate={handleUpdateQuestion}
                                  onDelete={() => handleDeleteQuestion(question.id)}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Templates Library */}
              {showTemplateLibrary && (
                <div>
                  <QuestionTemplatesLibrary
                    onAddQuestion={handleAddQuestionFromTemplate}
                    currentQuestionCount={template.questions.length}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <QuestionnairePreview
              questions={template.questions}
              templateName={template.name}
              estimatedDuration={template.estimatedDuration}
            />
          </TabsContent>
        </Tabs>
      </div>

      <BulkImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleImportQuestions}
        existingQuestions={template.questions}
      />
    </div>
  );
}
