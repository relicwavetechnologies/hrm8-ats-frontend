import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { FileText, Plus, Edit, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackTemplate {
  id: string;
  name: string;
  category: 'technical' | 'cultural' | 'communication' | 'leadership' | 'general';
  commentType: 'strength' | 'concern' | 'observation' | 'question';
  content: string;
  createdAt: string;
}

const TEMPLATES_KEY = 'feedback_templates';

export function FeedbackTemplateManager() {
  const [templates, setTemplates] = useState<FeedbackTemplate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'general' as FeedbackTemplate['category'],
    commentType: 'observation' as FeedbackTemplate['commentType'],
    content: '',
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const stored = localStorage.getItem(TEMPLATES_KEY);
    if (stored) {
      setTemplates(JSON.parse(stored));
    } else {
      // Initialize with default templates
      const defaultTemplates: FeedbackTemplate[] = [
        {
          id: '1',
          name: 'Strong Technical Skills',
          category: 'technical',
          commentType: 'strength',
          content: 'Demonstrated excellent technical proficiency in [specific area]. Shows deep understanding of [concepts/technologies].',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Communication Clarity',
          category: 'communication',
          commentType: 'observation',
          content: 'Communicated ideas clearly and effectively. Explained complex concepts in an understandable manner.',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Cultural Fit Concern',
          category: 'cultural',
          commentType: 'concern',
          content: 'Some concerns about alignment with team values. May need discussion around [specific area].',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(defaultTemplates));
      setTemplates(defaultTemplates);
    }
  };

  const saveTemplates = (newTemplates: FeedbackTemplate[]) => {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(newTemplates));
    setTemplates(newTemplates);
  };

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTemplate: FeedbackTemplate = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
    };

    saveTemplates([...templates, newTemplate]);
    resetForm();
    toast.success('Template created successfully');
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updated = templates.map(t =>
      t.id === editingId ? { ...t, ...formData } : t
    );

    saveTemplates(updated);
    resetForm();
    toast.success('Template updated successfully');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      saveTemplates(templates.filter(t => t.id !== id));
      toast.success('Template deleted successfully');
    }
  };

  const handleEdit = (template: FeedbackTemplate) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      category: template.category,
      commentType: template.commentType,
      content: template.content,
    });
  };

  const handleCopy = (template: FeedbackTemplate) => {
    navigator.clipboard.writeText(template.content);
    toast.success('Template content copied to clipboard');
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'general',
      commentType: 'observation',
      content: '',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {editingId ? 'Edit Template' : 'Create New Template'}
          </CardTitle>
          <CardDescription>
            Create reusable feedback templates for common observations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Strong Problem Solving"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v as any })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commentType">Comment Type</Label>
              <Select
                value={formData.commentType}
                onValueChange={(v) => setFormData({ ...formData, commentType: v as any })}
              >
                <SelectTrigger id="commentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="concern">Concern</SelectItem>
                  <SelectItem value="observation">Observation</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Template Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter the template content. Use [brackets] for placeholder text that should be customized."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={editingId ? handleUpdate : handleAdd} className="flex-1">
              {editingId ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Template
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </>
              )}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Templates ({templates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No templates yet. Create your first template above.
            </p>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 space-y-2 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-primary/10 rounded capitalize">
                          {template.category}
                        </span>
                        <span className="text-xs px-2 py-1 bg-secondary/10 rounded capitalize">
                          {template.commentType}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
