import { useState } from "react";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/components/layouts/AtsPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Mail,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  History,
  Filter,
  FileText,
  BarChart3,
} from "lucide-react";
import {
  getEmailTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  EmailTemplate,
} from "@/shared/lib/emailTemplateService";
import { TemplateEditor } from "@/components/email-templates/TemplateEditor";
import { TemplateAnalytics } from "@/components/email-templates/TemplateAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useToast } from "@/shared/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/shared/lib/utils";

export default function EmailTemplates() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const templates = getEmailTemplates({
    type: filterType !== "all" ? (filterType as any) : undefined,
    isActive: filterStatus === "active" ? true : filterStatus === "inactive" ? false : undefined,
  }).filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: getEmailTemplates().length,
    active: getEmailTemplates({ isActive: true }).length,
    default: getEmailTemplates().filter((t) => t.isDefault).length,
  };

  const getTypeColor = (type: EmailTemplate['type']) => {
    const colors = {
      application_confirmation: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
      interview_invitation: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
      offer_letter: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
      rejection: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
      stage_change: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
      reminder: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
      custom: 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400',
    };
    return colors[type];
  };

  const getTypeLabel = (type: EmailTemplate['type']) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setEditorOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditorOpen(true);
  };

  const handleSave = (data: any, changeNote?: string) => {
    if (selectedTemplate) {
      updateTemplate(selectedTemplate.id, data, changeNote);
      toast({
        title: "Template updated",
        description: `"${data.name}" has been updated`,
      });
    } else {
      const newTemplate = createTemplate({
        ...data,
        createdBy: 'current-user',
      });
      toast({
        title: "Template created",
        description: `"${newTemplate.name}" has been created`,
      });
    }
    setRefreshKey((k) => k + 1);
  };

  const handleDuplicate = (template: EmailTemplate) => {
    const newName = `${template.name} (Copy)`;
    duplicateTemplate(template.id, newName);
    toast({
      title: "Template duplicated",
      description: `Created "${newName}"`,
    });
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = (template: EmailTemplate) => {
    if (template.isDefault) {
      toast({
        title: "Cannot delete",
        description: "Default templates cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Delete template "${template.name}"?`)) {
      deleteTemplate(template.id);
      toast({
        title: "Template deleted",
        description: `"${template.name}" has been removed`,
      });
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <AtsPageHeader title="Email Templates" subtitle="Manage automated email templates for candidate communications">
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </AtsPageHeader>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Default Templates</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.default}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList>
            <TabsTrigger value="templates">
              <Mail className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="application_confirmation">Application Confirmation</SelectItem>
              <SelectItem value="interview_invitation">Interview Invitation</SelectItem>
              <SelectItem value="offer_letter">Offer Letter</SelectItem>
              <SelectItem value="rejection">Rejection</SelectItem>
              <SelectItem value="stage_change">Stage Change</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || filterType !== "all" || filterStatus !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setFilterType("all");
                setFilterStatus("all");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Templates List */}
        <div className="space-y-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <Badge className={getTypeColor(template.type)}>
                        {getTypeLabel(template.type)}
                      </Badge>
                      {template.isDefault && (
                        <Badge variant="outline">Default</Badge>
                      )}
                      {!template.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                      <span className="font-medium">Subject:</span> {template.subject}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Version {template.version}</span>
                      <span>•</span>
                      <span>{template.variables.length} variables</span>
                      <span>•</span>
                      <span>Updated {formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}</span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(template)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {!template.isDefault && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(template)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}

          {templates.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery || filterType !== "all" || filterStatus !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first email template to get started"}
                </p>
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <TemplateAnalytics />
          </TabsContent>
        </Tabs>

        <TemplateEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          template={selectedTemplate}
          onSave={handleSave}
        />
      </div>
    </DashboardPageLayout>
  );
}
