import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
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
import {
  FileText,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Download,
  Upload,
  Search,
  DollarSign,
  Clock,
} from 'lucide-react';
import {
  getExportTemplates,
  deleteExportTemplate,
  duplicateExportTemplate,
  exportTemplatesBackup,
  importTemplatesBackup,
  ExportTemplate,
} from '@/shared/lib/exportTemplateStorage';
import { ExportTemplateDialog } from './ExportTemplateDialog';
import { useToast } from '@/shared/hooks/use-toast';
import { format } from 'date-fns';

interface ExportTemplateManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableFields: string[];
  onTemplateSelect?: (template: ExportTemplate) => void;
}

export function ExportTemplateManager({
  open,
  onOpenChange,
  availableFields,
  onTemplateSelect,
}: ExportTemplateManagerProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<ExportTemplate | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ExportTemplate | null>(null);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = () => {
    const loadedTemplates = getExportTemplates();
    setTemplates(loadedTemplates);
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUseTemplate = (template: ExportTemplate) => {
    onTemplateSelect?.(template);
    toast({
      title: 'Template Applied',
      description: `Using template "${template.name}"`,
    });
    onOpenChange(false);
  };

  const handleEdit = (template: ExportTemplate) => {
    setEditingTemplate(template);
    setTemplateDialogOpen(true);
  };

  const handleDuplicate = (template: ExportTemplate) => {
    const duplicated = duplicateExportTemplate(template.id);
    if (duplicated) {
      loadTemplates();
      toast({
        title: 'Template Duplicated',
        description: `Created "${duplicated.name}"`,
      });
    }
  };

  const handleDeleteClick = (template: ExportTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!templateToDelete) return;

    const success = deleteExportTemplate(templateToDelete.id);
    if (success) {
      loadTemplates();
      toast({
        title: 'Template Deleted',
        description: `"${templateToDelete.name}" has been deleted`,
      });
    }
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  const handleExportBackup = () => {
    const backup = exportTemplatesBackup();
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `export-templates-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Backup Created',
      description: 'Your templates have been exported',
    });
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const jsonString = event.target?.result as string;
        const result = importTemplatesBackup(jsonString);

        if (result.success) {
          loadTemplates();
          toast({
            title: 'Import Successful',
            description: `Imported ${result.imported} template${result.imported !== 1 ? 's' : ''}`,
          });
        } else {
          toast({
            title: 'Import Failed',
            description: result.errors[0] || 'Failed to import templates',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setTemplateDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Export Templates
            </DialogTitle>
            <DialogDescription>
              Manage saved export configurations for quick reuse
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search and Actions */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleCreateNew} size="sm">
                Create New
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background z-50">
                  <DropdownMenuItem onClick={handleExportBackup}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Backup
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleImportBackup}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Backup
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Templates List */}
            <ScrollArea className="h-[450px]">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No templates found' : 'No templates yet'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateNew}
                    className="mt-4"
                  >
                    Create Your First Template
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTemplates.map(template => (
                    <div
                      key={template.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{template.name}</h4>
                            {template.currencyFields.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {template.currencyFields.length} currency
                              </Badge>
                            )}
                          </div>

                          {template.description && (
                            <p className="text-sm text-muted-foreground">
                              {template.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-1">
                            {template.fields.slice(0, 5).map(field => (
                              <Badge key={field} variant="outline" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                            {template.fields.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.fields.length - 5} more
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Updated {format(new Date(template.updatedAt), 'MMM d, yyyy')}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleUseTemplate(template)}
                          >
                            Use Template
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background z-50">
                              <DropdownMenuItem onClick={() => handleEdit(template)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(template)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="text-xs text-muted-foreground text-center">
              {templates.length} template{templates.length !== 1 ? 's' : ''} total
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Template Dialog */}
      <ExportTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        availableFields={availableFields}
        editTemplate={editingTemplate}
        onTemplateSaved={() => {
          loadTemplates();
          setEditingTemplate(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
