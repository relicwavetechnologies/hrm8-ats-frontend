import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Edit, Trash2, Star, MessageSquare, CheckCircle, ListChecks } from "lucide-react";
import { ReviewQuestion } from "@/shared/types/performance";

interface QuestionCardProps {
  question: ReviewQuestion;
  onEdit: () => void;
  onDelete: () => void;
}

export function QuestionCard({ question, onEdit, onDelete }: QuestionCardProps) {
  const getTypeIcon = () => {
    switch (question.type) {
      case "rating":
        return <Star className="h-3 w-3" />;
      case "text":
        return <MessageSquare className="h-3 w-3" />;
      case "yes-no":
        return <CheckCircle className="h-3 w-3" />;
      case "multiple-choice":
        return <ListChecks className="h-3 w-3" />;
    }
  };

  const getTypeLabel = () => {
    switch (question.type) {
      case "rating":
        return "Rating";
      case "text":
        return "Text";
      case "yes-no":
        return "Yes/No";
      case "multiple-choice":
        return "Multiple Choice";
    }
  };

  return (
    <Card className="p-3 bg-muted/50">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <p className="text-sm flex-1">{question.question}</p>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={onEdit} className="h-7 w-7 p-0">
                <Edit className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onDelete} className="h-7 w-7 p-0">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {getTypeIcon()}
              <span className="ml-1">{getTypeLabel()}</span>
            </Badge>
            {question.required && (
              <Badge variant="secondary" className="text-xs">Required</Badge>
            )}
            {question.options && question.options.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {question.options.length} options
              </span>
            )}
          </div>

          {question.helpText && (
            <p className="text-xs text-muted-foreground mt-1 italic">{question.helpText}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
