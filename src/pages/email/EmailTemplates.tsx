import { useState, useEffect } from "react";
import { apiClient } from "@/shared/lib/api";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/app/layouts/AtsPageHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
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
  Sparkles,
} from "lucide-react";
import {
  EmailTemplate,
  emailTemplateService,
} from "@/shared/lib/emailTemplateService";
import { TemplateEditor } from "@/modules/email/components/email-templates/TemplateEditor";
import { AIGenerateDialog } from "@/modules/email/components/email-templates/AIGenerateDialog";
import { TemplateAnalytics } from "@/modules/email/components/email-templates/TemplateAnalytics";
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
  const [aiGenerateOpen, setAiGenerateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Test Email State
  const [sendTestOpen, setSendTestOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testTemplateId, setTestTemplateId] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<EmailTemplate[]>('/api/email-templates');
      if (res.success && res.data) {
        setTemplates(res.data);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [refreshKey]);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" ? t.isActive : !t.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: templates.length,
    active: templates.filter(t => t.isActive).length,
    default: templates.filter(t => t.isDefault).length,
  };

  const getTypeColor = (type: EmailTemplate['type']) => {
    const colors: Record<string, string> = {
      NEW: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
      ASSESSMENT: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
      INTERVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
      INTERVIEW_INVITATION: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
      OFFER: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
      HIRED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
      REJECTED: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
      CUSTOM: 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400',
    };
    return colors[type] || colors['CUSTOM'];
  };

  const getTypeLabel = (type: EmailTemplate['type']) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setEditorOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditorOpen(true);
  };

  const handleSave = async (data: any, changeNote?: string) => {
    try {
      if (selectedTemplate && selectedTemplate.id) {
        const res = await apiClient.put(`/api/email-templates/${selectedTemplate.id}`, { ...data, changeNote });
        if (res.success) {
          toast({
            title: "Template updated",
            description: `"${data.name}" has been updated`,
          });
        }
      } else {
        const res = await apiClient.post('/api/email-templates', data);
        if (res.success) {
          toast({
            title: "Template created",
            description: `"${data.name}" has been created`,
          });
        }
      }
      setRefreshKey((k) => k + 1);
      setEditorOpen(false); // Close editor after save
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

   const handleDuplicate = (template: EmailTemplate) => {
    // Navigate to editor with copy of data as default
    setSelectedTemplate({
      ...template,
      id: '', // New ID will be generated
      name: `${template.name} (Copy)`,
      isDefault: false,
    });
    setEditorOpen(true);
  };
  
  const openSendTestDialog = (template: EmailTemplate) => {
    setTestTemplateId(template.id);
    setTestEmail(""); // Optionally prefill with current user email if available
    setSendTestOpen(true);
  };

  const handleSendTest = async () => {
    if (!testTemplateId || !testEmail) return;
    
    setSendingTest(true);
    try {
      await emailTemplateService.sendTestEmail(testTemplateId, testEmail);
      toast({
        title: "Success",
        description: `Test email sent to ${testEmail}`,
      });
      setSendTestOpen(false);
    } catch (error) {
      console.error(error);
       toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setSendingTest(false);
    }
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
      apiClient.delete(`/api/email-templates/${template.id}`).then(() => {
        toast({
          title: "Template deleted",
          description: `"${template.name}" has been removed`,
        });
        setRefreshKey((k) => k + 1);
      });
    }
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <AtsPageHeader title="Email Templates" subtitle="Manage automated email templates for candidate communications">
          <Button onClick={() => setAiGenerateOpen(true)} className="mr-2" variant="outline">
            <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
            Generate with AI
          </Button>
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

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-md transition-all border-l-4" style={{ 
              borderLeftColor: template.isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted))' 
            }}>
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <Badge className={cn("px-2 py-0.5 text-[10px] font-medium tracking-wide", getTypeColor(template.type))}>
                    {getTypeLabel(template.type)}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(template)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openSendTestDialog(template)}>
                         <Mail className="h-4 w-4 mr-2" />
                         Send Test
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

                <div className="mb-4 flex-1">
                  <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors cursor-pointer" onClick={() => handleEdit(template)}>
                    {template.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2" title={template.subject}>
                    {template.subject}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t mt-auto">
                   <div className="flex -space-x-2">
                     {template.isDefault && (
                        <div className="bg-background rounded-full p-0.5 border" title="Default Template">
                            <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                                <History className="h-3 w-3" />
                            </Badge>
                        </div>
                     )}
                     {template.isAiGenerated && (
                        <div className="bg-background rounded-full p-0.5 border" title="AI Generated">
                            <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center rounded-full bg-purple-100 text-purple-700 border-purple-200">
                                <Sparkles className="h-3 w-3" />
                            </Badge>
                        </div>
                     )}
                   </div>
                   
                   <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
                     {(() => {
                        try {
                          const date = template.updatedAt ? new Date(template.updatedAt) : new Date();
                          return isNaN(date.getTime()) 
                            ? 'Recently' 
                            : formatDistanceToNow(date, { addSuffix: true });
                        } catch (e) {
                          return 'Recently';
                        }
                      })()}
                   </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Card - visible at end of list */}
          <Card className="border-dashed flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-muted/50 transition-colors min-h-[200px]" onClick={handleCreate}>
             <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-background">
               <Plus className="h-6 w-6 text-muted-foreground" />
             </div>
             <h3 className="font-medium text-sm">Create New Template</h3>
          </Card>
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
        
        <AIGenerateDialog 
          open={aiGenerateOpen} 
          onOpenChange={setAiGenerateOpen}
          onGenerate={(generated) => {
            setSelectedTemplate({
              id: '', // New template
              name: 'AI Generated Template',
              type: 'CUSTOM', 
              subject: generated.subject,
              body: generated.body,
              variables: [],
              isActive: true,
              isDefault: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              version: 1,
              companyId: '', // Dummy value
              jobId: null,
              jobRoundId: null,
              isAiGenerated: true,
              createdBy: '', // Dummy value
            });
            setEditorOpen(true);
          }}
        />
      </div>
    </DashboardPageLayout>
  );
}
