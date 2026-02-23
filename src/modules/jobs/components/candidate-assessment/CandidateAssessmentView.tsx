import { useState, useEffect, useMemo } from "react";
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
  ChevronLeft, ChevronRight, X, FileText, Users, Calendar, ClipboardCheck, MessageSquare, Activity, Vote, GitCompare, Highlighter, Mail, Phone, Hash, CheckSquare, Plus, Loader2, Sparkles, PenLine, ChevronDown
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
import { AiAssistantSidebar } from "@/shared/components/common/AiAssistantSidebar";

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
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

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

  const assistantRequestBody = useMemo(
    () => ({
      context: {
        mode: "candidate_assessment",
        applicationId: fullApplication.id,
        candidateId: fullApplication.candidateId,
        candidateName: fullApplication.candidateName || "Candidate",
        candidateEmail: fullApplication.candidateEmail || fullApplication.email || undefined,
        jobId: fullApplication.jobId,
        jobTitle,
        currentStage: fullApplication.stage ? String(fullApplication.stage) : undefined,
        currentStatus: fullApplication.status ? String(fullApplication.status) : undefined,
      },
    }),
    [
      fullApplication.id,
      fullApplication.candidateId,
      fullApplication.candidateName,
      fullApplication.candidateEmail,
      fullApplication.email,
      fullApplication.jobId,
      fullApplication.stage,
      fullApplication.status,
      jobTitle,
    ]
  );

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAiAssistantOpen(true)}
                className="h-7 px-2 text-[11px] gap-1.5 border-muted-foreground/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Ask AI
              </Button>
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
                  className="h-full flex flex-row overflow-hidden"
                >
                  {/* ── Left Sidebar Nav for Right Panel ────────────────────────── */}
                  <div className="w-[160px] bg-muted/30 border-r flex-shrink-0 flex flex-col py-3 overflow-y-auto hidden sm:flex">
                    <TabsList className="flex flex-col h-auto bg-transparent w-full space-y-0.5 p-2">
                      
                      {/* Overview Section */}
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mt-1 mb-1.5 w-full text-left">
                        Overview
                      </div>
                      
                      <TabsTrigger 
                        value="compose" 
                        className="w-full justify-start h-8 px-2.5 text-xs font-medium rounded-md text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/60 transition-none"
                      >
                        <PenLine className="h-3.5 w-3.5 mr-2" />
                        Notes & Tasks
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="activity" 
                        className="w-full justify-start h-8 px-2.5 text-xs font-medium rounded-md text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/60 transition-none"
                      >
                        <Activity className="h-3.5 w-3.5 mr-2" />
                        Activity Map
                      </TabsTrigger>

                      <TabsTrigger 
                        value="tasks" 
                        className="w-full justify-start h-8 px-2.5 text-xs font-medium rounded-md text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/60 transition-none"
                      >
                        <CheckSquare className="h-3.5 w-3.5 mr-2" />
                        Tasks
                      </TabsTrigger>

                      {/* Evaluation Section */}
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mt-5 mb-1.5 w-full text-left">
                        Evaluation
                      </div>

                      <TabsTrigger 
                        value="interviews" 
                        className="w-full justify-start h-8 px-2.5 text-xs font-medium rounded-md text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/60 transition-none"
                      >
                        <Calendar className="h-3.5 w-3.5 mr-2" />
                        Interviews
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="reviews" 
                        className="w-full justify-start h-8 px-2.5 text-xs font-medium rounded-md text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/60 transition-none"
                       >
                        <Users className="h-3.5 w-3.5 mr-2" />
                        Scorecards
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="questionnaire" 
                        className="w-full justify-start h-8 px-2.5 text-xs font-medium rounded-md text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/60 transition-none"
                      >
                        <ClipboardCheck className="h-3.5 w-3.5 mr-2" />
                        Questionnaire
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="annotations" 
                        className="w-full justify-start h-8 px-2.5 text-xs font-medium rounded-md text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/60 transition-none"
                      >
                        <Highlighter className="h-3.5 w-3.5 mr-2" />
                        Annotations
                      </TabsTrigger>

                      {/* Communications Section */}
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mt-5 mb-1.5 w-full text-left">
                        Communications
                      </div>

                      <button
                        onClick={() => { setActiveTab("comms"); setCommsTab("email-thread"); }}
                        className={`w-full flex items-center justify-start h-8 px-2.5 text-xs font-medium rounded-md transition-none select-none ${
                           activeTab === "comms" && commsTab === "email-thread"
                             ? "bg-primary/10 text-primary"
                             : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        }`}
                      >
                        <Mail className="h-3.5 w-3.5 mr-2" />
                        Emails
                      </button>
                      
                      <button
                        onClick={() => { setActiveTab("comms"); setCommsTab("calls"); }}
                        className={`w-full flex items-center justify-start h-8 px-2.5 text-xs font-medium rounded-md transition-none select-none ${
                           activeTab === "comms" && commsTab === "calls"
                             ? "bg-primary/10 text-primary"
                             : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        }`}
                      >
                        <Phone className="h-3.5 w-3.5 mr-2" />
                        Call Logs
                      </button>

                      <button
                        onClick={() => { setActiveTab("comms"); setCommsTab("sms"); }}
                        className={`w-full flex items-center justify-start h-8 px-2.5 text-xs font-medium rounded-md transition-none select-none ${
                           activeTab === "comms" && commsTab === "sms"
                             ? "bg-primary/10 text-primary"
                             : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        }`}
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-2" />
                        SMS
                      </button>

                      <button
                        onClick={() => { setActiveTab("comms"); setCommsTab("slack"); }}
                        className={`w-full flex items-center justify-start h-8 px-2.5 text-xs font-medium rounded-md transition-none select-none ${
                           activeTab === "comms" && commsTab === "slack"
                             ? "bg-primary/10 text-primary"
                             : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        }`}
                      >
                        <Hash className="h-3.5 w-3.5 mr-2" />
                        Slack
                      </button>
                    </TabsList>
                  </div>

                  {/* ── Tab Content Area ─────────────────────────────── */}
                  <div className="flex-1 overflow-hidden bg-background">

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
      <Sheet open={isAiAssistantOpen} onOpenChange={setIsAiAssistantOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[560px] p-0"
          overlayClassName="bg-black/25 backdrop-blur-[1px]"
        >
          <SheetTitle className="sr-only">Ask AI about this candidate</SheetTitle>
          <SheetDescription className="sr-only">
            Candidate-scoped assistant for analysis and actions
          </SheetDescription>
          <AiAssistantSidebar
            streamEndpoint="/api/assistant/chat/stream"
            requestBody={assistantRequestBody}
            welcomeTitle="Candidate Copilot"
            welcomeSubtitle="Ask anything about this candidate or run actions."
            suggestedPrompts={[
              "Give me a full summary of this candidate",
              "What are the top strengths and concerns?",
              "Move this candidate to Technical Interview",
              "Add a note: Strong communication and stakeholder handling",
            ]}
          />
        </SheetContent>
      </Sheet>
    </Sheet>
  );
}
