import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardPageLayout } from '@/app/layouts/DashboardPageLayout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { TemplateBuilderDialog } from '@/modules/assessments/components/TemplateBuilderDialog';
import { ProviderTemplateImportDialog } from '@/modules/assessments/components/ProviderTemplateImportDialog';
import { 
  Plus, Search, Filter, Copy, Pencil, Trash2, Download,
  Clock, FileText, Target, ToggleLeft, ToggleRight 
} from 'lucide-react';
import { WarningConfirmationDialog } from '@/shared/components/ui/warning-confirmation-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  getAssessmentTemplates,
  saveAssessmentTemplate,
  updateAssessmentTemplate,
  deleteAssessmentTemplate,
  duplicateAssessmentTemplate,
} from '@/shared/lib/mockAssessmentTemplateStorage';
import type { AssessmentTemplate, AssessmentType } from '@/shared/types/assessment';
import { useToast } from '@/shared/hooks/use-toast';

export default function AssessmentTemplates() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<AssessmentTemplate[]>(getAssessmentTemplates());
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssessmentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showBuilder, setShowBuilder] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AssessmentTemplate | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const refreshTemplates = () => {
    setTemplates(getAssessmentTemplates());
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          template.name.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower) ||
          template.categories.some(cat => cat.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && template.assessmentType !== typeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'active' && !template.isActive) return false;
      if (statusFilter === 'inactive' && template.isActive) return false;

      return true;
    });
  }, [templates, searchTerm, typeFilter, statusFilter]);

  const handleSaveTemplate = (template: AssessmentTemplate) => {
    if (editingTemplate) {
      updateAssessmentTemplate(template.id, template);
      toast({
        title: "Template Updated",
        description: `"${template.name}" has been updated successfully.`,
      });
    } else {
      saveAssessmentTemplate(template);
      toast({
        title: "Template Created",
        description: `"${template.name}" has been created successfully.`,
      });
    }
    refreshTemplates();
    setEditingTemplate(undefined);
  };

  const handleEditTemplate = (template: AssessmentTemplate) => {
    setEditingTemplate(template);
    setShowBuilder(true);
  };

  const handleDuplicateTemplate = (id: string) => {
    const duplicated = duplicateAssessmentTemplate(id);
    if (duplicated) {
      toast({
        title: "Template Duplicated",
        description: `"${duplicated.name}" has been created.`,
      });
      refreshTemplates();
    }
  };

  const handleToggleActive = (template: AssessmentTemplate) => {
    updateAssessmentTemplate(template.id, { isActive: !template.isActive });
    toast({
      title: template.isActive ? "Template Deactivated" : "Template Activated",
      description: `"${template.name}" is now ${template.isActive ? 'inactive' : 'active'}.`,
    });
    refreshTemplates();
  };

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (templateToDelete) {
      const template = templates.find(t => t.id === templateToDelete);
      deleteAssessmentTemplate(templateToDelete);
      toast({
        title: "Template Deleted",
        description: `"${template?.name}" has been deleted.`,
        variant: "destructive",
      });
      refreshTemplates();
      setTemplateToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const getTypeLabel = (type: AssessmentType) => {
    const labels: Record<AssessmentType, string> = {
      'cognitive': 'Cognitive',
      'personality': 'Personality',
      'technical-skills': 'Technical',
      'situational-judgment': 'Situational',
      'behavioral': 'Behavioral',
      'culture-fit': 'Culture Fit',
      'custom': 'Custom',
    };
    return labels[type];
  };

  const stats = useMemo(() => ({
    total: templates.length,
    active: templates.filter(t => t.isActive).length,
    inactive: templates.filter(t => !t.isActive).length,
  }), [templates]);

  return (
    <DashboardPageLayout
      title="Assessment Templates"
      subtitle="Create and manage reusable assessment templates"
      breadcrumbActions={
        <div className="text-base font-semibold flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/assessment-templates/builder/new')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Build Questionnaire
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportDialog(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Import Templates
          </Button>
          <Button onClick={() => {
            setEditingTemplate(undefined);
            setShowBuilder(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="transition-[background,border-color,box-shadow,color] duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="transition-[background,border-color,box-shadow,color] duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <ToggleRight className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.active}</div>
            </CardContent>
          </Card>

          <Card className="transition-[background,border-color,box-shadow,color] duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="transition-[background,border-color,box-shadow,color] duration-500">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as AssessmentType | 'all')}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cognitive">Cognitive</SelectItem>
                  <SelectItem value="personality">Personality</SelectItem>
                  <SelectItem value="technical-skills">Technical Skills</SelectItem>
                  <SelectItem value="situational-judgment">Situational Judgment</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="culture-fit">Culture Fit</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive')}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <Card className="transition-[background,border-color,box-shadow,color] duration-500">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first assessment template'}
              </p>
              {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
                <Button onClick={() => {
                  setEditingTemplate(undefined);
                  setShowBuilder(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Template
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {getTypeLabel(template.assessmentType)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{template.duration}m</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>{template.questionCount} Q</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Target className="h-3 w-3" />
                      <span>{template.passThreshold}%</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Categories:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.categories.slice(0, 3).map((category) => (
                        <Badge key={category} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                      {template.categories.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.categories.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                   <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(`/assessment-templates/builder/${template.id}`)}
                      className="flex-1"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Build Questions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template.id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(template)}
                    >
                      {template.isActive ? (
                        <ToggleLeft className="h-3 w-3" />
                      ) : (
                        <ToggleRight className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(template.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Template Builder Dialog */}
      <TemplateBuilderDialog
        open={showBuilder}
        onClose={() => {
          setShowBuilder(false);
          setEditingTemplate(undefined);
        }}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />

      {/* Provider Import Dialog */}
      <ProviderTemplateImportDialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportComplete={refreshTemplates}
      />

      {/* Delete Confirmation Dialog */}
      <WarningConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        type="delete"
        title="Delete Template?"
        description="This action cannot be undone. This template will be permanently deleted."
      />
    </DashboardPageLayout>
  );
}
