import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Switch } from '@/shared/components/ui/switch';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { AssessmentTemplate, AssessmentType, AssessmentProvider } from '@/shared/types/assessment';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/shared/hooks/use-toast';
import { z } from 'zod';

const templateSchema = z.object({
  name: z.string().trim().min(1, "Template name is required").max(100),
  description: z.string().trim().min(1, "Description is required").max(500),
  duration: z.number().min(5).max(300),
  questionCount: z.number().min(1).max(200),
  passThreshold: z.number().min(0).max(100),
});

interface TemplateBuilderDialogProps {
  open: boolean;
  onClose: () => void;
  template?: AssessmentTemplate;
  onSave: (template: AssessmentTemplate) => void;
}

export function TemplateBuilderDialog({ open, onClose, template, onSave }: TemplateBuilderDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [assessmentType, setAssessmentType] = useState<AssessmentType>(template?.assessmentType || 'cognitive');
  const [provider, setProvider] = useState<AssessmentProvider>(template?.provider || 'testgorilla');
  const [duration, setDuration] = useState(template?.duration || 45);
  const [questionCount, setQuestionCount] = useState(template?.questionCount || 30);
  const [passThreshold, setPassThreshold] = useState(template?.passThreshold || 70);
  const [categories, setCategories] = useState<string[]>(template?.categories || []);
  const [newCategory, setNewCategory] = useState('');
  const [isActive, setIsActive] = useState(template?.isActive ?? true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = () => {
    try {
      templateSchema.parse({
        name,
        description,
        duration,
        questionCount,
        passThreshold,
      });
      
      if (categories.length === 0) {
        setValidationErrors(['At least one category is required']);
        return false;
      }
      
      setValidationErrors([]);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationErrors(error.errors.map(e => e.message));
      }
      return false;
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    const trimmedCategory = newCategory.trim();
    if (trimmedCategory.length > 50) {
      toast({
        title: "Category Too Long",
        description: "Category must be 50 characters or less",
        variant: "destructive",
      });
      return;
    }
    
    if (categories.includes(trimmedCategory)) {
      toast({
        title: "Duplicate Category",
        description: "This category already exists",
        variant: "destructive",
      });
      return;
    }
    
    setCategories([...categories, trimmedCategory]);
    setNewCategory('');
  };

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive",
      });
      return;
    }

    const now = new Date().toISOString();
    const savedTemplate: AssessmentTemplate = {
      id: template?.id || `template-${uuidv4()}`,
      name,
      description,
      assessmentType,
      provider,
      duration,
      questionCount,
      passThreshold,
      categories,
      isActive,
      createdAt: template?.createdAt || now,
      updatedAt: now,
    };

    onSave(savedTemplate);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setAssessmentType('cognitive');
    setProvider('testgorilla');
    setDuration(45);
    setQuestionCount(30);
    setPassThreshold(70);
    setCategories([]);
    setNewCategory('');
    setIsActive(true);
    setValidationErrors([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'Create Assessment Template'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {validationErrors.length > 0 && (
            <Card className="bg-destructive/10 border-destructive">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-destructive mb-2">Validation Errors:</p>
                <ul className="text-sm text-destructive space-y-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Information</h3>
            
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Software Engineer - Technical Assessment"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">{name.length}/100 characters</p>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose and scope of this assessment template..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">{description.length}/500 characters</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Assessment Type *</Label>
                <Select value={assessmentType} onValueChange={(v) => setAssessmentType(v as AssessmentType)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="cognitive">Cognitive Ability</SelectItem>
                    <SelectItem value="personality">Personality</SelectItem>
                    <SelectItem value="technical-skills">Technical Skills</SelectItem>
                    <SelectItem value="situational-judgment">Situational Judgment</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="culture-fit">Culture Fit</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="provider">Provider *</Label>
                <Select value={provider} onValueChange={(v) => setProvider(v as AssessmentProvider)}>
                  <SelectTrigger id="provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="testgorilla">TestGorilla</SelectItem>
                    <SelectItem value="vervoe">Vervoe</SelectItem>
                    <SelectItem value="criteria">Criteria Corp</SelectItem>
                    <SelectItem value="harver">Harver</SelectItem>
                    <SelectItem value="shl">SHL</SelectItem>
                    <SelectItem value="codility">Codility</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Assessment Configuration */}
          <div className="space-y-4">
            <h3 className="font-semibold">Assessment Configuration</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  max="300"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="questionCount">Question Count *</Label>
                <Input
                  id="questionCount"
                  type="number"
                  min="1"
                  max="200"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="passThreshold">Pass Threshold (%) *</Label>
                <Input
                  id="passThreshold"
                  type="number"
                  min="0"
                  max="100"
                  value={passThreshold}
                  onChange={(e) => setPassThreshold(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold">Assessment Categories *</h3>
            
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add a category (e.g., Logical Reasoning)"
                maxLength={50}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
              />
              <Button onClick={handleAddCategory} type="button" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge key={category} variant="secondary" className="gap-1 pr-1">
                    {category}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-0.5 p-0 hover:text-destructive hover:bg-transparent"
                      onClick={() => handleRemoveCategory(category)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground">No categories added yet. Add at least one category.</p>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active (available for use in assessments)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {template ? 'Update Template' : 'Create Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
