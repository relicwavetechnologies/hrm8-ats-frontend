import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/shared/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ChevronLeft, ChevronRight, X, FileText, Users, Calendar, ClipboardCheck, MessageSquare, Activity, Vote, GitCompare, Highlighter, Mail, Phone, Hash, CheckSquare, Plus, Loader2 } from "lucide-react";
import { Application } from "@/shared/types/application";
import { ActivityTimelineTab } from "./tabs/ActivityTimelineTab";
import { ExperienceSkillsTab } from "./tabs/ExperienceSkillsTab";
import { QuestionnaireResponsesTab } from "./tabs/QuestionnaireResponsesTab";
import { InterviewsTab } from "./tabs/InterviewsTab";
import { TeamReviewsTab } from "./tabs/TeamReviewsTab";
import { ResumeAnnotationsTab } from "./tabs/ResumeAnnotationsTab";
import { EmailTab } from "./tabs/EmailTab";
import { CallLogsTab } from "./tabs/CallLogsTab";
import { SmsTab } from "./tabs/SmsTab";
import { SlackTab } from "./tabs/SlackTab";
import { NotesTab } from "./tabs/NotesTab";
import { TaskCreationTab, TaskListTab } from "./tabs/CreateTaskTab";
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
  const [activeTab, setActiveTab] = useState("activity");
  const [topActiveTab, setTopActiveTab] = useState("notes");
  const [fullApplication, setFullApplication] = useState<Application>(application);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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
    currentUserId: 'current-user',
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
          {/* Compact Header */}
          <div className="bg-background flex-shrink-0">
            <div className="flex items-center justify-between py-1.5 px-2 gap-2 border-b">
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="outline" className="h-6 text-[10px] px-2 max-w-[180px] truncate">
                  {fullApplication.candidateName || "Candidate"}
                </Badge>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">Status</span>
                <Select
                  value={String(fullApplication.status || "applied")}
                  onValueChange={handleStatusChange}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="h-7 w-[160px] text-[11px] bg-background">
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
              </div>
              <div className="flex items-center gap-1">
                <NotificationCenter userId="current-user" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-7 w-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Resizable 3-Panel Content Layout */}
          <div className="flex-1 overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Left Panel - Resizable Candidate Info */}
              <ResizablePanel
                defaultSize={25}
                minSize={20}
                maxSize={40}
                className="overflow-hidden"
              >
                <CandidateInfoPanel
                  application={fullApplication}
                  jobTitle={jobTitle}
                />
              </ResizablePanel>

              {/* Resize Handle */}
              <ResizableHandle withHandle />

              {/* Right Side - Notes + Tabs */}
              <ResizablePanel defaultSize={75} minSize={50}>
                <div className="h-full flex flex-col overflow-hidden">
                  {/* Top - Notes Panel */}
                  {/* Top - Notes / New Task Panel */}
                  <div className="h-[360px] flex-shrink-0 border-b bg-background">
                    <CandidateNotesPanelEnhanced
                      applicationId={fullApplication.id}
                      jobId={jobId || fullApplication.jobId || ''}
                      candidateName={fullApplication.candidateName || "Candidate"}
                      jobTitle={jobTitle}
                      candidateEmail={fullApplication.candidateEmail}
                      candidatePhone={fullApplication.candidatePhone}
                      application={fullApplication}
                    />
                  </div>

                  {/* Bottom - Existing Tabs */}
                  <div className="flex-1 overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                      <div className="border-b px-2 bg-muted/20 flex-shrink-0">
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                          <TabsList className="h-10 bg-transparent inline-flex w-max gap-1 whitespace-nowrap">
                            <TabsTrigger value="activity" className="gap-1.5 text-xs">
                              <Activity className="h-3.5 w-3.5" />
                              Activity
                            </TabsTrigger>

                            <TabsTrigger value="notes" className="gap-1.5 text-xs">
                              <MessageSquare className="h-3.5 w-3.5" />
                              Notes
                            </TabsTrigger>
                            <TabsTrigger value="tasks" className="gap-1.5 text-xs">
                              <CheckSquare className="h-3.5 w-3.5" />
                              Tasks
                            </TabsTrigger>
                            <TabsTrigger value="annotations" className="gap-1.5 text-xs">
                              <Highlighter className="h-3.5 w-3.5" />
                              Annotations
                            </TabsTrigger>
                            <TabsTrigger value="questionnaire" className="gap-1.5 text-xs">
                              <MessageSquare className="h-3.5 w-3.5" />
                              Questionnaire
                            </TabsTrigger>
                            <TabsTrigger value="interviews" className="gap-1.5 text-xs">
                              <Calendar className="h-3.5 w-3.5" />
                              Interviews
                            </TabsTrigger>
                            <TabsTrigger value="reviews" className="gap-1.5 text-xs">
                              <Users className="h-3.5 w-3.5" />
                              Team Reviews
                            </TabsTrigger>
                            <TabsTrigger value="email" className="gap-1.5 text-xs">
                              <Mail className="h-3.5 w-3.5" />
                              Email
                            </TabsTrigger>
                            <TabsTrigger value="calls" className="gap-1.5 text-xs">
                              <Phone className="h-3.5 w-3.5" />
                              Calls
                            </TabsTrigger>
                            <TabsTrigger value="sms" className="gap-1.5 text-xs">
                              <MessageSquare className="h-3.5 w-3.5" />
                              SMS
                            </TabsTrigger>
                            <TabsTrigger value="slack" className="gap-1.5 text-xs">
                              <Hash className="h-3.5 w-3.5" />
                              Slack
                            </TabsTrigger>
                          </TabsList>
                        </div>
                      </div>

                      <ScrollArea className="flex-1">
                        <div className="p-4">
                          <TabsContent value="activity" className="mt-0">
                            <ActivityTimelineTab application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="notes" className="mt-0">
                            <NotesTab application={fullApplication} />
                          </TabsContent>





                          <TabsContent value="tasks" className="mt-0 h-full">
                            <TaskListTab application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="experience" className="mt-0">
                            <ExperienceSkillsTab application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="questionnaire" className="mt-0">
                            <QuestionnaireResponsesTab
                              application={fullApplication}
                              jobId={jobId || fullApplication.jobId}
                            />
                          </TabsContent>

                          <TabsContent value="interviews" className="mt-0">
                            <InterviewsTab application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="reviews" className="mt-0">
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
                          </TabsContent>

                          <TabsContent value="annotations" className="mt-0">
                            <ResumeAnnotationsTab candidateId={fullApplication.id} application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="email" className="mt-0">
                            <EmailTab application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="calls" className="mt-0">
                            <CallLogsTab application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="sms" className="mt-0">
                            <SmsTab application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="slack" className="mt-0">
                            <SlackTab application={fullApplication} />
                          </TabsContent>
                        </div>
                      </ScrollArea>
                    </Tabs>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </SheetContent>
    </Sheet >
  );
}
