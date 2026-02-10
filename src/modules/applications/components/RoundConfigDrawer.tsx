/**
 * Tabbed Round Configuration Drawer (SaaS-style)
 * General | Interview | Assessment | Email — all settings configurable in one flow
 */
import { useState, useEffect } from "react";
import { FormDrawer } from "@/shared/components/ui/form-drawer";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Separator } from "@/shared/components/ui/separator";
import { jobRoundService, JobRound } from "@/shared/lib/jobRoundService";
import { emailTemplateService, EmailTemplate, EmailTemplateType } from "@/shared/lib/emailTemplateService";
import { apiClient } from "@/shared/lib/api";
import { jobService } from "@/shared/lib/jobService";
import { interviewService, CreateInterviewConfigRequest } from "@/shared/lib/interviewService";
import { assessmentService, AssessmentQuestion, CreateAssessmentRequest } from "@/shared/lib/assessmentService";
import { toast } from "sonner";
import { Save, AlertCircle, Plus, Sparkles, Loader2, Settings2, Video, FileCheck, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import type { JobRole } from "@/shared/types/job";

export type RoundConfigTab = "general" | "interview" | "assessment" | "email";

interface RoundConfigDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  round: JobRound | null;
  roles?: JobRole[];
  jobTitle?: string;
  initialTab?: RoundConfigTab;
  onSuccess?: () => void;
}

// Normalize API response (snake_case -> camelCase)
function normInterviewConfig(c: any): any {
  if (!c) return null;
  return {
    enabled: c.enabled ?? false,
    autoSchedule: c.auto_schedule ?? c.autoSchedule ?? true,
    requireBeforeProgression: c.require_before_progression ?? c.requireBeforeProgression ?? false,
    requireAllInterviewers: c.require_all_interviewers ?? c.requireAllInterviewers ?? false,
    interviewFormat: (c.interview_format ?? c.interviewFormat ?? "LIVE_VIDEO") as "LIVE_VIDEO" | "PHONE" | "IN_PERSON" | "PANEL",
    defaultDuration: c.default_duration ?? c.defaultDuration ?? 60,
    requiresInterviewer: c.requires_interviewer ?? c.requiresInterviewer ?? true,
    passThreshold: c.pass_threshold ?? c.passThreshold,
    scoringMethod: c.scoring_method ?? c.scoringMethod,
    autoMoveOnPass: c.auto_move_on_pass ?? c.autoMoveOnPass ?? false,
    instructions: c.agenda ?? c.instructions,
    agenda: c.agenda,
  };
}

function normAssessmentConfig(c: any): any {
  if (!c) return null;
  return {
    enabled: c.enabled ?? false,
    autoAssign: c.auto_assign ?? c.autoAssign ?? true,
    autoMoveOnPass: c.auto_move_on_pass ?? c.autoMoveOnPass ?? false,
    autoRejectOnFail: c.auto_reject_on_fail ?? c.autoRejectOnFail ?? false,
    autoRejectOnDeadline: c.auto_reject_on_deadline ?? c.autoRejectOnDeadline ?? false,
    deadlineDays: c.deadline_days ?? c.deadlineDays,
    timeLimitMinutes: c.time_limit_minutes ?? c.timeLimitMinutes,
    passThreshold: c.pass_threshold ?? c.passThreshold,
    provider: c.provider ?? "native",
    instructions: c.instructions ?? "",
    questions: c.questions ?? [],
  };
}

export function RoundConfigDrawer({
  open,
  onOpenChange,
  jobId,
  round,
  roles = [],
  jobTitle = "",
  initialTab = "general",
  onSuccess,
}: RoundConfigDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<RoundConfigTab>(initialTab);

  // General
  const [assignedRoleId, setAssignedRoleId] = useState("");
  const [syncPermissions, setSyncPermissions] = useState(true);
  const [autoMoveOnPass, setAutoMoveOnPass] = useState(false);
  const [requireAllInterviewers, setRequireAllInterviewers] = useState(false);

  // Interview (INTERVIEW rounds)
  const [interviewEnabled, setInterviewEnabled] = useState(false);
  const [defaultDuration, setDefaultDuration] = useState(60);
  const [interviewFormat, setInterviewFormat] = useState<"LIVE_VIDEO" | "PHONE" | "IN_PERSON" | "PANEL">("LIVE_VIDEO");
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [requireBeforeProgression, setRequireBeforeProgression] = useState(false);
  const [passThreshold, setPassThreshold] = useState<number | undefined>();
  const [scoringMethod, setScoringMethod] = useState<"AVERAGE" | "WEIGHTED" | "CONSENSUS">("AVERAGE");
  const [agenda, setAgenda] = useState("");

  // Assessment (ASSESSMENT rounds)
  const [assessmentEnabled, setAssessmentEnabled] = useState(false);
  const [autoAssign, setAutoAssign] = useState(true);
  const [assessmentAutoMoveOnPass, setAssessmentAutoMoveOnPass] = useState(false);
  const [autoRejectOnFail, setAutoRejectOnFail] = useState(false);
  const [autoRejectOnDeadline, setAutoRejectOnDeadline] = useState(false);
  const [deadlineDays, setDeadlineDays] = useState<number | undefined>(7);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | undefined>();
  const [assessmentPassThreshold, setAssessmentPassThreshold] = useState<number | undefined>(70);
  const [provider, setProvider] = useState("native");
  const [instructions, setInstructions] = useState("");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);

  // Email
  const [enabled, setEnabled] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
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

  const isInterview = round?.type === "INTERVIEW";
  const isAssessment = round?.type === "ASSESSMENT";
  const isCustomRound = round && !round.isFixed;

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, open]);

  useEffect(() => {
    if (open && jobId && round) {
      setAssignedRoleId(round.assignedRoleId ?? "");
      setSyncPermissions(round.syncPermissions ?? true);
      loadData();
    }
  }, [open, jobId, round?.id]);

  useEffect(() => {
    if (!open || !jobId) return;
    if (roles?.length) return;
    (async () => {
      try {
        const res = await jobService.getJobRoles(jobId);
        if (res.success && res.data?.roles) setLoadedRoles(res.data.roles);
      } catch {
        /* ignore */
      }
    })();
  }, [open, jobId, roles?.length]);

  useEffect(() => {
    if (!open || !jobId || jobTitle) return;
    (async () => {
      try {
        const res = await jobService.getJobById(jobId);
        if (res.success && res.data?.job?.title) setJobTitleFromApi(res.data.job.title);
      } catch {
        /* ignore */
      }
    })();
  }, [open, jobId, jobTitle]);

  useEffect(() => {
    setSelectedTemplate(selectedTemplateId ? (templates.find((t) => t.id === selectedTemplateId) ?? null) : null);
  }, [selectedTemplateId, templates]);

  const getExpectedTemplateType = (roundType: string, fixedKey?: string | null): EmailTemplateType | undefined => {
    if (fixedKey === "NEW") return "NEW";
    if (fixedKey === "OFFER") return "OFFER";
    if (fixedKey === "HIRED") return "HIRED";
    if (fixedKey === "REJECTED") return "REJECTED";
    if (roundType === "ASSESSMENT") return "ASSESSMENT";
    if (roundType === "INTERVIEW") return "INTERVIEW";
    return undefined;
  };

  const formatTemplateTypeLabel = (type: string | undefined) => {
    const map: Record<string, string> = {
      NEW: "New Application",
      APPLICATION_CONFIRMATION: "New Application",
      ASSESSMENT: "Assessment",
      INTERVIEW: "Interview",
      INTERVIEW_INVITATION: "Interview",
      OFFER: "Offer",
      HIRED: "Hired",
      REJECTED: "Rejected",
    };
    return map[type ?? ""] ?? (type ?? "Unknown").split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
  };

  const loadData = async () => {
    if (!round) return;
    setLoading(true);
    try {
      const expectedType = getExpectedTemplateType(round.type, round.fixedKey);
      const [configRes, specificTemplates, customTemplates] = await Promise.all([
        jobRoundService.getEmailConfig(jobId, round.id),
        expectedType ? emailTemplateService.getTemplates({ type: expectedType }) : Promise.resolve([]),
        emailTemplateService.getTemplates({ type: "CUSTOM" }),
      ]);

      if (configRes.success && configRes.data) {
        setEnabled(configRes.data.enabled);
        setSelectedTemplateId(configRes.data.templateId || "");
      } else {
        setEnabled(false);
        setSelectedTemplateId("");
      }

        const combined = [...specificTemplates, ...customTemplates];
        const allTemplates = Array.from(new Map(combined.map((t) => [t.id, t])).values());
      setTemplates(allTemplates);

      // General: auto-move from round or config
      if (round.isFixed) {
        setAutoMoveOnPass(Boolean(round.autoMoveOnPass));
      } else if (isInterview) {
        const ir = await interviewService.getInterviewConfig(jobId, round.id);
        const c = normInterviewConfig(ir.data?.config);
        setAutoMoveOnPass(Boolean(c?.autoMoveOnPass));
        setRequireAllInterviewers(Boolean(c?.requireAllInterviewers));
        if (c) {
          setInterviewEnabled(c.enabled);
          setDefaultDuration(c.defaultDuration ?? 60);
          setInterviewFormat((c.interviewFormat as any) ?? "LIVE_VIDEO");
          setAutoSchedule(c.autoSchedule ?? true);
          setRequireBeforeProgression(c.requireBeforeProgression ?? false);
          setPassThreshold(c.passThreshold);
          setScoringMethod((c.scoringMethod as any) ?? "AVERAGE");
          setAgenda(c.agenda ?? c.instructions ?? "");
        }
      } else if (isAssessment) {
        const ar = await assessmentService.getAssessmentConfig(jobId, round.id);
        const c = normAssessmentConfig(ar.data?.config);
        setAutoMoveOnPass(Boolean(c?.autoMoveOnPass));
        if (c) {
          setAssessmentEnabled(c.enabled);
          setAutoAssign(c.autoAssign ?? true);
          setAssessmentAutoMoveOnPass(c.autoMoveOnPass ?? false);
          setAutoRejectOnFail(c.autoRejectOnFail ?? false);
          setAutoRejectOnDeadline(c.autoRejectOnDeadline ?? false);
          setDeadlineDays(c.deadlineDays ?? 7);
          setTimeLimitMinutes(c.timeLimitMinutes);
          setAssessmentPassThreshold(c.passThreshold ?? 70);
          setProvider(c.provider ?? "native");
          setInstructions(c.instructions ?? "");
          setQuestions(c.questions ?? []);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWithAI = async () => {
    if (!round) return;
    setAiGenerating(true);
    try {
      const type = getExpectedTemplateType(round.type, round.fixedKey) ?? "CUSTOM";
      const res = await apiClient.post<{ subject: string; body: string }>("/api/ai/templates/generate", {
        type,
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
        type: (type as EmailTemplateType) || "CUSTOM",
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
      toast.success("Template created. Click Save to apply.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create template with AI");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!round) return;
    if (enabled && !selectedTemplateId) {
      toast.error("Please select an email template or disable the automation.");
      return;
    }
    if (enabled && round.type === "ASSESSMENT" && !round.isFixed && selectedTemplate) {
      const body = selectedTemplate.body || "";
      if (!body.includes("{{assessmentUrl}}") && !body.includes("{{assessment_url}}")) {
        toast.error("Assessment templates must include the {{assessmentUrl}} variable.");
        return;
      }
    }
    if (assessmentEnabled && questions.length === 0) {
      toast.error("Please add at least one question or disable the assessment.");
      return;
    }

    setSaving(true);
    try {
      await jobRoundService.updateRound(jobId, round.id, {
        assignedRoleId: assignedRoleId || null,
        syncPermissions,
        autoMoveOnPass: isInterview || isAssessment ? undefined : autoMoveOnPass,
        ...(isInterview && { requireAllInterviewers }),
      });

      if (isInterview) {
        const interviewPayload: CreateInterviewConfigRequest = {
          enabled: interviewEnabled,
          autoSchedule,
          requireBeforeProgression,
          requireAllInterviewers,
          interviewFormat,
          defaultDuration,
          passThreshold,
          scoringMethod,
          autoMoveOnPass,
          agenda: agenda || undefined,
        };
        await interviewService.configureInterview(jobId, round.id, interviewPayload);
      }

      if (isAssessment) {
        const assessmentPayload: CreateAssessmentRequest = {
          enabled: assessmentEnabled,
          autoAssign,
          auto_move_on_pass: assessmentAutoMoveOnPass,
          auto_reject_on_fail: autoRejectOnFail,
          auto_reject_on_deadline: autoRejectOnDeadline,
          deadlineDays: deadlineDays || undefined,
          timeLimitMinutes: timeLimitMinutes || undefined,
          passThreshold: assessmentPassThreshold || undefined,
          provider,
          questions: questions.length > 0 ? questions : undefined,
          instructions: instructions || undefined,
        };
        await assessmentService.configureAssessment(jobId, round.id, assessmentPayload);
      }

      if (!isInterview && !isAssessment && isCustomRound) {
        await jobRoundService.updateRound(jobId, round.id, { autoMoveOnPass: isAssessment ? assessmentAutoMoveOnPass : autoMoveOnPass });
      }

      await jobRoundService.updateEmailConfig(jobId, round.id, { enabled, templateId: selectedTemplateId });

      toast.success("Configuration saved");
      onSuccess?.();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (!round) return null;

  const tabList = (
    <TabsList className="grid w-full grid-cols-4" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
      <TabsTrigger value="general" className="gap-1.5 text-xs">
        <Settings2 className="h-3.5 w-3.5" />
        General
      </TabsTrigger>
      {isInterview && (
        <TabsTrigger value="interview" className="gap-1.5 text-xs">
          <Video className="h-3.5 w-3.5" />
          Interview
        </TabsTrigger>
      )}
      {isAssessment && (
        <TabsTrigger value="assessment" className="gap-1.5 text-xs">
          <FileCheck className="h-3.5 w-3.5" />
          Assessment
        </TabsTrigger>
      )}
      <TabsTrigger value="email" className="gap-1.5 text-xs">
        <Mail className="h-3.5 w-3.5" />
        Email
      </TabsTrigger>
    </TabsList>
  );

  const visibleTabs = ["general", ...(isInterview ? ["interview"] : []), ...(isAssessment ? ["assessment"] : []), "email"];
  const defaultTab = visibleTabs.includes(activeTab) ? activeTab : "general";

  return (
    <>
      <FormDrawer
        open={open}
        onOpenChange={onOpenChange}
        title={`Configure: ${round.name}`}
        description="Role, interview, assessment, and email settings"
        width="2xl"
      >
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
          <Tabs value={defaultTab} onValueChange={(v) => setActiveTab(v as RoundConfigTab)} className="space-y-4">
            <TabsList className={`grid w-full ${visibleTabs.length === 4 ? "grid-cols-4" : visibleTabs.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
              <TabsTrigger value="general" className="gap-1.5 text-xs">
                <Settings2 className="h-3.5 w-3.5" />
                General
              </TabsTrigger>
              {isInterview && (
                <TabsTrigger value="interview" className="gap-1.5 text-xs">
                  <Video className="h-3.5 w-3.5" />
                  Interview
                </TabsTrigger>
              )}
              {isAssessment && (
                <TabsTrigger value="assessment" className="gap-1.5 text-xs">
                  <FileCheck className="h-3.5 w-3.5" />
                  Assessment
                </TabsTrigger>
              )}
              <TabsTrigger value="email" className="gap-1.5 text-xs">
                <Mail className="h-3.5 w-3.5" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
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
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
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
                    {isInterview && assignedRoleId && (
                      <div className="flex items-center space-x-2 pt-2 border-t">
                        <Checkbox
                          id="require-all"
                          checked={requireAllInterviewers}
                          onCheckedChange={(c) => setRequireAllInterviewers(c === true)}
                        />
                        <Label htmlFor="require-all" className="text-sm font-normal cursor-pointer">
                          Require approval from all assigned interviewers before candidate can progress
                        </Label>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              {isCustomRound && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Stage progression</CardTitle>
                    <CardDescription>Auto-move candidate to next round when they pass</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-move"
                        checked={isAssessment ? assessmentAutoMoveOnPass : autoMoveOnPass}
                        onCheckedChange={(v) => {
                          if (isAssessment) setAssessmentAutoMoveOnPass(v);
                          else setAutoMoveOnPass(v);
                        }}
                      />
                      <Label htmlFor="auto-move" className="text-sm font-normal cursor-pointer">
                        Auto-move on pass
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {isInterview && (
              <TabsContent value="interview" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Interview settings</CardTitle>
                    <CardDescription>Duration, format, and evaluation criteria</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable interview config</Label>
                        <p className="text-xs text-muted-foreground">Store settings for this round</p>
                      </div>
                      <Switch checked={interviewEnabled} onCheckedChange={setInterviewEnabled} />
                    </div>
                    {interviewEnabled && (
                      <>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Default duration (min)</Label>
                            <Select value={String(defaultDuration)} onValueChange={(v) => setDefaultDuration(parseInt(v, 10))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[15, 30, 45, 60, 90, 120].map((n) => (
                                  <SelectItem key={n} value={String(n)}>
                                    {n} min
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Format</Label>
                            <Select value={interviewFormat} onValueChange={(v: any) => setInterviewFormat(v)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LIVE_VIDEO">Video</SelectItem>
                                <SelectItem value="PHONE">Phone</SelectItem>
                                <SelectItem value="IN_PERSON">In-person</SelectItem>
                                <SelectItem value="PANEL">Panel</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Auto-schedule interviews</Label>
                          <Switch checked={autoSchedule} onCheckedChange={setAutoSchedule} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Require interview before progression</Label>
                          <Switch checked={requireBeforeProgression} onCheckedChange={setRequireBeforeProgression} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Pass threshold (%)</Label>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={passThreshold ?? ""}
                              onChange={(e) => setPassThreshold(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                              placeholder="Optional"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Scoring method</Label>
                            <Select value={scoringMethod} onValueChange={(v: any) => setScoringMethod(v)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AVERAGE">Average</SelectItem>
                                <SelectItem value="WEIGHTED">Weighted</SelectItem>
                                <SelectItem value="CONSENSUS">Consensus</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Agenda / instructions</Label>
                          <Textarea
                            value={agenda}
                            onChange={(e) => setAgenda(e.target.value)}
                            placeholder="Guidelines for interviewers..."
                            rows={3}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {isAssessment && (
              <TabsContent value="assessment" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Assessment settings</CardTitle>
                    <CardDescription>Enable, assign, and configure assessments for this round</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable assessment</Label>
                      <Switch checked={assessmentEnabled} onCheckedChange={setAssessmentEnabled} />
                    </div>
                    {assessmentEnabled && (
                      <>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <Label>Auto-assign to new applicants</Label>
                          <Switch checked={autoAssign} onCheckedChange={setAutoAssign} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Auto-move on pass</Label>
                          <Switch checked={assessmentAutoMoveOnPass} onCheckedChange={setAssessmentAutoMoveOnPass} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Auto-reject on fail</Label>
                          <Switch checked={autoRejectOnFail} onCheckedChange={setAutoRejectOnFail} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Auto-reject on deadline missed</Label>
                          <Switch checked={autoRejectOnDeadline} onCheckedChange={setAutoRejectOnDeadline} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Deadline (days)</Label>
                            <Input
                              type="number"
                              min={1}
                              value={deadlineDays ?? ""}
                              onChange={(e) => setDeadlineDays(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                              placeholder="7"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Time limit (min)</Label>
                            <Input
                              type="number"
                              min={1}
                              value={timeLimitMinutes ?? ""}
                              onChange={(e) => setTimeLimitMinutes(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                              placeholder="Optional"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Pass threshold (%)</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={assessmentPassThreshold ?? ""}
                            onChange={(e) => setAssessmentPassThreshold(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                            placeholder="70"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Provider</Label>
                          <Select value={provider} onValueChange={setProvider}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="native">Native</SelectItem>
                              <SelectItem value="hackerrank">HackerRank</SelectItem>
                              <SelectItem value="codility">Codility</SelectItem>
                              <SelectItem value="testgorilla">TestGorilla</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Instructions</Label>
                          <Textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Instructions for candidates..."
                            rows={3}
                          />
                        </div>
                        <Separator />
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Questions</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setQuestions([...questions, { questionText: "", type: "MULTIPLE_CHOICE", options: ["", "", ""], order: questions.length }])}
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add
                            </Button>
                          </div>
                          {questions.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4">No questions. Add at least one when assessment is enabled.</p>
                          ) : (
                            <div className="space-y-3">
                              {questions.map((q, i) => (
                                <Card key={i} className="p-3">
                                  <div className="flex justify-between gap-2">
                                    <Input
                                      value={q.questionText}
                                      onChange={(e) => {
                                        const u = [...questions];
                                        u[i] = { ...u[i], questionText: e.target.value };
                                        setQuestions(u);
                                      }}
                                      placeholder="Question text"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}>
                                      ×
                                    </Button>
                                  </div>
                                  <Select
                                    value={q.type}
                                    onValueChange={(v: any) => {
                                      const u = [...questions];
                                      u[i] = { ...u[i], type: v, options: ["MULTIPLE_CHOICE", "MULTIPLE_SELECT"].includes(v) ? u[i].options ?? ["", ""] : undefined };
                                      setQuestions(u);
                                    }}
                                  >
                                    <SelectTrigger className="mt-2">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                      <SelectItem value="MULTIPLE_SELECT">Multiple Select</SelectItem>
                                      <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                                      <SelectItem value="LONG_ANSWER">Long Answer</SelectItem>
                                      <SelectItem value="CODE">Code</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="email" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Automated email</CardTitle>
                  <CardDescription>Send an email when a candidate enters this stage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <Label className="text-sm font-medium cursor-pointer">Turn on automated email</Label>
                      <p className="text-xs text-muted-foreground">When on, an email is sent when a candidate enters this round.</p>
                    </div>
                    <Switch id="automated-email" checked={enabled} onCheckedChange={setEnabled} />
                  </div>
                  {enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Template</Label>
                        <div className="flex gap-2">
                          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Choose a template..." />
                            </SelectTrigger>
                            <SelectContent>
                              {templates.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  <span className="flex justify-between w-full gap-2">
                                    <span>{t.name}</span>
                                    <span className="text-xs text-muted-foreground opacity-70">{formatTemplateTypeLabel(t.type)}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm" onClick={() => setAiDialogOpen(true)} className="gap-1" title="Create with AI">
                            <Sparkles className="h-4 w-4" /> AI
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => window.open("/email-templates", "_blank")} title="Email Hub">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Showing <strong>{formatTemplateTypeLabel(getExpectedTemplateType(round.type, round.fixedKey))}</strong> and Custom templates.
                        </p>
                      </div>
                      {selectedTemplate && (
                        <div className="p-4 border rounded-md bg-muted/30">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Preview</Label>
                          <p className="text-sm font-medium">{selectedTemplate.subject}</p>
                          <div className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{selectedTemplate.body}</div>
                        </div>
                      )}
                      {round.type === "ASSESSMENT" && !round.isFixed && selectedTemplate && !selectedTemplate.body?.includes("{{assessmentUrl}}") && !selectedTemplate.body?.includes("{{assessment_url}}") && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Invalid template</AlertTitle>
                          <AlertDescription>
                            Assessment rounds require the <strong>{`{{assessmentUrl}}`}</strong> variable in the template.
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
          </>
        )}
      </FormDrawer>

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Create email template with AI
            </DialogTitle>
            <DialogDescription>Job and round pre-selected for &quot;{round.name}&quot;</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Job: <strong>{effectiveJobTitle || "—"}</strong></p>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={aiTone} onValueChange={setAiTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Textarea placeholder="e.g. Include interview duration..." value={aiContext} onChange={(e) => setAiContext(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateWithAI} disabled={aiGenerating}>
              {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {aiGenerating ? " Generating…" : " Generate & create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
