import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Sparkles,
  Search,
  Star,
  FileText,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  Filter,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  WarningConfirmationDialog
} from "@/shared/components/ui/warning-confirmation-dialog";
import { jobService } from "@/shared/lib/jobService";
import { jobTemplateService, JobTemplate } from "@/shared/lib/jobTemplateService";
import { Job } from "@/shared/types/job";
import { useToast } from "@/shared/hooks/use-toast";
import { useAuth } from "@/app/providers/AuthContext";
import { CreateTemplateWithAIDialog } from "@/modules/jobs/components/templates/CreateTemplateWithAIDialog";
import { EditTemplateDialog } from "@/modules/jobs/components/templates/EditTemplateDialog";
import { formatDistanceToNow } from "date-fns";
import { templateCategories } from "@/shared/lib/jobTemplateService";
import { useDraftJob } from "@/shared/hooks/useDraftJob";
import { TemplatesPageSkeleton } from "@/modules/jobs/components/templates/TemplatesPageSkeleton";

export default function JobTemplates() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "name">("recent");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<JobTemplate | null>(null);
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [useTemplateDialogOpen, setUseTemplateDialogOpen] = useState(false);
  const [templateToUse, setTemplateToUse] = useState<JobTemplate | null>(null);
  const { draftJob: existingDraft, refetch: refetchDraft } = useDraftJob();
  const [latestDraft, setLatestDraft] = useState<Job | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await jobTemplateService.getTemplates({
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        search: searchQuery || undefined,
      });
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, toast]);

  // Fetch templates from backend
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Client-side sorting
  const sortedTemplates = useMemo(() => {
    let result = [...templates];

    switch (sortBy) {
      case "popular":
        result.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "recent":
      default:
        result.sort((a, b) => {
          const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return bTime - aTime;
        });
        break;
    }

    return result;
  }, [templates, sortBy]);

  const handleUseTemplate = async (template: JobTemplate) => {
    setTemplateToUse(template);

    // Refetch to get the latest draft before showing dialog
    const draft = await refetchDraft();
    setLatestDraft(draft);

    setUseTemplateDialogOpen(true);
  };

  const confirmUseTemplate = async () => {
    if (!templateToUse) return;

    try {
      // Get template data formatted for job creation
      const templateDataResponse = await jobTemplateService.getTemplateJobData(templateToUse.id);

      if (!templateDataResponse.success || !templateDataResponse.data) {
        throw new Error('Failed to get template data');
      }

      const jobRequest = templateDataResponse.data;

      // Record template usage
      await jobTemplateService.recordUsage(templateToUse.id);

      if (latestDraft?.id) {
        // Update existing draft with template data
        await jobService.updateJob(latestDraft.id, {
          ...jobRequest,
          status: 'DRAFT',
        });
      } else {
        // Create new draft with template data
        await jobService.createJob(jobRequest);
      }

      toast({
        title: "Template applied",
        description: `Template data has been filled into your draft job.`,
      });

      setUseTemplateDialogOpen(false);
      setTemplateToUse(null);

      // Navigate to jobs page to open the draft, with flag to indicate it's from template
      navigate('/ats/jobs?action=create&fromTemplate=true');
    } catch (error) {
      console.error('Error using template:', error);
      toast({
        title: "Error",
        description: "Failed to apply template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (template: JobTemplate) => {
    setEditingTemplate(template);
  };

  const handleDelete = async (template: JobTemplate) => {
    if (confirm(`Delete template "${template.name}"?`)) {
      try {
        await jobTemplateService.deleteTemplate(template.id);
        setTemplates(templates.filter(t => t.id !== template.id));
        toast({
          title: "Template deleted",
          description: `"${template.name}" has been removed.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete template",
          variant: "destructive",
        });
      }
    }
  };

  const handleDuplicate = (template: JobTemplate) => {
    toast({
      title: "Template duplicated",
      description: `Created a copy of "${template.name}".`,
    });
  };

  return (
    <DashboardPageLayout>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {loading ? (
          <TemplatesPageSkeleton />
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-4xl font-extrabold tracking-tight">Job Templates</h1>
                <p className="text-lg text-muted-foreground">
                  Build your library of recurring templates to hire faster.
                </p>
              </div>
              <Button size="lg" onClick={() => setCreateDialogOpen(true)} className="gap-2 shadow-lg hover:shadow-primary/20 transition-all duration-300">
                <Sparkles className="h-5 w-5" />
                Create Template with AI
              </Button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search templates by name, title or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-muted/20 border-none rounded-lg text-base"
                />
              </div>

              <div className="flex gap-3 w-full lg:w-auto">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[200px] h-12 rounded-lg border-muted/50 bg-muted/5">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {templateCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-lg border-muted/50 bg-muted/5">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Template Grid */}
            <div className="pt-2">
              <TemplateGrid
                templates={sortedTemplates}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onUseTemplate={handleUseTemplate}
              />
            </div>

            <CreateTemplateWithAIDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              onSuccess={fetchTemplates}
            />

            {editingTemplate && (
              <EditTemplateDialog
                template={editingTemplate}
                open={!!editingTemplate}
                onOpenChange={(open) => {
                  if (!open) {
                    setEditingTemplate(null);
                    fetchTemplates();
                  }
                }}
              />
            )}

            <WarningConfirmationDialog
              open={useTemplateDialogOpen}
              onOpenChange={(open) => {
                setUseTemplateDialogOpen(open);
                if (!open) {
                  setTemplateToUse(null);
                  setLatestDraft(null);
                }
              }}
              onConfirm={confirmUseTemplate}
              type="warning"
              title="Use Template?"
              description={
                latestDraft
                  ? `You have an existing draft job: "${latestDraft.title || 'Untitled Job'}". Using this template will overwrite your current draft with the template data. Any changes you made to the draft will be lost.`
                  : "This will create a new draft job using the template data."
              }
              confirmLabel={latestDraft ? 'Overwrite Draft & Use Template' : 'Use Template'}
            />
          </>
        )}
      </div>
    </DashboardPageLayout>
  );
}
interface TemplateGridProps {
  templates: JobTemplate[];
  onEdit: (template: JobTemplate) => void;
  onDuplicate: (template: JobTemplate) => void;
  onDelete: (template: JobTemplate) => void;
  onUseTemplate: (template: JobTemplate) => void;
}

function TemplateGrid({ templates, onEdit, onDuplicate, onDelete, onUseTemplate }: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No templates found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or create a new template
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card key={template.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {template.name}
                  {(template.usageCount || 0) > 20 && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-1 line-clamp-2">
                  {(() => {
                    const description = template.description || "No description";
                    const maxLength = 150;
                    if (description.length > maxLength) {
                      return description.substring(0, maxLength).trim() + "...";
                    }
                    return description;
                  })()}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background z-50">
                  <DropdownMenuItem onClick={() => onEdit(template)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(template)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(template)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <Badge variant="secondary">{template.category || template.jobData?.department || "Uncategorized"}</Badge>
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                Shared
              </Badge>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Job Title:</span>
                <span className="font-medium text-foreground">
                  {template.jobData?.title || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Created:</span>
                <span className="font-medium text-foreground">
                  {template.createdAt && !isNaN(new Date(template.createdAt).getTime()) ? formatDistanceToNow(new Date(template.createdAt), { addSuffix: true }) : 'recently'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Usage count:</span>
                <span className="font-medium text-foreground">
                  {template.usageCount || 0} times
                </span>
              </div>
            </div>

            {template.jobData?.title && (
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">Template includes:</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {template.jobData?.title && (
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      <span>Job Title: {template.jobData.title}</span>
                    </li>
                  )}
                  {template.jobData?.department && (
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      <span>Department: {template.jobData.department}</span>
                    </li>
                  )}
                  {template.jobData?.employmentType && (
                    <li className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      <span>Type: {template.jobData.employmentType}</span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => onUseTemplate(template)}
            >
              Use Template
            </Button>
          </CardContent>
        </Card>
      ))
      }
    </div >
  );
}
