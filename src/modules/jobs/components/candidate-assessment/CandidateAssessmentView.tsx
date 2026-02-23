import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/shared/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  ChevronLeft, ChevronRight, X, Calendar, ClipboardCheck,
  MessageSquare, Activity, Users, Highlighter, Mail, Phone,
  Hash, CheckSquare, Loader2, PenLine, ChevronDown,
} from "lucide-react";
import { Application } from "@/shared/types/application";
import { ActivityTimelineTab } from "./tabs/ActivityTimelineTab";
import { QuestionnaireResponsesTab } from "./tabs/QuestionnaireResponsesTab";
import { InterviewsTab } from "./tabs/InterviewsTab";
import { TeamReviewsTab } from "./tabs/TeamReviewsTab";
import { ResumeAnnotationsTab } from "./tabs/ResumeAnnotationsTab";
import { EmailTab } from "./tabs/EmailTab";
import { CallLogsTab } from "./tabs/CallLogsTab";
import { SmsTab } from "./tabs/SmsTab";
import { SlackTab } from "./tabs/SlackTab";
import { TaskListTab } from "./tabs/CreateTaskTab";
import { useCursorTracking } from "@/shared/hooks/useCursorTracking";
import { NotificationCenter } from "@/modules/notifications/components/NotificationCenter";
import { CandidateInfoPanel } from "./CandidateInfoPanel";
import { CandidateNotesPanelEnhanced } from "./CandidateNotesPanelEnhanced";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/shared/components/ui/resizable";
import { useToast } from "@/shared/hooks/use-toast";

interface CandidateAssessmentViewProps {
  application: Application;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  jobTitle: string;
  nextStageName?: string;
  onMoveToNextStage?: () => void;
  isSimpleFlow?: boolean;
  jobId?: string;
}

// Communication sub-tabs driven by a dropdown
type CommsTab = "email-thread" | "calls" | "sms" | "slack";

export function CandidateAssessmentView({
  application,
  open,
  onOpenChange,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  jobTitle,
  nextStageName,
  onMoveToNextStage,
  isSimpleFlow,
  jobId,
}: CandidateAssessmentViewProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("compose");
  const [commsTab, setCommsTab] = useState<CommsTab>("email-thread");
  const [fullApplication, setFullApplication] = useState<Application>(application);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const commsLabels: Record<CommsTab, { label: string; icon: React.ReactNode }> = {
    "email-thread": { label: "Email Thread", icon: <Mail className="h-3.5 w-3.5" /> },
    calls: { label: "Call Logs", icon: <Phone className="h-3.5 w-3.5" /> },
    sms: { label: "SMS", icon: <MessageSquare className="h-3.5 w-3.5" /> },
    slack: { label: "Slack", icon: <Hash className="h-3.5 w-3.5" /> },
  };

  const statusToStageMap: Record<string, string> = {
    applied: "New Application",
    screening: "Resume Review",
    interview: "Technical Interview",
    offer: "Offer Extended",
    hired: "Offer Accepted",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  };

  useEffect(() => {
    const fetchFullDetails = async () => {
      if (!application.id) return;
      try {
        const { applicationService } = await import("@/modules/applications/lib/applicationService");
        const response = await applicationService.getApplication(application.id);
        if (response.success && response.data && response.data.application) {
          setFullApplication(prev => ({ ...prev, ...response.data!.application }));
        }
      } catch (error) {
        console.error("Failed to fetch full application details", error);
      }
    };
    fetchFullDetails();
  }, [application.id, application.updatedAt, application]);

  const { containerRef } = useCursorTracking({
    applicationId: fullApplication.id,
    currentUserId: "current-user",
    enabled: open,
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onOpenChange(false);
    } else if (e.key === "n" && hasNext && onNext) {
      onNext();
    } else if (e.key === "p" && hasPrevious && onPrevious) {
      onPrevious();
    }
  };

  const handleStatusChange = async (nextStatus: string) => {
    if (!fullApplication.id || !nextStatus || nextStatus === fullApplication.status) return;
    const nextStage = statusToStageMap[nextStatus] || fullApplication.stage || "New Application";

    setIsUpdatingStatus(true);
    try {
      const { applicationService } = await import("@/modules/applications/lib/applicationService");
      const response = await applicationService.updateStage(fullApplication.id, nextStage);

      if (!response.success) {
        throw new Error(response.error || "Failed to update status");
      }

      setFullApplication((prev) => ({
        ...prev,
        status: nextStatus as Application["status"],
        stage: nextStage as Application["stage"],
      }));
      toast({ title: "Status updated" });
    } catch (error) {
      toast({
        title: "Failed to update status",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] p-0 gap-0 h-full overflow-hidden"
        onKeyDown={handleKeyDown}
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">Candidate Assessment - {fullApplication.candidateName || "Candidate"}</SheetTitle>
        <SheetDescription className="sr-only">
          Assessment details for {fullApplication.candidateName || "Candidate"}
        </SheetDescription>

        <div ref={containerRef} className="flex flex-col h-full relative overflow-hidden">

          {/* ── Compact Header ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-3 py-2 border-b bg-background flex-shrink-0 gap-3">
            {/* Left: nav + name + status */}
            <div className="flex items-center gap-2 min-w-0">
              {(hasPrevious || hasNext) && (
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    onClick={onPrevious} disabled={!hasPrevious}
                    title="Previous candidate (P)"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    onClick={onNext} disabled={!hasNext}
                    title="Next candidate (N)"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <span className="text-sm font-semibold truncate max-w-[200px]">
                {fullApplication.candidateName || "Candidate"}
              </span>

              <div className="h-4 w-px bg-border" />

              <Select
                value={String(fullApplication.status || "applied")}
                onValueChange={handleStatusChange}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger className="h-7 w-[150px] text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>

              {isUpdatingStatus && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}

              {nextStageName && onMoveToNextStage && (
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 text-xs px-3"
                  onClick={onMoveToNextStage}
                >
                  Move to {nextStageName}
                </Button>
              )}
            </div>

            {/* Right: notifications + close */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <NotificationCenter userId="current-user" />
              <Button
                variant="ghost" size="icon" className="h-7 w-7"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ── Main Content ────────────────────────────────────────────── */}
          <div className="flex-1 overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="h-full">

              {/* Left Panel — Candidate Info (accordion sidebar) */}
              <ResizablePanel defaultSize={26} minSize={20} maxSize={40} className="overflow-hidden">
                <CandidateInfoPanel
                  application={fullApplication}
                  jobTitle={jobTitle}
                />
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Right Panel — Unified Tab Router */}
              <ResizablePanel defaultSize={74} minSize={50}>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="h-full flex flex-col overflow-hidden"
                >
                  {/* ── Single Tab Row ───────────────────────────────── */}
                  <div className="border-b bg-background flex-shrink-0 px-2">
                    <TabsList className="h-10 bg-transparent inline-flex gap-0.5 w-auto">

                      <TabsTrigger value="compose" className="gap-1.5 text-xs rounded-sm data-[state=active]:bg-muted data-[state=active]:shadow-none">
                        <PenLine className="h-3.5 w-3.5" />
                        Compose
                      </TabsTrigger>

                      <TabsTrigger value="activity" className="gap-1.5 text-xs rounded-sm data-[state=active]:bg-muted data-[state=active]:shadow-none">
                        <Activity className="h-3.5 w-3.5" />
                        Activity
                      </TabsTrigger>

                      <TabsTrigger value="tasks" className="gap-1.5 text-xs rounded-sm data-[state=active]:bg-muted data-[state=active]:shadow-none">
                        <CheckSquare className="h-3.5 w-3.5" />
                        Tasks
                      </TabsTrigger>

                      <TabsTrigger value="annotations" className="gap-1.5 text-xs rounded-sm data-[state=active]:bg-muted data-[state=active]:shadow-none">
                        <Highlighter className="h-3.5 w-3.5" />
                        Annotations
                      </TabsTrigger>

                      <TabsTrigger value="questionnaire" className="gap-1.5 text-xs rounded-sm data-[state=active]:bg-muted data-[state=active]:shadow-none">
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        Questionnaire
                      </TabsTrigger>

                      <TabsTrigger value="interviews" className="gap-1.5 text-xs rounded-sm data-[state=active]:bg-muted data-[state=active]:shadow-none">
                        <Calendar className="h-3.5 w-3.5" />
                        Interviews
                      </TabsTrigger>

                      <TabsTrigger value="reviews" className="gap-1.5 text-xs rounded-sm data-[state=active]:bg-muted data-[state=active]:shadow-none">
                        <Users className="h-3.5 w-3.5" />
                        Team Reviews
                      </TabsTrigger>

                      {/* Comms dropdown trigger — activates the tab AND opens sub-menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={`
                              inline-flex items-center gap-1.5 text-xs px-3 h-9 rounded-sm transition-colors
                              ${activeTab === "comms"
                                ? "bg-muted text-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              }
                            `}
                            onClick={() => setActiveTab("comms")}
                          >
                            {commsLabels[commsTab].icon}
                            {commsLabels[commsTab].label}
                            <ChevronDown className="h-3 w-3 opacity-60" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[150px]">
                          {(Object.keys(commsLabels) as CommsTab[]).map((key) => (
                            <DropdownMenuItem
                              key={key}
                              className="gap-2 text-xs"
                              onClick={() => { setActiveTab("comms"); setCommsTab(key); }}
                            >
                              {commsLabels[key].icon}
                              {commsLabels[key].label}
                              {commsTab === key && activeTab === "comms" && (
                                <Badge variant="secondary" className="ml-auto text-[9px] py-0 px-1">active</Badge>
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                    </TabsList>
                  </div>

                  {/* ── Tab Content Area ─────────────────────────────── */}
                  <div className="flex-1 overflow-hidden">

                    {/* Compose tab — the notes/email/sms/meet/task panel, full height */}
                    <TabsContent value="compose" className="h-full mt-0 data-[state=active]:flex flex-col">
                      <CandidateNotesPanelEnhanced
                        applicationId={fullApplication.id}
                        jobId={jobId || fullApplication.jobId || ""}
                        candidateName={fullApplication.candidateName || "Candidate"}
                        jobTitle={jobTitle}
                        candidateEmail={fullApplication.candidateEmail}
                        candidatePhone={fullApplication.candidatePhone}
                        application={fullApplication}
                      />
                    </TabsContent>

                    {/* Activity */}
                    <TabsContent value="activity" className="h-full mt-0">
                      <ScrollArea className="h-full">
                        <div className="p-4">
                          <ActivityTimelineTab application={fullApplication} />
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Tasks */}
                    <TabsContent value="tasks" className="h-full mt-0">
                      <ScrollArea className="h-full">
                        <div className="p-4">
                          <TaskListTab application={fullApplication} />
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Annotations */}
                    <TabsContent value="annotations" className="h-full mt-0">
                      <ScrollArea className="h-full">
                        <div className="p-4">
                          <ResumeAnnotationsTab candidateId={fullApplication.id} application={fullApplication} />
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Questionnaire */}
                    <TabsContent value="questionnaire" className="h-full mt-0">
                      <ScrollArea className="h-full">
                        <div className="p-4">
                          <QuestionnaireResponsesTab
                            application={fullApplication}
                            jobId={jobId || fullApplication.jobId}
                          />
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Interviews */}
                    <TabsContent value="interviews" className="h-full mt-0">
                      <ScrollArea className="h-full">
                        <div className="p-4">
                          <InterviewsTab application={fullApplication} />
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Team Reviews */}
                    <TabsContent value="reviews" className="h-full mt-0">
                      <ScrollArea className="h-full">
                        <div className="p-4">
                          <TeamReviewsTab
                            application={fullApplication}
                            onUpdate={async () => {
                              if (!application.id) return;
                              try {
                                const { applicationService } = await import("@/modules/applications/lib/applicationService");
                                const response = await applicationService.getApplication(application.id);
                                if (response.success && response.data && response.data.application) {
                                  setFullApplication(prev => ({ ...prev, ...response.data!.application }));
                                }
                              } catch (error) {
                                console.error("Failed to fetch full application details", error);
                              }
                            }}
                          />
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Comms — driven by commsTab state */}
                    <TabsContent value="comms" className="h-full mt-0">
                      <ScrollArea className="h-full">
                        <div className="p-4">
                          {commsTab === "email-thread" && <EmailTab application={fullApplication} />}
                          {commsTab === "calls" && <CallLogsTab application={fullApplication} />}
                          {commsTab === "sms" && <SmsTab application={fullApplication} />}
                          {commsTab === "slack" && <SlackTab application={fullApplication} />}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                  </div>
                </Tabs>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
