import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  DollarSign,
  Eye,
  Globe2,
  Megaphone,
  MessagesSquare,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import type { Job, JobOverviewMilestone, JobOverviewResponse } from "@/shared/types/job";

import { OverviewBoardPerformanceChart } from "./OverviewBoardPerformanceChart";
import { OverviewChartFrame } from "./OverviewChartFrame";
import { OverviewHiringFunnelChart } from "./OverviewHiringFunnelChart";
import { OverviewReachTrendChart } from "./OverviewReachTrendChart";
import { OverviewSourceMixChart } from "./OverviewSourceMixChart";

type JobOverviewTabProps = {
  job: Job;
  overview: JobOverviewResponse | null;
  isLoading: boolean;
  onOpenDistribution: () => void;
  onLaunchMarketplace: () => void;
  onRefreshOverview: () => void;
  onOpenTab: (tab: string) => void;
};

function formatRelative(value?: string | Date | null) {
  if (!value) return "Never";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return formatDistanceToNow(date, { addSuffix: true });
}

function humanize(value?: string | null) {
  const normalized = String(value || "").trim();
  if (!normalized) return "-";
  return normalized.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function stripHtml(html?: string | null) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function paymentTone(status?: string | null) {
  switch (String(status || "").toUpperCase()) {
    case "PAID":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200";
    case "FAILED":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200";
  }
}

function distributionTone(attentionState?: string) {
  switch (String(attentionState || "").toUpperCase()) {
    case "LIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200";
    case "STALE":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200";
    case "NEEDS_ATTENTION":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200";
  }
}

function setupLabel(job: Job) {
  if (job.pendingConsultantAssignment) return "Pending consultant";
  if (job.setupType === "simple") return "Simple flow";
  if (job.advanceSetupComplete) return "Advanced ready";
  if (job.setupType === "advanced") return "Advanced setup";
  return "Overview";
}

function renderPreviewList(items: string[]) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing added yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm text-foreground">
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-3.5">
      <Card className="border-border/60 shadow-none">
        <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2 rounded-2xl border border-border/60 bg-muted/[0.2] p-3">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-7 w-28 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-12">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className={cn("border-border/60 shadow-none", index % 2 === 0 ? "xl:col-span-7" : "xl:col-span-5")}>
            <CardContent className="space-y-3 p-4">
              <div className="h-4 w-36 animate-pulse rounded bg-muted" />
              <div className="h-3 w-56 animate-pulse rounded bg-muted" />
              <div className="h-44 animate-pulse rounded-2xl bg-muted/[0.5]" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OperationRow({
  icon: Icon,
  label,
  primary,
  secondary,
  timestamp,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  primary: string;
  secondary: string;
  timestamp?: string | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-border/60 bg-muted/[0.1] px-3 py-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/[0.04]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background">
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium text-foreground">{label}</p>
          <p className="shrink-0 text-[11px] text-muted-foreground">{timestamp ? formatRelative(timestamp) : "No activity"}</p>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>{primary}</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span>{secondary}</span>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function MilestoneItem({
  milestone,
  onOpenTab,
}: {
  milestone: JobOverviewMilestone;
  onOpenTab: (tab: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/[0.1] px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary/80" />
            <p className="text-sm font-medium text-foreground">{milestone.title}</p>
          </div>
          {milestone.description ? <p className="mt-1 pl-4 text-xs text-muted-foreground">{milestone.description}</p> : null}
        </div>
        <Badge variant="outline" className="shrink-0 rounded-full text-[10px] uppercase tracking-[0.14em]">
          {humanize(milestone.type)}
        </Badge>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 pl-4">
        <p className="text-[11px] text-muted-foreground">{formatRelative(milestone.occurredAt)}</p>
        {milestone.hrefTab ? (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onOpenTab(milestone.hrefTab!)}>
            Open
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function SummaryCell({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/[0.08] px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function JobOverviewTab({
  job,
  overview,
  isLoading,
  onOpenDistribution,
  onLaunchMarketplace,
  onRefreshOverview,
  onOpenTab,
}: JobOverviewTabProps) {
  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (!overview) {
    return (
      <Card className="border-border/60 shadow-none">
        <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
          <ShieldAlert className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Overview unavailable right now</p>
            <p className="mt-1 text-xs text-muted-foreground">
              The job can still be managed from the other tabs while the overview summary reloads.
            </p>
          </div>
          <Button size="sm" onClick={onRefreshOverview}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const sourceBreakdown = overview.sourceMix.breakdown;
  const roleSummary = overview.roleSnapshot.summary || stripHtml(job.description).slice(0, 240);

  const banners = [
    job.pendingConsultantAssignment
      ? {
          key: "consultant",
          tone: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100",
          title: "Consultant assignment is still pending",
          description: "The job can move forward in HRM8, but managed-service setup stays blocked until a consultant is assigned.",
        }
      : null,
    overview.header.paymentStatus &&
    !["PAID", "paid"].includes(String(overview.header.paymentStatus))
      ? {
          key: "payment",
          tone: "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100",
          title: `Payment status: ${humanize(overview.header.paymentStatus)}`,
          description: "Billing needs attention before the role is fully clear of operational blockers.",
        }
      : null,
    overview.header.jobTargetNeedsAttention
      ? {
          key: "distribution",
          tone: "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-100",
          title: "JobTarget needs attention",
          description: "Sync or posting refresh has an error. Open Distribution to review board health and recover the launch.",
        }
      : null,
  ].filter(Boolean) as Array<{ key: string; tone: string; title: string; description: string }>;

  return (
    <div className="space-y-4">
      {banners.map((banner) => (
        <Card key={banner.key} className={cn("border shadow-none", banner.tone)}>
          <CardContent className="flex items-start gap-3 p-3.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{banner.title}</p>
              <p className="mt-1 text-xs opacity-90">{banner.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="border-border/70 bg-background shadow-none">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Overview</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground">{overview.header.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {job.employerName || "Company"} · {job.location || "Location not set"} · {humanize(overview.header.serviceType)}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                  {humanize(overview.header.status)}
                </Badge>
                <Badge variant="outline" className="rounded-full text-[10px]">
                  {overview.header.distributionScope === "GLOBAL" ? "Global distribution" : "HRM8 only"}
                </Badge>
                <Badge variant="outline" className="rounded-full text-[10px]">
                  {humanize(overview.header.visibility)}
                </Badge>
                <Badge variant="outline" className="rounded-full text-[10px]">
                  {setupLabel(job)}
                </Badge>
                {overview.header.paymentStatus ? (
                  <Badge variant="outline" className={cn("rounded-full text-[10px]", paymentTone(overview.header.paymentStatus))}>
                    Payment {humanize(overview.header.paymentStatus)}
                  </Badge>
                ) : null}
                {overview.header.distributionScope === "GLOBAL" ? (
                  <Badge variant="outline" className={cn("rounded-full text-[10px]", distributionTone(overview.distribution.attentionState))}>
                    {overview.distribution.enabled ? humanize(overview.distribution.attentionState || overview.distribution.syncStatus || "synced") : "Not launched"}
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={onRefreshOverview}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh overview
              </Button>
              <Button variant="outline" size="sm" onClick={onOpenDistribution}>
                <Megaphone className="mr-2 h-4 w-4" />
                Open distribution
              </Button>
              {job.distributionScope === "GLOBAL" ? (
                <Button size="sm" onClick={onLaunchMarketplace}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Launch Marketplace
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <SummaryCell
              label="Posted"
              value={formatRelative(overview.header.postedAt)}
              hint={`Updated ${formatRelative(overview.header.updatedAt)}`}
            />
            <SummaryCell
              label="Consultant"
              value={overview.team.assignedConsultantName || (overview.team.consultantState === "NOT_REQUIRED" ? "Not required" : "Pending assignment")}
              hint={humanize(overview.team.consultantState)}
            />
            <SummaryCell
              label="Reach coverage"
              value={overview.career.applyCoverage === "EXACT" ? "Exact HRM8 applies" : "Partial legacy coverage"}
              hint={overview.career.lastActivityAt ? `Last activity ${formatRelative(overview.career.lastActivityAt)}` : "Awaiting traffic"}
            />
            <SummaryCell
              label="External posting"
              value={overview.distribution.enabled ? `${overview.distribution.boardsLive} boards live` : "Not enabled"}
              hint={overview.distribution.lastRefreshAt ? `Refreshed ${formatRelative(overview.distribution.lastRefreshAt)}` : "No external refresh yet"}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-background px-4 py-3 shadow-none">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Applicants</p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">{overview.kpis.applicants}</p>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background px-4 py-3 shadow-none">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">HRM8 views</p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">{overview.kpis.views}</p>
            </div>
            <Eye className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background px-4 py-3 shadow-none">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">ATS applies</p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">{overview.kpis.applies}</p>
            </div>
            <Target className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background px-4 py-3 shadow-none">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {job.distributionScope === "GLOBAL" ? "Boards live" : "Distribution"}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                {job.distributionScope === "GLOBAL" ? overview.kpis.boardsLive : "HRM8"}
              </p>
            </div>
            <Globe2 className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)] xl:items-start">
        <div className="space-y-3.5">
        <OverviewChartFrame
          title="Hiring funnel"
          description="Current applicant stages and round occupancy."
          aside={
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => onOpenTab("applicants")}>
              Open pipeline
            </Button>
          }
        >
          <OverviewHiringFunnelChart funnel={overview.funnel} />
        </OverviewChartFrame>

        <OverviewChartFrame
          title="Reach and conversion"
          description="HRM8 reach and ATS apply movement over the last 14 days."
        >
          <OverviewReachTrendChart career={overview.career} totalAtsApplies={overview.sourceMix.totalAtsApplies} />
        </OverviewChartFrame>

        <OverviewChartFrame
          title="External distribution"
          description={
            job.distributionScope === "GLOBAL"
              ? "JobTarget status, board activity, and launch access."
              : "This job is currently limited to HRM8."
          }
          aside={
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={onOpenDistribution}>
                Open distribution
              </Button>
              {job.distributionScope === "GLOBAL" ? (
                <Button size="sm" className="h-8 px-3 text-xs" onClick={onLaunchMarketplace}>
                  Launch Marketplace
                </Button>
              ) : null}
            </div>
          }
        >
          {overview.distribution.enabled ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-border/60 bg-muted/[0.1] px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Sync</p>
                  <p className="mt-1 text-base font-semibold">{humanize(overview.distribution.syncStatus || overview.distribution.attentionState)}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/[0.1] px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Boards live</p>
                  <p className="mt-1 text-base font-semibold">{overview.distribution.boardsLive}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/[0.1] px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">JT clicks</p>
                  <p className="mt-1 text-base font-semibold">{overview.distribution.totalClicks}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/[0.1] px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">JT applies</p>
                  <p className="mt-1 text-base font-semibold">{overview.distribution.totalApplies}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className={cn("rounded-full text-[10px]", distributionTone(overview.distribution.attentionState))}>
                  {humanize(overview.distribution.attentionState || overview.distribution.syncStatus)}
                </Badge>
                <Badge variant="outline" className="rounded-full text-[10px]">
                  Spend {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(overview.distribution.totalSpend || 0)}
                </Badge>
                {overview.distribution.feedState ? (
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    Feed {humanize(overview.distribution.feedState)}
                  </Badge>
                ) : null}
                <Badge variant="outline" className="rounded-full text-[10px]">
                  Easy Apply {humanize(overview.distribution.easyApplyState)}
                </Badge>
                {overview.distribution.lastRefreshAt ? (
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    Refreshed {formatRelative(overview.distribution.lastRefreshAt)}
                  </Badge>
                ) : null}
              </div>

              <OverviewBoardPerformanceChart boards={overview.distribution.topBoards} />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/[0.08] px-4 py-10 text-center">
              <Megaphone className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">External distribution is not enabled</p>
              <p className="mt-1 text-xs text-muted-foreground">
                This role is currently HRM8-only. The Distribution tab remains available if you want to review settings later.
              </p>
            </div>
          )}
        </OverviewChartFrame>

        <OverviewChartFrame
          title="Role snapshot"
          description="Core role details with the long-form content collapsed until needed."
          className="hidden xl:block"
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-muted/[0.08] px-4 py-4">
              <p className="text-sm leading-6 text-foreground">{roleSummary || "No summary available yet."}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                {job.employmentType}
              </Badge>
              <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                {job.workArrangement}
              </Badge>
              <Badge variant="outline" className="rounded-full text-[10px]">
                {job.location}
              </Badge>
              <Badge variant="outline" className="rounded-full text-[10px]">
                {humanize(job.serviceType)}
              </Badge>
            </div>

            <Accordion type="multiple" className="rounded-xl border border-border/60 px-4">
              <AccordionItem value="description">
                <AccordionTrigger className="text-sm font-medium">Description</AccordionTrigger>
                <AccordionContent>
                  <div
                    className="prose prose-sm max-w-none text-sm leading-6 dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: job.description || "<p>No description added yet.</p>" }}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="requirements">
                <AccordionTrigger className="text-sm font-medium">
                  Requirements ({overview.roleSnapshot.totalRequirements})
                </AccordionTrigger>
                <AccordionContent>{renderPreviewList(job.requirements || [])}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="responsibilities">
                <AccordionTrigger className="text-sm font-medium">
                  Responsibilities ({overview.roleSnapshot.totalResponsibilities})
                </AccordionTrigger>
                <AccordionContent>{renderPreviewList(job.responsibilities || [])}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </OverviewChartFrame>
        </div>

        <div className="space-y-3.5">
        <OverviewChartFrame
          title="Operations pulse"
          description="Quick jump points for the active work around this role."
        >
          <div className="space-y-3">
            <OperationRow
              icon={Sparkles}
              label="Screening queue"
              primary={`${overview.operations.screening.pending} pending review`}
              secondary={
                overview.operations.screening.averageScore != null
                  ? `${overview.operations.screening.analyzed} analyzed · avg score ${overview.operations.screening.averageScore}`
                  : `${overview.operations.screening.analyzed} analyzed`
              }
              onClick={() => onOpenTab("screening")}
            />
            <OperationRow
              icon={BriefcaseBusiness}
              label="Tasks"
              primary={`${overview.operations.tasks.pending} active`}
              secondary={`${overview.operations.tasks.overdue} overdue · ${overview.operations.tasks.urgent} urgent`}
              timestamp={overview.operations.tasks.lastActivityAt}
              onClick={() => onOpenTab("tasks")}
            />
            <OperationRow
              icon={MessagesSquare}
              label="Messages"
              primary={`${overview.operations.messages.conversations} conversations`}
              secondary={`${overview.operations.messages.waitingOnCandidate} waiting on candidate · ${overview.operations.messages.waitingOnHiringTeam} waiting on team`}
              timestamp={overview.operations.messages.lastMessageAt}
              onClick={() => onOpenTab("messages")}
            />
            <OperationRow
              icon={Clock3}
              label="Interviews"
              primary={`${overview.operations.interviews.upcoming7d} upcoming in 7 days`}
              secondary={`${overview.operations.interviews.completed} completed · ${overview.operations.interviews.noShowOrCancelled} cancelled/no-show`}
              timestamp={overview.operations.interviews.lastActivityAt}
              onClick={() => onOpenTab("ai-interviews")}
            />
            <OperationRow
              icon={DollarSign}
              label="Offers"
              primary={`${overview.operations.offers.sent} sent`}
              secondary={`${overview.operations.offers.accepted} accepted · ${overview.operations.offers.docsPending} docs pending`}
              timestamp={overview.operations.offers.lastActivityAt}
              onClick={() => onOpenTab("offers")}
            />
          </div>
        </OverviewChartFrame>

        <OverviewChartFrame
          title="Team and source mix"
          description="Who owns the role and where applicants are coming from."
          aside={
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => onOpenTab("team")}>
              Open team tab
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Apply source mix</p>
                  <p className="text-xs text-muted-foreground">Current ATS source split for this job.</p>
                </div>
                <Badge variant="outline" className="rounded-full text-[10px]">
                  {overview.sourceMix.totalAtsApplies} total applies
                </Badge>
              </div>
              <OverviewSourceMixChart total={overview.sourceMix.totalAtsApplies} breakdown={sourceBreakdown} />
            </div>

            <div className="border-t border-border/60" />

            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryCell
                label="Consultant"
                value={overview.team.assignedConsultantName || (overview.team.consultantState === "NOT_REQUIRED" ? "Not required" : "Pending")}
                hint={humanize(overview.team.consultantState)}
              />
              <SummaryCell
                label="Hiring team"
                value={`${overview.team.totalMembers} members`}
                hint={`${overview.team.pendingInvites} pending invites`}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-muted/[0.08] px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Active</p>
                <p className="mt-1 text-lg font-semibold">{overview.team.activeMembers}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/[0.08] px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Roles</p>
                <p className="mt-1 text-lg font-semibold">{overview.team.roleCount}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/[0.08] px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Round coverage</p>
                <p className="mt-1 text-lg font-semibold">
                  {overview.team.roundsWithAssignedRoles}/{overview.team.totalRounds}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/[0.08] px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">Round role coverage</p>
                <p className="text-xs text-muted-foreground">
                  {overview.team.totalRounds > 0
                    ? `${Math.round((overview.team.roundsWithAssignedRoles / overview.team.totalRounds) * 100)}% configured`
                    : "No rounds yet"}
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#1f8f76,#7bc8b0)]"
                  style={{
                    width: `${overview.team.totalRounds > 0 ? (overview.team.roundsWithAssignedRoles / overview.team.totalRounds) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </OverviewChartFrame>

        <OverviewChartFrame
          title="Milestones"
          description="Recent job and candidate milestones."
        >
          <div className="space-y-3">
            {overview.milestones.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 px-4 py-10 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-foreground">No milestones recorded yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Candidate movement, distribution refreshes, and offer events will start appearing here automatically.
                </p>
              </div>
            ) : (
              overview.milestones.slice(0, 6).map((milestone) => (
                <MilestoneItem key={milestone.id} milestone={milestone} onOpenTab={onOpenTab} />
              ))
            )}
          </div>
        </OverviewChartFrame>

        <OverviewChartFrame
          title="Role snapshot"
          description="Core role details with the long-form content collapsed until needed."
          className="xl:hidden"
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-muted/[0.08] px-4 py-4">
              <p className="text-sm leading-6 text-foreground">{roleSummary || "No summary available yet."}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                {job.employmentType}
              </Badge>
              <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                {job.workArrangement}
              </Badge>
              <Badge variant="outline" className="rounded-full text-[10px]">
                {job.location}
              </Badge>
              <Badge variant="outline" className="rounded-full text-[10px]">
                {humanize(job.serviceType)}
              </Badge>
            </div>

            <Accordion type="multiple" className="rounded-xl border border-border/60 px-4">
              <AccordionItem value="description-mobile">
                <AccordionTrigger className="text-sm font-medium">Description</AccordionTrigger>
                <AccordionContent>
                  <div
                    className="prose prose-sm max-w-none text-sm leading-6 dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: job.description || "<p>No description added yet.</p>" }}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="requirements-mobile">
                <AccordionTrigger className="text-sm font-medium">
                  Requirements ({overview.roleSnapshot.totalRequirements})
                </AccordionTrigger>
                <AccordionContent>{renderPreviewList(job.requirements || [])}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="responsibilities-mobile">
                <AccordionTrigger className="text-sm font-medium">
                  Responsibilities ({overview.roleSnapshot.totalResponsibilities})
                </AccordionTrigger>
                <AccordionContent>{renderPreviewList(job.responsibilities || [])}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </OverviewChartFrame>
        </div>
      </div>
    </div>
  );
}
