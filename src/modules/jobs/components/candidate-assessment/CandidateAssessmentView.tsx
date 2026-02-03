import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ChevronLeft, ChevronRight, X, FileText, Users, Calendar, ClipboardCheck, MessageSquare, Activity, Briefcase, Vote, GitCompare, Highlighter } from "lucide-react";
import { Application } from "@/shared/types/application";
import { CandidateProfileHeader } from "./CandidateProfileHeader";
import { AIMatchScoreCard } from "./AIMatchScoreCard";
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
import { CursorOverlay } from "./CursorIndicator";
import { NotificationCenter } from "@/modules/notifications/components/NotificationCenter";

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
    // Determine if we need to fetch full details (e.g., missing notes or reviews)
    // Or just fetch always to be safe and get latest data
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
  }, [application.id, application.updatedAt, application]); // Re-fetch if ID matches but data/timestamp changed

  const { unreadCount } = useActivityNotifications(fullApplication);
  const { activeUsers } = useCandidatePresence({
    applicationId: fullApplication.id,
    currentUserId: 'current-user',
    currentUserName: 'You',
    currentUserRole: 'Hiring Manager',
    currentTab: activeTab,
  });
  const { cursors, containerRef } = useCursorTracking({
    applicationId: fullApplication.id,
    currentUserId: 'current-user',
    enabled: open,
  });

  // Keyboard shortcuts
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
        className="w-full sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl p-0 gap-0 h-full overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <div ref={containerRef} className="flex flex-col h-full relative overflow-hidden">
          {/* Header */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between p-4">
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

            <CandidateProfileHeader application={fullApplication} jobTitle={jobTitle} />
            <QuickActionsToolbar 
              application={fullApplication} 
              nextStageName={nextStageName}
              onNextStage={onMoveToNextStage}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="border-b px-4 bg-muted/20">
                <ScrollArea className="w-full whitespace-nowrap overflow-auto">
                  <TabsList className="h-12 bg-transparent">
                    <TabsTrigger value="overview" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="annotations" className="gap-2">
                      <Highlighter className="h-4 w-4" />
                      Annotations
                    </TabsTrigger>
                    <TabsTrigger value="questionnaire" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Questionnaire
                    </TabsTrigger>
                    <TabsTrigger value="scorecards" className="gap-2">
                      <ClipboardCheck className="h-4 w-4" />
                      Scorecards
                    </TabsTrigger>
                    <TabsTrigger value="interviews" className="gap-2">
                      <Calendar className="h-4 w-4" />
                      Interviews
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="gap-2">
                      <Users className="h-4 w-4" />
                      Team Reviews
                    </TabsTrigger>
                    <TabsTrigger value="voting" className="gap-2">
                      <Vote className="h-4 w-4" />
                      Voting
                    </TabsTrigger>
                    <TabsTrigger value="comparison" className="gap-2">
                      <GitCompare className="h-4 w-4" />
                      Compare
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="gap-2">
                      <Activity className="h-4 w-4" />
                      Activity
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-1 h-5 min-w-5 rounded-full px-1 text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </ScrollArea>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6">
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
                // Determine if we need to fetch full details (e.g., missing notes or reviews)
                // Or just fetch always to be safe and get latest data
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
      </SheetContent>
    </Sheet>
  );
}
