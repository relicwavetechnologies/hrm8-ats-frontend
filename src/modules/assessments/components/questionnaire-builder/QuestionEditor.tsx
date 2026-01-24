import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { GripVertical, Trash2, Plus, X } from 'lucide-react';
import type { QuestionnaireQuestion, QuestionType, AnswerOption } from '@/shared/types/questionnaireBuilder';

interface QuestionEditorProps {
  question: QuestionnaireQuestion;
  onUpdate: (question: QuestionnaireQuestion) => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

const QUESTION_TYPES = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'rating-scale', label: 'Rating Scale' },
  { value: 'yes-no', label: 'Yes/No' },
  { value: 'short-text', label: 'Short Text' },
  { value: 'long-text', label: 'Long Text' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'date', label: 'Date' },
];

export default function QuestionEditor({ question, onUpdate, onDelete, dragHandleProps }: QuestionEditorProps) {
  const [expanded, setExpanded] = useState(true);

  const handleTypeChange = (type: QuestionType) => {
    const updatedQuestion: QuestionnaireQuestion = {
      ...question,
      type,
      options: type === 'multiple-choice' ? question.options || [] : undefined,
      ratingConfig: type === 'rating-scale' ? question.ratingConfig || { min: 1, max: 5 } : undefined,
    };
    onUpdate(updatedQuestion);
  };

  const handleAddOption = () => {
    const newOption: AnswerOption = {
      id: `option-${Date.now()}`,
      text: '',
      score: 0,
    };
    onUpdate({
      ...question,
      options: [...(question.options || []), newOption],
    });
  };

  const handleUpdateOption = (index: number, field: keyof AnswerOption, value: string | number) => {
    const updatedOptions = [...(question.options || [])];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    onUpdate({ ...question, options: updatedOptions });
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = [...(question.options || [])];
    updatedOptions.splice(index, 1);
    onUpdate({ ...question, options: updatedOptions });
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing mt-1">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <Select value={question.type} onValueChange={(value) => handleTypeChange(value as QuestionType)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            {expanded && (
              <>
                <div className="space-y-2">
                  <Label>Question Text *</Label>
                  <Input
                    value={question.text}
                    onChange={(e) => onUpdate({ ...question, text: e.target.value })}
                    placeholder="Enter your question here..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input
                    value={question.description || ''}
                    onChange={(e) => onUpdate({ ...question, description: e.target.value })}
                    placeholder="Add context or instructions..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={question.required}
                    onCheckedChange={(checked) => onUpdate({ ...question, required: checked })}
                  />
                  <Label>Required question</Label>
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 pl-12">
          {/* Multiple Choice Options */}
          {question.type === 'multiple-choice' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Answer Options</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={question.allowMultiple || false}
                    onCheckedChange={(checked) => onUpdate({ ...question, allowMultiple: checked })}
                  />
                  <span className="text-sm text-muted-foreground">Allow multiple</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {(question.options || []).map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <Input
                      value={option.text}
                      onChange={(e) => handleUpdateOption(index, 'text', e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    {question.scoringEnabled && (
                      <Input
                        type="number"
                        value={option.score || 0}
                        onChange={(e) => handleUpdateOption(index, 'score', parseInt(e.target.value))}
                        placeholder="Score"
                        className="w-20"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" size="sm" onClick={handleAddOption}>
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          )}

          {/* Rating Scale Configuration */}
          {question.type === 'rating-scale' && (
            <div className="space-y-3">
              <Label>Rating Scale Configuration</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Minimum</Label>
                  <Input
                    type="number"
                    value={question.ratingConfig?.min || 1}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        ratingConfig: { ...question.ratingConfig!, min: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum</Label>
                  <Input
                    type="number"
                    value={question.ratingConfig?.max || 5}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        ratingConfig: { ...question.ratingConfig!, max: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Label (Optional)</Label>
                  <Input
                    value={question.ratingConfig?.minLabel || ''}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        ratingConfig: { ...question.ratingConfig!, minLabel: e.target.value },
                      })
                    }
                    placeholder="e.g., Poor"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Label (Optional)</Label>
                  <Input
                    value={question.ratingConfig?.maxLabel || ''}
                    onChange={(e) =>
                      onUpdate({
                        ...question,
                        ratingConfig: { ...question.ratingConfig!, maxLabel: e.target.value },
                      })
                    }
                    placeholder="e.g., Excellent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Text Question Configuration */}
          {(question.type === 'short-text' || question.type === 'long-text') && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Placeholder Text</Label>
                <Input
                  value={question.placeholder || ''}
                  onChange={(e) => onUpdate({ ...question, placeholder: e.target.value })}
                  placeholder="Enter placeholder text..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Min Length</Label>
                  <Input
                    type="number"
                    value={question.minLength || 0}
                    onChange={(e) => onUpdate({ ...question, minLength: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Length</Label>
                  <Input
                    type="number"
                    value={question.maxLength || 500}
                    onChange={(e) => onUpdate({ ...question, maxLength: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Numeric Configuration */}
          {question.type === 'numeric' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Min Value</Label>
                  <Input
                    type="number"
                    value={question.minValue || ''}
                    onChange={(e) => onUpdate({ ...question, minValue: parseInt(e.target.value) })}
                    placeholder="No limit"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Value</Label>
                  <Input
                    type="number"
                    value={question.maxValue || ''}
                    onChange={(e) => onUpdate({ ...question, maxValue: parseInt(e.target.value) })}
                    placeholder="No limit"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Scoring Configuration */}
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Switch
                checked={question.scoringEnabled || false}
                onCheckedChange={(checked) => onUpdate({ ...question, scoringEnabled: checked })}
              />
              <Label>Enable scoring for this question</Label>
            </div>
            {question.scoringEnabled && (
              <div className="space-y-2 pl-6">
                <Label>Maximum Score</Label>
                <Input
                  type="number"
                  value={question.maxScore || 10}
                  onChange={(e) => onUpdate({ ...question, maxScore: parseInt(e.target.value) })}
                  className="w-32"
                />
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
