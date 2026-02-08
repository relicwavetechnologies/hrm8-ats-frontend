import { useState, useEffect, useMemo } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, DragOverEvent, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Application, ApplicationStage } from "@/shared/types/application";
import { ApplicationCard } from "./ApplicationCard";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { updateApplicationStatus, getApplications } from "@/shared/lib/mockApplicationStorage";
import { applicationService } from "@/shared/lib/applicationService";
import { ConsultantCandidateService } from "@/shared/lib/consultant/consultantCandidateService";
import { toast } from "sonner";
import { CandidateAssessmentView } from "@/modules/jobs/components/candidate-assessment/CandidateAssessmentView";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ChevronDown, Plus, Trash2, GripVertical, Settings, CalendarClock, FileSearch, Send, Star, Users, Play, Mail } from "lucide-react";
import { CreateRoundDialog } from "./CreateRoundDialog";
import { RoundEmailConfigDrawer } from "./RoundEmailConfigDrawer";
import { AssessmentConfigurationDrawer } from "./AssessmentConfigurationDrawer";
import { AssessmentReviewDrawer } from "./AssessmentReviewDrawer";
import { InterviewConfigurationDrawer } from "./InterviewConfigurationDrawer";
import { InterviewScheduleDrawer } from "./InterviewScheduleDrawer";
import { RoundInterviewsDrawer } from "./RoundInterviewsDrawer";
import { InitialScreeningDrawer } from "./InitialScreeningDrawer";
import { OfferConfigurationDrawer } from "./OfferConfigurationDrawer";
import { OfferExecutionDrawer } from "./OfferExecutionDrawer";
import { JobRound, JobRoundType, jobRoundService } from "@/shared/lib/jobRoundService";
import { jobService } from "@/shared/lib/jobService";
import { offerService } from "@/shared/lib/offerService";
import { MoveStageDialog } from "./MoveStageDialog";

interface ApplicationPipelineProps {
  jobId?: string;
  jobTitle?: string;
  applications?: Application[];
  isCompareMode?: boolean;
  selectedForComparison?: string[];
  onToggleSelect?: (applicationId: string) => void;
  enableMultiSelect?: boolean;
  selectedApplicationIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onApplicationMoved?: () => void; // Callback when application is moved (for parent to refresh)
  isConsultantView?: boolean; // When true, uses consultant API endpoints
}

const pipelineStages: { stage: ApplicationStage; label: string; color: string }[] = [
  { stage: "New Application", label: "New", color: "bg-blue-50 dark:bg-blue-950/30" },
  { stage: "Resume Review", label: "Screening", color: "bg-purple-50 dark:bg-purple-950/30" },
  { stage: "Phone Screen", label: "Phone Screen", color: "bg-amber-50 dark:bg-amber-950/30" },
  { stage: "Technical Interview", label: "Interview", color: "bg-cyan-50 dark:bg-cyan-950/30" },
  { stage: "Offer Extended", label: "Offer", color: "bg-green-50 dark:bg-green-950/30" },
  { stage: "Offer Accepted", label: "Hired", color: "bg-emerald-50 dark:bg-emerald-950/30" },
  { stage: "Rejected", label: "Rejected", color: "bg-red-50 dark:bg-red-950/30" },
];

// Sortable Round Column Wrapper - allows dragging round columns to reorder
function SortableRoundColumn({
  round,
  applications,
  onApplicationClick,
  isCompareMode,
  selectedForComparison,
  onToggleSelect,
  onStageChange,
  onMoveToRound,
  onDeleteRound,
  onConfigureAssessment,
  onConfigureInterview,
  allRounds,
  onViewInterviews,
  onViewRoundInterviews,
  onOpenScreening,
  onConfigureOffer,
  onExecuteOffer,
  onOpenAssessmentDrawer,
  onConfigureEmail,
}: {
  round: JobRound;
  applications: Application[];
  onApplicationClick: (application: Application) => void;
  isCompareMode: boolean;
  selectedForComparison: string[];
  onToggleSelect?: (applicationId: string) => void;
  onStageChange: (applicationId: string, newStage: ApplicationStage) => void;
  onMoveToRound?: (applicationId: string, roundId: string) => void;
  onDeleteRound?: (roundId: string) => void;
  onConfigureAssessment?: (roundId: string) => void;
  onConfigureInterview?: (roundId: string) => void;
  allRounds: JobRound[];
  onViewInterviews?: (application: Application) => void;
  onViewRoundInterviews?: (roundId: string) => void;
  onOpenScreening?: (round: JobRound) => void;
  onConfigureOffer?: (roundId: string) => void;
  onExecuteOffer?: (roundId: string) => void;
  onOpenAssessmentDrawer?: (round: JobRound) => void;
  onConfigureEmail?: (round: JobRound) => void;
  dragHandleProps?: any;
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: `round-${round.id}`,
    disabled: round.isFixed, // Fixed rounds cannot be reordered
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isColumnDragging ? 0.5 : 1,
  };

  return (
    <div ref={setSortableRef} style={style} className="min-w-0">
      <StageColumn
        round={round}
        applications={applications}
        onApplicationClick={onApplicationClick}
        isCompareMode={isCompareMode}
        selectedForComparison={selectedForComparison}
        onToggleSelect={onToggleSelect}
        onStageChange={onStageChange}
        onMoveToRound={onMoveToRound}
        onDeleteRound={onDeleteRound}
        onConfigureAssessment={onConfigureAssessment}
        onConfigureInterview={onConfigureInterview}
        allRounds={allRounds}
        onViewInterviews={onViewInterviews}
        onViewRoundInterviews={onViewRoundInterviews}
        onOpenScreening={onOpenScreening}
        onConfigureOffer={onConfigureOffer}
        onExecuteOffer={onExecuteOffer}
        onOpenAssessmentDrawer={onOpenAssessmentDrawer}
        onConfigureEmail={onConfigureEmail}
        dragHandleProps={!round.isFixed ? { ...attributes, ...listeners } : undefined}
      />
    </div>
  );
}

// Stage Column Component with Droppable
function StageColumn({
  round,
  applications,
  onApplicationClick,
  isCompareMode,
  selectedForComparison,
  onToggleSelect,
  onStageChange,
  onMoveToRound,
  onDeleteRound,
  onConfigureAssessment,
  onConfigureInterview,
  allRounds,
  onViewInterviews,
  onViewRoundInterviews,
  onOpenScreening,
  onExecuteOffer,
  onConfigureOffer,
  onOpenAssessmentDrawer,
  onConfigureEmail,
  dragHandleProps,
}: {
  round: JobRound;
  applications: Application[];
  onApplicationClick: (application: Application) => void;
  isCompareMode: boolean;
  selectedForComparison: string[];
  onToggleSelect?: (applicationId: string) => void;
  onStageChange: (applicationId: string, newStage: ApplicationStage) => void;
  onMoveToRound?: (applicationId: string, roundId: string) => void;
  onDeleteRound?: (roundId: string) => void;
  onConfigureAssessment?: (roundId: string) => void;
  onConfigureInterview?: (roundId: string) => void;
  allRounds: JobRound[];
  onViewInterviews?: (application: Application) => void;
  onViewRoundInterviews?: (roundId: string) => void;
  onOpenScreening?: (round: JobRound) => void;
  onConfigureOffer?: (roundId: string) => void;
  onExecuteOffer?: (roundId: string) => void;
  onOpenAssessmentDrawer?: (round: JobRound) => void;
  onConfigureEmail?: (round: JobRound) => void;
  dragHandleProps?: any;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: round.id,
  });

  // Get color based on round type and fixed status
  const getRoundColor = (round: JobRound): string => {
    if (round.isFixed) {
      if (round.fixedKey === 'NEW') return 'bg-blue-50 dark:bg-blue-950/30';
      if (round.fixedKey === 'OFFER') return 'bg-green-50 dark:bg-green-950/30';
      if (round.fixedKey === 'HIRED') return 'bg-emerald-50 dark:bg-emerald-950/30';
      if (round.fixedKey === 'REJECTED') return 'bg-red-50 dark:bg-red-950/30';
    }
    return round.type === 'INTERVIEW'
      ? 'bg-cyan-50 dark:bg-cyan-950/30'
      : 'bg-purple-50 dark:bg-purple-950/30';
  };

  return (
    <div className="min-w-0">
      <Card className={`${getRoundColor(round)} border-2 h-full flex flex-col ${isOver ? 'ring-2 ring-primary' : ''}`}>
        <div className="p-3 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div
              className={`flex items-center gap-2 flex-1 min-w-0 ${round.isFixed && round.fixedKey === 'NEW' ? 'cursor-pointer hover:opacity-80' : ''}`}
              onClick={(e) => {
                if (round.isFixed && round.fixedKey === 'NEW' && onOpenScreening) {
                  e.stopPropagation();
                  onOpenScreening(round);
                }
              }}
            >
              {dragHandleProps && !round.isFixed && (
                <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                  <GripVertical className="h-4 w-4" />
                </div>
              )}
              <h3 className="font-semibold text-sm truncate">{round.name}</h3>
              {!round.isFixed && round.type === 'INTERVIEW' && (
                <Badge variant="outline" className="text-xs h-5 px-1.5 rounded-full shrink-0">
                  Interview
                </Badge>
              )}
              {!round.isFixed && round.type === 'ASSESSMENT' && (
                <Badge variant="outline" className="text-xs h-5 px-1.5 rounded-full shrink-0">
                  Assessment
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs h-6 px-2 rounded-full">
                {applications.length}
              </Badge>
              {onConfigureEmail && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfigureEmail(round);
                  }}
                  title="Configure Auto-Reply Email"
                >
                  <Mail className="h-3 w-3" />
                </Button>
              )}
              {round.isFixed && round.fixedKey === 'NEW' && (
                <>
                  {onOpenScreening && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenScreening(round);
                      }}
                      title="Open Initial Screening"
                    >
                      <FileSearch className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
              {!round.isFixed && round.type === 'ASSESSMENT' && (
                <>
                  {onOpenAssessmentDrawer && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAssessmentDrawer(round);
                      }}
                      title="Review Assessments"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  )}
                  {onConfigureAssessment && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfigureAssessment(round.id);
                      }}
                      title="Configure Assessment"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
              {!round.isFixed && round.type === 'INTERVIEW' && (
                <>
                  {onConfigureInterview && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfigureInterview(round.id);
                      }}
                      title="Configure Interview"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  )}
                  {onViewRoundInterviews && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewRoundInterviews(round.id);
                      }}
                      title="View Round Interviews"
                    >
                      <CalendarClock className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
              {round.isFixed && round.fixedKey === 'OFFER' && (
                <>
                  {onConfigureOffer && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfigureOffer(round.id);
                      }}
                      title="Configure Offer Settings"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  )}
                  {onExecuteOffer && applications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExecuteOffer(round.id);
                      }}
                      title="Send Offers"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
              {!round.isFixed && onDeleteRound && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRound(round.id);
                  }}
                  title="Delete Round"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <div ref={setNodeRef} className="flex-1 min-h-[150px]">
            <SortableContext items={applications.map((app) => app.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5 flex-1 overflow-y-auto min-h-[150px]">
                {applications.map((application) => (
                  <div key={application.id} className="relative group">
                    <ApplicationCard
                      application={application}
                      onClick={() => onApplicationClick(application)}
                      isCompareMode={isCompareMode}
                      isSelected={selectedForComparison.includes(application.id)}
                      onToggleSelect={onToggleSelect}
                      variant="minimal"
                      allRounds={allRounds}
                      onMoveToRound={(appId, roundId) => {
                        if (onMoveToRound) {
                          onMoveToRound(appId, roundId);
                        }
                      }}
                      onViewInterviews={onViewInterviews}
                    />
                  </div>
                ))}

                {applications.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                    No applications
                  </div>
                )}
              </div>
            </SortableContext>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function ApplicationPipeline({
  jobId,
  jobTitle = "Position",
  applications: providedApplications,
  isCompareMode = false,
  selectedForComparison = [],
  onToggleSelect,
  enableMultiSelect = false,
  selectedApplicationIds = [],
  onSelectionChange,
  onApplicationMoved,
  isConsultantView = false,
}: ApplicationPipelineProps) {
  // Service layer - switches between employer and consultant APIs
  const appService = isConsultantView ? ConsultantCandidateService : applicationService;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [rounds, setRounds] = useState<JobRound[]>([]);
  const [createRoundDialogOpen, setCreateRoundDialogOpen] = useState(false);
  const [assessmentConfigDrawerOpen, setAssessmentConfigDrawerOpen] = useState(false);
  const [interviewConfigDrawerOpen, setInterviewConfigDrawerOpen] = useState(false);
  const [selectedRoundForConfig, setSelectedRoundForConfig] = useState<JobRound | null>(null);
  const [selectedRoundForInterviews, setSelectedRoundForInterviews] = useState<JobRound | null>(null);
  const [interviewScheduleDrawerOpen, setInterviewScheduleDrawerOpen] = useState(false);
  const [selectedApplicationForInterviews, setSelectedApplicationForInterviews] = useState<Application | null>(null);
  const [screeningDrawerOpen, setScreeningDrawerOpen] = useState(false);
  const [selectedRoundForScreening, setSelectedRoundForScreening] = useState<JobRound | null>(null);
  const [offerConfigDrawerOpen, setOfferConfigDrawerOpen] = useState(false);
  const [offerExecutionDrawerOpen, setOfferExecutionDrawerOpen] = useState(false);
  const [selectedRoundForOffer, setSelectedRoundForOffer] = useState<JobRound | null>(null);
  const [assessmentReviewDrawerOpen, setAssessmentReviewDrawerOpen] = useState(false);
  const [selectedRoundForReview, setSelectedRoundForReview] = useState<JobRound | null>(null);
  const [roundEmailConfigDrawerOpen, setRoundEmailConfigDrawerOpen] = useState(false);
  const [selectedRoundForEmailConfig, setSelectedRoundForEmailConfig] = useState<JobRound | null>(null);
  const [jobData, setJobData] = useState<any>(null);
  const isSimpleFlow = jobData?.job?.setupType === 'simple';
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  // Move Dialog State
  const [isMoveStageDialogOpen, setIsMoveStageDialogOpen] = useState(false);
  const [pendingMoveApplication, setPendingMoveApplication] = useState<Application | null>(null);
  const [pendingTargetRound, setPendingTargetRound] = useState<JobRound | null>(null);
  const [pendingIsMoving, setPendingIsMoving] = useState(false);

  // Load rounds and job data when jobId changes
  useEffect(() => {
    if (jobId) {
      loadRounds();
      loadJobData();
    }
  }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update applications when providedApplications changes (for filtering)
  useEffect(() => {
    if (providedApplications !== undefined) {
      setApplications(providedApplications);
    } else {
      loadApplications();
    }
  }, [providedApplications, jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial load when jobId is set and no providedApplications
  useEffect(() => {
    if (jobId && providedApplications === undefined) {
      loadApplications();
    }
  }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadJobData = async () => {
    if (!jobId) return;
    // Skip job data loading for consultant view - not needed for pipeline
    if (isConsultantView) return;
    try {
      const response = await jobService.getJobById(jobId);
      if (response.success && response.data) {
        setJobData(response.data);
      }
    } catch (error) {
      console.error('Failed to load job data:', error);
    }
  };

  const loadRounds = async () => {
    if (!jobId) return;

    try {
      // Use consultant service for rounds if in consultant view
      const response = isConsultantView
        ? await ConsultantCandidateService.getJobRounds(jobId)
        : await jobRoundService.getJobRounds(jobId);

      if (response.success && response.data) {
        const loadedRounds = response.data.rounds || [];
        // Ensure we always have the 4 fixed rounds
        const fixedRoundKeys = ['NEW', 'OFFER', 'HIRED', 'REJECTED'];
        const fixedRounds = fixedRoundKeys.map((key, idx) => {
          const existing = loadedRounds.find(r => r.fixedKey === key);
          if (existing) return existing;
          // Create fallback fixed round if missing
          return {
            id: `fixed-${key}-${jobId}`,
            jobId,
            name: key === 'NEW' ? 'New' : key === 'OFFER' ? 'Offer' : key === 'HIRED' ? 'Hired' : 'Rejected',
            order: key === 'NEW' ? 1 : key === 'OFFER' ? 999 : key === 'HIRED' ? 1000 : 1001,
            type: 'ASSESSMENT' as JobRoundType,
            isFixed: true,
            fixedKey: key,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });

        // Separate custom rounds and sort them
        const customRounds = loadedRounds.filter(r => !r.isFixed).sort((a, b) => a.order - b.order);

        // Build final array: NEW (1), then custom rounds (2-998), then OFFER (999), HIRED (1000), REJECTED (1001)
        const allRounds: JobRound[] = [];

        // Always start with NEW
        const newRound = fixedRounds.find(r => r.fixedKey === 'NEW');
        if (newRound) allRounds.push(newRound);

        // Add custom rounds (they should have orders between 2 and 998)
        allRounds.push(...customRounds);

        // Add end fixed rounds
        const offerRound = fixedRounds.find(r => r.fixedKey === 'OFFER');
        const hiredRound = fixedRounds.find(r => r.fixedKey === 'HIRED');
        const rejectedRound = fixedRounds.find(r => r.fixedKey === 'REJECTED');
        if (offerRound) allRounds.push(offerRound);
        if (hiredRound) allRounds.push(hiredRound);
        if (rejectedRound) allRounds.push(rejectedRound);

        // Final sort by order to ensure correct sequence
        allRounds.sort((a, b) => a.order - b.order);

        setRounds(allRounds);
      }
    } catch (error) {
      console.error('Failed to load rounds:', error);
      // Create default fixed rounds if backend fails
      if (jobId) {
        const defaultRounds: JobRound[] = [
          { id: `fixed-NEW-${jobId}`, jobId, name: 'New', order: 1, type: 'ASSESSMENT', isFixed: true, fixedKey: 'NEW', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: `fixed-OFFER-${jobId}`, jobId, name: 'Offer', order: 999, type: 'ASSESSMENT', isFixed: true, fixedKey: 'OFFER', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: `fixed-HIRED-${jobId}`, jobId, name: 'Hired', order: 1000, type: 'ASSESSMENT', isFixed: true, fixedKey: 'HIRED', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: `fixed-REJECTED-${jobId}`, jobId, name: 'Rejected', order: 1001, type: 'ASSESSMENT', isFixed: true, fixedKey: 'REJECTED', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ];
        setRounds(defaultRounds);
      }
    }
  };


  const loadApplications = async (): Promise<Record<string, string> | undefined> => {
    if (providedApplications) {
      // Use provided filtered applications
      setApplications(providedApplications);
      return undefined;
    } else if (jobId) {
      // Load from API if jobId is provided
      try {
        const response = await appService.getJobApplications(jobId);
        const apiApplications = response.data?.applications || [];

        // Extract round progress mapping
        const roundMap: Record<string, string> = {};
        // @ts-expect-error - roundProgress exists in backend response but might not be in type definition
        if (response.data?.roundProgress) {
          // @ts-expect-error - iterating over unknown type
          Object.entries(response.data.roundProgress).forEach(([appId, progress]: [string, any]) => {
            if (progress?.roundId) {
              roundMap[appId] = progress.roundId;
            }
          });
        }

        // Map API applications to frontend Application type
        // Handle both pre-transformed consultant data and raw employer API data
        const mappedApplications: Application[] = apiApplications.map((app: any) => ({
          id: app.id,
          candidateId: app.candidateId || app.candidate_id || app.candidate?.id || (app as any).candidate_id,
          // Handle pre-transformed data (candidateName) or raw data (candidate.firstName/first_name)
          candidateName: app.candidateName || (
            (app.candidate?.firstName && app.candidate?.lastName)
              ? `${app.candidate.firstName} ${app.candidate.lastName}`
              : (app.candidate?.first_name && app.candidate?.last_name)
                ? `${app.candidate.first_name} ${app.candidate.last_name}`
                : 'Unknown Candidate'
          ),
          candidateEmail: app.candidateEmail || app.candidate?.email || '',
          candidatePhoto: app.candidatePhoto || app.candidate?.photo,
          jobId: app.jobId || app.job_id,
          jobTitle: app.jobTitle || app.job?.title || 'Unknown Job',
          employerName: app.employerName || app.job?.company?.name || 'Unknown Company',
          appliedDate: app.appliedDate ? new Date(app.appliedDate) : (app.applied_date ? new Date(app.applied_date) : new Date()),
          status: mapApplicationStatus(app.status),
          stage: mapApplicationStage(app.stage),
          roundId: roundMap[app.id],
          resumeUrl: app.resumeUrl || app.resume_url || app.candidate?.resume_url,
          coverLetterUrl: app.coverLetterUrl || app.cover_letter_url,
          portfolioUrl: app.portfolioUrl || app.portfolio_url,
          linkedInUrl: app.linkedInUrl || app.linked_in_url || app.candidate?.linked_in_url,
          customAnswers: app.customAnswers || app.custom_answers || [],
          isRead: app.isRead ?? app.is_read,
          isNew: app.isNew ?? app.is_new,
          tags: app.tags || [],
          recruiterNotes: app.recruiterNotes || app.recruiter_notes,
          notes: [],
          activities: [],
          interviews: [],
          createdAt: app.createdAt ? new Date(app.createdAt) : (app.created_at ? new Date(app.created_at) : new Date()),
          updatedAt: app.updatedAt ? new Date(app.updatedAt) : (app.updated_at ? new Date(app.updated_at) : new Date()),
          shortlisted: app.shortlisted || false,
          manuallyAdded: app.manuallyAdded || app.manually_added || false,
          // Include AI scoring fields for ApplicationCard display
          score: app.score,
          aiMatchScore: app.aiMatchScore || app.aiScore || app.score, // Used by AIMatchBadge
          aiAnalysis: app.aiAnalysis, // Used for recommendation badge and justification
        }));
        setApplications(mappedApplications);
        return undefined;
      } catch (error) {
        console.error('Failed to load applications:', error);
        // Fallback to mock data
        const allApps = getApplications();
        const filtered = allApps.filter(app => app.jobId === jobId);
        setApplications(filtered);
        return undefined;
      }
    } else {
      // Fetch all from mock storage
      const allApps = getApplications();
      setApplications(allApps);
      return undefined;
    }
  };

  // Map backend ApplicationStatus to frontend ApplicationStatus
  const mapApplicationStatus = (status: string): Application['status'] => {
    const statusMap: Record<string, Application['status']> = {
      'NEW': 'applied',
      'SCREENING': 'screening',
      'INTERVIEW': 'interview',
      'OFFER': 'offer',
      'HIRED': 'hired',
      'REJECTED': 'rejected',
      'WITHDRAWN': 'withdrawn',
    };
    return statusMap[status] || 'applied';
  };

  // Map backend ApplicationStage to frontend ApplicationStage
  const mapApplicationStage = (stage: string): ApplicationStage => {
    const stageMap: Record<string, ApplicationStage> = {
      'NEW_APPLICATION': 'New Application',
      'RESUME_REVIEW': 'Resume Review',
      'PHONE_SCREEN': 'Phone Screen',
      'TECHNICAL_INTERVIEW': 'Technical Interview',
      'ONSITE_INTERVIEW': 'Manager Interview',
      'OFFER_EXTENDED': 'Offer Extended',
      'OFFER_ACCEPTED': 'Offer Accepted',
      'REJECTED': 'Rejected',
    };
    return stageMap[stage] || 'New Application';
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    // Check if dragging a round column (starts with "round-")
    if (id.startsWith('round-')) {
      setActiveRoundId(id);
    } else {
      // Dragging an application
      setActiveId(id);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Optional: Add logic for smoother drag-over effects between columns
    // For now, we rely on handleDragEnd for the actual move
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveRoundId(null);
      return;
    }

    const activeIdStr = active.id as string;

    // Handle round column reordering
    if (activeIdStr.startsWith('round-')) {
      if (over.id.toString().startsWith('round-')) {
        const activeRoundId = activeIdStr.replace('round-', '');
        const overRoundId = over.id.toString().replace('round-', '');

        if (activeRoundId !== overRoundId) {
          await handleRoundReorder(activeRoundId, overRoundId);
        }
      }
      setActiveRoundId(null);
      return;
    }

    // Handle application drag between rounds
    const application = applications.find((app) => app.id === active.id);
    if (!application) {
      setActiveId(null);
      return;
    }

    // Check if dropped on a round column (droppable area)
    let targetRound: JobRound | null = null;

    // Check if dropped directly on a round column
    targetRound = rounds.find(r => r.id === over.id) || null;

    // Handle case where it dropped on the SortableRoundColumn wrapper
    if (!targetRound && over.id.toString().startsWith('round-')) {
      const cleanId = over.id.toString().replace('round-', '');
      targetRound = rounds.find(r => r.id === cleanId) || null;
    }

    if (!targetRound) {
      // Dropped on another card - find which round that card's application belongs to
      const targetApplication = applications.find((app) => app.id === over.id);
      if (targetApplication) {
        // Find the round this application is currently in
        targetRound = rounds.find(r => {
          const roundName = r.name.toLowerCase();
          const stageName = targetApplication.stage.toLowerCase();
          // Improve matching logic to use ID if possible or reliable stage map
          if (targetApplication.roundId && r.id === targetApplication.roundId) return true;

          if (roundName.includes(stageName) || stageName.includes(roundName)) return true;
          return false;
        }) || null;
      }
    }

    // If we found a target round, move application to that round
    if (targetRound) {
      await handleMoveToRound(application.id, targetRound.id);
    }

    setActiveId(null);
  };

  const handleRoundReorder = async (activeRoundId: string, overRoundId: string) => {
    if (!jobId) return;

    const activeIndex = rounds.findIndex(r => r.id === activeRoundId);
    const overIndex = rounds.findIndex(r => r.id === overRoundId);

    if (activeIndex === -1 || overIndex === -1) return;

    const activeRound = rounds[activeIndex];
    const overRound = rounds[overIndex];

    if (activeRound.isFixed) {
      toast.error('Fixed rounds cannot be reordered');
      return;
    }

    // Don't allow placing custom rounds before NEW or after REJECTED
    if (overRound.fixedKey === 'NEW' && activeIndex > overIndex) {
      toast.error('Cannot place rounds before "New"');
      return;
    }

    // Calculate new order based on the over round's order
    let newOrder: number;
    if (overRound.isFixed) {
      // If dropping on a fixed round, place before it (for OFFER) or after it (for others)
      if (overRound.fixedKey === 'OFFER' || overRound.fixedKey === 'HIRED') {
        newOrder = overRound.order - 1;
      } else {
        newOrder = overRound.order + 1;
      }
    } else {
      newOrder = overRound.order;
    }

    // Calculate new order for the moved round
    const reorderedRounds = arrayMove(rounds, activeIndex, overIndex);

    // Optimistically update UI
    setRounds(reorderedRounds);

    // Update the active round's order on backend
    try {
      const response = await jobRoundService.updateRound(jobId, activeRoundId, { order: newOrder });

      if (!response.success) {
        // Revert on error
        loadRounds();
        toast.error(response.error || 'Failed to reorder round');
      } else {
        // Reload to get updated orders from backend
        loadRounds();
      }
    } catch (error) {
      console.error('Failed to reorder round:', error);
      loadRounds(); // Revert on error
      toast.error('Failed to reorder round');
    }
  };

  // Helper to find current round for an application
  const findRoundForApplication = (app: Application): JobRound | undefined => {
    if (app.roundId) {
      return rounds.find(r => r.id === app.roundId);
    }
    // Fallback logic specific to how getApplicationsForRound works
    return rounds.find(round => {
      const roundName = round.name.toLowerCase();
      const stageName = app.stage.toLowerCase();
      if (round.isFixed) {
        if (round.fixedKey === 'NEW' && (stageName.includes('new'))) return true;
        if (round.fixedKey === 'OFFER' && stageName.includes('offer')) return true;
        if (round.fixedKey === 'HIRED' && stageName.includes('hired')) return true;
        if (round.fixedKey === 'REJECTED' && stageName.includes('rejected')) return true;
      }
      if (stageName.includes(roundName) || roundName.includes(stageName)) return true;
      const stageConfig = pipelineStages.find(s => s.stage === app.stage);
      if (stageConfig) {
        const labelName = stageConfig.label.toLowerCase();
        if (roundName.includes(labelName) || labelName.includes(roundName)) return true;
      }
      return false;
    });
  };

  const handleStageChange = async (applicationId: string, newStage: ApplicationStage) => {
    // Deprecated in favor of Round Movement, but kept for compatibility with detail panel if needed
    // Logic remains similar but we should encourage round movement
    try {
      // ... existing implementation ...
      // For now, let's just delegate to the existing logic or keep it as is since it's used by the DetailPanel directly
      // However, DetailPanel now uses MoveStageDialog on its own.
      // So this might only be called by other components (none in this file use it directly except SortableRoundColumn prop passing)

      const stageMap: Record<ApplicationStage, string> = {
        "New Application": "NEW_APPLICATION",
        "Resume Review": "RESUME_REVIEW",
        "Phone Screen": "PHONE_SCREEN",
        "Technical Interview": "TECHNICAL_INTERVIEW",
        "Manager Interview": "ONSITE_INTERVIEW",
        "Final Round": "ONSITE_INTERVIEW",
        "Reference Check": "ONSITE_INTERVIEW",
        "Offer Extended": "OFFER_EXTENDED",
        "Offer Accepted": "OFFER_ACCEPTED",
        "Rejected": "REJECTED",
        "Withdrawn": "REJECTED",
      };

      const backendStage = stageMap[newStage] || "NEW_APPLICATION";
      const response = await applicationService.updateStage(applicationId, backendStage);

      if (response.success) {
        const statusMapForUpdate: Record<string, Application['status']> = {
          "New Application": "applied",
          "Resume Review": "screening",
          "Phone Screen": "screening",
          "Technical Interview": "interview",
          "Manager Interview": "interview",
          "Offer Extended": "offer",
          "Offer Accepted": "hired",
          "Rejected": "rejected"
        };
        updateApplicationStatus(applicationId, statusMapForUpdate[newStage] || "applied", newStage);
        if (providedApplications === undefined) {
          loadApplications();
        } else {
          onApplicationMoved?.();
        }
      }
    } catch (error) {
      console.error('Failed to update stage:', error);
      toast.error('Failed to update application stage');
    }
  };

  const handleMoveToRound = async (applicationId: string, roundId: string) => {
    // 1. Identify Application and Target Round
    const application = applications.find(app => app.id === applicationId);
    const targetRound = rounds.find(r => r.id === roundId);

    if (!application || !targetRound) {
      console.error("Application or Target Round not found", { applicationId, roundId });
      return;
    }

    // 2. Identify Current Round
    const currentRound = findRoundForApplication(application);

    // 3. Validation Logic
    let isAllowed = false;

    // Rule: Can always move to Rejected
    if (targetRound.isFixed && targetRound.fixedKey === 'REJECTED') {
      isAllowed = true;
    }
    // Rule: Can move if we couldn't determine current round (safe fallback, or maybe restrict?)
    // Let's allow it to avoid getting stuck
    else if (!currentRound) {
      isAllowed = true;
    }
    else {
      const currentIndex = rounds.findIndex(r => r.id === currentRound.id);
      const targetIndex = rounds.findIndex(r => r.id === targetRound.id);

      // Rule: Can move to Next Round
      if (targetIndex === currentIndex + 1) {
        isAllowed = true;
      }
      // Rule: Can move BACKWARDS? User said "Restrict movement to only the *next* round".
      // Usually moving back is allowed for corrections, but let's stick to the prompt's explicit instruction for now or at least warn.
      // Prompt: "Restrict movement to only the *next* round"
      // We will STRICTLY block skips.
      // We will BLOCK backwards moves? 
      // Let's block everything else for now to be strictly compliant.
    }

    if (!isAllowed) {
      toast.error("Process Restriction", {
        description: "You can only move candidates to the immediate next round or to Rejected.",
        duration: 4000,
      });
      return;
    }

    // 4. Open Confirmation Dialog
    setPendingMoveApplication(application);
    setPendingTargetRound(targetRound);
    setIsMoveStageDialogOpen(true);
  };

  const executeMoveToRound = async (comment: string) => {
    const application = pendingMoveApplication;
    const targetRound = pendingTargetRound;

    if (!application || !targetRound) return;

    const applicationId = application.id;
    const roundId = targetRound.id;

    setPendingIsMoving(true);

    try {
      // Logic from original handleMoveToRound 
      // ... (Using targetRound directly since we already resolved it in validation)

      let actualRoundId = roundId;
      // Handle fallback IDs if needed (though rounds should be loaded)
      // (Simplified from original because we trust rounds array mostly, but keeping fallback logic is safe)
      if (roundId.startsWith('fixed-')) {
        // ... existing logic ...
        const parts = roundId.split('-');
        if (parts.length >= 2) {
          const fixedKey = parts[1];
          const actualRound = rounds.find(r => r.isFixed && r.fixedKey === fixedKey);
          if (actualRound) actualRoundId = actualRound.id;
        }
      }

      // Robust Date Formatter (DD/MM/YYYY, HH:mm:ss) - Deterministic
      const formatTimestamp = (date: Date) => {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        const h = date.getHours().toString().padStart(2, '0');
        const min = date.getMinutes().toString().padStart(2, '0');
        const s = date.getSeconds().toString().padStart(2, '0');
        return `${d}/${m}/${y}, ${h}:${min}:${s}`;
      };

      // 1. Execute Move
      // Cast appService to any if strictly typed interface is missing methods, or rely on it being the class instance
      const response = await appService.moveToRound(applicationId, actualRoundId);

      if (response.success) {
        // 2. Save Comment (if provided)
        if (comment && !isConsultantView) {
          try {
            // Fetch latest application data to preserve existing notes
            // If we use pendingMoveApplication directly, we rely on it being up-to-date, 
            // but concurrent edits or stale state in kanban might cause data loss.
            // Fetching fresh data is safer.
            const response = await (appService as any).getApplication(applicationId);
            const latestApp = response.data?.application || response.application; // handle potentially different response shapes if needed

            const currentNotes = latestApp?.recruiterNotes || "";
            const timestamp = formatTimestamp(new Date());
            const newNoteEntry = `[${timestamp}] Moved to ${targetRound.name}: ${comment}`;

            const appendText = currentNotes
              ? `${currentNotes}\n\n${newNoteEntry}`
              : newNoteEntry;

            await (appService as any).updateNotes(applicationId, appendText);

            // CRITICAL: Update the selected application state so the drawer refetches/updates immediately
            if (selectedApplication && selectedApplication.id === applicationId) {
              setSelectedApplication(latestApp);
            }
          } catch (err) {
            console.error("Failed to append move note", err);
            // Fallback: try to act on what we have or just log error. 
            // We should not block the move success UI, so catching here is good.
          }
        }

        // 3. Post-Move Logic (Reloads, Auto-Offer)
        await loadRounds();

        // Check if moved to OFFER round and auto-send is enabled
        const offerRound = rounds.find(r => r.isFixed && r.fixedKey === 'OFFER');
        // using fixedKey to match targetRound might be safer if IDs differ
        if (offerRound && targetRound.fixedKey === 'OFFER' && jobId) {
          const configKey = `offer_config_${jobId}_${offerRound.id}`;
          const savedConfig = localStorage.getItem(configKey);
          if (savedConfig) {
            try {
              const config = JSON.parse(savedConfig);
              if (config.autoSend) {
                await autoSendOffer(application, config);
              }
            } catch (e) {
              console.error('Failed to parse offer config:', e);
            }
          }
        }

        if (providedApplications !== undefined) {
          toast.success(`Moved ${application.candidateName} to ${targetRound.name}`);
          onApplicationMoved?.();
        } else {
          await loadApplications();
          toast.success(`Moved ${application.candidateName} to ${targetRound.name}`);
        }

        // Close Dialog
        setIsMoveStageDialogOpen(false);
        setPendingMoveApplication(null);
        setPendingTargetRound(null);

      } else {
        toast.error('Failed to move application', {
          description: response.error || 'Please try again'
        });
      }
    } catch (error) {
      console.error('Failed to move application to round:', error);
      toast.error('Failed to move application', {
        description: 'Please try again'
      });
    } finally {
      setPendingIsMoving(false);
    }
  };

  const autoSendOffer = async (application: Application, config: any) => {
    try {
      console.log('Auto-sending offer for application:', application.id, 'with config:', config);

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (parseInt(config.defaultExpiryDays) || 7));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 30);

      const offerData = {
        applicationId: application.id,
        offerType: "full-time",
        salary: parseFloat(config.defaultSalary) || 0,
        salaryCurrency: config.defaultSalaryCurrency || "USD",
        salaryPeriod: config.defaultSalaryPeriod || "annual",
        startDate: startDate.toISOString().split('T')[0],
        workLocation: config.defaultWorkLocation || "",
        workArrangement: config.defaultWorkArrangement || "remote",
        benefits: config.defaultBenefits
          ? (typeof config.defaultBenefits === 'string'
            ? config.defaultBenefits.split(',').map((b: string) => b.trim())
            : config.defaultBenefits)
          : [],
        vacationDays: config.defaultVacationDays ? parseInt(config.defaultVacationDays) : undefined,
        customMessage: config.defaultCustomMessage,
        expiryDate: expiryDate.toISOString().split('T')[0],
        templateId: config.defaultTemplateId,
      };

      console.log('Creating offer with data:', offerData);
      const createResponse = await offerService.createOffer(application.id, offerData);

      if (createResponse.success && createResponse.data) {
        console.log('Offer created successfully:', createResponse.data.id);
        const sendResponse = await offerService.sendOffer(createResponse.data.id);
        if (sendResponse.success) {
          console.log('Offer sent successfully');
          toast.success(`Offer auto-sent to ${application.candidateName}`);
        } else {
          console.error('Failed to send offer:', sendResponse.error);
          toast.error(`Failed to send offer to ${application.candidateName}`, {
            description: sendResponse.error || 'Please try manually'
          });
        }
      } else {
        console.error('Failed to create offer:', createResponse.error);
        toast.error(`Failed to create offer for ${application.candidateName}`, {
          description: createResponse.error || 'Please try manually'
        });
      }
    } catch (error) {
      console.error('Failed to auto-send offer:', error);
      toast.error(`Failed to auto-send offer to ${application.candidateName}`, {
        description: error instanceof Error ? error.message : 'Please try manually'
      });
    }
  };

  const handleConfigureOffer = (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (round) {
      setSelectedRoundForOffer(round);
      setOfferConfigDrawerOpen(true);
    }
  };

  const handleExecuteOffer = (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (round) {
      setSelectedRoundForOffer(round);
      setOfferExecutionDrawerOpen(true);
    }
  };

  const getOfferConfig = (roundId: string) => {
    if (!jobId) return undefined;
    const configKey = `offer_config_${jobId}_${roundId}`;
    const saved = localStorage.getItem(configKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  };

  const handleApplicationClick = (application: Application) => {
    setSelectedApplication(application);
    setDetailPanelOpen(true);
  };

  const handleNext = () => {
    if (!selectedApplication) return;
    const currentIndex = applications.findIndex(app => app.id === selectedApplication.id);
    if (currentIndex < applications.length - 1) {
      setSelectedApplication(applications[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (!selectedApplication) return;
    const currentIndex = applications.findIndex(app => app.id === selectedApplication.id);
    if (currentIndex > 0) {
      setSelectedApplication(applications[currentIndex - 1]);
    }
  };

  const currentIndex = selectedApplication
    ? applications.findIndex(app => app.id === selectedApplication.id)
    : -1;
  const hasNext = currentIndex < applications.length - 1;
  const hasPrevious = currentIndex > 0;

  const activeApplication = activeId ? applications.find((app) => app.id === activeId) : null;

  const handleDeleteRound = async (roundId: string) => {
    if (!jobId) return;

    if (!confirm('Are you sure you want to delete this round? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await jobRoundService.deleteRound(jobId, roundId);
      if (response.success) {
        toast.success('Round deleted successfully');
        loadRounds();
      } else {
        toast.error(response.error || 'Failed to delete round');
      }
    } catch (error) {
      console.error('Failed to delete round:', error);
      toast.error('Failed to delete round');
    }
  };

  const handleRoundCreated = () => {
    loadRounds();
  };

  const handleConfigureAssessment = (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (round) {
      setSelectedRoundForConfig(round);
      setAssessmentConfigDrawerOpen(true);
    }
  };

  const handleOpenAssessmentReview = (round: JobRound) => {
    setSelectedRoundForReview(round);
    setAssessmentReviewDrawerOpen(true);
  };

  const handleConfigureInterview = (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (round) {
      setSelectedRoundForConfig(round);
      setInterviewConfigDrawerOpen(true);
    }
  };

  const handleViewInterviews = (application: Application) => {
    setSelectedApplicationForInterviews(application);
    setInterviewScheduleDrawerOpen(true);
  };

  const handleViewRoundInterviews = (roundId: string) => {
    console.log('handleViewRoundInterviews called with roundId:', roundId);
    console.log('Current jobId:', jobId);
    const round = rounds.find((r) => r.id === roundId);
    console.log('Found round:', round);
    if (round) {
      setSelectedRoundForInterviews(round);
      console.log('Set selectedRoundForInterviews to:', round);
      console.log('Drawer should open with jobId:', jobId);
    } else {
      console.error('Round not found with id:', roundId);
    }
  };

  const handleOpenScreening = (round: JobRound) => {
    console.log('Opening screening drawer for round:', round);
    setSelectedRoundForScreening(round);
    setScreeningDrawerOpen(true);
    // Ensure job data is loaded if not already
    if (!jobData && jobId) {
      loadJobData();
    }
  };

  useEffect(() => {
    if (selectedRoundForInterviews) {
      console.log('selectedRoundForInterviews is set:', selectedRoundForInterviews);
      console.log('jobId for drawer:', jobId);
      console.log('Drawer should be rendered:', !!selectedRoundForInterviews && !!jobId);
    }
  }, [selectedRoundForInterviews, jobId]);

  // Map applications to rounds using ApplicationRoundProgress data
  const getApplicationsForRound = (round: JobRound) => {
    return applications.filter((app) => {
      // Check if application has a round mapping
      const appRoundId = app.roundId;

      if (appRoundId) {
        // Use round progress mapping if available
        return appRoundId === round.id;
      }

      // Fallback to name-based matching for applications without round progress
      // This handles new applications or legacy data
      const roundName = round.name.toLowerCase();
      const stageName = app.stage.toLowerCase();

      // For fixed rounds, try to match by stage
      if (round.isFixed) {
        if (round.fixedKey === 'NEW' && (stageName.includes('new') || !appRoundId)) {
          return true; // New applications without round progress go to "New"
        }
        if (round.fixedKey === 'OFFER' && stageName.includes('offer')) return true;
        if (round.fixedKey === 'HIRED' && stageName.includes('hired')) return true;
        if (round.fixedKey === 'REJECTED' && stageName.includes('rejected')) return true;
      }

      // 1. Try direct match
      if (stageName.includes(roundName) || roundName.includes(stageName)) {
        return true;
      }

      // 2. Try matching via pipelineStages labels
      // e.g. "Resume Review" stage has label "Screening" -> matches "Screening" round
      const stageConfig = pipelineStages.find(s => s.stage === app.stage);
      if (stageConfig) {
        const labelName = stageConfig.label.toLowerCase();
        if (roundName.includes(labelName) || labelName.includes(roundName)) {
          return true;
        }
      }

      return false;
    });
  };

  // Calculate pipeline statistics
  const totalApplications = applications.length;
  const avgScore = useMemo(() => {
    const scores = applications
      .map(app => app.score ?? app.aiMatchScore)
      .filter((score): score is number => score !== undefined && score !== null);
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }, [applications]);

  const shortlistedCount = applications.filter(app => app.shortlisted).length;
  const newApplicationsCount = applications.filter(app =>
    app.stage === 'New Application' || !app.isRead
  ).length;

  // Handle multi-select if enabled
  const handleToggleSelection = (applicationId: string) => {
    if (onSelectionChange && selectedApplicationIds) {
      const newSelection = selectedApplicationIds.includes(applicationId)
        ? selectedApplicationIds.filter(id => id !== applicationId)
        : [...selectedApplicationIds, applicationId];
      onSelectionChange(newSelection);
    }
  };

  const handleConfigureEmail = (round: JobRound) => {
    setSelectedRoundForEmailConfig(round);
    setRoundEmailConfigDrawerOpen(true);
  };

  const selectedIds = enableMultiSelect ? (selectedApplicationIds || []) : selectedForComparison;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        {/* Pipeline Stats */}
        {totalApplications > 0 ? (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Total:</span>
              <span className="text-xs font-semibold">{totalApplications}</span>
            </div>
            {newApplicationsCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                <span className="text-xs text-muted-foreground">New:</span>
                <span className="text-xs font-semibold">{newApplicationsCount}</span>
              </div>
            )}
            {shortlistedCount > 0 && (
              <div className="flex items-center gap-2">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-muted-foreground">Shortlisted:</span>
                <span className="text-xs font-semibold">{shortlistedCount}</span>
              </div>
            )}
            {avgScore !== null && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Avg Score:</span>
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 font-semibold">
                  {avgScore}%
                </Badge>
              </div>
            )}
          </div>
        ) : <div />}

        {/* Create Round Button */}
        {jobId && (
          <div>
            <Button
              onClick={() => setCreateRoundDialogOpen(true)}
              size="sm"
              className="gap-2 h-7 text-xs"
              variant="outline"
            >
              <Plus className="h-3 w-3" />
              Create Round
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full gap-4 min-w-max pb-4">
            <SortableContext items={rounds.map((r) => `round-${r.id}`)} strategy={horizontalListSortingStrategy}>
              {rounds.map((round) => (
                <SortableRoundColumn
                  key={round.id}
                  round={round}
                  allRounds={rounds}
                  applications={applications.filter((app) => app.roundId === round.id)}
                  onApplicationClick={handleApplicationClick}
                  isCompareMode={isCompareMode}
                  selectedForComparison={selectedForComparison}
                  onToggleSelect={onToggleSelect}
                  onStageChange={handleStageChange}
                  onMoveToRound={handleMoveToRound}
                  onDeleteRound={handleDeleteRound}
                  onConfigureAssessment={isSimpleFlow ? undefined : handleConfigureAssessment}
                  onConfigureInterview={handleConfigureInterview}
                  onViewInterviews={handleViewInterviews}
                  onViewRoundInterviews={handleViewRoundInterviews}
                  onOpenScreening={isSimpleFlow ? undefined : handleOpenScreening}
                  onConfigureOffer={isSimpleFlow ? undefined : handleConfigureOffer}
                  onExecuteOffer={handleExecuteOffer}
                  onOpenAssessmentDrawer={isSimpleFlow ? undefined : handleOpenAssessmentReview}
                  onConfigureEmail={isSimpleFlow ? undefined : handleConfigureEmail}
                />
              ))}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeApplication && <ApplicationCard application={activeApplication} onClick={() => { }} />}
            {activeRoundId && (() => {
              const draggedRound = rounds.find(r => `round-${r.id}` === activeRoundId);
              if (draggedRound) {
                const roundApps = getApplicationsForRound(draggedRound);
                return (
                  <div style={{ width: '280px' }}>
                    <StageColumn
                      round={draggedRound}
                      applications={roundApps}
                      onApplicationClick={() => { }}
                      isCompareMode={false}
                      selectedForComparison={[]}
                      onStageChange={() => { }}
                      allRounds={rounds}
                    />
                  </div>
                );
              }
              return null;
            })()}
          </DragOverlay>
        </DndContext>
      </div>



      {selectedApplication && (
        <CandidateAssessmentView
          key={selectedApplication.id}
          application={selectedApplication}
          open={detailPanelOpen}
          onOpenChange={setDetailPanelOpen}
          jobTitle={jobTitle}
          onNext={handleNext}
          onPrevious={handlePrevious}
          hasNext={hasNext}
          hasPrevious={hasPrevious}

          // Next Stage Logic
          nextStageName={(() => {
            // Try to find current round index
            // 1. By ID match if we know current round ID (not stored in app usually, but we can look up by stage name?)
            // Application has "stage", Rounds have "name".
            const currentStageName = selectedApplication.stage;
            const currentRoundIndex = rounds.findIndex(r => r.name === currentStageName);

            if (currentRoundIndex !== -1 && currentRoundIndex < rounds.length - 1) {
              return rounds[currentRoundIndex + 1].name;
            }
            return undefined;
          })()}
          onMoveToNextStage={() => {
            const currentStageName = selectedApplication.stage;
            const currentRoundIndex = rounds.findIndex(r => r.name === currentStageName);

            if (currentRoundIndex !== -1 && currentRoundIndex < rounds.length - 1) {
              const nextRound = rounds[currentRoundIndex + 1];
              setPendingMoveApplication(selectedApplication);
              setPendingTargetRound(nextRound);
              setIsMoveStageDialogOpen(true);
            } else {
              toast.error("No next stage available");
            }
          }}
        />
      )}

      {jobId && (
        <>
          <RoundEmailConfigDrawer
            open={roundEmailConfigDrawerOpen}
            onOpenChange={setRoundEmailConfigDrawerOpen}
            jobId={jobId || ''}
            round={selectedRoundForEmailConfig}
            onSuccess={() => {
              // Maybe refresh something or toast
            }}
          />

          <CreateRoundDialog
            open={createRoundDialogOpen}
            onOpenChange={setCreateRoundDialogOpen}
            onSuccess={handleRoundCreated}
            jobId={jobId}
          />
        </>
      )}

      {jobId && selectedRoundForConfig && (
        <>
          <AssessmentConfigurationDrawer
            open={assessmentConfigDrawerOpen}
            onOpenChange={setAssessmentConfigDrawerOpen}
            jobId={jobId}
            roundId={selectedRoundForConfig.id}
            roundName={selectedRoundForConfig.name}
            onSuccess={() => {
              loadRounds();
            }}
          />
          <InterviewConfigurationDrawer
            open={interviewConfigDrawerOpen}
            onOpenChange={setInterviewConfigDrawerOpen}
            jobId={jobId}
            roundId={selectedRoundForConfig.id}
            roundName={selectedRoundForConfig.name}
            onSuccess={() => {
              loadRounds();
            }}
          />
        </>
      )}

      <InterviewScheduleDrawer
        open={interviewScheduleDrawerOpen}
        onOpenChange={setInterviewScheduleDrawerOpen}
        applicationId={selectedApplicationForInterviews?.id}
        jobId={jobId}
        candidateName={selectedApplicationForInterviews?.candidateName || selectedApplicationForInterviews?.candidateId}
        jobTitle={jobTitle}
      />

      {selectedRoundForInterviews && jobId && (
        <RoundInterviewsDrawer
          key={`drawer-${selectedRoundForInterviews.id}`}
          open={true}
          onOpenChange={(open) => {
            console.log('RoundInterviewsDrawer onOpenChange:', open);
            if (!open) {
              setSelectedRoundForInterviews(null);
            }
          }}
          jobId={jobId}
          jobRoundId={selectedRoundForInterviews.id}
          roundName={selectedRoundForInterviews.name}
          roundType={selectedRoundForInterviews.type}
          jobTitle={jobTitle}
          onConfigureRound={() => {
            setSelectedRoundForConfig(selectedRoundForInterviews);
            setInterviewConfigDrawerOpen(true);
          }}
        />
      )}

      {selectedRoundForScreening && jobId && (
        <InitialScreeningDrawer
          open={screeningDrawerOpen}
          onOpenChange={(open) => {
            setScreeningDrawerOpen(open);
            if (!open) {
              setSelectedRoundForScreening(null);
            }
          }}
          jobId={jobId}
          jobTitle={jobData?.title || jobTitle}
          jobRequirements={jobData?.requirements || []}
          jobDescription={jobData?.description || ''}
          job={jobData || { id: jobId, title: jobTitle, requirements: [], description: '' } as any}
          roundId={selectedRoundForScreening.id}
          roundName={selectedRoundForScreening.name}
        />
      )}

      {jobId && selectedRoundForReview && (
        <AssessmentReviewDrawer
          open={assessmentReviewDrawerOpen}
          onOpenChange={setAssessmentReviewDrawerOpen}
          jobId={jobId}
          round={selectedRoundForReview}
          onMoveToNextRound={async (applicationId) => {
            const currentRoundIndex = rounds.findIndex(r => r.id === selectedRoundForReview.id);
            if (currentRoundIndex !== -1 && currentRoundIndex < rounds.length - 1) {
              const nextRound = rounds[currentRoundIndex + 1];
              await handleMoveToRound(applicationId, nextRound.id);
            } else {
              toast.error("No next stage available");
            }
          }}
        />
      )}

      {selectedRoundForOffer && jobId && (
        <>
          <OfferConfigurationDrawer
            open={offerConfigDrawerOpen}
            onOpenChange={(open) => {
              setOfferConfigDrawerOpen(open);
              if (!open) {
                setSelectedRoundForOffer(null);
              }
            }}
            jobId={jobId}
            roundId={selectedRoundForOffer.id}
            roundName={selectedRoundForOffer.name}
            onSuccess={() => {
              loadRounds();
            }}
          />
          <OfferExecutionDrawer
            open={offerExecutionDrawerOpen}
            onOpenChange={(open) => {
              setOfferExecutionDrawerOpen(open);
              if (!open) {
                setSelectedRoundForOffer(null);
              }
            }}
            jobId={jobId}
            roundId={selectedRoundForOffer.id}
            applications={getApplicationsForRound(selectedRoundForOffer)}
            jobTitle={jobTitle}
            defaultConfig={getOfferConfig(selectedRoundForOffer.id)}
            onSuccess={() => {
              loadApplications();
            }}
          />
        </>
      )}

      {/* Move Stage Dialog from Drag & Drop */}
      <MoveStageDialog
        open={isMoveStageDialogOpen}
        onOpenChange={setIsMoveStageDialogOpen}
        candidateName={pendingMoveApplication?.candidateName || "Candidate"}
        nextStageName={pendingTargetRound?.name || "Next Stage"}
        onConfirm={executeMoveToRound}
        isSubmitting={pendingIsMoving}
      />
    </>
  );
}