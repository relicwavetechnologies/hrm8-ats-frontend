import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { FileText, Plus, Edit, Trash2, Copy, Calendar } from 'lucide-react';
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
} from '@/shared/lib/feedbackRequestTemplateService';
import { FeedbackRequestTemplate } from '@/shared/types/feedbackRequestTemplate';
import { useToast } from '@/shared/hooks/use-toast';
import { z } from 'zod';

const templateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  role: z.string().max(50, 'Role must be less than 50 characters').optional(),
  interviewStage: z.string().max(50, 'Stage must be less than 50 characters').optional(),
  message: z.string().trim().min(1, 'Message is required').max(1000, 'Message must be less than 1000 characters'),
  dueDaysFromNow: z.number().min(1, 'Must be at least 1 day').max(30, 'Must be 30 days or less'),
});

export function FeedbackRequestTemplateManager() {
  const [templates, setTemplates] = useState<FeedbackRequestTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<FeedbackRequestTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    role: '',
    interviewStage: '',
    message: '',
    dueDaysFromNow: 3,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    setTemplates(getTemplates());
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      role: '',
      interviewStage: '',
      message: '',
      dueDaysFromNow: 3,
    });
    setErrors({});
    setEditingTemplate(null);
  };

  const handleEdit = (template: FeedbackRequestTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      role: template.role || '',
      interviewStage: template.interviewStage || '',
      message: template.message,
      dueDaysFromNow: template.dueDaysFromNow,
    });
    setFormOpen(true);
  };

  const handleSubmit = () => {
    const result = templateSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        const path = err.path[0] as string;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, {
        ...formData,
        description: formData.description || undefined,
        role: formData.role || undefined,
        interviewStage: formData.interviewStage || undefined,
      });
      toast({
        title: 'Template Updated',
        description: 'Feedback request template has been updated',
      });
    } else {
      createTemplate({
        ...formData,
        description: formData.description || undefined,
        role: formData.role || undefined,
        interviewStage: formData.interviewStage || undefined,
      });
      toast({
        title: 'Template Created',
        description: 'New feedback request template has been created',
      });
    }

    loadTemplates();
    setFormOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    toast({
      title: 'Template Deleted',
      description: 'Feedback request template has been removed',
    });
    loadTemplates();
    setDeleteId(null);
  };

  const handleDuplicate = (id: string) => {
    duplicateTemplate(id);
    toast({
      title: 'Template Duplicated',
      description: 'A copy of the template has been created',
    });
    loadTemplates();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Feedback Request Templates</h3>
          <p className="text-sm text-muted-foreground">
            Create reusable templates for different roles and interview stages
          </p>
        </div>
        <Dialog open={formOpen} onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </DialogTitle>
              <DialogDescription>
                Configure a reusable template for feedback requests
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors({ ...errors, name: '' });
                  }}
                  placeholder="e.g., Technical Round Feedback"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    setErrors({ ...errors, description: '' });
                  }}
                  placeholder="Brief description of when to use this template"
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Target Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => {
                      setFormData({ ...formData, role: e.target.value });
                      setErrors({ ...errors, role: '' });
                    }}
                    placeholder="e.g., Technical Interviewer"
                  />
                  {errors.role && (
                    <p className="text-sm text-destructive">{errors.role}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stage">Interview Stage</Label>
                  <Input
                    id="stage"
                    value={formData.interviewStage}
                    onChange={(e) => {
                      setFormData({ ...formData, interviewStage: e.target.value });
                      setErrors({ ...errors, interviewStage: '' });
                    }}
                    placeholder="e.g., Technical Round"
                  />
                  {errors.interviewStage && (
                    <p className="text-sm text-destructive">{errors.interviewStage}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDays">Due Date (days from request) *</Label>
                <Input
                  id="dueDays"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.dueDaysFromNow}
                  onChange={(e) => {
                    setFormData({ ...formData, dueDaysFromNow: parseInt(e.target.value) || 1 });
                    setErrors({ ...errors, dueDaysFromNow: '' });
                  }}
                />
                {errors.dueDaysFromNow && (
                  <p className="text-sm text-destructive">{errors.dueDaysFromNow}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message Template *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 1000) {
                      setFormData({ ...formData, message: value });
                      setErrors({ ...errors, message: '' });
                    }
                  }}
                  placeholder="Enter the message that will be sent with feedback requests..."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.message.length}/1000 characters
                </p>
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setFormOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingTemplate ? 'Update' : 'Create'} Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-2">No templates yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first feedback request template to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    {template.description && (
                      <CardDescription>{template.description}</CardDescription>
                    )}
                  </div>
                  {template.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {template.role && (
                    <Badge variant="outline">Role: {template.role}</Badge>
                  )}
                  {template.interviewStage && (
                    <Badge variant="outline">Stage: {template.interviewStage}</Badge>
                  )}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {template.dueDaysFromNow} day{template.dueDaysFromNow > 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground line-clamp-2">
                  {template.message}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(template.id)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(template.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
