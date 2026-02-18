import { useState, useEffect, useMemo } from "react";
import { Application } from "@/shared/types/application";
import { JobRound } from "@/shared/lib/jobRoundService";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { ApplicationCard } from "./ApplicationCard";
import { Users, Filter, Settings, Loader2, CheckCircle2, AlertCircle, Send, Eye, Clock, ArrowRight, Calendar, Video, Phone, MapPin, XCircle, Sparkles, Mail } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { format, isValid } from "date-fns";
import { apiClient } from "@/shared/lib/api";
import { toast } from "sonner";
import { AssessmentGradingDialog } from "./AssessmentGradingDialog";
import { InterviewRoundPanel } from "./InterviewRoundPanel";
import { CandidateAssessmentView } from "@/modules/jobs/components/candidate-assessment/CandidateAssessmentView";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { applicationService } from "@/shared/lib/applicationService";
import { CandidateEvaluationView } from "./candidate-evaluation/CandidateEvaluationView";

interface RoundDetailViewProps {
  jobId: string;
  round: JobRound;
  applications: Application[];
  onApplicationClick: (app: Application) => void;
  onMoveToRound?: (appId: string, roundId: string) => void;
  onConfigureAssessment?: (roundId: string) => void;
  onConfigureInterview?: (roundId: string) => void;
  allRounds?: JobRound[];
  onMoveToNextRound?: (applicationId: string) => void;
  onReject?: (applicationId: string) => void;
  onRefresh?: () => void;
  onConfigureEmail?: (roundId: string) => void;
}

interface RoundAssessment {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  status: string; // 'INVITED' | 'IN_PROGRESS' | 'COMPLETED'
  score: number | null;
  averageScore?: number | null;
  invitedAt: string | null;
  completedAt: string | null;
  invitationToken: string;
  isFinalized?: boolean;
}

// Derive display state from assessment data
type DisplayState = 'NOT_INVITED' | 'INVITED' | 'IN_PROGRESS' | 'COMPLETED' | 'PASSED' | 'FAILED';

const PASS_THRESHOLD = 70;

function getDisplayState(assessment: RoundAssessment | null): DisplayState {
  if (!assessment) return 'NOT_INVITED';

  const { status, averageScore, isFinalized } = assessment;

  // Finalized with score determines pass/fail
  if (isFinalized && averageScore !== null) {
    return averageScore >= PASS_THRESHOLD ? 'PASSED' : 'FAILED';
  }

  // Assessment completed, awaiting grading/finalization
  if (status === 'COMPLETED') return 'COMPLETED';

  // Assessment in progress
  if (status === 'IN_PROGRESS') return 'IN_PROGRESS';

  // Invited but not started
  if (status === 'INVITED') return 'INVITED';

  return 'NOT_INVITED';
}

export function RoundDetailView({
  jobId,
  round,
  applications,
  onApplicationClick,
  onMoveToRound,
  onConfigureAssessment,
  onConfigureInterview,
  allRounds,
  onMoveToNextRound,
  onReject,
  onRefresh,
  onConfigureEmail
}: RoundDetailViewProps) {

  // Candidates currently in this round
  const roundApplications = useMemo(() => {
    return applications.filter(app => app.roundId === round.id);
  }, [applications, round.id]);

  // Assessment data
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState<RoundAssessment[]>([]);
  const [activeTab, setActiveTab] = useState(round.type === 'ASSESSMENT' ? "candidates" : "candidates");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [gradingOpen, setGradingOpen] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  // Bulk Analysis State
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Candidate detail drawer state
  const [selectedProfileApp, setSelectedProfileApp] = useState<Application | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  const handleViewProfile = (app: Application) => {
    setSelectedProfileApp(app);
    setDetailPanelOpen(true);
  };

  // Evaluation State
  const [selectedAppForEval, setSelectedAppForEval] = useState<Application | null>(null);

  useEffect(() => {
    if (round.type === 'ASSESSMENT' && jobId && round.id) {
      fetchAssessments();
    }
    // Clear selection when round changes
    setSelectedCandidateIds(new Set());
  }, [jobId, round.id, round.type, applications]);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<RoundAssessment[]>(`/api/jobs/${jobId}/rounds/${round.id}/assessments`);
      if (response.success && response.data) {
        setAssessments(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch assessments", error);
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (applicationId: string) => {
    setInvitingId(applicationId);
    try {
      const response = await apiClient.post(`/api/assessments/invite`, {
        applicationId,
        jobRoundId: round.id
      });
      if (response.success) {
        toast.success("Invitation sent successfully");
        fetchAssessments();
      } else {
        toast.error("Failed to send invitation");
      }
    } catch (error) {
      console.error("Failed to invite", error);
      toast.error("Failed to send invitation");
    } finally {
      setInvitingId(null);
    }
  };

  const handleResend = async (assessmentId: string) => {
    setResendingId(assessmentId);
    try {
      const response = await apiClient.post(`/api/assessments/${assessmentId}/resend`);
      if (response.success) {
        toast.success("Invitation resent successfully");
        fetchAssessments();
      }
    } catch (error) {
      console.error("Failed to resend invitation", error);
      toast.error("Failed to resend invitation");
    } finally {
      setResendingId(null);
    }
  };

  const handleGrade = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
    setGradingOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleBulkReanalyze = async () => {
    if (selectedCandidateIds.size === 0) return;

    setIsAnalyzing(true);
    try {
      const result = await applicationService.bulkScoreCandidates(
        Array.from(selectedCandidateIds),
        jobId
      );

      if (result.success && result.data) {
        toast.success(result.data.message || `Successfully analyzed ${result.data.success} candidates`);
        // Refresh the page data
        onRefresh?.();
        // Clear selection
        setSelectedCandidateIds(new Set());
      } else {
        toast.error(result.error || "Failed to analyze candidates");
      }
    } catch (error) {
      console.error("Bulk analysis failed", error);
      toast.error("An error occurred during analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [isBulkMoving, setIsBulkMoving] = useState(false);

  const handleBulkMove = async () => {
    if (selectedCandidateIds.size === 0) return;

    setIsBulkMoving(true);
    try {
      const selectedApps = roundApplications.filter(app => selectedCandidateIds.has(app.id));

      for (const app of selectedApps) {
        if (app.shortlisted) {
          await onMoveToNextRound?.(app.id);
        } else if (app.status === 'rejected') {
          await onReject?.(app.id);
        }
      }

      toast.success(`Successfully processed ${selectedApps.length} candidates`);
      onRefresh?.();
      setSelectedCandidateIds(new Set());
    } catch (error) {
      console.error("Bulk move failed", error);
      toast.error("Failed to move some candidates");
    } finally {
      setIsBulkMoving(false);
    }
  };

  // Build candidate list with assessment state
  const candidatesWithState = useMemo(() => {
    return roundApplications.map(app => {
      const assessment = assessments.find(a => a.applicationId === app.id);
      const displayState = getDisplayState(assessment || null);
      return { app, assessment, displayState };
    });
  }, [roundApplications, assessments]);

  // Group candidates by state
  const pendingCandidates = candidatesWithState.filter(c =>
    ['NOT_INVITED', 'INVITED', 'IN_PROGRESS'].includes(c.displayState)
  );
  const reviewCandidates = candidatesWithState.filter(c => c.displayState === 'COMPLETED');
  const decidedCandidates = candidatesWithState.filter(c =>
    ['PASSED', 'FAILED'].includes(c.displayState)
  );

  // Render a single candidate row
  const renderCandidateRow = ({ app, assessment, displayState }: { app: Application; assessment: RoundAssessment | null; displayState: DisplayState }) => {
    const name = app.candidateName || 'Unknown';

    return (
      <div
        key={app.id}
        className="group flex items-center justify-between p-4 mb-3 bg-background border border-border/40 rounded-xl hover:border-border/80 hover:shadow-sm transition-all duration-200"
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border border-border/20">
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm text-foreground/90">{name}</h4>
              {assessment?.averageScore != null && (
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-muted/50 text-muted-foreground border-0">
                  Score: {assessment.averageScore}
                </Badge>
              )}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-0.5 gap-3">
              {/* Status Badge */}
              {displayState === 'NOT_INVITED' && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-gray-300 text-gray-500">Not Invited</Badge>
              )}
              {displayState === 'INVITED' && (
                <>
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-yellow-400 text-yellow-600 bg-yellow-50">Invited</Badge>
                  {assessment?.invitedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 opacity-70" />
                      {format(new Date(assessment.invitedAt), 'MMM d')}
                    </span>
                  )}
                </>
              )}
              {displayState === 'IN_PROGRESS' && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-blue-400 text-blue-600 bg-blue-50">In Progress</Badge>
              )}
              {displayState === 'COMPLETED' && (
                <>
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-green-400 text-green-600 bg-green-50">Completed</Badge>
                  {assessment?.completedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 opacity-70" />
                      {format(new Date(assessment.completedAt), 'MMM d')}
                    </span>
                  )}
                </>
              )}
              {displayState === 'PASSED' && (
                <Badge className="text-[10px] h-5 px-1.5 bg-green-500 text-white">Passed</Badge>
              )}
              {displayState === 'FAILED' && (
                <Badge variant="destructive" className="text-[10px] h-5 px-1.5">Failed</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions based on state */}
        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
          {/* Always show View Profile */}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => handleViewProfile(app)}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            View Profile
          </Button>

          {displayState === 'NOT_INVITED' && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-primary/20 hover:bg-primary/5 hover:text-primary"
              onClick={() => handleInvite(app.id)}
              disabled={invitingId === app.id}
            >
              {invitingId === app.id ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
              ) : (
                <Send className="h-3.5 w-3.5 mr-1.5" />
              )}
              Invite
            </Button>
          )}

          {(displayState === 'INVITED' || displayState === 'IN_PROGRESS') && assessment && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs hover:bg-primary/5"
              onClick={() => handleResend(assessment.id)}
              disabled={resendingId === assessment.id}
            >
              {resendingId === assessment.id ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
              ) : (
                <Send className="h-3.5 w-3.5 mr-1.5" />
              )}
              Resend
            </Button>
          )}

          {displayState === 'COMPLETED' && assessment && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => handleGrade(assessment.id)}
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              Review & Grade
            </Button>
          )}

          {displayState === 'PASSED' && (
            <>
              {assessment && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => handleGrade(assessment.id)}
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onMoveToNextRound && (
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 text-xs bg-primary hover:bg-primary/90"
                  onClick={() => onMoveToNextRound(app.id)}
                >
                  <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                  Next Stage
                </Button>
              )}
            </>
          )}

          {displayState === 'FAILED' && (
            <>
              {assessment && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => handleGrade(assessment.id)}
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs"
                onClick={() => onReject?.(app.id)}
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 tracking-tight">
            {round.name}
            <span className="text-xs font-normal text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              {roundApplications.length}
            </span>
          </h3>
          <p className="text-sm text-muted-foreground/80 mt-1">
            Manage candidates in the {round.name} stage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {round.type === 'INTERVIEW' && !round.isFixed && onConfigureInterview && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-border/60 hover:bg-muted/50 text-xs font-medium"
              onClick={() => onConfigureInterview(round.id)}
            >
              <Settings className="mr-2 h-3.5 w-3.5" />
              Configure
            </Button>
          )}
          {onConfigureEmail && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-border/60 hover:bg-muted/50 text-xs font-medium"
              onClick={() => onConfigureEmail(round.id)}
            >
              <Mail className="mr-2 h-3.5 w-3.5" />
              Configure
            </Button>
          )}
          {round.type === 'ASSESSMENT' && !round.isFixed && onConfigureAssessment && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-border/60 hover:bg-muted/50 text-xs font-medium"
              onClick={() => onConfigureAssessment(round.id)}
            >
              <Settings className="mr-2 h-3.5 w-3.5" />
              Configure
            </Button>
          )}
        </div>
      </div>

      {(round.name === 'New' || round.name === 'New Application') ? (
        <div className="space-y-4">

          {/* Bulk Actions Toolbar - Only for New Application round */}
          {roundApplications.length > 0 && (
            <div className="flex items-center justify-between p-2 bg-muted/30 border rounded-lg mb-4">
              <div className="flex items-center gap-3 px-2">
                <Checkbox
                  checked={roundApplications.length > 0 && selectedCandidateIds.size === roundApplications.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCandidateIds(new Set(roundApplications.map(a => a.id)));
                    } else {
                      setSelectedCandidateIds(new Set());
                    }
                  }}
                  id="select-all"
                />
                <label htmlFor="select-all" className="text-sm font-medium text-muted-foreground cursor-pointer">
                  Select All ({roundApplications.length})
                </label>
              </div>

              {selectedCandidateIds.size > 0 && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-200">
                  <span className="text-sm text-muted-foreground mr-2">
                    {selectedCandidateIds.size} selected
                  </span>
                  <Button
                    size="sm"
                    onClick={handleBulkReanalyze}
                    disabled={isAnalyzing}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Reanalyze
                  </Button>

                  {(() => {
                    const selectedApps = roundApplications.filter(app => selectedCandidateIds.has(app.id));
                    const allDecided = selectedApps.length > 0 && selectedApps.every(app => app.shortlisted || app.status === 'rejected');

                    return (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={handleBulkMove}
                        disabled={!allDecided || isBulkMoving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {isBulkMoving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        Finalize & Move
                      </Button>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          <div className="border border-border/40 rounded-xl overflow-hidden bg-background shadow-sm">
            <div className="p-0">
              {roundApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground/60">
                  <Users className="h-10 w-10 mb-4 opacity-10" />
                  <h3 className="text-base font-medium text-foreground/80">No candidates in this round</h3>
                  <p className="text-xs mt-1 opacity-70">
                    Move candidates here from the pipeline.
                  </p>
                </div>
              ) : (
                // List View for New Application Round
                <div className="divide-y divide-border/40">
                  {roundApplications.map((app) => (
                    <div
                      key={app.id}
                      className={`flex items-start gap-4 p-4 transition-colors hover:bg-muted/30 ${selectedCandidateIds.has(app.id) ? 'bg-primary/5' : ''}`}
                    >
                      <div className="pt-1">
                        <Checkbox
                          checked={selectedCandidateIds.has(app.id)}
                          onCheckedChange={(checked) => {
                            const newSet = new Set(selectedCandidateIds);
                            if (checked) {
                              newSet.add(app.id);
                            } else {
                              newSet.delete(app.id);
                            }
                            setSelectedCandidateIds(newSet);
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0" onClick={() => onApplicationClick(app)}>
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <Avatar className="h-10 w-10 border border-border/20 mt-0.5">
                              <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
                                {getInitials(app.candidateName || 'Unknown')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm text-foreground hover:underline cursor-pointer">
                                  {app.candidateName || 'Unknown Candidate'}
                                </h4>
                                {app.score != null && (
                                  <Badge variant={app.score >= 70 ? "secondary" : "outline"} className="text-[10px] h-5 px-1.5 font-normal">
                                    {app.score}% Match
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground mt-1 gap-3">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {app.candidateEmail || 'No email'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Applied {(() => {
                                    const d = new Date(app.appliedDate || app.createdAt || (app as any).created_at);
                                    return isValid(d) ? format(d, 'MMM d, yyyy') : 'N/A';
                                  })()}
                                </span>
                              </div>

                              {/* Quick Analysis/Tags Preview */}
                              {(app.tags && app.tags.length > 0) && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {app.tags.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-[10px] h-4 px-1 rounded-sm text-muted-foreground bg-muted/30 border-transparent">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {app.tags.length > 3 && (
                                    <span className="text-[10px] text-muted-foreground flex items-center">+{app.tags.length - 3}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center">
                            {(() => {
                              if (app.status === 'rejected') {
                                return <Badge variant="outline" className="mr-2 h-7 rounded-lg border-red-100 bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider">Rejected</Badge>;
                              }
                              if (app.shortlisted) {
                                return <Badge variant="outline" className="mr-2 h-7 rounded-lg border-emerald-100 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">Shortlisted</Badge>;
                              }
                              return <Badge variant="outline" className="mr-2 h-7 rounded-lg border-slate-100 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Pending</Badge>;
                            })()}

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProfile(app);
                              }}
                            >
                              View Profile
                            </Button>
                            <Button
                              size="sm"
                              variant="default" // Primary action
                              className="bg-slate-900 hover:bg-black text-white h-8 text-xs font-bold ml-2 rounded-lg transition-all active:scale-[0.98]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAppForEval(app);
                              }}
                            >
                              EVALUATE
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : round.type === 'INTERVIEW' ? (
        <InterviewRoundPanel
          jobId={jobId}
          roundId={round.id}
          roundName={round.name}
        />
      ) : round.type === 'ASSESSMENT' ? (
        <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/30" />
            </div>
          ) : roundApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground/60 border border-dashed border-border/40 rounded-xl bg-muted/5">
              <Users className="h-10 w-10 mb-4 opacity-10" />
              <h3 className="text-base font-medium text-foreground/80">No candidates in this round</h3>
              <p className="text-xs mt-1 opacity-70">
                Move candidates here from the pipeline.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Pending Section (Not Invited, Invited, In Progress) */}
              {pendingCandidates.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Pending ({pendingCandidates.length})
                  </h4>
                  <div className="grid gap-3">
                    {pendingCandidates.map(renderCandidateRow)}
                  </div>
                </div>
              )}

              {/* Ready for Review Section */}
              {reviewCandidates.length > 0 && (
                <div>
                  {pendingCandidates.length > 0 && <Separator className="my-6 opacity-50" />}
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    Ready for Review ({reviewCandidates.length})
                  </h4>
                  <div className="grid gap-3">
                    {reviewCandidates.map(renderCandidateRow)}
                  </div>
                </div>
              )}

              {/* Decided Section (Passed/Failed - awaiting action) */}
              {decidedCandidates.length > 0 && (
                <div>
                  {(pendingCandidates.length > 0 || reviewCandidates.length > 0) && <Separator className="my-6 opacity-50" />}
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
                    <AlertCircle className="h-4 w-4" />
                    Awaiting Decision ({decidedCandidates.length})
                  </h4>
                  <div className="grid gap-3">
                    {decidedCandidates.map(renderCandidateRow)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Standard Grid View fallback
        <div className="border border-border/40 rounded-xl overflow-hidden bg-background shadow-sm">
          <div className="p-0">
            {roundApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground/60">
                <Users className="h-10 w-10 mb-4 opacity-10" />
                <h3 className="text-base font-medium text-foreground/80">No candidates in this round</h3>
                <p className="text-xs mt-1 opacity-70">
                  Move candidates here from the pipeline.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/5">
                {roundApplications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onClick={() => onApplicationClick(app)}
                    variant="minimal"
                    allRounds={allRounds}
                    onMoveToRound={onMoveToRound}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedAssessmentId && (
        <AssessmentGradingDialog
          open={gradingOpen}
          onOpenChange={setGradingOpen}
          assessmentId={selectedAssessmentId}
          readOnly={false}
          onGraded={fetchAssessments}
        />
      )}

      {/* Candidate Detail Drawer */}
      {selectedProfileApp && (
        <CandidateAssessmentView
          key={selectedProfileApp.id}
          application={selectedProfileApp}
          open={detailPanelOpen}
          onOpenChange={setDetailPanelOpen}
          jobTitle={round.name}
          jobId={jobId}
        />
      )}

      {selectedAppForEval && (
        <CandidateEvaluationView
          isOpen={!!selectedAppForEval}
          application={selectedAppForEval}
          onClose={() => setSelectedAppForEval(null)}
          onEvaluationComplete={() => {
            onRefresh?.();
            // We keep it open or close depending on preference, current implementation closes if non-pending decision
          }}
        />
      )}
    </div>
  );
}
