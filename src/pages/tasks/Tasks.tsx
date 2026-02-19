import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { JobTasksTab } from "@/modules/jobs/components/tasks/JobTasksTab";
import { applicationService } from "@/shared/lib/applicationService";
import type { Application } from "@/shared/types/application";
import { Loader2, CheckSquare } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

function mapApplication(raw: any): Application {
  const candidateFromPayload = raw.candidate || raw.candidateProfile || {};
  const fullNameFromParts = [
    candidateFromPayload.firstName || candidateFromPayload.first_name,
    candidateFromPayload.lastName || candidateFromPayload.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const candidateName =
    raw.candidateName ||
    raw.name ||
    candidateFromPayload.name ||
    candidateFromPayload.fullName ||
    fullNameFromParts ||
    raw.candidateEmail ||
    raw.email ||
    candidateFromPayload.email ||
    "Unknown Candidate";

  const candidateEmail = raw.candidateEmail || raw.email || candidateFromPayload.email || "";
  const candidatePhone = raw.candidatePhone || raw.phone || candidateFromPayload.phone || "";

  return {
    id: raw.id,
    candidateId: raw.candidateId || candidateFromPayload.id || "",
    jobId: raw.jobId || raw.job?.id || "",
    jobTitle: raw.jobTitle || raw.job?.title || "",
    employerName: raw.employerName || raw.company?.name || "",
    status: (raw.status || "applied") as Application["status"],
    stage: (raw.stage || "New Application") as Application["stage"],
    appliedDate: raw.appliedDate || raw.createdAt || new Date().toISOString(),
    resumeUrl: raw.resumeUrl,
    coverLetterUrl: raw.coverLetterUrl,
    portfolioUrl: raw.portfolioUrl,
    linkedInUrl: raw.linkedInUrl,
    websiteUrl: raw.websiteUrl,
    candidateName,
    candidateEmail,
    candidatePhone,
    candidatePhoto: raw.candidatePhoto || candidateFromPayload.photo,
    customAnswers: raw.customAnswers,
    questionnaireData: raw.questionnaireData,
    isRead: raw.isRead ?? true,
    isNew: raw.isNew ?? false,
    tags: raw.tags || [],
    score: raw.score,
    aiMatchScore: raw.aiMatchScore,
    rank: raw.rank,
    shortlisted: raw.shortlisted ?? false,
    shortlistedAt: raw.shortlistedAt,
    shortlistedBy: raw.shortlistedBy,
    manuallyAdded: raw.manuallyAdded ?? false,
    addedBy: raw.addedBy,
    addedAt: raw.addedAt,
    recruiterNotes: raw.recruiterNotes,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
    assignedTo: raw.assignedTo,
    assignedToName: raw.assignedToName,
    activities: raw.activities || [],
    interviews: raw.interviews || [],
    notes: raw.notes || [],
    teamReviews: raw.teamReviews || [],
    evaluations: raw.evaluations || [],
    aiAnalysis: raw.aiAnalysis,
    roundId: raw.roundId,
    candidate: candidateFromPayload,
    parsedResume: raw.parsedResume,
    candidatePreferences: raw.candidatePreferences,
  };
}

export default function TasksPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await applicationService.getCompanyApplications();
      if (!response.success || !response.data?.applications) {
        throw new Error((response as any).error || "Failed to load candidates");
      }
      const mapped = response.data.applications.map(mapApplication);
      setApplications(mapped);
    } catch (error) {
      toast({
        title: "Failed to load task candidates",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const totalCandidates = useMemo(() => applications.length, [applications]);

  return (
    <DashboardPageLayout>
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="h-[520px] border rounded-md bg-background flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : totalCandidates === 0 ? (
          <div className="h-[520px] border rounded-md bg-background flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <CheckSquare className="h-6 w-6" />
            <p className="text-sm">No candidates found for tasks.</p>
          </div>
        ) : (
          <JobTasksTab applications={applications} onRefresh={loadApplications} />
        )}
      </div>
    </DashboardPageLayout>
  );
}
