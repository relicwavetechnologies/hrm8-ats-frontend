import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Globe2,
  LineChart,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { BoardBrandBadge } from "@/shared/components/ui/board-brand-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Switch } from "@/shared/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";
import { useToast } from "@/shared/hooks/use-toast";
import { jobService } from "@/shared/lib/jobService";
import { Job, JobTargetDistributionDetail, JobTargetPostingSnapshot } from "@/shared/types/job";

type JobTargetDistributionTabProps = {
  job: Job;
  distribution: JobTargetDistributionDetail | null;
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh: () => void;
  onLaunch: () => void;
  canViewAdvanced?: boolean;
  onJobUpdated?: (job: Job) => void;
};

type Tone = "neutral" | "success" | "warning" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "border-border/70 bg-muted/30 text-foreground dark:bg-muted/20",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
  warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
  danger: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300",
};

const DEFAULT_EASY_APPLY_CONFIG = {
  enabled: false,
  type: "full" as const,
  hostedApply: false,
  questionnaireEnabled: false,
};

const EMPTY_CAREER_METRICS = {
  views: 0,
  applyClicks: 0,
  applies: 0,
  applyCoverage: "EXACT" as const,
  lastActivityAt: null,
  trend: {
    labels: [],
    views: [],
    applies: [],
  },
};

const EMPTY_TOTALS = {
  totalAtsApplies: 0,
  careerApplies: 0,
  jobTargetAttributedApplies: 0,
  otherAtsApplies: 0,
};

function getEasyApplyConfig(job: Job) {
  return {
    ...DEFAULT_EASY_APPLY_CONFIG,
    ...(job.globalPublishConfig?.easyApplyConfig || {}),
  };
}

function buildGlobalPublishConfig(job: Job, easyApplyConfig: typeof DEFAULT_EASY_APPLY_CONFIG) {
  return {
    channels: job.globalPublishConfig?.channels || job.jobTargetChannels || [],
    budgetTier: job.globalPublishConfig?.budgetTier || job.jobTargetBudgetTier || 'none',
    customBudget: job.globalPublishConfig?.customBudget ?? job.jobTargetBudget,
    hrm8ServiceRequiresApproval: job.globalPublishConfig?.hrm8ServiceRequiresApproval ?? (job.serviceType !== 'self-managed' && job.serviceType !== 'rpo'),
    hrm8ServiceApproved: job.globalPublishConfig?.hrm8ServiceApproved ?? !!job.jobTargetApproved,
    easyApplyConfig,
  };
}

function formatRelative(value?: string | null) {
  if (!value) return "Never";
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatMoney(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getSyncTone(distribution: JobTargetDistributionDetail | null): Tone {
  if (!distribution) return "neutral";
  if (distribution.sync.postingsLastError || distribution.sync.lastError) return "danger";
  if (distribution.sync.isStale) return "warning";
  if (distribution.rollups.activePostingCount > 0) return "success";
  return "neutral";
}

function getStatusLabel(distribution: JobTargetDistributionDetail | null) {
  if (!distribution?.job.remoteJobId) return "Not launched";
  if (distribution.sync.postingsLastError || distribution.sync.lastError) return "Needs attention";
  if (distribution.sync.isStale) return "Refresh needed";
  if (distribution.rollups.activePostingCount > 0) return "Live on boards";
  return "Ready";
}

function getStatusIcon(distribution: JobTargetDistributionDetail | null) {
  if (!distribution?.job.remoteJobId) return Globe2;
  if (distribution.sync.postingsLastError || distribution.sync.lastError) return ShieldAlert;
  if (distribution.sync.isStale) return AlertCircle;
  if (distribution.rollups.activePostingCount > 0) return CheckCircle2;
  return Sparkles;
}

function formatFeedState(state?: JobTargetDistributionDetail['feedState']) {
  switch (state) {
    case 'READY':
      return 'Ready';
    case 'NOT_ENABLED_BY_JOBTARGET':
      return 'Awaiting mapping';
    case 'ERROR':
      return 'Needs attention';
    case 'SYNCING':
      return 'Syncing';
    default:
      return 'Unknown';
  }
}

function formatTrackingState(state?: JobTargetDistributionDetail['trackingHealth']['status']) {
  switch (state) {
    case 'HEALTHY':
      return 'Healthy';
    case 'PENDING':
      return 'Pending';
    case 'ERROR':
      return 'Needs attention';
    default:
      return 'Unknown';
  }
}

function formatSourceLabel(source: string) {
  if (source === "HRM8_BOARD") return "HRM8 board";
  if (source === "CANDIDATE_PORTAL") return "Candidate portal";
  if (source === "JOBTARGET") return "JobTarget";
  if (source === "MANUAL") return "Manual";
  if (source === "TALENT_POOL") return "Talent pool";
  return source.replaceAll("_", " ").toLowerCase();
}

function MetricTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-gradient-to-br from-background to-muted/20 px-3 py-3 dark:to-muted/10">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function MiniStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-gradient-to-br from-background to-primary/5 px-2.5 py-2 dark:to-primary/10">
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold leading-none">{value}</p>
      {hint ? <p className="mt-1 truncate text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function SegmentedBar({
  items,
  emptyLabel,
}: {
  items: Array<{ label: string; value: number; color: string }>;
  emptyLabel: string;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="rounded-full border border-dashed border-border/70 px-3 py-2 text-xs text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {items.map((item) => (
          <div
            key={item.label}
            className="h-full transition-all"
            style={{
              width: `${(item.value / total) * 100}%`,
              backgroundColor: item.color,
            }}
          />
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-lg border border-border/50 px-2.5 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="truncate text-foreground">{item.label}</span>
            </div>
            <span className="font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PerformanceBars({
  data,
}: {
  data: Array<{ label: string; clicks: number; applies: number }>;
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 px-3 py-8 text-center text-sm text-muted-foreground">
        No posting activity yet.
      </div>
    );
  }

  const maxValue = Math.max(...data.flatMap((item) => [item.clicks, item.applies]), 1);
  const chartHeight = data.length * 34 + 12;

  return (
    <div className="rounded-xl border border-border/60 bg-background/70 p-3">
      <svg viewBox={`0 0 360 ${chartHeight}`} className="h-auto w-full">
        {data.map((item, index) => {
          const y = index * 34 + 10;
          const clicksWidth = Math.max((item.clicks / maxValue) * 160, item.clicks > 0 ? 8 : 0);
          const appliesWidth = Math.max((item.applies / maxValue) * 160, item.applies > 0 ? 8 : 0);

          return (
            <g key={item.label} transform={`translate(0 ${y})`}>
              <text x="0" y="10" className="fill-muted-foreground text-[10px] font-medium">
                {item.label.slice(0, 18)}
              </text>
              <rect x="118" y="0" rx="6" ry="6" width="160" height="10" fill="hsl(var(--muted))" />
              <rect x="118" y="0" rx="6" ry="6" width={clicksWidth} height="10" fill="#0f766e" />
              <rect x="118" y="14" rx="6" ry="6" width="160" height="10" fill="hsl(var(--muted))" />
              <rect x="118" y="14" rx="6" ry="6" width={appliesWidth} height="10" fill="#f59e0b" />
              <text x="288" y="9" className="fill-foreground text-[10px]">
                {item.clicks} clicks
              </text>
              <text x="288" y="23" className="fill-foreground text-[10px]">
                {item.applies} applies
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function MiniTrend({
  label,
  value,
  accent,
  data,
}: {
  label: string;
  value: number;
  accent: string;
  data: number[];
}) {
  const width = 120;
  const height = 36;
  const max = Math.max(...data, 1);
  const points = data
    .map((point, index) => {
      const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
      const y = height - (point / max) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2.5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <p className="mt-1 text-lg font-semibold">{value}</p>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="h-9 w-28">
          <polyline
            fill="none"
            stroke={accent}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
    </div>
  );
}

function PostingDetailsSheet({
  posting,
  open,
  onOpenChange,
  canViewAdvanced,
}: {
  posting: JobTargetPostingSnapshot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canViewAdvanced?: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        {posting ? (
          <>
            <SheetHeader>
              <SheetTitle>{posting.siteName || "Job board posting"}</SheetTitle>
              <SheetDescription>
                Posting diagnostics, cost details, and launch metadata.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="mt-6 h-[calc(100vh-140px)] pr-4">
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricTile label="Clicks" value={posting.analytics.clicks} />
                  <MetricTile label="Applies" value={posting.analytics.apps} />
                  <MetricTile label="Status" value={posting.status || "Unknown"} />
                  <MetricTile label="Easy Apply" value={posting.easyApply ? "Enabled" : "Off"} />
                </div>

                <div className="rounded-xl border border-border/60 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Timeline</p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Created</span>
                      <span>{formatDateTime(posting.createdAt || posting.user.createdDtm)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Expires</span>
                      <span>{formatDateTime(posting.expiredAt)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Last refreshed</span>
                      <span>{formatDateTime(posting.lastRefreshedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Cost</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <MetricTile label="Total" value={formatMoney(posting.totalCost)} />
                    <MetricTile label="Posting" value={formatMoney(posting.postingCost)} />
                    <MetricTile label="Retail" value={formatMoney(posting.retailCost)} />
                    <MetricTile label="Savings" value={formatMoney(posting.savings)} />
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Identifiers</p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Posting ID</span>
                      <span className="font-mono text-xs">{posting.postingId}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="font-mono text-xs">{posting.orderId || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Site ID</span>
                      <span className="font-mono text-xs">{posting.siteId || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Product ID</span>
                      <span className="font-mono text-xs">{posting.productId || "-"}</span>
                    </div>
                  </div>
                </div>

                {canViewAdvanced ? (
                  <div className="rounded-xl border border-border/60 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Advanced</p>
                    <div className="mt-3 space-y-3 text-sm">
                      <div>
                        <p className="mb-1 text-muted-foreground">Click2Apply URL</p>
                        <p className="break-all rounded-lg bg-muted/50 p-2 text-xs">
                          {posting.click2ApplyUrl || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-muted-foreground">Created by</p>
                        <p>{posting.user.createdByName || posting.user.createdByEmail || "-"}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-muted-foreground">Stopped by</p>
                        <p>{posting.user.stoppedByName || posting.user.stoppedByEmail || "-"}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export function JobTargetDistributionTab({
  job,
  distribution,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  onLaunch,
  canViewAdvanced = false,
  onJobUpdated,
}: JobTargetDistributionTabProps) {
  const { toast } = useToast();
  const [selectedPosting, setSelectedPosting] = useState<JobTargetPostingSnapshot | null>(null);
  const [easyApplyDraft, setEasyApplyDraft] = useState(() => getEasyApplyConfig(job));
  const [savedEasyApplyConfig, setSavedEasyApplyConfig] = useState(() => getEasyApplyConfig(job));
  const [savingEasyApply, setSavingEasyApply] = useState(false);
  const hasEasyApplyChanges = JSON.stringify(easyApplyDraft) !== JSON.stringify(savedEasyApplyConfig);

  const statusTone = getSyncTone(distribution);
  const StatusIcon = getStatusIcon(distribution);
  const careerMetrics = distribution?.careerMetrics || job.careerMetrics || EMPTY_CAREER_METRICS;
  const totals = distribution?.totals || {
    ...EMPTY_TOTALS,
    totalAtsApplies: job.applicantsCount || 0,
    otherAtsApplies: job.applicantsCount || 0,
  };

  const postingPerformance = useMemo(() => {
    return (distribution?.topBoards || []).map((posting) => ({
      label: posting.siteName || "Unknown",
      clicks: posting.clicks,
      applies: posting.applies,
    }))
      .sort((left, right) => right.clicks - left.clicks)
      .slice(0, 6);
  }, [distribution?.topBoards]);

  const sourceSegments = useMemo(() => {
    const palette = ["#0f766e", "#0ea5e9", "#f59e0b", "#ef4444", "#7c3aed"];
    return (distribution?.sourceBreakdownAll || []).slice(0, 5).map((item, index) => ({
      label: formatSourceLabel(item.source),
      value: item.count,
      color: palette[index % palette.length],
    }));
  }, [distribution?.sourceBreakdownAll]);

  const clicksTrend = useMemo(() => {
    const base = postingPerformance.map((item) => item.clicks);
    return base.length > 0 ? base : [0];
  }, [postingPerformance]);

  const appliesTrend = useMemo(() => {
    const base = postingPerformance.map((item) => item.applies);
    return base.length > 0 ? base : [0];
  }, [postingPerformance]);

  const careerViewsTrend = useMemo(() => {
    return careerMetrics.trend.views.length > 0 ? careerMetrics.trend.views : [0];
  }, [careerMetrics.trend.views]);

  const careerAppliesTrend = useMemo(() => {
    return careerMetrics.trend.applies.length > 0 ? careerMetrics.trend.applies : [0];
  }, [careerMetrics.trend.applies]);

  useEffect(() => {
    const nextConfig = getEasyApplyConfig(job);
    setEasyApplyDraft(nextConfig);
    setSavedEasyApplyConfig(nextConfig);
  }, [job.id, job.globalPublishConfig]);

  const saveEasyApply = async () => {
    setSavingEasyApply(true);
    try {
      const response = await jobService.updateJob(job.id, {
        distributionScope: job.distributionScope || 'HRM8_ONLY',
        globalPublishConfig: buildGlobalPublishConfig(job, easyApplyDraft),
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Unable to save Easy Apply settings.");
      }

      setSavedEasyApplyConfig(easyApplyDraft);
      onJobUpdated?.(response.data);
      onRefresh();
      toast({
        title: "Easy Apply updated",
        description: "JobTarget settings were saved and synced for this job.",
      });
    } catch (error: any) {
      toast({
        title: "Unable to save Easy Apply",
        description: error?.message || "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSavingEasyApply(false);
    }
  };

  const easyApplySettingsCard = (
    <Card className="border-border/60 bg-background shadow-none">
      <CardHeader className="px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-sm font-semibold">Easy Apply</CardTitle>
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full px-2 py-0 text-[10px]",
                  easyApplyDraft.enabled
                    ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300"
                    : "border-border/70 bg-muted/40 text-muted-foreground",
                )}
              >
                {easyApplyDraft.enabled ? "On" : "Off"}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Control JobTarget board-hosted apply for this job.
            </CardDescription>
          </div>

          <Button
            size="sm"
            className="h-8 gap-2 text-xs"
            onClick={() => void saveEasyApply()}
            disabled={savingEasyApply || !hasEasyApplyChanges}
          >
            {savingEasyApply ? <RefreshCcw className="h-3.5 w-3.5 animate-spin" /> : null}
            Save
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-2 px-4 pb-4 pt-0">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-sm font-medium">Enable Easy Apply</p>
            <p className="text-[11px] text-muted-foreground">
              Send Easy Apply settings on JobTarget sync and edit calls.
            </p>
          </div>
          <Switch
            checked={!!easyApplyDraft.enabled}
            onCheckedChange={(next) =>
              setEasyApplyDraft((current) => ({
                ...current,
                enabled: !!next,
                hostedApply: !!next ? current.hostedApply : false,
                questionnaireEnabled: !!next ? current.questionnaireEnabled : false,
              }))
            }
            disabled={savingEasyApply}
          />
        </div>

        {easyApplyDraft.enabled ? (
          <>
            <div className="grid gap-2 rounded-lg border border-border/60 bg-background px-3 py-2.5 sm:grid-cols-[120px_1fr] sm:items-center">
              <div className="space-y-0.5">
                <p className="text-xs font-medium">Apply type</p>
                <p className="text-[11px] text-muted-foreground">Choose the JobTarget apply flow.</p>
              </div>
              <Select
                value={easyApplyDraft.type}
                onValueChange={(value: "basic" | "full") =>
                  setEasyApplyDraft((current) => ({ ...current, type: value }))
                }
                disabled={savingEasyApply}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-border/60 bg-background">
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-medium">Hosted Apply</p>
                  <p className="text-[11px] text-muted-foreground">Use hosted apply where supported.</p>
                </div>
                <Switch
                  checked={!!easyApplyDraft.hostedApply}
                  onCheckedChange={(next) =>
                    setEasyApplyDraft((current) => ({ ...current, hostedApply: !!next }))
                  }
                  disabled={savingEasyApply}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-medium">Use HRM8 Questions</p>
                  <p className="text-[11px] text-muted-foreground">Attach the questionnaire webhook.</p>
                </div>
                <Switch
                  checked={!!easyApplyDraft.questionnaireEnabled}
                  onCheckedChange={(next) =>
                    setEasyApplyDraft((current) => ({ ...current, questionnaireEnabled: !!next }))
                  }
                  disabled={savingEasyApply}
                />
              </div>
            </div>
          </>
        ) : null}

        <p className="px-1 text-[11px] text-muted-foreground">
          Changes save in HRM8 first and are pushed to JobTarget on the next edit or sync.
        </p>
      </CardContent>
    </Card>
  );

  const careerPerformanceCard = (
    <Card className="border-border/60 bg-gradient-to-br from-background to-emerald-50/60 shadow-none dark:to-emerald-950/20">
      <CardHeader className="px-3 pt-3 pb-2">
        <CardTitle className="text-sm font-semibold">HRM8 Career Performance</CardTitle>
        <CardDescription className="text-xs">
          Lifetime activity from the HRM8 career page and candidate portal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 px-3 pb-3">
        <div className="grid gap-2 sm:grid-cols-4">
          <MiniStat label="Views" value={careerMetrics.views} hint={formatRelative(careerMetrics.lastActivityAt)} />
          <MiniStat label="Apply clicks" value={careerMetrics.applyClicks} hint="Career-page intent" />
          <MiniStat label="Applies" value={careerMetrics.applies} hint="Tagged HRM8 applies" />
          <MiniStat
            label="Coverage"
            value={careerMetrics.applyCoverage === "PARTIAL_LEGACY" ? "Partial" : "Exact"}
            hint={careerMetrics.applyCoverage === "PARTIAL_LEGACY" ? "Legacy source gaps exist" : "Prospective exact"}
          />
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <MiniTrend label="Career views (7d)" value={careerMetrics.views} accent="#0f766e" data={careerViewsTrend} />
          <MiniTrend label="ATS applies (7d)" value={totals.totalAtsApplies} accent="#f59e0b" data={careerAppliesTrend} />
        </div>
      </CardContent>
    </Card>
  );

  const applySourcesCard = (
    <Card className="border-border/60 bg-gradient-to-br from-background to-sky-50/60 shadow-none dark:to-sky-950/20">
      <CardHeader className="px-3 pt-3 pb-2">
        <CardTitle className="text-sm font-semibold">Apply Sources</CardTitle>
        <CardDescription className="text-xs">
          ATS totals split across HRM8, JobTarget attribution, and other sources.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 px-3 pb-3">
        <div className="grid gap-2 sm:grid-cols-4">
          <MiniStat label="ATS applies" value={totals.totalAtsApplies} />
          <MiniStat label="HRM8 applies" value={totals.careerApplies} />
          <MiniStat label="JobTarget" value={totals.jobTargetAttributedApplies} />
          <MiniStat label="Other" value={totals.otherAtsApplies} />
        </div>
        <SegmentedBar items={sourceSegments} emptyLabel="No application source mix yet." />
      </CardContent>
    </Card>
  );

  const topMetricsGrid = (
    <div className="grid gap-4 xl:grid-cols-2">
      {careerPerformanceCard}
      {applySourcesCard}
    </div>
  );

  if (isLoading && !distribution) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <Card className="border-border/60 shadow-none">
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
              <div className="grid gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-none">
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="h-5 w-28 animate-pulse rounded bg-muted" />
              <div className="h-56 animate-pulse rounded-xl bg-muted" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!distribution || !distribution.job.remoteJobId) {
    if (job.distributionScope !== 'GLOBAL') {
      return (
        <div className="space-y-4">
          {topMetricsGrid}
          <Card className="border-border/60 bg-gradient-to-br from-background to-muted/20 shadow-none dark:to-muted/10">
            <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <Badge variant="outline" className="mb-3">External Distribution</Badge>
                <h3 className="text-lg font-semibold tracking-tight">External distribution is not enabled for this job.</h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  HRM8 career metrics still appear here. Switch the job to GLOBAL distribution to launch JobTarget and track board performance.
                </p>
              </div>
            </CardContent>
          </Card>
          {easyApplySettingsCard}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {topMetricsGrid}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <Card className="border-border/60 bg-gradient-to-br from-background to-muted/20 shadow-none dark:to-muted/10">
            <CardContent className="flex h-full flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <Badge variant="outline" className="mb-3">Distribution</Badge>
                <h3 className="text-lg font-semibold tracking-tight">Launch once, track everything here.</h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  HRM8 will keep the board status, clicks, applies, and sync health in one place. Use JobTarget only for board
                  selection and checkout.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border/60 px-2.5 py-1">Step 1: open JobTarget</span>
                  <span className="rounded-full border border-border/60 px-2.5 py-1">Step 2: select boards</span>
                  <span className="rounded-full border border-border/60 px-2.5 py-1">Step 3: return and refresh</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button onClick={onLaunch} className="gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Launch in JobTarget
                </Button>
              </div>
            </CardContent>
          </Card>
          {easyApplySettingsCard}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {topMetricsGrid}

        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
          <div className="space-y-4">
            <Card className="overflow-hidden border-border/60 bg-gradient-to-r from-background via-background to-primary/5 shadow-none dark:to-primary/10">
              <CardHeader className="px-3 pt-3 pb-2">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={cn("gap-1.5 rounded-full px-2.5 py-1", toneClasses[statusTone])}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {getStatusLabel(distribution)}
                      </Badge>
                      {distribution.easyApply.enabled ? (
                        <Badge variant="outline" className="rounded-full border-sky-200 bg-sky-50 text-sky-700">
                          Easy Apply
                        </Badge>
                      ) : null}
                      {distribution.easyApply.questionnaireEnabled ? (
                        <Badge variant="outline" className="rounded-full">Questionnaire</Badge>
                      ) : null}
                    </div>

                    <div>
                      <CardTitle className="text-sm font-semibold">Distribution Overview</CardTitle>
                      <CardDescription className="mt-1 text-xs">
                        {distribution.rollups.activePostingCount > 0
                          ? `${distribution.rollups.activePostingCount} active posting${distribution.rollups.activePostingCount === 1 ? "" : "s"} across ${distribution.rollups.activeSites.length} site${distribution.rollups.activeSites.length === 1 ? "" : "s"}.`
                          : "The job is synced, but no active board postings are visible yet."}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onLaunch} className="h-8 gap-2 text-xs">
                      <ExternalLink className="h-4 w-4" />
                      Open JobTarget
                    </Button>
                    <Button size="sm" onClick={onRefresh} disabled={isRefreshing} className="h-8 gap-2 text-xs">
                      <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-3 pb-3">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <MiniStat
                    label="Boards Live"
                    value={distribution.rollups.activePostingCount}
                    hint={distribution.rollups.activeSites.slice(0, 2).join(", ") || "No active sites"}
                  />
                  <MiniStat
                    label="Clicks"
                    value={distribution.rollups.totalClicks}
                    hint={`Updated ${formatRelative(distribution.sync.postingsLastRefreshedAt)}`}
                  />
                  <MiniStat
                    label="Applies"
                    value={distribution.rollups.totalApplies}
                    hint={`${distribution.attribution.totalJobTargetAttributedApplications} attributed in ATS`}
                  />
                  <MiniStat
                    label="Spend"
                    value={formatMoney(distribution.orderSummary.totalSpend || distribution.rollups.totalSpend)}
                    hint={distribution.orderSummary.orderCount > 0 ? `${distribution.orderSummary.orderCount} orders` : "No order data yet"}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-gradient-to-br from-background to-teal-50/70 shadow-none dark:to-teal-950/20">
              <CardHeader className="px-3 pt-3 pb-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm font-semibold">Board Performance</CardTitle>
                    <CardDescription className="text-xs">Clicks and applies by site</CardDescription>
                  </div>
                  <div className="hidden items-center gap-4 text-xs text-muted-foreground sm:flex">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-teal-700" />Clicks</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Applies</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-3 pb-3">
                <div className="grid gap-3 lg:grid-cols-[1.3fr_0.9fr]">
                  <PerformanceBars data={postingPerformance} />
                  <div className="grid gap-3">
                    <MiniTrend label="Click flow" value={distribution.rollups.totalClicks} accent="#0f766e" data={clicksTrend} />
                    <MiniTrend label="Apply flow" value={distribution.rollups.totalApplies} accent="#f59e0b" data={appliesTrend} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-gradient-to-br from-background to-sky-50/70 shadow-none dark:to-sky-950/20">
              <CardHeader className="px-3 pt-3 pb-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm font-semibold">Board Postings</CardTitle>
                    <CardDescription className="text-xs">Live board view with status and spend</CardDescription>
                  </div>
                  <span className="text-xs text-muted-foreground">{distribution.postings.length} total snapshots</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-3 pb-3">
                <div className="space-y-2">
                  {distribution.postings.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                      No posting snapshots have been captured yet. Refresh after ordering boards in JobTarget.
                    </div>
                  ) : (
                    distribution.postings.map((posting) => (
                      <div
                        key={posting.postingId}
                        className="grid gap-2 rounded-lg border border-border/60 bg-background/80 px-2.5 py-2.5 lg:grid-cols-[1.6fr_0.7fr_0.7fr_0.7fr_auto]"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <BoardBrandBadge
                              siteName={posting.siteName || "Unknown site"}
                              className="max-w-full rounded-full px-1.5 py-0.5"
                              iconClassName="h-4 w-4 text-[9px]"
                              labelClassName="max-w-[150px] text-[10px]"
                            />
                            {posting.easyApply ? (
                              <Badge variant="outline" className="rounded-full border-sky-200 bg-sky-50 px-2 py-0 text-[10px] text-sky-700">
                                Easy Apply
                              </Badge>
                            ) : null}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>{posting.status || "Unknown"}</span>
                            <span className="text-border">•</span>
                            <span>{formatRelative(posting.createdAt || posting.user.createdDtm)}</span>
                            {posting.expiredAt ? (
                              <>
                                <span className="text-border">•</span>
                                <span>Expires {formatRelative(posting.expiredAt)}</span>
                              </>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                          <LineChart className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{posting.analytics.clicks}</span>
                          <span className="text-xs text-muted-foreground">clicks</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{posting.analytics.apps}</span>
                          <span className="text-xs text-muted-foreground">applies</span>
                        </div>

                        <div className="flex items-center text-xs">
                          <span className="font-medium">{formatMoney(posting.totalCost)}</span>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          {posting.viewUrl ? (
                            <Button variant="ghost" size="sm" asChild className="h-7 gap-1 px-2 text-xs">
                              <a href={posting.viewUrl} target="_blank" rel="noreferrer">
                                Open
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 px-2 text-xs"
                            onClick={() => setSelectedPosting(posting)}
                          >
                            Details
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {easyApplySettingsCard}

            <Card className="border-border/60 bg-gradient-to-br from-background to-violet-50/70 shadow-none dark:to-violet-950/20">
              <CardHeader className="px-3 pt-3 pb-2">
                <CardTitle className="text-sm font-semibold">Integration Health</CardTitle>
                <CardDescription className="text-xs">Company, user, job, feed, and applicant tracking status</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-0 px-3 pb-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <MetricTile label="Company sync" value={distribution.integrationHealth.company} />
                  <MetricTile label="User sync" value={distribution.integrationHealth.user} />
                  <MetricTile label="Job sync" value={distribution.integrationHealth.job} />
                  <MetricTile label="Feed state" value={formatFeedState(distribution.feedState)} />
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Remote job</span>
                    <span className="font-mono text-xs">{distribution.job.remoteJobId}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Last job sync</span>
                    <span>{formatRelative(distribution.sync.lastSyncedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Postings refresh</span>
                    <span>{formatRelative(distribution.sync.postingsLastRefreshedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Company sync</span>
                    <span>{formatRelative(distribution.company.lastSyncedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Applicant tracking</span>
                    <span>{formatTrackingState(distribution.trackingHealth.status)}</span>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-2 sm:grid-cols-2">
                  <MetricTile label="Tracked applies" value={distribution.attribution.totalJobTargetAttributedApplications} />
                  <MetricTile
                    label="Last good sync"
                    value={distribution.trackingHealth.lastSuccessfulSyncAt ? formatRelative(distribution.trackingHealth.lastSuccessfulSyncAt) : "Not yet"}
                  />
                </div>

                {distribution.sync.lastError || distribution.company.lastError || distribution.sync.postingsLastError ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                    {distribution.sync.postingsLastError || distribution.sync.lastError || distribution.company.lastError}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-gradient-to-br from-background to-rose-50/70 shadow-none dark:to-rose-950/20">
              <CardHeader className="px-3 pt-3 pb-2">
                <CardTitle className="text-sm font-semibold">Tracking & Orders</CardTitle>
                <CardDescription className="text-xs">Applicant sync retries plus read-only order visibility</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-3 pb-3">
                <div className="grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <MetricTile label="Tracking" value={formatTrackingState(distribution.trackingHealth.status)} />
                    <MetricTile label="New app failures" value={distribution.syncIssues.failedNewApplicationSyncs} />
                    <MetricTile label="Stage failures" value={distribution.syncIssues.failedStageSyncs} />
                    <MetricTile label="Pending retries" value={distribution.trackingHealth.pendingNewApplicationSyncs + distribution.trackingHealth.pendingStageSyncs} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetricTile label="Orders" value={distribution.orderSummary.orderCount} />
                    <MetricTile label="Total spend" value={formatMoney(distribution.orderSummary.totalSpend)} />
                  </div>
                  <div className="rounded-xl border border-border/60 px-3 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Latest order</span>
                      <span>{distribution.orderSummary.latestOrderAt ? formatRelative(distribution.orderSummary.latestOrderAt) : 'No orders yet'}</span>
                    </div>
                  </div>
                  {distribution.orderSummary.recentOrders.slice(0, 3).map((order) => (
                    <div key={order.orderId} className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{order.siteName || `Order ${order.orderId}`}</p>
                        <p className="text-xs text-muted-foreground">{order.createdAt ? formatRelative(order.createdAt) : 'Date unavailable'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatMoney(order.cost)}</span>
                        {order.receiptUrl ? (
                          <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
                            <a href={order.receiptUrl} target="_blank" rel="noreferrer">
                              Receipt
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                  <div className="rounded-xl border border-border/60 px-3 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Last failed sync</span>
                      <span>{formatRelative(distribution.syncIssues.lastFailedSyncAt)}</span>
                    </div>
                  </div>
                  {distribution.syncIssues.errorSnippets.length > 0 ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-rose-700">Recent errors</p>
                      <div className="mt-2 space-y-2">
                        {distribution.syncIssues.errorSnippets.slice(0, 3).map((snippet, index) => (
                          <p key={`${snippet}-${index}`} className="text-sm text-rose-800">
                            {snippet}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
                      No recent applicant sync failures.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PostingDetailsSheet
        posting={selectedPosting}
        open={!!selectedPosting}
        onOpenChange={(open) => {
          if (!open) setSelectedPosting(null);
        }}
        canViewAdvanced={canViewAdvanced}
      />
    </>
  );
}
