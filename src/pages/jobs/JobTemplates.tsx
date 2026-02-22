import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable, Column } from "@/shared/components/tables/DataTable";
import { Plus, Search, FileText, Edit, Copy, Trash2, MoreVertical, Filter, Users, TrendingUp } from "lucide-react";
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
import { WarningConfirmationDialog } from "@/shared/components/ui/warning-confirmation-dialog";
import { jobService } from "@/shared/lib/jobService";
import { jobTemplateService, JobTemplate, templateCategories } from "@/shared/lib/jobTemplateService";
import { Job } from "@/shared/types/job";
import { useToast } from "@/shared/hooks/use-toast";
import { useAuth } from "@/app/providers/AuthContext";
import { CreateTemplateWithAIDialog } from "@/modules/jobs/components/templates/CreateTemplateWithAIDialog";
import { EditTemplateDialog } from "@/modules/jobs/components/templates/EditTemplateDialog";
import { formatDistanceToNow } from "date-fns";
import { useDraftJob } from "@/shared/hooks/useDraftJob";
import { TemplatesPageSkeleton } from "@/modules/jobs/components/templates/TemplatesPageSkeleton";
import { FormDrawer } from "@/shared/components/ui/form-drawer";

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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<JobTemplate | null>(null);
  const [previewEditMode, setPreviewEditMode] = useState(false);
  const [savingPreview, setSavingPreview] = useState(false);
  const [previewForm, setPreviewForm] = useState({
    name: "",
    description: "",
    category: "",
    title: "",
    department: "",
    location: "",
    employmentType: "",
    workArrangement: "",
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "",
    requirementsText: "",
    responsibilitiesText: "",
    jobDescription: "",
  });
  const { refetch: refetchDraft } = useDraftJob();
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
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    if (showMyTemplates) {
      filtered = filtered.filter((t) => t.createdBy === user?.id);
    }

    if (sortBy === "popular") {
      filtered = [...filtered].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    } else if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      filtered = [...filtered].sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bTime - aTime;
      });
    }

    return filtered;
  }, [templates, sortBy, showMyTemplates, user]);

  const stats = useMemo(() => {
    return {
      total: templates.length,
      mine: templates.filter((t) => t.createdBy === user?.id).length,
      usage: templates.reduce((sum, t) => sum + (t.usageCount || 0), 0),
      categories: templateCategories.length,
    };
  }, [templates, user]);

  const getCategoryClass = (category?: string) => {
    const value = (category || "").toLowerCase();
    if (value.includes("engineering") || value.includes("tech")) {
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    }
    if (value.includes("sales") || value.includes("marketing")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    }
    if (value.includes("hr") || value.includes("people")) {
      return "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800";
    }
    if (value.includes("finance")) {
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
    }
    return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700";
  };

  const handleUseTemplate = async (template: JobTemplate) => {
    setTemplateToUse(template);
    const draft = await refetchDraft();
    setLatestDraft(draft);
    setUseTemplateDialogOpen(true);
  };

  const confirmUseTemplate = async () => {
    if (!templateToUse) return;

    try {
      const templateDataResponse = await jobTemplateService.getTemplateJobData(templateToUse.id);
      if (!templateDataResponse.success || !templateDataResponse.data) {
        throw new Error("Failed to get template data");
      }

      const jobRequest = templateDataResponse.data;
      await jobTemplateService.recordUsage(templateToUse.id);

      if (latestDraft?.id) {
        await jobService.updateJob(latestDraft.id, {
          ...jobRequest,
          status: "DRAFT",
        });
      } else {
        await jobService.createJob(jobRequest);
      }

      toast({ title: "Template applied", description: "Template data has been filled into your draft job." });
      setUseTemplateDialogOpen(false);
      setTemplateToUse(null);
      navigate("/ats/jobs?action=create&fromTemplate=true");
    } catch {
      toast({ title: "Error", description: "Failed to apply template. Please try again.", variant: "destructive" });
    }
  };

  const handleDelete = async (template: JobTemplate) => {
    if (!confirm(`Delete template "${template.name}"?`)) return;
    try {
      await jobTemplateService.deleteTemplate(template.id);
      setTemplates((prev) => prev.filter((t) => t.id !== template.id));
      toast({ title: "Template deleted", description: `"${template.name}" has been removed.` });
    } catch {
      toast({ title: "Error", description: "Failed to delete template", variant: "destructive" });
    }
  };

  const handleDuplicate = (template: JobTemplate) => {
    toast({ title: "Template duplicated", description: `Created a copy of "${template.name}".` });
  };

  const openPreview = (template: JobTemplate) => {
    const jobData = template.jobData || ({} as any);
    setPreviewTemplate(template);
    setPreviewForm({
      name: template.name || "",
      description: template.description || "",
      category: template.category || "",
      title: jobData.title || "",
      department: jobData.department || "",
      location: jobData.location || "",
      employmentType: jobData.employmentType || "",
      workArrangement: jobData.workArrangement || "",
      experienceLevel: jobData.experienceLevel || "",
      salaryMin: jobData.salaryMin != null ? String(jobData.salaryMin) : "",
      salaryMax: jobData.salaryMax != null ? String(jobData.salaryMax) : "",
      salaryCurrency: jobData.salaryCurrency || "",
      requirementsText: Array.isArray(jobData.requirements) ? jobData.requirements.join("\n") : "",
      responsibilitiesText: Array.isArray(jobData.responsibilities) ? jobData.responsibilities.join("\n") : "",
      jobDescription: jobData.description || "",
    });
    setPreviewEditMode(false);
    setPreviewOpen(true);
  };

  const handleSavePreview = async () => {
    if (!previewTemplate) return;
    setSavingPreview(true);
    try {
      const parsedMin = previewForm.salaryMin.trim() === "" ? undefined : Number(previewForm.salaryMin);
      const parsedMax = previewForm.salaryMax.trim() === "" ? undefined : Number(previewForm.salaryMax);
      const requirements = previewForm.requirementsText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
      const responsibilities = previewForm.responsibilitiesText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        name: previewForm.name.trim(),
        description: previewForm.description.trim(),
        category: previewForm.category.trim() || "Custom",
        jobData: {
          ...previewTemplate.jobData,
          title: previewForm.title.trim(),
          department: previewForm.department.trim(),
          location: previewForm.location.trim(),
          employmentType: previewForm.employmentType.trim() as any,
          workArrangement: previewForm.workArrangement.trim() as any,
          experienceLevel: previewForm.experienceLevel.trim(),
          salaryMin: Number.isFinite(parsedMin as number) ? parsedMin : undefined,
          salaryMax: Number.isFinite(parsedMax as number) ? parsedMax : undefined,
          salaryCurrency: previewForm.salaryCurrency.trim() || "USD",
          requirements,
          responsibilities,
          description: previewForm.jobDescription,
        },
      };

      const response = await jobTemplateService.updateTemplate(previewTemplate.id, payload);
      if (!response.success) {
        throw new Error(response.error || "Failed to update template");
      }

      toast({ title: "Template updated", description: "Changes saved successfully." });
      await fetchTemplates();
      setPreviewEditMode(false);
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save template changes",
        variant: "destructive",
      });
    } finally {
      setSavingPreview(false);
    }
  };

  const columns = useMemo((): Column<JobTemplate>[] => [
    {
      key: "name",
      label: "Template",
      sortable: true,
      render: (template) => (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold truncate">{template.name}</p>
            {(template.usageCount || 0) > 20 && (
              <Badge variant="secondary" className="h-5 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                Popular
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1">{template.description || "No description"}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (template) => (
        <Badge variant="outline" className={`h-5 text-[10px] ${getCategoryClass(template.category || template.jobData?.department)}`}>
          {template.category || template.jobData?.department || "Uncategorized"}
        </Badge>
      ),
    },
    {
      key: "jobTitle",
      label: "Job Title",
      render: (template) => (
        <span className="text-xs font-medium">{template.jobData?.title || "N/A"}</span>
      ),
    },
    {
      key: "usageCount",
      label: "Usage",
      sortable: true,
      render: (template) => (
        <Badge variant="outline" className="h-5 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
          {template.usageCount || 0}
        </Badge>
      ),
    },
    {
      key: "updatedAt",
      label: "Updated",
      sortable: true,
      render: (template) => (
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(template.updatedAt || template.createdAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: "shared",
      label: "Shared",
      render: () => (
        <Badge variant="secondary" className="h-5 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
          <Users className="h-3 w-3 mr-1" /> Team
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "130px",
      render: (template) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleUseTemplate(template)}>
            Use
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-xs" onClick={() => setEditingTemplate(template)}>
                <Edit className="h-3.5 w-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={() => handleDuplicate(template)}>
                <Copy className="h-3.5 w-3.5 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-destructive" onClick={() => handleDelete(template)}>
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [handleUseTemplate]);

  return (
    <DashboardPageLayout>
      <div className="p-4 space-y-4">
        {loading ? (
          <TemplatesPageSkeleton />
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-semibold">Job Templates</h1>
                <p className="text-xs text-muted-foreground">Reusable templates in compact table view</p>
              </div>
              <Button size="sm" className="h-8 text-xs" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Create Template
              </Button>
            </div>

            <div className="border rounded-md bg-gradient-to-r from-slate-50 to-blue-50/40 dark:from-slate-900/40 dark:to-blue-900/10 px-2 py-1.5">
              <div className="flex items-center gap-2 text-[11px]">
                <Badge variant="outline" className="h-6 rounded-md bg-white border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">Total {stats.total}</Badge>
                <Badge variant="outline" className="h-6 rounded-md bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400">Mine {stats.mine}</Badge>
                <Badge variant="outline" className="h-6 rounded-md bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400">Usage {stats.usage}</Badge>
                <Badge variant="outline" className="h-6 rounded-md bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-900/30 dark:border-violet-800 dark:text-violet-400">Categories {stats.categories}</Badge>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px] h-8 text-xs">
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {templateCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as "recent" | "popular" | "name")}>
                <SelectTrigger className="w-full sm:w-[160px] h-8 text-xs">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant={showMyTemplates ? "default" : "outline"}
                onClick={() => setShowMyTemplates(!showMyTemplates)}
                className="h-8 text-xs"
              >
                My Templates
              </Button>
            </div>

            <DataTable
              data={filteredTemplates}
              columns={columns}
              compact
              searchable={false}
              selectable={false}
              emptyMessage="No templates found"
              tableId="job-templates"
              onRowClick={openPreview}
            />

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
                  ? `You have an existing draft job: "${latestDraft.title || "Untitled Job"}". Using this template will overwrite your current draft.`
                  : "This will create a new draft job using the template data."
              }
              confirmLabel={latestDraft ? "Overwrite Draft & Use Template" : "Use Template"}
            />

            <FormDrawer
              open={previewOpen}
              onOpenChange={(open) => {
                setPreviewOpen(open);
                if (!open) {
                  setPreviewTemplate(null);
                  setPreviewEditMode(false);
                }
              }}
              title={previewTemplate?.name || "Template Preview"}
              description="Template details and editable fields"
              width="lg"
            >
              {!previewTemplate ? null : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`h-5 text-[10px] ${getCategoryClass(previewForm.category)}`}>
                        {previewForm.category || "Uncategorized"}
                      </Badge>
                      <Badge variant="outline" className="h-5 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                        Used {previewTemplate.usageCount || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={previewEditMode ? "secondary" : "outline"}
                        className="h-7 text-xs"
                        onClick={() => setPreviewEditMode((prev) => !prev)}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        {previewEditMode ? "Cancel Edit" : "Edit"}
                      </Button>
                      {previewEditMode && (
                        <Button size="sm" className="h-7 text-xs" onClick={handleSavePreview} disabled={savingPreview}>
                          {savingPreview ? "Saving..." : "Save Changes"}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">Template Name</p>
                      <Input
                        value={previewForm.name}
                        onChange={(e) => setPreviewForm((prev) => ({ ...prev, name: e.target.value }))}
                        disabled={!previewEditMode}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">Category</p>
                      <Input
                        value={previewForm.category}
                        onChange={(e) => setPreviewForm((prev) => ({ ...prev, category: e.target.value }))}
                        disabled={!previewEditMode}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[11px] text-muted-foreground mb-1">Template Description</p>
                      <Textarea
                        value={previewForm.description}
                        onChange={(e) => setPreviewForm((prev) => ({ ...prev, description: e.target.value }))}
                        disabled={!previewEditMode}
                        className="min-h-[70px] text-xs"
                      />
                    </div>
                  </div>

                  <div className="border rounded-md p-2.5 space-y-2">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Job Configuration</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input value={previewForm.title} onChange={(e) => setPreviewForm((p) => ({ ...p, title: e.target.value }))} disabled={!previewEditMode} className="h-8 text-xs" placeholder="Job title" />
                      <Input value={previewForm.department} onChange={(e) => setPreviewForm((p) => ({ ...p, department: e.target.value }))} disabled={!previewEditMode} className="h-8 text-xs" placeholder="Department" />
                      <Input value={previewForm.location} onChange={(e) => setPreviewForm((p) => ({ ...p, location: e.target.value }))} disabled={!previewEditMode} className="h-8 text-xs" placeholder="Location" />
                      <Input value={previewForm.employmentType} onChange={(e) => setPreviewForm((p) => ({ ...p, employmentType: e.target.value }))} disabled={!previewEditMode} className="h-8 text-xs" placeholder="Employment type" />
                      <Input value={previewForm.workArrangement} onChange={(e) => setPreviewForm((p) => ({ ...p, workArrangement: e.target.value }))} disabled={!previewEditMode} className="h-8 text-xs" placeholder="Work arrangement" />
                      <Input value={previewForm.experienceLevel} onChange={(e) => setPreviewForm((p) => ({ ...p, experienceLevel: e.target.value }))} disabled={!previewEditMode} className="h-8 text-xs" placeholder="Experience level" />
                    </div>
                  </div>

                  <div className="border rounded-md p-2.5 space-y-2">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Compensation</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input value={previewForm.salaryMin} onChange={(e) => setPreviewForm((p) => ({ ...p, salaryMin: e.target.value }))} disabled={!previewEditMode} className="h-8 text-xs" placeholder="Salary min" />
                      <Input value={previewForm.salaryMax} onChange={(e) => setPreviewForm((p) => ({ ...p, salaryMax: e.target.value }))} disabled={!previewEditMode} className="h-8 text-xs" placeholder="Salary max" />
                      <Input value={previewForm.salaryCurrency} onChange={(e) => setPreviewForm((p) => ({ ...p, salaryCurrency: e.target.value }))} disabled={!previewEditMode} className="h-8 text-xs" placeholder="Currency" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="border rounded-md p-2.5 space-y-2">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Requirements (one per line)</p>
                      <Textarea
                        value={previewForm.requirementsText}
                        onChange={(e) => setPreviewForm((p) => ({ ...p, requirementsText: e.target.value }))}
                        disabled={!previewEditMode}
                        className="min-h-[120px] text-xs"
                      />
                    </div>
                    <div className="border rounded-md p-2.5 space-y-2">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Responsibilities (one per line)</p>
                      <Textarea
                        value={previewForm.responsibilitiesText}
                        onChange={(e) => setPreviewForm((p) => ({ ...p, responsibilitiesText: e.target.value }))}
                        disabled={!previewEditMode}
                        className="min-h-[120px] text-xs"
                      />
                    </div>
                  </div>

                  <div className="border rounded-md p-2.5 space-y-2">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Job Description</p>
                    <Textarea
                      value={previewForm.jobDescription}
                      onChange={(e) => setPreviewForm((p) => ({ ...p, jobDescription: e.target.value }))}
                      disabled={!previewEditMode}
                      className="min-h-[140px] text-xs"
                    />
                  </div>
                </div>
              )}
            </FormDrawer>
          </>
        )}
      </div>
    </DashboardPageLayout>
  );
}
