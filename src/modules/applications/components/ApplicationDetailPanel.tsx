import { Application } from "@/shared/types/application";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Mail, Phone, MapPin, Briefcase, FileText, Calendar,
  Star, MessageSquare, Clock, ArrowRight, Download, Video, Send,
  Award, TrendingUp, Bookmark, BookmarkCheck, Sparkles, UserX,
} from "lucide-react";
import { AIAnalysisView } from "./screening/AIAnalysisView";
import { ParsedResumeView } from "./parsing/ParsedResumeView";
import { CoverLetterView } from "./parsing/CoverLetterView";
import { QuestionnaireResponseView } from "./parsing/QuestionnaireResponseView";
import { ProfileCompletenessIndicator } from "./parsing/ProfileCompletenessIndicator";
import { QuickScoringWidget } from "./shortlisting/QuickScoringWidget";
import { RankingWidget } from "./shortlisting/RankingWidget";
import { ShortlistButton } from "./shortlisting/ShortlistButton";
import { formatDistanceToNow, format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ApplicationStage } from "@/shared/types/application";
import { updateApplicationStatus } from "@/shared/lib/mockApplicationStorage";
import { applicationService } from "@/shared/lib/applicationService";
import { toast } from "sonner";
import { Textarea } from "@/shared/components/ui/textarea";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { InterviewScheduler } from "@/modules/interviews/components/InterviewScheduler";
import { OfferForm } from "@/modules/offers/components/OfferForm";
import { getTemplateById } from "@/shared/lib/mockTemplateStorage";
import { offerService } from "@/shared/lib/offerService";
import { jobService } from "@/shared/lib/jobService";
import { Job } from "@/shared/types/job";
import { mapBackendJobToFrontend } from "@/shared/lib/jobDataMapper";
import { ApplicationEmailHistory } from "@/modules/email/components/ApplicationEmailHistory";
import { MoveStageDialog } from "./MoveStageDialog";
import { TeamReviewsTab } from "./TeamReviewsTab";

interface ApplicationDetailPanelProps {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export function ApplicationDetailPanel({ application, open, onOpenChange, onRefresh }: ApplicationDetailPanelProps) {
  const [newNote, setNewNote] = useState("");
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [editingScore, setEditingScore] = useState<string>("");
  const [editingRank, setEditingRank] = useState<string>("");
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  const [isUpdatingRank, setIsUpdatingRank] = useState(false);


  const [isShortlisting, setIsShortlisting] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [pendingStage, setPendingStage] = useState<ApplicationStage | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  // Fetch job data when offer dialog opens
  useEffect(() => {
    const fetchJob = async () => {
      if (isOfferDialogOpen && application?.jobId && !job) {
        setIsLoadingJob(true);
        try {
          const response = await jobService.getJobById(application.jobId);
          if (response.success && response.data) {
            const mappedJob = mapBackendJobToFrontend(response.data.job || response.data);
            setJob(mappedJob);
          }
        } catch (error) {
          console.error('Failed to fetch job:', error);
        } finally {
          setIsLoadingJob(false);
        }
      }
    };

    fetchJob();
  }, [isOfferDialogOpen, application?.jobId]);

  // Reset job when dialog closes
  useEffect(() => {
    if (!isOfferDialogOpen) {
      setJob(null);
    }
  }, [isOfferDialogOpen]);

  // Update editing values when application changes
  useEffect(() => {
    if (application) {
      setEditingScore(application.score?.toString() || "");
      setEditingRank(application.rank?.toString() || "");
    }
  }, [application]);

  if (!application) return null;

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleStageChange = (newStage: ApplicationStage) => {
    setPendingStage(newStage);
    setIsMoveDialogOpen(true);
  };

  const confirmMove = async (comment: string) => {
    if (!pendingStage) return;

    setIsMoving(true);
    try {
      // Map frontend stage to backend stage format
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

      const backendStage = stageMap[pendingStage] || "NEW_APPLICATION";

      // Update stage
      const response = await applicationService.updateStage(application.id, backendStage);

      if (response.success) {
        // Add comment as a note if provided
        if (comment) {
          await applicationService.updateNotes(application.id, `Moved to ${pendingStage}: ${comment}`);
        }

        // Also update local mock storage for fallback
        const statusMap: Record<ApplicationStage, Application['status']> = {
          "New Application": "applied",
          "Resume Review": "screening",
          "Phone Screen": "screening",
          "Technical Interview": "interview",
          "Manager Interview": "interview",
          "Final Round": "interview",
          "Reference Check": "interview",
          "Offer Extended": "offer",
          "Offer Accepted": "hired",
          "Rejected": "rejected",
          "Withdrawn": "withdrawn",
        };
        updateApplicationStatus(application.id, statusMap[pendingStage], pendingStage);
        toast.success(`Moved to ${pendingStage}`);
        setIsMoveDialogOpen(false);
        onRefresh();
      } else {
        toast.error("Failed to update stage", {
          description: response.error || "Please try again"
        });
      }
    } catch (error) {
      console.error('Failed to update stage:', error);
      toast.error("Failed to update stage");
    } finally {
      setIsMoving(false);
    }
  };

  const handleScoreUpdate = async () => {
    const score = parseFloat(editingScore);
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error("Score must be between 0 and 100");
      return;
    }

    setIsUpdatingScore(true);
    try {
      const response = await applicationService.updateScore(application.id, score);
      if (response.success) {
        toast.success("Score updated");
        onRefresh();
      } else {
        toast.error("Failed to update score", {
          description: response.error || "Please try again"
        });
        setEditingScore(application.score?.toString() || "");
      }
    } catch (error) {
      console.error('Failed to update score:', error);
      toast.error("Failed to update score");
      setEditingScore(application.score?.toString() || "");
    } finally {
      setIsUpdatingScore(false);
    }
  };

  const handleRankUpdate = async () => {
    const rank = parseInt(editingRank);
    if (isNaN(rank) || rank < 1) {
      toast.error("Rank must be at least 1");
      return;
    }

    setIsUpdatingRank(true);
    try {
      const response = await applicationService.updateRank(application.id, rank);
      if (response.success) {
        toast.success("Rank updated");
        onRefresh();
      } else {
        toast.error("Failed to update rank", {
          description: response.error || "Please try again"
        });
        setEditingRank(application.rank?.toString() || "");
      }
    } catch (error) {
      console.error('Failed to update rank:', error);
      toast.error("Failed to update rank");
      setEditingRank(application.rank?.toString() || "");
    } finally {
      setIsUpdatingRank(false);
    }
  };

  const handleShortlist = async () => {
    setIsShortlisting(true);
    try {
      const response = application.shortlisted
        ? await applicationService.unshortlistCandidate(application.id)
        : await applicationService.shortlistCandidate(application.id);

      if (response.success) {
        toast.success(application.shortlisted ? "Candidate unshortlisted" : "Candidate shortlisted");
        onRefresh();
      } else {
        toast.error("Failed to update shortlist status", {
          description: response.error || "Please try again"
        });
      }
    } catch (error) {
      console.error('Failed to update shortlist:', error);
      toast.error("Failed to update shortlist status");
    } finally {
      setIsShortlisting(false);
    }
  };

  const handleAddReviewNote = async (content: string) => {
    try {
      const response = await applicationService.updateNotes(application.id, content);
      if (response.success) {
        toast.success("Note added");
        onRefresh();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to add note:', error);
      toast.error("Failed to add note");
      throw error;
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Application Details</SheetTitle>
            <SheetDescription>
              Detailed view of the application for {application.candidateName}.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Candidate Header */}
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={application.candidatePhoto} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {getInitials(application.candidateName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{application.candidateName}</h2>
                    <p className="text-muted-foreground">{application.jobTitle}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{application.stage}</Badge>
                      {application.rating && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < application.rating!
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                                }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <ProfileCompletenessIndicator application={application} showProgress={false} showDetails={true} />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsInterviewDialogOpen(true)}>
                <Video className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsOfferDialogOpen(true)}>
                <Send className="h-4 w-4 mr-2" />
                Send Offer
              </Button>
            </div>

            {/* Shortlisting & Scoring Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Shortlisting & Scoring</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Shortlist Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Shortlist Status</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {application.shortlisted ? "Candidate is shortlisted" : "Not shortlisted"}
                    </p>
                  </div>
                  <ShortlistButton
                    applicationId={application.id}
                    shortlisted={application.shortlisted}
                    onShortlistChange={(shortlisted) => {
                      onRefresh();
                    }}
                    variant="button"
                    size="sm"
                    showLabel={true}
                  />
                </div>

                <Separator />

                {/* Score Input */}
                <div className="space-y-2">
                  <Label htmlFor="score">Fit Score (0-100)</Label>
                  <QuickScoringWidget
                    applicationId={application.id}
                    score={application.score}
                    onScoreUpdate={(newScore) => {
                      setEditingScore(newScore.toString());
                      onRefresh();
                    }}
                    variant="card"
                    showSlider={true}
                  />
                </div>

                {/* Rank Input */}
                <div className="space-y-2">
                  <Label htmlFor="rank">Rank</Label>
                  <RankingWidget
                    applicationId={application.id}
                    rank={application.rank}
                    onRankUpdate={(newRank) => {
                      setEditingRank(newRank.toString());
                      onRefresh();
                    }}
                    variant="card"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stage Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Move to Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full gap-2"
                    onClick={() => {
                      // Logic to find next stage
                      const stages: ApplicationStage[] = [
                        "New Application",
                        "Resume Review",
                        "Phone Screen",
                        "Technical Interview",
                        "Manager Interview",
                        "Final Round",
                        "Reference Check",
                        "Offer Extended",
                        "Offer Accepted",
                        "Rejected" // Excluded from "Next" logic usually, but here as safety
                      ];
                      const currentIndex = stages.indexOf(application.stage);
                      if (currentIndex !== -1 && currentIndex < stages.length - 2) { // Stop before Rejected/Offer Accepted if desired, or just check bounds
                        handleStageChange(stages[currentIndex + 1]);
                      } else if (application.stage === 'Offer Extended') {
                        handleStageChange('Offer Accepted');
                      } else {
                        toast.info("No next stage available");
                      }
                    }}
                  >
                    Move to Next Round
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full gap-2 text-destructive hover:text-destructive"
                    onClick={() => handleStageChange("Rejected")}
                  >
                    Reject Candidate
                    <UserX className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {application.parsedResume && (
                  <TabsTrigger value="resume">Resume</TabsTrigger>
                )}
                {application.coverLetterUrl && (
                  <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
                )}
                {application.questionnaireData && (
                  <TabsTrigger value="questionnaire">Questionnaire</TabsTrigger>
                )}
                <TabsTrigger value="team-reviews" className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Team Reviews
                </TabsTrigger>
                <TabsTrigger value="emails" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Emails
                </TabsTrigger>
                {application.aiAnalysis && (
                  <TabsTrigger value="ai-analysis" className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Analysis
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{application.candidateEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Applied {formatDistanceToNow(application.appliedDate, { addSuffix: true })}
                    </div>
                  </CardContent>
                </Card>

                {application.resumeUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Resume.pdf
                        <Download className="h-4 w-4 ml-auto" />
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {application.customAnswers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Application Answers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {application.customAnswers.map((answer) => (
                        <div key={answer.questionId}>
                          <p className="text-sm font-medium mb-1">{answer.question}</p>
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(answer.answer) ? answer.answer.join(", ") : answer.answer}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="resume" className="mt-4">
                {application.parsedResume ? (
                  <ParsedResumeView
                    parsedResume={application.parsedResume}
                    resumeUrl={application.resumeUrl}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Resume parsing not available</p>
                    {application.resumeUrl && (
                      <p className="text-xs mt-2">Resume file is available but not yet parsed</p>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cover-letter" className="mt-4">
                <CoverLetterView application={application} />
              </TabsContent>

              <TabsContent value="questionnaire" className="mt-4">
                {application.questionnaireData ? (
                  <QuestionnaireResponseView questionnaireData={application.questionnaireData} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No questionnaire responses available</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="team-reviews">
                <TeamReviewsTab
                  application={application}
                  onAddNote={handleAddReviewNote}
                />
              </TabsContent>

              <TabsContent value="emails" className="mt-4">
                <ApplicationEmailHistory applicationId={application.id} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Interview Dialog */}
          <Dialog open={isInterviewDialogOpen} onOpenChange={setIsInterviewDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule Interview</DialogTitle>
                <DialogDescription>
                  Schedule a new interview with this candidate.
                </DialogDescription>
              </DialogHeader>
              <InterviewScheduler
                candidateName={application.candidateName}
                jobTitle={application.jobTitle}
                onSubmit={(data) => {
                  const template = data.templateId ? getTemplateById(data.templateId) : null;
                  setIsInterviewDialogOpen(false);
                  toast.success(
                    template
                      ? `Interview scheduled with ${template.name} template`
                      : "Interview scheduled successfully"
                  );
                }}
                onCancel={() => setIsInterviewDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Offer Dialog */}
          <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generate Offer Letter</DialogTitle>
                <DialogDescription>
                  Create and send an offer letter to the candidate.
                </DialogDescription>
              </DialogHeader>
              <OfferForm
                candidateName={application.candidateName}
                jobTitle={application.jobTitle}
                job={job}
                onSubmit={async (data) => {
                  try {
                    // Create offer
                    const createResponse = await offerService.createOffer(application.id, {
                      offerType: data.offerType,
                      salary: data.salary,
                      salaryCurrency: data.salaryCurrency,
                      salaryPeriod: data.salaryPeriod,
                      startDate: data.startDate,
                      workLocation: data.workLocation,
                      workArrangement: data.workArrangement,
                      probationPeriod: data.probationPeriod,
                      vacationDays: data.vacationDays,
                      bonusStructure: data.bonusStructure,
                      equityOptions: data.equityOptions,
                      benefits: data.benefits ? data.benefits.split(',').map(b => b.trim()) : [],
                      customMessage: data.customMessage,
                      expiryDate: data.expiryDate,
                      templateId: data.templateId,
                    });

                    if (createResponse.success) {
                      // Send offer immediately
                      const sendResponse = await offerService.sendOffer(createResponse.data.id);
                      if (sendResponse.success) {
                        toast.success("Offer created and sent successfully");
                        setIsOfferDialogOpen(false);
                        onRefresh();
                      } else {
                        toast.error("Offer created but failed to send", {
                          description: sendResponse.error
                        });
                      }
                    } else {
                      toast.error("Failed to create offer", {
                        description: createResponse.error
                      });
                    }
                  } catch (error) {
                    console.error('Failed to create offer:', error);
                    toast.error("Failed to create offer");
                  }
                }}
                onCancel={() => setIsOfferDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </SheetContent>
      </Sheet>

      <MoveStageDialog
        open={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
        candidateName={application.candidateName || "Candidate"}
        nextStageName={pendingStage || ""}
        onConfirm={confirmMove}
        isSubmitting={isMoving}
      />
    </>
  );
}
