import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { GripVertical, Edit, Trash2, Plus } from "lucide-react";
import { ReviewSection } from "@/types/performance";
import { QuestionCard } from "./QuestionCard";

interface SectionCardProps {
  section: ReviewSection;
  onEdit: (section: ReviewSection) => void;
  onDelete: (sectionId: string) => void;
  onAddQuestion: (sectionId: string) => void;
  onEditQuestion: (sectionId: string, question: any) => void;
  onDeleteQuestion: (sectionId: string, questionId: string) => void;
  currentSectionId: string;
}

export function SectionCard({ 
  section, 
  onEdit, 
  onDelete, 
  onAddQuestion, 
  onEditQuestion, 
  onDeleteQuestion,
  currentSectionId 
}: SectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-4">
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-start gap-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing pt-1">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="font-semibold">{section.title}</h4>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{section.weight}%</Badge>
                <Button size="sm" variant="ghost" onClick={() => onEdit(section)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(section.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {section.description && (
              <p className="text-sm text-muted-foreground">{section.description}</p>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="pl-8 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Questions ({section.questions.length})
            </p>
            <Button size="sm" variant="outline" onClick={() => onAddQuestion(section.id)}>
              <Plus className="h-3 w-3 mr-1" />
              Add Question
            </Button>
          </div>

          {section.questions.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-2">No questions yet</p>
          ) : (
            <div className="space-y-2">
              {section.questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onEdit={() => onEditQuestion(section.id, question)}
                  onDelete={() => onDeleteQuestion(section.id, question.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
