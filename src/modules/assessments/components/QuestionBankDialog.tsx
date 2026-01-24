import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { FormInput, FormTextarea, FormSelect } from '@/shared/components/common/form-fields';
import { Form } from '@/shared/components/ui/form';
import { QuestionBankItem, QuestionType, DifficultyLevel } from '@/shared/types/questionBank';
import { Plus, Trash2, X } from 'lucide-react';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';

const questionSchema = z.object({
  text: z.string().min(10, 'Question must be at least 10 characters'),
  type: z.string(),
  difficulty: z.string(),
  points: z.number().min(1).max(100),
  timeLimit: z.number().optional(),
  instructions: z.string().optional(),
  isActive: z.boolean(),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (question: Partial<QuestionBankItem>) => void;
  question?: QuestionBankItem;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'single-choice', label: 'Single Choice' },
  { value: 'true-false', label: 'True/False' },
  { value: 'text-short', label: 'Short Text' },
  { value: 'text-long', label: 'Long Text' },
  { value: 'coding', label: 'Coding Challenge' },
  { value: 'video-response', label: 'Video Response' },
  { value: 'file-upload', label: 'File Upload' },
];

const DIFFICULTY_LEVELS: { value: DifficultyLevel; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'expert', label: 'Expert' },
];

export function QuestionBankDialog({
  open,
  onOpenChange,
  onSave,
  question,
}: QuestionBankDialogProps) {
  const [categories, setCategories] = useState<string[]>(question?.category || []);
  const [categoryInput, setCategoryInput] = useState('');
  const [tags, setTags] = useState<string[]>(question?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [options, setOptions] = useState(question?.options || []);
  const [selectedType, setSelectedType] = useState<QuestionType>(question?.type || 'single-choice');

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: question?.text || '',
      type: question?.type || 'single-choice',
      difficulty: question?.difficulty || 'medium',
      points: question?.points || 10,
      timeLimit: question?.timeLimit || 120,
      instructions: question?.instructions || '',
      isActive: question?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (question) {
      form.reset({
        text: question.text,
        type: question.type,
        difficulty: question.difficulty,
        points: question.points,
        timeLimit: question.timeLimit || 120,
        instructions: question.instructions || '',
        isActive: question.isActive,
      });
      setCategories(question.category);
      setTags(question.tags);
      setOptions(question.options || []);
      setSelectedType(question.type);
    } else {
      form.reset({
        text: '',
        type: 'single-choice',
        difficulty: 'medium',
        points: 10,
        timeLimit: 120,
        instructions: '',
        isActive: true,
      });
      setCategories([]);
      setTags([]);
      setOptions([]);
      setSelectedType('single-choice');
    }
  }, [question, form, open]);

  const showOptions = ['multiple-choice', 'single-choice', 'true-false'].includes(selectedType);

  const handleAddCategory = () => {
    if (categoryInput.trim() && !categories.includes(categoryInput.trim())) {
      setCategories([...categories, categoryInput.trim()]);
      setCategoryInput('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddOption = () => {
    setOptions([...options, { id: `opt-${Date.now()}`, text: '', isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const updated = [...options];
    if (field === 'text') {
      updated[index].text = value as string;
    } else {
      // For single choice, uncheck all others
      if (selectedType === 'single-choice' && value === true) {
        updated.forEach((opt, i) => {
          opt.isCorrect = i === index;
        });
      } else {
        updated[index].isCorrect = value as boolean;
      }
    }
    setOptions(updated);
  };

  const onSubmit = (data: QuestionFormData) => {
    const questionData: Partial<QuestionBankItem> = {
      ...data,
      type: data.type as QuestionType,
      difficulty: data.difficulty as DifficultyLevel,
      category: categories,
      tags: tags,
      options: showOptions ? options : undefined,
    };

    onSave(questionData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{question ? 'Edit Question' : 'Create Question'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormTextarea
              form={form}
              name="text"
              label="Question Text"
              placeholder="Enter your question..."
              rows={3}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                form={form}
                name="type"
                label="Question Type"
                options={QUESTION_TYPES}
                required
              />

              <FormSelect
                form={form}
                name="difficulty"
                label="Difficulty Level"
                options={DIFFICULTY_LEVELS}
                required
              />
            </div>

            {/* Watch for type changes */}
            {(() => {
              const currentType = form.watch('type') as QuestionType;
              if (currentType !== selectedType) {
                setSelectedType(currentType);
              }
              return null;
            })()}

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                form={form}
                name="points"
                label="Points"
                type="number"
                required
              />

              <FormInput
                form={form}
                name="timeLimit"
                label="Time Limit (seconds)"
                type="number"
              />
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex gap-2">
                <Input
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  placeholder="Add category..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddCategory} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge key={category} variant="secondary" className="gap-1">
                    {category}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveCategory(category)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Options for choice-based questions */}
            {showOptions && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Answer Options</Label>
                  <Button type="button" onClick={handleAddOption} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <Switch
                        checked={option.isCorrect}
                        onCheckedChange={(checked) =>
                          handleOptionChange(index, 'isCorrect', checked)
                        }
                      />
                      <Input
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <FormTextarea
              form={form}
              name="instructions"
              label="Instructions (Optional)"
              placeholder="Additional instructions for candidates..."
              rows={2}
            />

            <div className="flex items-center justify-between">
              <Label>Active Status</Label>
              <Switch
                checked={form.watch('isActive')}
                onCheckedChange={(checked) => form.setValue('isActive', checked)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {question ? 'Update Question' : 'Create Question'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
