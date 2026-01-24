import { useState, useEffect } from "react";
import { Plus, Save, Trash2, Eye } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { toast } from "@/shared/hooks/use-toast";
import { PerformanceReviewTemplate, ReviewSection, ReviewCycle } from "@/shared/types/performance";
import { getReviewTemplates, saveReviewTemplate, getTemplateById } from "@/shared/lib/performanceStorage";
import { AddSectionDialog } from "./AddSectionDialog";
import { AddQuestionDialog } from "./AddQuestionDialog";
import { SectionCard } from "./SectionCard";

export function ReviewTemplateBuilder() {
  const [templates, setTemplates] = useState<PerformanceReviewTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateCycle, setTemplateCycle] = useState<ReviewCycle>("quarterly");
  const [isActive, setIsActive] = useState(true);
  const [sections, setSections] = useState<ReviewSection[]>([]);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ReviewSection | null>(null);
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{ sectionId: string; question: any } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const loadedTemplates = getReviewTemplates();
    setTemplates(loadedTemplates);
  };

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === "new") {
      setSelectedTemplateId("");
      setTemplateName("");
      setTemplateDescription("");
      setTemplateCycle("quarterly");
      setIsActive(true);
      setSections([]);
    } else {
      const template = getTemplateById(templateId);
      if (template) {
        setSelectedTemplateId(template.id);
        setTemplateName(template.name);
        setTemplateDescription(template.description || "");
        setTemplateCycle(template.cycle);
        setIsActive(template.isActive);
        setSections(template.sections);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddSection = (section: ReviewSection) => {
    setSections([...sections, section]);
    toast({ title: "Section added successfully" });
  };

  const handleEditSection = (section: ReviewSection) => {
    setSections(sections.map(s => s.id === section.id ? section : s));
    toast({ title: "Section updated successfully" });
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
    toast({ title: "Section deleted" });
  };

  const handleAddQuestion = (sectionId: string, question: any) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [...section.questions, question]
        };
      }
      return section;
    }));
    toast({ title: "Question added successfully" });
  };

  const handleEditQuestion = (sectionId: string, question: any) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q => q.id === question.id ? question : q)
        };
      }
      return section;
    }));
    toast({ title: "Question updated successfully" });
  };

  const handleDeleteQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        };
      }
      return section;
    }));
    toast({ title: "Question deleted" });
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast({ title: "Please enter a template name", variant: "destructive" });
      return;
    }

    if (sections.length === 0) {
      toast({ title: "Please add at least one section", variant: "destructive" });
      return;
    }

    // Validate weights add up to 100
    const totalWeight = sections.reduce((sum, section) => sum + section.weight, 0);
    if (totalWeight !== 100) {
      toast({ 
        title: "Section weights must add up to 100%", 
        description: `Current total: ${totalWeight}%`,
        variant: "destructive" 
      });
      return;
    }

    const template: PerformanceReviewTemplate = {
      id: selectedTemplateId || `template-${Date.now()}`,
      name: templateName,
      description: templateDescription,
      cycle: templateCycle,
      sections: sections,
      isActive: isActive,
      createdAt: selectedTemplateId ? getTemplateById(selectedTemplateId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveReviewTemplate(template);
    loadTemplates();
    toast({ title: "Template saved successfully" });
  };

  const handleDeleteTemplate = () => {
    if (selectedTemplateId && confirm("Are you sure you want to delete this template?")) {
      // Implementation would go here
      toast({ title: "Template deleted" });
      handleTemplateSelect("new");
      loadTemplates();
    }
  };

  const totalWeight = sections.reduce((sum, section) => sum + section.weight, 0);

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Template Builder</h3>
            <Select value={selectedTemplateId || "new"} onValueChange={handleTemplateSelect}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select or create template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">+ Create New Template</SelectItem>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Annual Performance Review"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cycle">Review Cycle *</Label>
              <Select value={templateCycle} onValueChange={(value) => setTemplateCycle(value as ReviewCycle)}>
                <SelectTrigger id="cycle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="bi-annual">Bi-Annual</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Brief description of this review template"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="active">Active Template</Label>
          </div>
        </div>
      </Card>

      {/* Sections */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Review Sections</h3>
              <p className="text-sm text-muted-foreground">
                Total weight: {totalWeight}% {totalWeight !== 100 && <span className="text-destructive">(must equal 100%)</span>}
              </p>
            </div>
            <Button onClick={() => { setEditingSection(null); setAddSectionOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>

          {sections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No sections yet. Add your first section to get started.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {sections.map((section) => (
                    <SectionCard
                      key={section.id}
                      section={section}
                      onEdit={(section) => { setEditingSection(section); setAddSectionOpen(true); }}
                      onDelete={handleDeleteSection}
                      onAddQuestion={(sectionId) => { setEditingQuestion(null); setAddQuestionOpen(true); }}
                      onEditQuestion={(sectionId, question) => { 
                        setEditingQuestion({ sectionId, question }); 
                        setAddQuestionOpen(true); 
                      }}
                      onDeleteQuestion={handleDeleteQuestion}
                      currentSectionId={editingQuestion?.sectionId || (addQuestionOpen && sections[0]?.id) || ""}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <div>
          {selectedTemplateId && (
            <Button variant="destructive" onClick={handleDeleteTemplate}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Template
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleTemplateSelect("new")}>
            Cancel
          </Button>
          <Button onClick={handleSaveTemplate}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <AddSectionDialog
        open={addSectionOpen}
        onOpenChange={setAddSectionOpen}
        onSave={editingSection ? handleEditSection : handleAddSection}
        section={editingSection}
      />

      <AddQuestionDialog
        open={addQuestionOpen}
        onOpenChange={setAddQuestionOpen}
        onSave={(question) => {
          if (editingQuestion) {
            handleEditQuestion(editingQuestion.sectionId, question);
          } else if (sections.length > 0) {
            handleAddQuestion(sections[0].id, question);
          }
        }}
        question={editingQuestion?.question}
        sections={sections}
        currentSectionId={editingQuestion?.sectionId}
        onSectionChange={(sectionId) => {
          if (editingQuestion) {
            setEditingQuestion({ ...editingQuestion, sectionId });
          }
        }}
      />
    </div>
  );
}
