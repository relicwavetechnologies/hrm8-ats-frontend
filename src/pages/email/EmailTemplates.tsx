import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/app/layouts/AtsPageHeader";
import { apiClient } from "@/shared/lib/api";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent } from "@/shared/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Mail,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  History,
  FileText,
  Sparkles,
  Activity,
  PieChart,
  BarChart3,
} from "lucide-react";
import {
  EmailTemplate,
  emailTemplateService,
} from "@/shared/lib/emailTemplateService";
import { TemplateEditor } from "@/modules/email/components/email-templates/TemplateEditor";
import { AIGenerateDialog } from "@/modules/email/components/email-templates/AIGenerateDialog";

function SparklineChart({ values, stroke }: { values: number[]; stroke: string }) {
  const width = 260;
  const height = 74;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);

  const points = values
    .map((value, idx) => {
      const x = (idx / Math.max(values.length - 1, 1)) * (width - 12) + 6;
      const y = ((max - value) / range) * (height - 16) + 8;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {values.map((value, idx) => {
        const x = (idx / Math.max(values.length - 1, 1)) * (width - 12) + 6;
        const y = ((max - value) / range) * (height - 16) + 8;
        return <circle key={`${value}-${idx}`} cx={x} cy={y} r="2" fill={stroke} />;
      })}
    </svg>
  );
}

function HorizontalBarChart({ data }: { data: Array<{ label: string; value: number; tone: string }> }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="grid grid-cols-[84px_1fr_24px] items-center gap-2">
          <span className="text-[11px] text-muted-foreground truncate">{item.label}</span>
          <div className="h-2 rounded bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded", item.tone)}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-right text-muted-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ active, inactive }: { active: number; inactive: number }) {
  const total = Math.max(active + inactive, 1);
  const activeDeg = (active / total) * 360;

  return (
    <div className="flex items-center gap-3">
      <div
        className="h-16 w-16 rounded-full"
        style={{
          background: `conic-gradient(hsl(var(--primary)) 0deg ${activeDeg}deg, hsl(var(--muted)) ${activeDeg}deg 360deg)`,
        }}
      >
        <div className="m-2 h-12 w-12 rounded-full bg-background border" />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Active {active}</p>
        <p className="text-xs text-muted-foreground">Inactive {inactive}</p>
      </div>
    </div>
  );
}

export default function EmailTemplates() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [aiGenerateOpen, setAiGenerateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sendTestOpen, setSendTestOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testTemplateId, setTestTemplateId] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<EmailTemplate[]>("/api/email-templates");
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

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || template.type === filterType;
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" ? template.isActive : !template.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [templates, searchQuery, filterType, filterStatus]);

  const stats = useMemo(() => {
    const active = templates.filter((t) => t.isActive).length;
    const aiGenerated = templates.filter((t) => t.isAiGenerated).length;
    const defaults = templates.filter((t) => t.isDefault).length;
    return {
      total: templates.length,
      active,
      inactive: Math.max(templates.length - active, 0),
      aiGenerated,
      defaults,
    };
  }, [templates]);

  const weeklyTrend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(now);
      day.setDate(now.getDate() - (6 - i));
      const dayKey = day.toISOString().slice(0, 10);
      return templates.filter((template) =>
        (template.updatedAt || template.createdAt || "").slice(0, 10) === dayKey,
      ).length;
    });
  }, [templates]);

  const typeDistribution = useMemo(() => {
    const counts = templates.reduce<Record<string, number>>((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value], idx) => ({
        label: label.replace(/_/g, " "),
        value,
        tone:
          idx === 0
            ? "bg-blue-500 dark:bg-blue-600"
            : idx === 1
              ? "bg-emerald-500 dark:bg-emerald-600"
              : idx === 2
                ? "bg-amber-500 dark:bg-amber-600"
                : idx === 3
                  ? "bg-violet-500 dark:bg-violet-600"
                  : "bg-slate-500 dark:bg-slate-600",
      }));
  }, [templates]);

  const getTypeColor = (type: EmailTemplate["type"]) => {
    const colors: Record<string, string> = {
      NEW: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
      ASSESSMENT: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800",
      INTERVIEW: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
      INTERVIEW_INVITATION: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
      OFFER: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
      OFFER_EXTENDED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
      OFFER_ACCEPTED: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
      HIRED: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800",
      REJECTED: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
      CUSTOM: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
      REMINDER: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800",
      FOLLOW_UP: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800",
      STAGE_CHANGE: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 dark:border-fuchsia-800",
      APPLICATION_CONFIRMATION: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800",
    };
    return colors[type] || colors.CUSTOM;
  };

  const getTypeLabel = (type: EmailTemplate["type"]) => {
    return type
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
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
      if (selectedTemplate?.id) {
        const res = await apiClient.put(`/api/email-templates/${selectedTemplate.id}`, {
          ...data,
          changeNote,
        });
        if (res.success) {
          toast({
            title: "Template updated",
            description: `\"${data.name}\" has been updated`,
          });
        }
      } else {
        const res = await apiClient.post("/api/email-templates", data);
        if (res.success) {
          toast({
            title: "Template created",
            description: `\"${data.name}\" has been created`,
          });
        }
      }
      setRefreshKey((k) => k + 1);
      setEditorOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = (template: EmailTemplate) => {
    setSelectedTemplate({
      ...template,
      id: "",
      name: `${template.name} (Copy)`,
      isDefault: false,
    });
    setEditorOpen(true);
  };

  const openSendTestDialog = (template: EmailTemplate) => {
    setTestTemplateId(template.id);
    setTestEmail("");
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

    if (confirm(`Delete template \"${template.name}\"?`)) {
      apiClient.delete(`/api/email-templates/${template.id}`).then(() => {
        toast({
          title: "Template deleted",
          description: `\"${template.name}\" has been removed`,
        });
        setRefreshKey((k) => k + 1);
      });
    }
  };

  return (
    <DashboardPageLayout>
      <div className="p-4 md:p-5 space-y-4">
        <AtsPageHeader
          title="Email Templates"
          subtitle="Compact template management with usage insights"
        >
          <Button onClick={() => setAiGenerateOpen(true)} size="sm" variant="outline" className="mr-2">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Generate with AI
          </Button>
          <Button onClick={handleCreate} size="sm">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Template
          </Button>
        </AtsPageHeader>

        <div className="grid gap-3 xl:grid-cols-3">
          <Card className="border">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">7-Day Update Trend</p>
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <SparklineChart values={weeklyTrend} stroke="hsl(var(--primary))" />
              <p className="text-[11px] text-muted-foreground">
                {stats.total} templates tracked
              </p>
            </CardContent>
          </Card>

          <Card className="border">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Top Template Types</p>
                <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <HorizontalBarChart data={typeDistribution.length ? typeDistribution : [{ label: "No data", value: 0, tone: "bg-slate-300" }]} />
            </CardContent>
          </Card>

          <Card className="border">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Activation Split</p>
                <PieChart className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <DonutChart active={stats.active} inactive={stats.inactive} />
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="rounded border p-2">
                  <p className="text-[10px] text-muted-foreground">Total</p>
                  <p className="text-sm font-semibold">{stats.total}</p>
                </div>
                <div className="rounded border p-2">
                  <p className="text-[10px] text-muted-foreground">Default</p>
                  <p className="text-sm font-semibold">{stats.defaults}</p>
                </div>
                <div className="rounded border p-2">
                  <p className="text-[10px] text-muted-foreground">AI</p>
                  <p className="text-sm font-semibold">{stats.aiGenerated}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border">
          <CardContent className="p-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name or subject"
                  className="h-8 pl-8 text-xs"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-8 w-[170px] text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="APPLICATION_CONFIRMATION">Application Confirmation</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="ASSESSMENT">Assessment</SelectItem>
                  <SelectItem value="INTERVIEW">Interview</SelectItem>
                  <SelectItem value="INTERVIEW_INVITATION">Interview Invitation</SelectItem>
                  <SelectItem value="STAGE_CHANGE">Stage Change</SelectItem>
                  <SelectItem value="REMINDER">Reminder</SelectItem>
                  <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                  <SelectItem value="OFFER">Offer</SelectItem>
                  <SelectItem value="OFFER_EXTENDED">Offer Extended</SelectItem>
                  <SelectItem value="OFFER_ACCEPTED">Offer Accepted</SelectItem>
                  <SelectItem value="HIRED">Hired</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="h-9 text-xs">Template</TableHead>
                    <TableHead className="h-9 text-xs">Type</TableHead>
                    <TableHead className="h-9 text-xs">Status</TableHead>
                    <TableHead className="h-9 text-xs">Version</TableHead>
                    <TableHead className="h-9 text-xs">Updated</TableHead>
                    <TableHead className="h-9 text-xs w-[64px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                      <TableRow key={`template-skeleton-${idx}`}>
                        <TableCell colSpan={6} className="h-10">
                          <div className="h-4 w-full rounded bg-muted/60 animate-pulse" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredTemplates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-20 text-center text-sm text-muted-foreground">
                        No templates found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTemplates.map((template) => (
                      <TableRow key={template.id} className="hover:bg-muted/20">
                        <TableCell className="py-2.5">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{template.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{template.subject}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] font-medium", getTypeColor(template.type))}
                          >
                            {getTypeLabel(template.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px]",
                                template.isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                                  : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
                              )}
                            >
                              {template.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {template.isDefault && (
                              <Badge variant="outline" className="text-[10px]">
                                <History className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                            {template.isAiGenerated && (
                              <Badge variant="outline" className="text-[10px]">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5 text-xs">v{template.version}</TableCell>
                        <TableCell className="py-2.5 text-xs text-muted-foreground">
                          {(() => {
                            try {
                              const date = template.updatedAt
                                ? new Date(template.updatedAt)
                                : new Date();
                              return Number.isNaN(date.getTime())
                                ? "Recently"
                                : formatDistanceToNow(date, { addSuffix: true });
                            } catch {
                              return "Recently";
                            }
                          })()}
                        </TableCell>
                        <TableCell className="py-2.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
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
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

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
              id: "",
              name: "AI Generated Template",
              type: "CUSTOM",
              subject: generated.subject,
              body: generated.body,
              variables: [],
              isActive: true,
              isDefault: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              version: 1,
              companyId: "",
              jobId: null,
              jobRoundId: null,
              isAiGenerated: true,
              createdBy: "",
            });
            setEditorOpen(true);
          }}
        />

        <Dialog open={sendTestOpen} onOpenChange={setSendTestOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Test Email</DialogTitle>
              <DialogDescription>
                Enter an email address to receive a test copy of this template.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="test-email">Email Address</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="you@company.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSendTestOpen(false)} disabled={sendingTest}>
                Cancel
              </Button>
              <Button onClick={handleSendTest} disabled={sendingTest || !testEmail}>
                {sendingTest ? "Sending..." : "Send Test"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPageLayout>
  );
}
