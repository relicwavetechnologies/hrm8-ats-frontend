import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/shared/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ChevronLeft, ChevronRight, X, FileText, Users, Calendar, ClipboardCheck, MessageSquare, Activity, Vote, GitCompare, Highlighter } from "lucide-react";
import { Application } from "@/shared/types/application";
import { QuickActionsToolbar } from "./QuickActionsToolbar";
import { OverviewTab } from "./tabs/OverviewTab";
import { ExperienceSkillsTab } from "./tabs/ExperienceSkillsTab";
import { QuestionnaireResponsesTab } from "./tabs/QuestionnaireResponsesTab";
import { ScorecardsTab } from "./tabs/ScorecardsTab";
import { InterviewsTab } from "./tabs/InterviewsTab";
import { TeamReviewsTab } from "./tabs/TeamReviewsTab";
import { ActivityTimelineTab } from "./tabs/ActivityTimelineTab";
import { VotingTab } from "./tabs/VotingTab";
import { ComparisonTab } from "./tabs/ComparisonTab";
import { ResumeAnnotationsTab } from "./tabs/ResumeAnnotationsTab";
import { useActivityNotifications } from "@/shared/hooks/useActivityNotifications";
import { useCandidatePresence } from "@/shared/hooks/useCandidatePresence";
import { CandidatePresenceIndicator } from "./CandidatePresenceIndicator";
import { useCursorTracking } from "@/shared/hooks/useCursorTracking";
import { NotificationCenter } from "@/modules/notifications/components/NotificationCenter";
import { CandidateInfoPanel } from "./CandidateInfoPanel";
import { CandidateNotesPanel } from "./CandidateNotesPanel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/shared/components/ui/resizable";

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
}: CandidateAssessmentViewProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [fullApplication, setFullApplication] = useState<Application>(application);

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

  const { unreadCount } = useActivityNotifications(fullApplication);
  const { activeUsers } = useCandidatePresence({
    applicationId: fullApplication.id,
    currentUserId: 'current-user',
    currentUserName: 'You',
    currentUserRole: 'Hiring Manager',
    currentTab: activeTab,
  });
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] p-0 gap-0 h-full overflow-hidden"
        onKeyDown={handleKeyDown}
        aria-describedby={undefined}
      >
        {/* Screen reader only title for accessibility */}
        <SheetTitle className="sr-only">Candidate Assessment - {fullApplication.candidateName}</SheetTitle>
        <div ref={containerRef} className="flex flex-col h-full relative overflow-hidden">
          {/* Compact Header */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm text-muted-foreground">
                  Candidate Assessment
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNext}
                  disabled={!hasNext}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <CandidatePresenceIndicator
                  activeUsers={activeUsers}
                  currentUserId="current-user"
                />
                <NotificationCenter userId="current-user" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Actions Toolbar */}
            <QuickActionsToolbar
              application={fullApplication}
              nextStageName={nextStageName}
              onNextStage={onMoveToNextStage}
            />
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
                  <div className="h-[260px] flex-shrink-0 border-b p-3">
                    <CandidateNotesPanel
                      applicationId={fullApplication.id}
                      jobId={fullApplication.jobId || ''}
                      candidateName={fullApplication.candidateName || fullApplication.candidate?.first_name + ' ' + fullApplication.candidate?.last_name}
                      jobTitle={jobTitle}
                    />
                  </div>

                  {/* Bottom - Existing Tabs */}
                  <div className="flex-1 overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                      <div className="border-b px-4 bg-muted/20 flex-shrink-0">
                        <ScrollArea className="w-full whitespace-nowrap overflow-auto">
                          <TabsList className="h-10 bg-transparent">
                            <TabsTrigger value="overview" className="gap-1.5 text-xs">
                              <FileText className="h-3.5 w-3.5" />
                              Overview
                            </TabsTrigger>
                            <TabsTrigger value="annotations" className="gap-1.5 text-xs">
                              <Highlighter className="h-3.5 w-3.5" />
                              Annotations
                            </TabsTrigger>
                            <TabsTrigger value="questionnaire" className="gap-1.5 text-xs">
                              <MessageSquare className="h-3.5 w-3.5" />
                              Questionnaire
                            </TabsTrigger>
                            <TabsTrigger value="scorecards" className="gap-1.5 text-xs">
                              <ClipboardCheck className="h-3.5 w-3.5" />
                              Scorecards
                            </TabsTrigger>
                            <TabsTrigger value="interviews" className="gap-1.5 text-xs">
                              <Calendar className="h-3.5 w-3.5" />
                              Interviews
                            </TabsTrigger>
                            <TabsTrigger value="reviews" className="gap-1.5 text-xs">
                              <Users className="h-3.5 w-3.5" />
                              Team Reviews
                            </TabsTrigger>
                            <TabsTrigger value="voting" className="gap-1.5 text-xs">
                              <Vote className="h-3.5 w-3.5" />
                              Voting
                            </TabsTrigger>
                            <TabsTrigger value="comparison" className="gap-1.5 text-xs">
                              <GitCompare className="h-3.5 w-3.5" />
                              Compare
                            </TabsTrigger>
                            <TabsTrigger value="activity" className="gap-1.5 text-xs">
                              <Activity className="h-3.5 w-3.5" />
                              Activity
                              {unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-1 h-4 min-w-4 rounded-full px-1 text-[10px]">
                                  {unreadCount}
                                </Badge>
                              )}
                            </TabsTrigger>
                          </TabsList>
                        </ScrollArea>
                      </div>

                      <ScrollArea className="flex-1">
                        <div className="p-4">
                          <TabsContent value="overview" className="mt-0">
                            <OverviewTab application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="experience" className="mt-0">
                            <ExperienceSkillsTab application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="questionnaire" className="mt-0">
                            <QuestionnaireResponsesTab application={fullApplication} />
                          </TabsContent>

                          <TabsContent value="scorecards" className="mt-0">
                            <ScorecardsTab application={fullApplication} />
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

                          <TabsContent value="voting" className="mt-0">
                            <VotingTab
                              candidateId={fullApplication.id}
                              candidateName={fullApplication.candidateName}
                            />
                          </TabsContent>

                          <TabsContent value="comparison" className="mt-0">
                            <ComparisonTab />
                          </TabsContent>

                          <TabsContent value="annotations" className="mt-0">
                            <ResumeAnnotationsTab candidateId={fullApplication.id} />
                          </TabsContent>

                          <TabsContent value="activity" className="mt-0">
                            <ActivityTimelineTab application={fullApplication} />
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
    </Sheet>
  );
}
