import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { CandidatesTab } from "@/modules/applications/components/CandidatesTab";
import { applicationService } from "@/shared/lib/applicationService";
import type { Application } from "@/shared/types/application";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useToast } from "@/shared/hooks/use-toast";

const CANDIDATES_CACHE_KEY = "global-candidates-cache-v2";
const CANDIDATES_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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

function CandidatesTableSkeleton() {
  return (
    <div className="rounded-lg border border-border/80 bg-background shadow-none">
      <div className="border-b px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="space-y-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-72" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
      <div className="border-b px-4 py-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Skeleton className="h-[112px] w-full rounded-md" />
        <Skeleton className="h-[112px] w-full rounded-md" />
      </div>
      <div className="p-3 space-y-2">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="grid grid-cols-7 gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full col-span-2" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Candidates() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const loadRequestRef = useRef(0);

  const loadApplications = useCallback(async (silent = false) => {
    const requestId = ++loadRequestRef.current;
    if (silent) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await applicationService.getCompanyApplications();
      if (requestId !== loadRequestRef.current) return;

      if (!response.success || !response.data?.applications) {
        throw new Error((response as any).error || "Failed to load candidates");
      }

      const mapped = response.data.applications.map(mapApplication);
      setApplications(mapped);
      sessionStorage.setItem(
        CANDIDATES_CACHE_KEY,
        JSON.stringify({ ts: Date.now(), applications: mapped })
      );
    } catch (error) {
      if (requestId !== loadRequestRef.current) return;
      toast({
        title: "Failed to load candidates",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      setApplications([]);
    } finally {
      if (requestId !== loadRequestRef.current) return;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CANDIDATES_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { ts?: number; applications?: Application[] };
        const isFresh = typeof parsed.ts === "number" && Date.now() - parsed.ts < CANDIDATES_CACHE_TTL_MS;
        if (isFresh && Array.isArray(parsed.applications)) {
          setApplications(parsed.applications);
          setIsLoading(false);
          loadApplications(true);
          return;
        }
      }
    } catch {
      // ignore cache parse errors
    }

    loadApplications();
  }, [loadApplications]);

  const headerSummary = useMemo(() => {
    const total = applications.length;
    const shortlisted = applications.filter((app) => app.shortlisted).length;
    const scored = applications.filter((app) => (app.score || app.aiMatchScore || app.aiAnalysis?.overallScore || 0) > 0).length;
    return { total, shortlisted, scored };
  }, [applications]);

  return (
    <DashboardPageLayout>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold">Candidates</h1>
            <p className="text-xs text-muted-foreground">All job candidates in the same table view as job details.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[11px] text-muted-foreground border rounded-md px-2 py-1 bg-muted/20">Total {headerSummary.total}</div>
            <div className="text-[11px] text-muted-foreground border rounded-md px-2 py-1 bg-muted/20">Shortlisted {headerSummary.shortlisted}</div>
            <div className="text-[11px] text-muted-foreground border rounded-md px-2 py-1 bg-muted/20">Scored {headerSummary.scored}</div>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => loadApplications(true)} disabled={isRefreshing}>
              {isRefreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Refresh"}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <CandidatesTableSkeleton />
        ) : applications.length === 0 ? (
          <div className="h-[520px] border rounded-md bg-background flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Users className="h-6 w-6" />
            <p className="text-sm">No candidates found.</p>
          </div>
        ) : (
          <CandidatesTab
            applications={applications}
            jobId="all-jobs"
            jobTitle="All Candidates"
            rounds={[]}
            onRefresh={() => loadApplications(true)}
          />
        )}
      </div>
    </DashboardPageLayout>
  );
}
