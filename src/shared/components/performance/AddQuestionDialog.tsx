import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Plus, X } from "lucide-react";
import { ReviewQuestion, ReviewSection } from "@/types/performance";

interface AddQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (question: ReviewQuestion) => void;
  question?: ReviewQuestion | null;
  sections: ReviewSection[];
  currentSectionId?: string;
  onSectionChange?: (sectionId: string) => void;
}

export function AddQuestionDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  question, 
  sections,
  currentSectionId,
  onSectionChange 
}: AddQuestionDialogProps) {
  const [questionText, setQuestionText] = useState("");
  const [type, setType] = useState<"rating" | "text" | "yes-no" | "multiple-choice">("rating");
  const [required, setRequired] = useState(true);
  const [helpText, setHelpText] = useState("");
  const [options, setOptions] = useState<string[]>([""]);

  useEffect(() => {
    if (question) {
      setQuestionText(question.question);
      setType(question.type);
      setRequired(question.required);
      setHelpText(question.helpText || "");
      setOptions(question.options || [""]);
    } else {
      setQuestionText("");
      setType("rating");
      setRequired(true);
      setHelpText("");
      setOptions([""]);
    }
  }, [question, open]);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSave = () => {
    if (!questionText.trim()) {
      return;
    }

    if (type === "multiple-choice" && options.filter(o => o.trim()).length < 2) {
      return;
    }

    const newQuestion: ReviewQuestion = {
      id: question?.id || `question-${Date.now()}`,
      question: questionText.trim(),
      type,
      required,
      helpText: helpText.trim() || undefined,
      options: type === "multiple-choice" ? options.filter(o => o.trim()) : undefined
    };

    onSave(newQuestion);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{question ? "Edit Question" : "Add Question"}</DialogTitle>
          <DialogDescription>
            {question ? "Update the question details below." : "Create a new review question."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!question && sections.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="section">Section *</Label>
              <Select 
                value={currentSectionId || sections[0]?.id} 
                onValueChange={(value) => onSectionChange?.(value)}
              >
                <SelectTrigger id="section">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map(section => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="question-text">Question *</Label>
            <Textarea
              id="question-text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g., How effectively does the employee communicate with team members?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-type">Question Type *</Label>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
              <SelectTrigger id="question-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating (1-5)</SelectItem>
                <SelectItem value="text">Text Response</SelectItem>
                <SelectItem value="yes-no">Yes/No</SelectItem>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "multiple-choice" && (
            <div className="space-y-2">
              <Label>Options *</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                      disabled={options.length <= 2}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="help-text">Help Text</Label>
            <Textarea
              id="help-text"
              value={helpText}
              onChange={(e) => setHelpText(e.target.value)}
              placeholder="Optional guidance for answering this question"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="required" checked={required} onCheckedChange={setRequired} />
            <Label htmlFor="required">Required Question</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={
              !questionText.trim() || 
              (type === "multiple-choice" && options.filter(o => o.trim()).length < 2)
            }
          >
            {question ? "Update" : "Add"} Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
