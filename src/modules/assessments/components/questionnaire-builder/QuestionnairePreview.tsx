import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Slider } from '@/shared/components/ui/slider';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import type { QuestionnaireQuestion } from '@/shared/types/questionnaireBuilder';
import { FileUp, Calendar } from 'lucide-react';

interface QuestionnairePreviewProps {
  questions: QuestionnaireQuestion[];
  templateName: string;
  estimatedDuration: number;
}

export default function QuestionnairePreview({ questions, templateName, estimatedDuration }: QuestionnairePreviewProps) {
  const renderQuestion = (question: QuestionnaireQuestion, index: number) => {
    return (
      <div key={question.id} className="space-y-3 pb-6 border-b last:border-0">
        <div className="flex items-start gap-2">
          <Badge variant="outline" className="mt-0.5">
            Q{index + 1}
          </Badge>
          <div className="flex-1">
            <div className="flex items-start gap-2">
              <Label className="text-base font-medium">
                {question.text}
                {question.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            </div>
            {question.description && (
              <p className="text-sm text-muted-foreground mt-1">{question.description}</p>
            )}
          </div>
        </div>

        <div className="pl-12">
          {question.type === 'multiple-choice' && (
            <div className="space-y-2">
              {question.allowMultiple ? (
                <div className="space-y-2">
                  {(question.options || []).map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox id={option.id} disabled />
                      <Label htmlFor={option.id} className="text-sm">
                        {option.text}
                        {question.scoringEnabled && option.score !== undefined && (
                          <span className="text-muted-foreground ml-2">({option.score} pts)</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <RadioGroup>
                  {(question.options || []).map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} disabled />
                      <Label htmlFor={option.id} className="text-sm">
                        {option.text}
                        {question.scoringEnabled && option.score !== undefined && (
                          <span className="text-muted-foreground ml-2">({option.score} pts)</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          )}

          {question.type === 'rating-scale' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{question.ratingConfig?.minLabel || question.ratingConfig?.min}</span>
                <span>{question.ratingConfig?.maxLabel || question.ratingConfig?.max}</span>
              </div>
              <Slider
                defaultValue={[Math.round(((question.ratingConfig?.min || 1) + (question.ratingConfig?.max || 5)) / 2)]}
                min={question.ratingConfig?.min || 1}
                max={question.ratingConfig?.max || 5}
                step={question.ratingConfig?.step || 1}
                disabled
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {Array.from(
                  { length: (question.ratingConfig?.max || 5) - (question.ratingConfig?.min || 1) + 1 },
                  (_, i) => (question.ratingConfig?.min || 1) + i
                ).map((num) => (
                  <span key={num}>{num}</span>
                ))}
              </div>
            </div>
          )}

          {question.type === 'yes-no' && (
            <RadioGroup>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id={`${question.id}-yes`} disabled />
                <Label htmlFor={`${question.id}-yes`} className="text-sm">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id={`${question.id}-no`} disabled />
                <Label htmlFor={`${question.id}-no`} className="text-sm">
                  No
                </Label>
              </div>
            </RadioGroup>
          )}

          {question.type === 'short-text' && (
            <Input placeholder={question.placeholder || 'Type your answer...'} disabled />
          )}

          {question.type === 'long-text' && (
            <Textarea
              placeholder={question.placeholder || 'Type your detailed answer...'}
              rows={4}
              disabled
            />
          )}

          {question.type === 'numeric' && (
            <Input
              type="number"
              placeholder={`Enter a number${question.minValue ? ` (min: ${question.minValue})` : ''}${question.maxValue ? ` (max: ${question.maxValue})` : ''}`}
              disabled
            />
          )}

          {question.type === 'date' && (
            <div className="flex items-center gap-2">
              <Input type="date" disabled className="flex-1" />
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {question.type === 'file-upload' && (
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
            </div>
          )}

          {question.scoringEnabled && (
            <p className="text-xs text-muted-foreground mt-2">
              Max score: {question.maxScore || 10} points
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{templateName || 'Untitled Questionnaire'}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {questions.length} {questions.length === 1 ? 'question' : 'questions'} • Est. {estimatedDuration} min
            </p>
          </div>
          <Badge variant="secondary">Preview</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-12 space-y-6">
            {questions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No questions added yet.</p>
                <p className="text-sm mt-1">Add questions to see the preview.</p>
              </div>
            ) : (
              questions.map((question, index) => renderQuestion(question, index))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
