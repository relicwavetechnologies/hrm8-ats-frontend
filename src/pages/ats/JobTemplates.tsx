import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Plus,
  Search,
  Star,
  TrendingUp,
  FileText,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  Filter,
  Users,
  Building2
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
import { mapBackendJobToFormData } from "@/shared/lib/jobDataMapper";
import { Job } from "@/shared/types/job";
import { useToast } from "@/shared/hooks/use-toast";
import { useAuth } from "@/app/AuthContext";
import { CreateTemplateDialog } from "@/modules/jobs/components/templates/CreateTemplateDialog";
import { EditTemplateDialog } from "@/modules/jobs/components/templates/EditTemplateDialog";
import { formatDistanceToNow } from "date-fns";
import { templateCategories } from "@/shared/lib/jobTemplateService";
import { useDraftJob } from "@/shared/hooks/useDraftJob";
import { transformJobFormDataToCreateRequest } from "@/shared/lib/jobFormTransformers";
import { TemplatesPageSkeleton } from "@/modules/jobs/components/templates/TemplatesPageSkeleton";

export default function JobTemplates() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "name">("recent");
  const [showMyTemplates, setShowMyTemplates] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<JobTemplate | null>(null);
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [useTemplateDialogOpen, setUseTemplateDialogOpen] = useState(false);
  const [templateToUse, setTemplateToUse] = useState<JobTemplate | null>(null);
  const { draftJob: existingDraft, refetch: refetchDraft } = useDraftJob();
  const [latestDraft, setLatestDraft] = useState<Job | null>(null);

  // Fetch templates from backend
  useEffect(() => {
    const fetchTemplates = async () => {
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
    };

    fetchTemplates();
  }, [toast, selectedCategory, searchQuery]);

  const allTemplates = templates;
  const popularTemplates = [...templates].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, 10);

  // Filter templates (client-side filtering for my templates and sorting)
  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    // My templates filter
    if (showMyTemplates) {
      filtered = filtered.filter((t) => t.createdBy === user?.id);
    }

    // Sort
    switch (sortBy) {
      case "popular":
        filtered = [...filtered].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
        break;
      case "name":
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "recent":
      default:
        filtered = [...filtered].sort((a, b) => {
          const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return bTime - aTime;
        });
        break;
    }

    return filtered;
  }, [allTemplates, sortBy, showMyTemplates, user]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: allTemplates.length,
      myTemplates: allTemplates.filter((t) => t.createdBy === user?.id).length,
      shared: allTemplates.length, // All templates are shared within company
      totalUsage: allTemplates.reduce((sum, t) => sum + (t.usageCount || 0), 0),
    };
  }, [allTemplates, user]);


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
      <div className="p-6 space-y-6">
        {loading ? (
          <TemplatesPageSkeleton />
        ) : (
          <>
            {/* Header */}
            <div className="text-base font-semibold flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Job Templates</h1>
                <p className="text-muted-foreground">
                  Create and manage reusable job posting templates
                </p>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.myTemplates} created by you
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shared Templates</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.shared}</div>
                  <p className="text-xs text-muted-foreground">
                    Available to team
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsage}</div>
                  <p className="text-xs text-muted-foreground">
                    Times used
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{templateCategories.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Template categories
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
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
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showMyTemplates ? "default" : "outline"}
                onClick={() => setShowMyTemplates(!showMyTemplates)}
              >
                My Templates
              </Button>
            </div>

            {/* Templates Tabs */}
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">
                  All Templates ({filteredTemplates.length})
                </TabsTrigger>
                <TabsTrigger value="popular">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Popular
                </TabsTrigger>
                {templateCategories.slice(0, 3).map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <TemplateGrid
                  templates={filteredTemplates}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onUseTemplate={handleUseTemplate}
                />
              </TabsContent>

              <TabsContent value="popular" className="space-y-4">
                <TemplateGrid
                  templates={popularTemplates}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onUseTemplate={handleUseTemplate}
                />
              </TabsContent>

              {templateCategories.slice(0, 3).map((category) => (
                <TabsContent key={category} value={category} className="space-y-4">
                  <TemplateGrid
                    templates={filteredTemplates.filter((t) => t.category === category || t.jobData?.department === category)}
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                    onUseTemplate={handleUseTemplate}
                  />
                </TabsContent>
              ))}
            </Tabs>

            <CreateTemplateDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
            />

            {editingTemplate && (
              <EditTemplateDialog
                template={editingTemplate}
                open={!!editingTemplate}
                onOpenChange={(open) => {
                  if (!open) {
                    setEditingTemplate(null);
                    // Refetch templates after editing
                    const fetchTemplates = async () => {
                      try {
                        const response = await jobTemplateService.getTemplates({
                          category: selectedCategory !== "all" ? selectedCategory : undefined,
                          search: searchQuery || undefined,
                        });
                        if (response.success && response.data) {
                          setTemplates(response.data);
                        }
                      } catch (error) {
                        console.error('Error fetching templates:', error);
                      }
                    };
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
              <div className="text-base font-semibold flex items-center justify-between">
                <span>Usage count:</span>
                <span className="font-medium text-foreground">
                  {template.usageCount || 0} times
                </span>
              </div>
              <div className="text-base font-semibold flex items-center justify-between">
                <span>Created:</span>
                <span className="font-medium text-foreground">
                  {formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            {template.jobData?.title && (
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">Template includes:</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {template.jobData.title && (
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
      ))}
    </div>
  );
}
