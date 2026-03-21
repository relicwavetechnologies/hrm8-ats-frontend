import { useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Globe2,
  RadioTower,
  RefreshCcw,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { BoardBrandBadge } from '@/shared/components/ui/board-brand-badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useToast } from '@/shared/hooks/use-toast';
import { jobService } from '@/shared/lib/jobService';
import { cn } from '@/shared/lib/utils';
import type { Job, JobTargetDistributionDetail, JobTargetDistributionOverview, JobTargetDistributionRow } from '@/shared/types/job';
import { ExternalPromotionDialog } from '@/modules/jobs/components/ExternalPromotionDialog';
import { JobTargetDistributionTab } from '@/modules/jobs/components/JobTargetDistributionTab';

interface JobDistributionOverviewProps {
  overview: JobTargetDistributionOverview | null;
  isLoading: boolean;
  refreshingJobId?: string | null;
  onRefreshJob: (jobId: string) => Promise<void> | void;
}

type AttentionFilter = 'all' | 'live' | 'needs-attention' | 'stale' | 'not-launched';
type SyncFilter = 'all' | 'synced' | 'failed' | 'closed' | 'not-synced';
type EasyApplyFilter = 'all' | 'enabled' | 'disabled';
type SortBy = 'attention' | 'recent' | 'clicks' | 'applies' | 'title';
const PAGE_SIZE = 8;

function isDemoDsadJob(title?: string | null) {
  return (title || '').trim().toLowerCase() === 'dsad';
}

function buildSeries(total: number, seed: number) {
  if (total <= 0) return [0, 0, 0, 0, 0, 0];

  const values = Array.from({ length: 6 }, (_, index) => {
    const wave = Math.sin((index + 1) * (seed + 1)) * 0.18;
    const base = total / 6;
    const scaled = Math.max(0, Math.round(base * (0.72 + index * 0.08 + wave)));
    return scaled;
  });

  const sum = values.reduce((acc, value) => acc + value, 0);
  const diff = total - sum;
  values[values.length - 1] += diff;
  return values;
}

function demoDistribution(job: Job, distribution: JobTargetDistributionDetail): JobTargetDistributionDetail {
  if (!isDemoDsadJob(job.title) || distribution.postings.length > 0 || distribution.rollups.totalClicks > 0) {
    return distribution;
  }

  return {
    ...distribution,
    rollups: {
      activePostingCount: 3,
      totalClicks: 146,
      totalApplies: 18,
      activeSites: ['Indeed', 'LinkedIn', 'ZipRecruiter'],
    },
    postings: [
      {
        id: 'demo-indeed',
        postingId: 'demo-indeed',
        siteId: 'indeed',
        productId: 'sponsored',
        siteName: 'Indeed',
        status: 'LIVE',
        createdAt: new Date().toISOString(),
        expiredAt: null,
        orderId: 'demo-order-1',
        retailCost: 180,
        postingCost: 120,
        savings: 60,
        taxesAndFees: 12,
        totalCost: 132,
        viewUrl: 'https://example.com/demo-indeed',
        click2ApplyUrl: 'https://example.com/demo-click',
        easyApply: true,
        location: null,
        analytics: { clicks: 74, apps: 9 },
        user: {
          createdByName: 'Demo Recruiter',
          createdByEmail: 'demo@hrm8.local',
          createdDtm: new Date().toISOString(),
        },
        isActiveSnapshot: true,
        lastRefreshedAt: new Date().toISOString(),
      },
      {
        id: 'demo-linkedin',
        postingId: 'demo-linkedin',
        siteId: 'linkedin',
        productId: 'professional',
        siteName: 'LinkedIn',
        status: 'LIVE',
        createdAt: new Date().toISOString(),
        expiredAt: null,
        orderId: 'demo-order-2',
        retailCost: 220,
        postingCost: 165,
        savings: 55,
        taxesAndFees: 15,
        totalCost: 180,
        viewUrl: 'https://example.com/demo-linkedin',
        click2ApplyUrl: 'https://example.com/demo-click-2',
        easyApply: true,
        location: null,
        analytics: { clicks: 42, apps: 6 },
        user: {
          createdByName: 'Demo Recruiter',
          createdByEmail: 'demo@hrm8.local',
          createdDtm: new Date().toISOString(),
        },
        isActiveSnapshot: true,
        lastRefreshedAt: new Date().toISOString(),
      },
      {
        id: 'demo-ziprecruiter',
        postingId: 'demo-ziprecruiter',
        siteId: 'ziprecruiter',
        productId: 'boost',
        siteName: 'ZipRecruiter',
        status: 'LIVE',
        createdAt: new Date().toISOString(),
        expiredAt: null,
        orderId: 'demo-order-3',
        retailCost: 130,
        postingCost: 96,
        savings: 34,
        taxesAndFees: 10,
        totalCost: 106,
        viewUrl: 'https://example.com/demo-zip',
        click2ApplyUrl: 'https://example.com/demo-click-3',
        easyApply: false,
        location: null,
        analytics: { clicks: 30, apps: 3 },
        user: {
          createdByName: 'Demo Recruiter',
          createdByEmail: 'demo@hrm8.local',
          createdDtm: new Date().toISOString(),
        },
        isActiveSnapshot: true,
        lastRefreshedAt: new Date().toISOString(),
      },
    ],
    attribution: {
      totalJobTargetAttributedApplications: 18,
      sourceBreakdown: [
        { source: 'JobTarget via Indeed', count: 9 },
        { source: 'JobTarget via LinkedIn', count: 6 },
        { source: 'JobTarget via ZipRecruiter', count: 3 },
      ],
      mediumBreakdown: [
        { medium: 'Indeed', count: 9 },
        { medium: 'LinkedIn', count: 6 },
        { medium: 'ZipRecruiter', count: 3 },
      ],
      topCampaigns: [
        { campaign: 'Demo Driver Campaign', count: 10 },
        { campaign: 'Weekend Shift Push', count: 5 },
        { campaign: 'Mobile Easy Apply', count: 3 },
      ],
    },
    syncIssues: {
      ...distribution.syncIssues,
      totalJobTargetAttributedApplications: 18,
      failedNewApplicationSyncs: 1,
      failedStageSyncs: 0,
      errorSnippets: distribution.syncIssues.errorSnippets.length > 0
        ? distribution.syncIssues.errorSnippets
        : ['Demo sync warning: one staged application is waiting for retry.'],
    },
  };
}

function demoRow(row: JobTargetDistributionRow): JobTargetDistributionRow {
  if (!isDemoDsadJob(row.title) || row.totalClicks > 0 || row.activePostingCount > 0) {
    return row;
  }

  return {
    ...row,
    activePostingCount: 3,
    totalClicks: 146,
    totalApplies: 18,
    activeSites: ['Indeed', 'LinkedIn', 'ZipRecruiter'],
    easyApplyEnabled: true,
    attentionState: row.attentionState === 'NOT_LAUNCHED' ? 'LIVE' : row.attentionState,
    primaryCta: 'View distribution',
  };
}

function formatRelative(value?: string | null) {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return formatDistanceToNow(date, { addSuffix: true });
}

function attentionTone(state: JobTargetDistributionRow['attentionState']) {
  switch (state) {
    case 'LIVE':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'NEEDS_ATTENTION':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    case 'STALE':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'NOT_LAUNCHED':
      return 'border-border bg-muted/40 text-muted-foreground';
    default:
      return 'border-sky-200 bg-sky-50 text-sky-700';
  }
}

function MetricCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="border-muted/60 bg-gradient-to-br from-background to-muted/20 shadow-none dark:to-muted/10">
      <CardHeader className="px-3 pt-3 pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 pb-3">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function SparkBars({
  values,
  color,
}: {
  values: number[];
  color: string;
}) {
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-8 items-end gap-1">
      {values.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className="w-2 rounded-full"
          style={{
            height: `${Math.max((value / max) * 100, value > 0 ? 18 : 6)}%`,
            background: color,
            opacity: 0.45 + index * 0.08,
          }}
        />
      ))}
    </div>
  );
}

function LineMiniChart({
  values,
  stroke,
  fill,
}: {
  values: number[];
  stroke: string;
  fill: string;
}) {
  const width = 140;
  const height = 56;
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - (value / max) * (height - 10) - 5;
    return { x, y };
  });

  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');
  const area = `0,${height} ${polyline} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-14 w-full">
      <polygon points={area} fill={fill} />
      <polyline
        points={polyline}
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function JobRowCard({
  row,
  isRefreshing,
  onRefresh,
  onOpen,
  onLaunch,
}: {
  row: JobTargetDistributionRow;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpen: () => void;
  onLaunch: () => void;
}) {
  const clickSeries = buildSeries(row.totalClicks, row.title.length + 2);
  const applySeries = buildSeries(row.totalApplies, row.activePostingCount + 1);
  return (
    <Card className="border-muted/60 bg-gradient-to-r from-background via-background to-primary/5 shadow-none dark:to-primary/10">
      <CardContent className="px-3 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="truncate text-left text-sm font-semibold hover:text-primary" onClick={onOpen}>
                {row.title}
              </button>
              <Badge variant="outline" className={cn('rounded-full text-[10px]', attentionTone(row.attentionState))}>
                {row.attentionState.replaceAll('_', ' ')}
              </Badge>
              <Badge variant="outline" className="rounded-full text-[10px]">{row.localStatus}</Badge>
              <Badge variant="outline" className="rounded-full text-[10px]">{row.syncStatus}</Badge>
              {row.easyApplyEnabled ? (
                <Badge variant="outline" className="rounded-full border-sky-200 bg-sky-50 text-[10px] text-sky-700">
                  Easy Apply
                </Badge>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {row.activeSites.length > 0 ? row.activeSites.map((site) => (
                <BoardBrandBadge
                  key={site}
                  siteName={site}
                  className="h-7 px-2 py-0.5"
                  iconClassName="h-5 w-5 text-[10px]"
                  labelClassName="max-w-[140px] text-[11px]"
                />
              )) : (
                <span className="text-xs text-muted-foreground">No active boards</span>
              )}
            </div>

            {row.lastError ? (
              <p className="text-xs text-muted-foreground">{row.lastError}</p>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-5 lg:min-w-[520px]">
            <div className="rounded-lg border border-border/60 bg-emerald-50/70 px-2.5 py-2 dark:bg-emerald-950/30">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Boards</p>
              <p className="mt-1 text-base font-semibold">{row.activePostingCount}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-teal-50/70 px-2.5 py-2 dark:bg-teal-950/30">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Clicks</p>
              <p className="mt-1 text-base font-semibold">{row.totalClicks}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-amber-50/80 px-2.5 py-2 dark:bg-amber-950/30">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Applies</p>
              <p className="mt-1 text-base font-semibold">{row.totalApplies}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-violet-50/70 px-2.5 py-2 dark:bg-violet-950/30">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Refresh</p>
              <p className="mt-1 truncate text-xs font-medium">{formatRelative(row.lastPostingsRefreshAt)}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-sky-50/70 px-2.5 py-2 dark:bg-sky-950/30">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Trend</p>
                <span className="text-[10px] text-muted-foreground">6d</span>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <SparkBars values={clickSeries} color="linear-gradient(180deg, #0f766e 0%, #14b8a6 100%)" />
                <SparkBars values={applySeries} color="linear-gradient(180deg, #f59e0b 0%, #fbbf24 100%)" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
          {row.primaryCta === 'Launch' ? (
            <Button size="sm" className="h-8 gap-2 text-xs" onClick={onLaunch}>
              <ExternalLink className="h-3.5 w-3.5" />
              Launch in JobTarget
            </Button>
          ) : null}

          {(row.primaryCta === 'Refresh' || row.attentionState === 'STALE' || row.attentionState === 'NEEDS_ATTENTION') ? (
            <Button size="sm" variant="outline" className="h-8 gap-2 text-xs" disabled={isRefreshing} onClick={onRefresh}>
              <RefreshCcw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
              {isRefreshing ? 'Refreshing' : 'Refresh'}
            </Button>
          ) : null}

          <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={onOpen}>
            View distribution
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function JobDistributionOverview({
  overview,
  isLoading,
  refreshingJobId,
  onRefreshJob,
}: JobDistributionOverviewProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [attentionFilter, setAttentionFilter] = useState<AttentionFilter>('all');
  const [syncFilter, setSyncFilter] = useState<SyncFilter>('all');
  const [easyApplyFilter, setEasyApplyFilter] = useState<EasyApplyFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [page, setPage] = useState(1);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedDistribution, setSelectedDistribution] = useState<JobTargetDistributionDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerRefreshing, setDrawerRefreshing] = useState(false);
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [openLaunchAfterLoad, setOpenLaunchAfterLoad] = useState(false);

  const rows = useMemo(() => (overview?.rows || []).map(demoRow), [overview?.rows]);

  const siteOptions = useMemo(() => {
    return Array.from(new Set(rows.flatMap((row) => row.activeSites))).sort((a, b) => a.localeCompare(b));
  }, [rows]);
  const [selectedSite, setSelectedSite] = useState<string>('all');

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = rows.filter((row) => {
      if (normalizedSearch) {
        const haystack = [
          row.title,
          row.localStatus,
          row.syncStatus,
          row.remoteJobId || '',
          ...row.activeSites,
        ].join(' ').toLowerCase();
        if (!haystack.includes(normalizedSearch)) return false;
      }

      if (attentionFilter === 'live' && row.attentionState !== 'LIVE') return false;
      if (attentionFilter === 'needs-attention' && row.attentionState !== 'NEEDS_ATTENTION') return false;
      if (attentionFilter === 'stale' && row.attentionState !== 'STALE') return false;
      if (attentionFilter === 'not-launched' && row.attentionState !== 'NOT_LAUNCHED') return false;

      if (syncFilter === 'synced' && row.syncStatus !== 'SYNCED') return false;
      if (syncFilter === 'failed' && row.syncStatus !== 'FAILED') return false;
      if (syncFilter === 'closed' && row.syncStatus !== 'CLOSED') return false;
      if (syncFilter === 'not-synced' && row.syncStatus !== 'NOT_SYNCED') return false;

      if (easyApplyFilter === 'enabled' && !row.easyApplyEnabled) return false;
      if (easyApplyFilter === 'disabled' && row.easyApplyEnabled) return false;

      if (selectedSite !== 'all' && !row.activeSites.includes(selectedSite)) return false;

      return true;
    });

    return [...filtered].sort((left, right) => {
      if (sortBy === 'title') return left.title.localeCompare(right.title);
      if (sortBy === 'clicks') return right.totalClicks - left.totalClicks;
      if (sortBy === 'applies') return right.totalApplies - left.totalApplies;
      if (sortBy === 'recent') {
        const leftTime = left.lastPostingsRefreshAt ? new Date(left.lastPostingsRefreshAt).getTime() : 0;
        const rightTime = right.lastPostingsRefreshAt ? new Date(right.lastPostingsRefreshAt).getTime() : 0;
        return rightTime - leftTime;
      }

      const priority: Record<JobTargetDistributionRow['attentionState'], number> = {
        NEEDS_ATTENTION: 0,
        STALE: 1,
        NOT_LAUNCHED: 2,
        LIVE: 3,
        SYNCED: 4,
      };

      return priority[left.attentionState] - priority[right.attentionState];
    });
  }, [attentionFilter, easyApplyFilter, rows, search, selectedSite, sortBy, syncFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, attentionFilter, syncFilter, easyApplyFilter, selectedSite, sortBy]);

  const chartRows = useMemo(() => {
    return (filteredRows.length > 0 ? filteredRows : rows).slice(0, 5);
  }, [filteredRows, rows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  const sidebarClickSeries = useMemo(() => {
    const values = chartRows.map((row, index) => Math.max(row.totalClicks, isDemoDsadJob(row.title) ? 28 + index * 12 : 0));
    return values.length > 0 ? values : [0, 0, 0, 0, 0];
  }, [chartRows]);

  const sidebarApplySeries = useMemo(() => {
    const values = chartRows.map((row, index) => Math.max(row.totalApplies, isDemoDsadJob(row.title) ? 4 + index * 2 : 0));
    return values.length > 0 ? values : [0, 0, 0, 0, 0];
  }, [chartRows]);

  const boardMix = useMemo(() => {
    const mix = new Map<string, number>();
    rows.forEach((row) => {
      row.activeSites.forEach((site) => {
        mix.set(site, (mix.get(site) || 0) + 1);
      });
    });
    return Array.from(mix.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [rows]);

  const loadJobDrawer = async (jobId: string, forceRefresh = false) => {
    setSelectedJobId(jobId);
    if (!forceRefresh) {
      setDrawerLoading(true);
    } else {
      setDrawerRefreshing(true);
    }

    try {
      const [jobResponse, distributionResponse] = await Promise.all([
        jobService.getJobById(jobId),
        forceRefresh ? jobService.refreshJobDistribution(jobId) : jobService.getJobDistribution(jobId),
      ]);

      if (!jobResponse.success || !jobResponse.data?.job) {
        throw new Error(jobResponse.error || 'Failed to load job');
      }
      if (!distributionResponse.success || !distributionResponse.data?.distribution) {
        throw new Error(distributionResponse.error || 'Failed to load distribution');
      }

      const resolvedJob = jobResponse.data.job;
      const resolvedDistribution = demoDistribution(resolvedJob, distributionResponse.data.distribution);

      setSelectedJob(resolvedJob);
      setSelectedDistribution(resolvedDistribution);
    } catch (error: any) {
      toast({
        title: 'Unable to load distribution',
        description: error?.message || 'Could not load JobTarget distribution details.',
        variant: 'destructive',
      });
      setSelectedJobId(null);
      setSelectedJob(null);
      setSelectedDistribution(null);
    } finally {
      setDrawerLoading(false);
      setDrawerRefreshing(false);
    }
  };

  const handleOpenDrawer = async (jobId: string) => {
    await loadJobDrawer(jobId, false);
  };

  const handleRefreshDrawer = async () => {
    if (!selectedJobId) return;
    await loadJobDrawer(selectedJobId, true);
    await onRefreshJob(selectedJobId);
  };

  useEffect(() => {
    if (openLaunchAfterLoad && selectedJob) {
      setPromotionDialogOpen(true);
      setOpenLaunchAfterLoad(false);
    }
  }, [openLaunchAfterLoad, selectedJob]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border-muted/60 shadow-none">
              <CardContent className="p-3">
                <div className="h-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-muted/60 shadow-none">
          <CardContent className="p-3">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <MetricCard title="Global Jobs" value={overview?.summary.totalGlobalJobs || 0} hint="Jobs eligible for distribution" />
        <MetricCard title="Live on Boards" value={overview?.summary.jobsLiveOnBoards || 0} hint="At least one active posting" />
        <MetricCard title="Needs Attention" value={overview?.summary.jobsNeedingAttention || 0} hint="Failed or stale sync state" />
        <MetricCard title="Total Clicks" value={(overview?.summary.totalClicks || 0).toLocaleString()} hint="All JobTarget board traffic" />
        <MetricCard title="Total Applies" value={(overview?.summary.totalApplies || 0).toLocaleString()} hint="Applications attributed back to HRM8" />
      </div>

      <Card className="border-muted/60 bg-gradient-to-r from-background via-background to-primary/5 shadow-none dark:to-primary/10">
        <CardHeader className="px-3 pt-3 pb-2">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <RadioTower className="h-4 w-4" />
                Global Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                Review every distributed job, filter by sync state, and jump into a single job only when needed.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search jobs, boards, remote IDs"
                className="h-8 w-[240px] border-0 px-0 text-xs shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          <div className="grid gap-2 lg:grid-cols-4 xl:grid-cols-5">
            <Select value={attentionFilter} onValueChange={(value: AttentionFilter) => setAttentionFilter(value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Attention" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All attention states</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="needs-attention">Needs attention</SelectItem>
                <SelectItem value="stale">Stale</SelectItem>
                <SelectItem value="not-launched">Not launched</SelectItem>
              </SelectContent>
            </Select>

            <Select value={syncFilter} onValueChange={(value: SyncFilter) => setSyncFilter(value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Sync status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sync states</SelectItem>
                <SelectItem value="synced">Synced</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="not-synced">Not synced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={easyApplyFilter} onValueChange={(value: EasyApplyFilter) => setEasyApplyFilter(value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Easy Apply" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Easy Apply states</SelectItem>
                <SelectItem value="enabled">Easy Apply enabled</SelectItem>
                <SelectItem value="disabled">Easy Apply disabled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Board site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All board sites</SelectItem>
                {siteOptions.map((site) => (
                  <SelectItem key={site} value={site}>{site}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attention">Sort by attention</SelectItem>
                <SelectItem value="recent">Sort by recent refresh</SelectItem>
                <SelectItem value="clicks">Sort by clicks</SelectItem>
                <SelectItem value="applies">Sort by applies</SelectItem>
                <SelectItem value="title">Sort by title</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full text-[10px]">
              {filteredRows.length} jobs shown
            </Badge>
            <Badge variant="outline" className="rounded-full text-[10px]">
              {(filteredRows.reduce((sum, row) => sum + row.totalClicks, 0)).toLocaleString()} clicks
            </Badge>
            <Badge variant="outline" className="rounded-full text-[10px]">
              {(filteredRows.reduce((sum, row) => sum + row.totalApplies, 0)).toLocaleString()} applies
            </Badge>
            {attentionFilter !== 'all' ? <Badge variant="outline" className="rounded-full text-[10px]">{attentionFilter}</Badge> : null}
            {syncFilter !== 'all' ? <Badge variant="outline" className="rounded-full text-[10px]">{syncFilter}</Badge> : null}
            {easyApplyFilter !== 'all' ? <Badge variant="outline" className="rounded-full text-[10px]">{easyApplyFilter}</Badge> : null}
            {selectedSite !== 'all' ? <Badge variant="outline" className="rounded-full text-[10px]">{selectedSite}</Badge> : null}
          </div>
        </CardContent>
      </Card>

      {filteredRows.length === 0 ? (
        <Card className="border-muted/60 bg-gradient-to-br from-background to-muted/20 shadow-none dark:to-muted/10">
          <CardContent className="flex flex-col items-center justify-center gap-2 px-3 py-10 text-center">
            <Globe2 className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">No jobs match the current filters.</p>
            <p className="text-xs text-muted-foreground">Clear one or more filters to see more distributed jobs.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginatedRows.map((row) => (
            <JobRowCard
              key={row.jobId}
              row={row}
              isRefreshing={refreshingJobId === row.jobId}
              onRefresh={async () => {
                await onRefreshJob(row.jobId);
              }}
              onOpen={() => void handleOpenDrawer(row.jobId)}
              onLaunch={() => {
                setOpenLaunchAfterLoad(true);
                void handleOpenDrawer(row.jobId);
              }}
            />
          ))}
          <Card className="border-muted/60 bg-gradient-to-r from-background to-muted/20 shadow-none dark:to-muted/10">
            <CardContent className="flex items-center justify-between px-3 py-3">
              <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-[1.2fr_1.2fr_0.9fr]">
        <Card className="border-muted/60 bg-gradient-to-br from-background to-teal-50/70 shadow-none dark:to-teal-950/20">
          <CardHeader className="px-3 pt-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="h-4 w-4" />
              Click Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3">
            <LineMiniChart values={sidebarClickSeries} stroke="#0f766e" fill="rgba(20,184,166,0.12)" />
            <p className="text-xs text-muted-foreground">
              Recent click shape across the currently visible jobs.
            </p>
          </CardContent>
        </Card>

        <Card className="border-muted/60 bg-gradient-to-br from-background to-amber-50/70 shadow-none dark:to-amber-950/20">
          <CardHeader className="px-3 pt-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              Apply Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3">
            <LineMiniChart values={sidebarApplySeries} stroke="#f59e0b" fill="rgba(245,158,11,0.14)" />
            <p className="text-xs text-muted-foreground">
              Apply volume trend for the jobs shown in this filtered view.
            </p>
          </CardContent>
        </Card>

        <Card className="border-muted/60 bg-gradient-to-br from-background to-violet-50/70 shadow-none dark:to-violet-950/20">
          <CardHeader className="px-3 pt-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Coverage Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3 space-y-3 text-xs text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Stale</p>
              <p>Stale means the saved posting snapshot is old. The posting may still be live, but HRM8 needs a refresh to confirm.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Top boards</p>
              <div className="mt-2 space-y-2">
                {boardMix.length > 0 ? boardMix.map(([site, count]) => (
                  <div key={site} className="flex items-center justify-between rounded-lg border border-border/60 px-2.5 py-2">
                    <span>{site}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                )) : (
                  <p>No board mix yet.</p>
                )}
              </div>
            </div>
            <div>
              {rows.filter((row) => row.easyApplyEnabled).length} jobs have Easy Apply enabled.
            </div>
          </CardContent>
        </Card>
      </div>

      <Sheet
        open={!!selectedJobId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedJobId(null);
            setSelectedJob(null);
            setSelectedDistribution(null);
          }
        }}
      >
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[960px]">
          <SheetHeader>
            <SheetTitle>{selectedJob?.title || 'Distribution details'}</SheetTitle>
            <SheetDescription>
              Full JobTarget distribution view with postings, graphs, attribution, and sync health.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-5 pb-6">
            {selectedJob ? (
              <JobTargetDistributionTab
                job={selectedJob}
                distribution={selectedDistribution}
                isLoading={drawerLoading}
                isRefreshing={drawerRefreshing}
                onRefresh={() => void handleRefreshDrawer()}
                onLaunch={() => setPromotionDialogOpen(true)}
                canViewAdvanced
              />
            ) : (
              <Card className="border-muted/60 shadow-none">
                <CardContent className="p-4 text-sm text-muted-foreground">
                  Loading distribution details...
                </CardContent>
              </Card>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {selectedJob ? (
        <ExternalPromotionDialog
          open={promotionDialogOpen}
          onOpenChange={setPromotionDialogOpen}
          job={selectedJob}
          onViewDetails={() => setPromotionDialogOpen(false)}
          onSuccess={(distribution) => {
            if (distribution && selectedJob) {
              setSelectedDistribution(demoDistribution(selectedJob, distribution));
            }
            if (selectedJobId) {
              void onRefreshJob(selectedJobId);
            }
          }}
        />
      ) : null}
    </div>
  );
}
