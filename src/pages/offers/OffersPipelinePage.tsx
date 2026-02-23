import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { JobOffersTab } from "@/modules/jobs/components/offers/JobOffersTab";
import { applicationService } from "@/shared/lib/applicationService";
import type { Application } from "@/shared/types/application";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useToast } from "@/shared/hooks/use-toast";
import { FileSignature, Loader2 } from "lucide-react";

const OFFERS_CACHE_KEY = "global-offers-cache-v1";
const OFFERS_CACHE_TTL_MS = 5 * 60 * 1000;

type PipelineMode = "offers" | "hired";

const isOfferLike = (app: Application) => {
  const stage = String(app.stage || "").toLowerCase();
  const status = String(app.status || "").toLowerCase();
  return Boolean(app.shortlisted) || status === "offer" || stage.includes("offer");
};

const isHiredLike = (app: Application) => {
  const stage = String(app.stage || "").toLowerCase();
  const status = String(app.status || "").toLowerCase();
  return status === "hired" || stage.includes("hired") || stage.includes("accepted");
};

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

function OffersPageSkeleton() {
  return (
    <div className="rounded-lg border border-border/80 bg-background shadow-none">
      <div className="border-b px-4 py-3">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="border-b px-4 py-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Skeleton className="h-[110px] w-full rounded-md" />
        <Skeleton className="h-[110px] w-full rounded-md" />
      </div>
      <div className="p-3 space-y-2">
        {Array.from({ length: 7 }).map((_, idx) => (
          <div key={idx} className="grid grid-cols-5 gap-2">
            <Skeleton className="h-8 w-full" />
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

export function OffersPipelinePage({ mode }: { mode: PipelineMode }) {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const loadRequestRef = useRef(0);

  const loadApplications = useCallback(
    async (silent = false) => {
      const requestId = ++loadRequestRef.current;
      if (silent) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const response = await applicationService.getCompanyApplications();
        if (requestId !== loadRequestRef.current) return;
        if (!response.success || !response.data?.applications) {
          throw new Error((response as any).error || "Failed to load offer candidates");
        }

        const mapped = response.data.applications.map(mapApplication);
        setApplications(mapped);
        sessionStorage.setItem(
          OFFERS_CACHE_KEY,
          JSON.stringify({ ts: Date.now(), applications: mapped }),
        );
      } catch (error) {
        if (requestId !== loadRequestRef.current) return;
        toast({
          title: `Failed to load ${mode}`,
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        setApplications([]);
      } finally {
        if (requestId !== loadRequestRef.current) return;
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [mode, toast],
  );

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(OFFERS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { ts?: number; applications?: Application[] };
        const isFresh = typeof parsed.ts === "number" && Date.now() - parsed.ts < OFFERS_CACHE_TTL_MS;
        if (isFresh && Array.isArray(parsed.applications)) {
          setApplications(parsed.applications);
          setIsLoading(false);
          loadApplications(true);
          return;
        }
      }
    } catch {
      // ignore cache parsing errors
    }

    loadApplications();
  }, [loadApplications]);

  const summary = useMemo(() => {
    const offered = applications.filter((app) => isOfferLike(app) && !isHiredLike(app)).length;
    const hired = applications.filter((app) => isHiredLike(app)).length;
    const jobs = new Set(applications.map((app) => app.jobId).filter(Boolean)).size;
    return { total: applications.length, offered, hired, jobs };
  }, [applications]);

  const title = mode === "hired" ? "Hired" : "Offers";
  const subtitle =
    mode === "hired"
      ? "Unified hired pipeline across all jobs."
      : "Unified offer pipeline across all jobs.";

  return (
    <DashboardPageLayout>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px]">Total {summary.total}</Badge>
            <Badge variant="outline" className="text-[10px]">Offers {summary.offered}</Badge>
            <Badge variant="outline" className="text-[10px]">Hired {summary.hired}</Badge>
            <Badge variant="outline" className="text-[10px]">Jobs {summary.jobs}</Badge>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => loadApplications(true)}
              disabled={isRefreshing}
            >
              {isRefreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Refresh"}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <OffersPageSkeleton />
        ) : applications.length === 0 ? (
          <div className="h-[520px] border rounded-md bg-background flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileSignature className="h-6 w-6" />
            <p className="text-sm">No {mode === "hired" ? "hired" : "offer"} candidates found.</p>
          </div>
        ) : (
          <JobOffersTab
            jobId="all-jobs"
            jobTitle="All Jobs"
            applications={applications}
            rounds={[]}
            mode={mode}
            showJobColumn
            onRefresh={() => loadApplications(true)}
          />
        )}
      </div>
    </DashboardPageLayout>
  );
}

