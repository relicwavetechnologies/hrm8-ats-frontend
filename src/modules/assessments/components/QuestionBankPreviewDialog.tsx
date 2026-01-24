import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { QuestionBankItem } from '@/shared/types/questionBank';
import { Eye, Clock, Award } from 'lucide-react';

interface QuestionBankPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: QuestionBankItem[];
}

export function QuestionBankPreviewDialog({
  open,
  onOpenChange,
  questions,
}: QuestionBankPreviewDialogProps) {
  const navigate = useNavigate();
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  const handleToggleQuestion = (questionId: string) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(questions.map((q) => q.id)));
    }
  };

  const handleStartPreview = () => {
    if (selectedQuestions.size === 0) return;
    const questionIds = Array.from(selectedQuestions).join(',');
    navigate(`/assessment-preview?questions=${questionIds}`);
    onOpenChange(false);
  };

  const selectedQuestionsArray = questions.filter((q) => selectedQuestions.has(q.id));
  const totalTime = selectedQuestionsArray.reduce(
    (sum, q) => sum + (q.timeLimit || 120),
    0
  );
  const totalPoints = selectedQuestionsArray.reduce((sum, q) => sum + q.points, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview Assessment
          </DialogTitle>
          <DialogDescription>
            Select questions to preview the candidate experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Stats */}
          {selectedQuestions.size > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">
                  {selectedQuestions.size}
                </div>
                <div className="text-xs text-muted-foreground">Questions</div>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.floor(totalTime / 60)}
                </div>
                <div className="text-xs text-muted-foreground">Minutes</div>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                  <Award className="h-4 w-4" />
                  {totalPoints}
                </div>
                <div className="text-xs text-muted-foreground">Total Points</div>
              </div>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                Select Questions ({selectedQuestions.size} of {questions.length})
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedQuestions.size === questions.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg p-4">
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => handleToggleQuestion(question.id)}
                  >
                    <Checkbox
                      checked={selectedQuestions.has(question.id)}
                      onCheckedChange={() => handleToggleQuestion(question.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          Q{index + 1}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {question.difficulty}
                        </Badge>
                        <Badge className="text-xs">{question.points} pts</Badge>
                        {question.timeLimit && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.floor(question.timeLimit / 60)}m
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium line-clamp-2">
                        {question.text}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {question.category.slice(0, 2).map((cat) => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleStartPreview}
            disabled={selectedQuestions.size === 0}
          >
            <Eye className="h-4 w-4 mr-2" />
            Start Preview ({selectedQuestions.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
