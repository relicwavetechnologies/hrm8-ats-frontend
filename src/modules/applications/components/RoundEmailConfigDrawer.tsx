import { useState, useEffect } from "react";
import { FormDrawer } from "@/shared/components/ui/form-drawer";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { jobRoundService, JobRound } from "@/shared/lib/jobRoundService";
import { emailTemplateService, EmailTemplate, EmailTemplateType } from "@/shared/lib/emailTemplateService";
import { apiClient } from "@/shared/lib/api";
import { jobService } from "@/shared/lib/jobService";
import { interviewService } from "@/shared/lib/interviewService";
import { assessmentService } from "@/shared/lib/assessmentService";
import { toast } from "sonner";
import { Save, AlertCircle, Plus, Sparkles, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import type { JobRole } from "@/shared/types/job";

interface RoundEmailConfigDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  round: JobRound | null;
  roles?: JobRole[];
  jobTitle?: string;
  onSuccess?: () => void;
}

export function RoundEmailConfigDrawer({
  open,
  onOpenChange,
  jobId,
  round,
  roles = [],
  jobTitle = "",
  onSuccess,
}: RoundEmailConfigDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [assignedRoleId, setAssignedRoleId] = useState<string>("");
  const [syncPermissions, setSyncPermissions] = useState(true);
  const [autoMoveOnPass, setAutoMoveOnPass] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiContext, setAiContext] = useState("");
  const [aiTone, setAiTone] = useState("professional");
  const [aiGenerating, setAiGenerating] = useState(false);

  const [loadedRoles, setLoadedRoles] = useState<JobRole[]>([]);
  const [jobTitleFromApi, setJobTitleFromApi] = useState("");
  const effectiveRoles = roles?.length ? roles : loadedRoles;
  const effectiveJobTitle = jobTitle || jobTitleFromApi;

  useEffect(() => {
    if (open && jobId && round) {
      setAssignedRoleId(round.assignedRoleId ?? "");
      setSyncPermissions(round.syncPermissions ?? true);
      loadData();
    }
  }, [open, jobId, round]);

  useEffect(() => {
    if (!open || !jobId) return;
    if (roles?.length) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await jobService.getJobRoles(jobId);
        if (cancelled) return;
        if (res.success && res.data?.roles) setLoadedRoles(res.data.roles);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [open, jobId, roles?.length]);

  useEffect(() => {
    if (!open || !jobId || jobTitle) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await jobService.getJobById(jobId);
        if (cancelled) return;
        if (res.success && res.data?.job?.title) setJobTitleFromApi(res.data.job.title);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [open, jobId, jobTitle]);

  useEffect(() => {
    if (selectedTemplateId) {
      const found = templates.find(t => t.id === selectedTemplateId);
      setSelectedTemplate(found || null);
    } else {
      setSelectedTemplate(null);
    }
  }, [selectedTemplateId, templates]);

  const getExpectedTemplateType = (roundType: string, fixedKey?: string | null): EmailTemplateType | undefined => {
    if (fixedKey === 'NEW') return 'NEW';
    if (fixedKey === 'OFFER') return 'OFFER'; 
    if (fixedKey === 'HIRED') return 'HIRED';
    if (fixedKey === 'REJECTED') return 'REJECTED';
    
    if (roundType === 'ASSESSMENT') return 'ASSESSMENT';
    if (roundType === 'INTERVIEW') return 'INTERVIEW'; // Simplified from INTERVIEW_INVITATION
    
    return undefined;
  };

  const formatTemplateTypeLabel = (type: string | undefined) => {
    if (!type) return 'Unknown';
    switch (type) {
        case 'NEW': return 'New Application';
        case 'APPLICATION_CONFIRMATION': return 'New Application'; // Fallback
        case 'ASSESSMENT': return 'Assessment';
        case 'INTERVIEW': return 'Interview';
        case 'INTERVIEW_INVITATION': return 'Interview'; // Map legacy to simple
        case 'OFFER': return 'Offer';
        case 'HIRED': return 'Hired';
        case 'REJECTED': return 'Rejected';
        default:
            return type.split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (!round) return;

      // 1. Load Config
      const configRes = await jobRoundService.getEmailConfig(jobId, round.id);
      if (configRes.success && configRes.data) {
        setEnabled(configRes.data.enabled);
        setSelectedTemplateId(configRes.data.templateId || "");
      } else {
        setEnabled(false);
        setSelectedTemplateId("");
      }

      // 2. Load existing auto-move-on-pass: fixed rounds from round.autoMoveOnPass, custom from interview/assessment config
      if (round.isFixed) {
        setAutoMoveOnPass(Boolean(round.autoMoveOnPass));
      } else if (round.type === "INTERVIEW" || round.type === "ASSESSMENT") {
        try {
          if (round.type === "INTERVIEW") {
            const ir = await interviewService.getInterviewConfig(jobId, round.id);
            const c = ir.data?.config as { auto_move_on_pass?: boolean; autoMoveOnPass?: boolean } | undefined;
            setAutoMoveOnPass(Boolean(c?.auto_move_on_pass ?? c?.autoMoveOnPass));
          } else {
            const ar = await assessmentService.getAssessmentConfig(jobId, round.id);
            const c = ar.data?.config as { auto_move_on_pass?: boolean; autoMoveOnPass?: boolean } | undefined;
            setAutoMoveOnPass(Boolean(c?.auto_move_on_pass ?? c?.autoMoveOnPass));
          }
        } catch {
          setAutoMoveOnPass(false);
        }
      }

      // 3. Load Templates
      // 2. Load Templates
      const expectedType = getExpectedTemplateType(round.type, round.fixedKey);
      
      // Fetch specific templates if type is known
      const specificTemplatesPromise = expectedType 
        ? emailTemplateService.getTemplates({ type: expectedType }) 
        : Promise.resolve([]);

      // Always fetch CUSTOM templates
      const customTemplatesPromise = emailTemplateService.getTemplates({ type: 'CUSTOM' });

      const [specificTemplates, customTemplates] = await Promise.all([
        specificTemplatesPromise, 
        customTemplatesPromise
      ]);
      
      // Combine and deduplicate by ID
      const allTemplates = [...specificTemplates, ...customTemplates];
      // Deduplicate by ID
      const uniqueTemplates = Array.from(new Map(allTemplates.map(t => [t.id, t])).values());
      
      setTemplates(uniqueTemplates);

    } catch (error) {
      console.error("Failed to load email config:", error);
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  const getExpectedTypeForApi = (): string => {
    const t = getExpectedTemplateType(round!.type, round!.fixedKey);
    return t ?? "CUSTOM";
  };

  const handleCreateWithAI = async () => {
    if (!round) return;
    setAiGenerating(true);
    try {
      const res = await apiClient.post<{ subject: string; body: string }>("/api/ai/templates/generate", {
        type: getExpectedTypeForApi(),
        jobTitle: effectiveJobTitle || "Position",
        companyName: "Our Company",
        candidateName: "Candidate",
        tone: aiTone,
        context: aiContext,
        jobId,
        jobRoundId: round.id,
        roundName: round.name,
      });
      if (!res.success || !res.data) throw new Error(res.error || "Generate failed");
      const newTemplate = await emailTemplateService.createTemplate({
        jobId,
        jobRoundId: round.id,
        name: `${round.name} – Email`,
        type: (getExpectedTypeForApi() as EmailTemplateType) || "CUSTOM",
        subject: res.data.subject,
        body: res.data.body,
        isAiGenerated: true,
      });
      setSelectedTemplateId(newTemplate.id);
      setEnabled(true);
      setTemplates((prev) => [...prev.filter((t) => t.id !== newTemplate.id), newTemplate]);
      setSelectedTemplate(newTemplate);
      setAiDialogOpen(false);
      setAiContext("");
      toast.success("Template created with AI and selected. Click Save to apply.");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to create template with AI");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!round) return;

    // Validation: Template required if enabled
    if (enabled && !selectedTemplateId) {
        toast.error("Please select an email template or disable the automation.");
        return;
    }

    setSaving(true);
    try {
        if (enabled && round.type === 'ASSESSMENT' && !round.isFixed) {
           if (selectedTemplate && !selectedTemplate.body.includes('{{assessmentUrl}}') && !selectedTemplate.body.includes('{{assessment_url}}')) {
             toast.error("Assessment templates must include the {{assessmentUrl}} variable.");
             setSaving(false);
             return;
           }
        }

        const roundPayload: Parameters<typeof jobRoundService.updateRound>[2] = {
          assignedRoleId: assignedRoleId ? assignedRoleId : null,
          syncPermissions,
          autoMoveOnPass,
        };
        await jobRoundService.updateRound(jobId, round.id, roundPayload);
        const response = await jobRoundService.updateEmailConfig(jobId, round.id, {
            enabled,
            templateId: selectedTemplateId
        });

        if (response.success) {
            toast.success("Configuration saved");
            onSuccess?.();
            onOpenChange(false);
        } else {
            throw new Error(response.error || "Failed to save");
        }
    } catch (error) {
        console.error("Failed to save config:", error);
        toast.error("Failed to save configuration");
    } finally {
        setSaving(false);
    }
  };

  if (!round) return null;

  return (
    <>
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={`Configure round: ${round.name}`}
      description="Role, permissions, and automated email for this stage"
      width="xl"
    >
      {loading ? (
        <div className="flex justify-center p-8">Loading...</div>
      ) : (
        <div className="space-y-6">
            {effectiveRoles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Role & permissions</CardTitle>
                  <CardDescription>Assign a role and who can move candidates in this round</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Assign role (optional)</Label>
                    <Select value={assignedRoleId || "_none_"} onValueChange={(v) => setAssignedRoleId(v === "_none_" ? "" : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="No role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none_">No role</SelectItem>
                        {effectiveRoles.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sync-permissions"
                      checked={syncPermissions}
                      onCheckedChange={(c) => setSyncPermissions(c === true)}
                    />
                    <Label htmlFor="sync-permissions" className="text-sm font-normal cursor-pointer">
                      All hiring team roles can move / manage in this round
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Stage progression (automation)</CardTitle>
                <CardDescription>
                  Automatically move the candidate to the next round when they pass this stage. This is separate from sending an email when they enter the stage.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-move"
                    checked={autoMoveOnPass}
                    onCheckedChange={setAutoMoveOnPass}
                  />
                  <Label htmlFor="auto-move" className="text-sm font-normal cursor-pointer">
                    Auto-move on pass (trigger when candidate passes this round)
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Automated Email</CardTitle>
                    <CardDescription>
                        Send an email when a candidate enters this stage (not the same as auto-moving them to the next round).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="automated-email-toggle" className="text-sm font-medium cursor-pointer">
                        Turn on automated email for this stage
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        When on, an email is sent when a candidate enters this round. When off, no email is sent.
                      </p>
                    </div>
                    <Switch
                      id="automated-email-toggle"
                      checked={enabled}
                      onCheckedChange={setEnabled}
                    />
                  </div>
               {enabled && (
                <>
                    <div className="space-y-2">
                        <Label>Select Template</Label>
                        <div className="flex gap-2">
                            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Choose a template..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map(t => (
                                        <SelectItem key={t.id} value={t.id}>
                                            <span className="flex items-center justify-between w-full gap-2">
                                                <span>{t.name}</span>
                                                <span className="text-xs text-muted-foreground opacity-70">
                                                    {formatTemplateTypeLabel(t.type)}
                                                </span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm" onClick={() => setAiDialogOpen(true)} className="gap-1" title="Create with AI (round + job pre-selected)">
                                <Sparkles className="h-4 w-4" />
                                Create with AI
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => window.open("/email-templates", "_blank")} title="Open Email Hub">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Showing <strong>{formatTemplateTypeLabel(getExpectedTemplateType(round.type, round.fixedKey))}</strong> and <strong>Custom</strong> templates.
                        </p>
                    </div>

                    {selectedTemplate && (
                        <div className="mt-4 p-4 border rounded-md bg-muted/30">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Preview</Label>
                            <div className="space-y-2">
                                <p className="text-sm font-medium">{selectedTemplate.subject}</p>
                                <div className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                                    {selectedTemplate.body}
                                </div>
                            </div>
                        </div>
                    )}

                    {round.type === 'ASSESSMENT' && !round.isFixed && selectedTemplate && !selectedTemplate.body.includes('{{assessmentUrl}}') && !selectedTemplate.body.includes('{{assessment_url}}') && (
                         <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Invalid Template</AlertTitle>
                            <AlertDescription>
                            Assessment rounds that send a test link require the <strong>{'{{assessmentUrl}}'}</strong> variable. Please edit the template in Email Hub or choose a different template.
                            </AlertDescription>
                        </Alert>
                    )}
                </>
               )}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                </Button>
            </div>
        </div>
      )}
    </FormDrawer>

    <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create email template with AI
          </DialogTitle>
          <DialogDescription>
            Job and round are pre-selected. AI will generate a template for &quot;{round?.name}&quot; ({getExpectedTypeForApi()}).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Job: <strong>{effectiveJobTitle || "—"}</strong>
          </p>
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={aiTone} onValueChange={setAiTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Additional context (optional)</Label>
            <Textarea
              placeholder="e.g. Include interview duration, mention remote option..."
              value={aiContext}
              onChange={(e) => setAiContext(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAiDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateWithAI} disabled={aiGenerating}>
            {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {aiGenerating ? " Generating…" : " Generate & create template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
