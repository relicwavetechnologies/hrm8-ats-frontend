import { useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, CheckCircle2, Globe2, RadioTower, Search, Sparkles } from 'lucide-react';

import { ExternalPromotionDialog } from '@/modules/jobs/components/ExternalPromotionDialog';
import { JobTargetDistributionTab } from '@/modules/jobs/components/JobTargetDistributionTab';
import { PublishedJobRow } from '@/modules/jobs/components/PublishedJobRow';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { useToast } from '@/shared/hooks/use-toast';
import { isJobSetupComplete, isJobSetupPending } from '@/shared/lib/jobSetupState';
import { jobService } from '@/shared/lib/jobService';
import { cn } from '@/shared/lib/utils';
import type {
  Job,
  JobTargetDistributionDetail,
  JobTargetDistributionOverview,
  JobTargetDistributionRow,
  PublishedJobDistributionState,
  PublishedJobListRow,
  PublishedJobSetupState,
} from '@/shared/types/job';

type SetupFilter = 'all' | 'pending-consultant' | 'pending-setup' | 'advanced' | 'simple';
type ScopeFilter = 'all' | 'global' | 'hrm8-only';
type DistributionFilter = 'all' | 'launch-pending' | 'sync-needed' | 'live' | 'hrm8-only' | 'closed';
type SyncFilter = 'all' | 'synced' | 'not-synced' | 'failed' | 'closed';
type EasyApplyFilter = 'all' | 'enabled' | 'disabled';
type SortBy = 'posted' | 'clicks' | 'applies' | 'title';

const PAGE_SIZE = 8;

function isDemoDsadJob(title?: string | null) {
  return (title || '').trim().toLowerCase() === 'dsad';
}

function emptyCareerMetrics() {
  return {
    views: 0,
    applyClicks: 0,
    applies: 0,
    applyCoverage: 'EXACT' as const,
    lastActivityAt: null,
    trend: {
      labels: [],
      views: [],
      applies: [],
    },
  };
}

function emptyTotals() {
  return {
    totalAtsApplies: 0,
    careerApplies: 0,
    jobTargetAttributedApplies: 0,
    otherAtsApplies: 0,
  };
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

function getSetupState(job: Job): PublishedJobSetupState {
  const isManaged = ['shortlisting', 'full-service', 'executive-search'].includes(job.serviceType || '');
  const needsConsultant = isManaged && !job.assignedConsultantId;

  if (job.pendingConsultantAssignment || needsConsultant) {
    return 'PENDING_CONSULTANT';
  }
  if (isJobSetupPending(job.id) || !isJobSetupComplete(job)) {
    return 'PENDING_SETUP';
  }
  if (job.setupType === 'advanced') {
    return 'ADVANCED';
  }
  if (job.setupType === 'simple') {
    return 'SIMPLE';
  }
  return 'UNKNOWN';
}

function getDistributionState(job: Job, distribution?: JobTargetDistributionRow): PublishedJobDistributionState {
  if (job.distributionScope !== 'GLOBAL') {
    return 'HRM8_ONLY';
  }

  if (distribution?.syncStatus === 'CLOSED') {
    return 'CLOSED';
  }

  if (distribution?.attentionState === 'NEEDS_ATTENTION' || distribution?.attentionState === 'STALE' || distribution?.syncStatus === 'FAILED') {
    return 'SYNC_NEEDED';
  }

  if ((distribution?.activePostingCount || 0) > 0 || distribution?.attentionState === 'LIVE') {
    return 'LIVE';
  }

  return 'LAUNCH_PENDING';
}

function getPrimaryAction(
  setupState: PublishedJobSetupState,
  distributionState: PublishedJobDistributionState
): PublishedJobListRow['primaryAction'] {
  if (setupState === 'PENDING_CONSULTANT' || setupState === 'PENDING_SETUP') {
    return 'complete_setup';
  }
  if (distributionState === 'LAUNCH_PENDING') {
    return 'launch_marketplace';
  }
  if (distributionState === 'SYNC_NEEDED') {
    return 'sync';
  }
  return 'view_distribution';
}

function buildMergedRow(job: Job, distribution?: JobTargetDistributionRow): PublishedJobListRow {
  const nextDistribution = distribution ? demoRow(distribution) : undefined;
  const setupState = getSetupState(job);
  const distributionState = getDistributionState(job, nextDistribution);
  const careerMetrics = nextDistribution?.careerMetrics || job.careerMetrics || emptyCareerMetrics();
  const totals = nextDistribution?.totals || emptyTotals();

  return {
    job,
    distribution: nextDistribution,
    setupState,
    distributionState,
    primaryAction: getPrimaryAction(setupState, distributionState),
    careerMetrics,
    totals,
    careerViewSeries: careerMetrics.trend.views,
    atsApplySeries: careerMetrics.trend.applies,
  };
}

type PublishedJobsListProps = {
  jobs: Job[];
  overview: JobTargetDistributionOverview | null;
  isDistributionLoading: boolean;
  refreshingJobId?: string | null;
  focusMode?: 'all' | 'distribution';
  selectedJobIds: string[];
  onSelectedJobIdsChange: (jobIds: string[]) => void;
  onRefreshJob: (jobId: string) => Promise<void> | void;
  onOpenSetup: (job: Job) => void;
  onNavigateToJob: (job: Job) => void;
  onRowContextMenu?: (job: Job, e: React.MouseEvent) => void;
  onRowDragStart?: (job: Job, e: React.DragEvent) => void;
};

export function PublishedJobsList({
  jobs,
  overview,
  isDistributionLoading,
  refreshingJobId,
  focusMode = 'all',
  selectedJobIds,
  onSelectedJobIdsChange,
  onRefreshJob,
  onOpenSetup,
  onNavigateToJob,
  onRowContextMenu,
  onRowDragStart,
}: PublishedJobsListProps) {
  const { toast } = useToast();
  const [setupFilter, setSetupFilter] = useState<SetupFilter>('all');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>(focusMode === 'distribution' ? 'global' : 'all');
  const [distributionFilter, setDistributionFilter] = useState<DistributionFilter>('all');
  const [syncFilter, setSyncFilter] = useState<SyncFilter>('all');
  const [easyApplyFilter, setEasyApplyFilter] = useState<EasyApplyFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('posted');
  const [searchBoards, setSearchBoards] = useState('');
  const [page, setPage] = useState(1);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedDistribution, setSelectedDistribution] = useState<JobTargetDistributionDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerRefreshing, setDrawerRefreshing] = useState(false);
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);

  useEffect(() => {
    if (focusMode === 'distribution') {
      setScopeFilter((current) => (current === 'all' ? 'global' : current));
    }
  }, [focusMode]);

  const mergedRows = useMemo(() => {
    const distributionMap = new Map((overview?.rows || []).map((row) => [row.jobId, row]));
    return jobs.map((job) => buildMergedRow(job, distributionMap.get(job.id)));
  }, [jobs, overview?.rows]);

  const siteOptions = useMemo(() => {
    return Array.from(
      new Set(
        mergedRows.flatMap((row) => row.distribution?.activeSites || [])
      )
    ).sort((left, right) => left.localeCompare(right));
  }, [mergedRows]);

  const filteredRows = useMemo(() => {
    const normalizedBoardSearch = searchBoards.trim().toLowerCase();

    const actionablePriority: Record<PublishedJobDistributionState | 'PENDING_CONSULTANT' | 'PENDING_SETUP', number> = {
      PENDING_CONSULTANT: 0,
      PENDING_SETUP: 1,
      LAUNCH_PENDING: 2,
      SYNC_NEEDED: 3,
      LIVE: 4,
      HRM8_ONLY: 5,
      CLOSED: 6,
    };

    const filtered = mergedRows.filter((row) => {
      if (setupFilter !== 'all') {
        if (setupFilter === 'pending-consultant' && row.setupState !== 'PENDING_CONSULTANT') return false;
        if (setupFilter === 'pending-setup' && row.setupState !== 'PENDING_SETUP') return false;
        if (setupFilter === 'advanced' && row.setupState !== 'ADVANCED') return false;
        if (setupFilter === 'simple' && row.setupState !== 'SIMPLE') return false;
      }

      if (scopeFilter === 'global' && row.job.distributionScope !== 'GLOBAL') return false;
      if (scopeFilter === 'hrm8-only' && row.job.distributionScope === 'GLOBAL') return false;

      if (distributionFilter !== 'all') {
        const expected = distributionFilter.toUpperCase().replace('-', '_') as PublishedJobDistributionState;
        if (row.distributionState !== expected) return false;
      }

      if (syncFilter === 'synced' && row.distribution?.syncStatus !== 'SYNCED') return false;
      if (syncFilter === 'not-synced' && (row.distribution?.syncStatus || 'NOT_SYNCED') !== 'NOT_SYNCED') return false;
      if (syncFilter === 'failed' && row.distribution?.syncStatus !== 'FAILED') return false;
      if (syncFilter === 'closed' && row.distributionState !== 'CLOSED') return false;

      if (easyApplyFilter === 'enabled' && !row.distribution?.easyApplyEnabled) return false;
      if (easyApplyFilter === 'disabled' && row.distribution?.easyApplyEnabled) return false;

      if (normalizedBoardSearch) {
        const haystack = [
          ...(row.distribution?.activeSites || []),
          row.distribution?.remoteJobId || '',
        ].join(' ').toLowerCase();
        if (!haystack.includes(normalizedBoardSearch)) return false;
      }

      return true;
    });

    return [...filtered].sort((left, right) => {
      if (sortBy === 'title') return left.job.title.localeCompare(right.job.title);
      if (sortBy === 'clicks') return (right.distribution?.totalClicks || 0) - (left.distribution?.totalClicks || 0);
      if (sortBy === 'applies') return (right.distribution?.totalApplies || 0) - (left.distribution?.totalApplies || 0);

      const leftPosted = new Date(left.job.postingDate || left.job.createdAt).getTime();
      const rightPosted = new Date(right.job.postingDate || right.job.createdAt).getTime();
      if (leftPosted !== rightPosted) return rightPosted - leftPosted;

      const leftPriority = actionablePriority[left.setupState === 'PENDING_CONSULTANT' || left.setupState === 'PENDING_SETUP' ? left.setupState : left.distributionState];
      const rightPriority = actionablePriority[right.setupState === 'PENDING_CONSULTANT' || right.setupState === 'PENDING_SETUP' ? right.setupState : right.distributionState];
      return leftPriority - rightPriority;
    });
  }, [distributionFilter, easyApplyFilter, mergedRows, scopeFilter, searchBoards, setupFilter, sortBy, syncFilter]);

  useEffect(() => {
    setPage(1);
  }, [setupFilter, scopeFilter, distributionFilter, syncFilter, easyApplyFilter, sortBy, searchBoards]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  const allVisibleSelected = paginatedRows.length > 0 && paginatedRows.every((row) => selectedJobIds.includes(row.job.id));
  const someVisibleSelected = paginatedRows.some((row) => selectedJobIds.includes(row.job.id));

  const summary = useMemo(() => {
    return {
      total: mergedRows.length,
      pendingSetup: mergedRows.filter((row) => row.setupState === 'PENDING_SETUP').length,
      launchPending: mergedRows.filter((row) => row.distributionState === 'LAUNCH_PENDING').length,
      live: mergedRows.filter((row) => row.distributionState === 'LIVE').length,
    };
  }, [mergedRows]);

  const loadJobDrawer = async (job: Job, forceRefresh = false) => {
    setSelectedJobId(job.id);
    setSelectedJob(job);
    if (forceRefresh) {
      setDrawerRefreshing(true);
    } else {
      setDrawerLoading(true);
    }

    try {
      const [jobResponse, distributionResponse] = await Promise.all([
        jobService.getJobById(job.id),
        forceRefresh ? jobService.refreshJobDistribution(job.id) : jobService.getJobDistribution(job.id),
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

  const handleRefreshDrawer = async () => {
    if (!selectedJob) return;
    await loadJobDrawer(selectedJob, true);
    await onRefreshJob(selectedJob.id);
  };

  const handleToggleVisible = (checked: boolean) => {
    const pageIds = paginatedRows.map((row) => row.job.id);
    if (checked) {
      onSelectedJobIdsChange(Array.from(new Set([...selectedJobIds, ...pageIds])));
      return;
    }
    onSelectedJobIdsChange(selectedJobIds.filter((id) => !pageIds.includes(id)));
  };

  const handlePrimaryAction = async (row: PublishedJobListRow) => {
    if (row.primaryAction === 'complete_setup') {
      onOpenSetup(row.job);
      return;
    }
    if (row.primaryAction === 'launch_marketplace') {
      setSelectedJob(row.job);
      setSelectedDistribution(null);
      setPromotionDialogOpen(true);
      return;
    }
    if (row.primaryAction === 'sync') {
      await onRefreshJob(row.job.id);
      return;
    }
    await loadJobDrawer(row.job, false);
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-gradient-to-r from-background via-background to-primary/5 shadow-none dark:to-primary/10">
        <CardHeader className="px-3 pt-3 pb-2">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <RadioTower className="h-4 w-4" />
                Published Jobs
              </CardTitle>
              <CardDescription className="text-xs">
                One place for hiring state, setup progress, JobTarget launch, sync, and live board performance.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchBoards}
                onChange={(event) => setSearchBoards(event.target.value)}
                placeholder="Search boards or remote IDs"
                className="h-8 w-[220px] border-0 px-0 text-xs shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          {focusMode === 'distribution' ? (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-200">
              <Sparkles className="h-3.5 w-3.5" />
              Distribution focus is enabled. Published jobs are filtered toward external distribution work.
            </div>
          ) : null}

          <div className="grid gap-2 lg:grid-cols-3 xl:grid-cols-6">
            <Select value={setupFilter} onValueChange={(value: SetupFilter) => setSetupFilter(value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Setup state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All setup states</SelectItem>
                <SelectItem value="pending-consultant">Pending consultant</SelectItem>
                <SelectItem value="pending-setup">Pending setup</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="simple">Simple</SelectItem>
              </SelectContent>
            </Select>

            <Select value={scopeFilter} onValueChange={(value: ScopeFilter) => setScopeFilter(value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Distribution scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All scopes</SelectItem>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="hrm8-only">HRM8 only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={distributionFilter} onValueChange={(value: DistributionFilter) => setDistributionFilter(value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Distribution state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All distribution states</SelectItem>
                <SelectItem value="launch-pending">Launch pending</SelectItem>
                <SelectItem value="sync-needed">Sync needed</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="hrm8-only">HRM8 only</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={syncFilter} onValueChange={(value: SyncFilter) => setSyncFilter(value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Sync state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sync states</SelectItem>
                <SelectItem value="synced">Synced</SelectItem>
                <SelectItem value="not-synced">Not synced</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
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

            <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="posted">Sort by posted time</SelectItem>
                <SelectItem value="clicks">Sort by clicks</SelectItem>
                <SelectItem value="applies">Sort by applies</SelectItem>
                <SelectItem value="title">Sort by title</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-border/60 px-2.5 py-1 text-[10px] text-muted-foreground">
              <Checkbox
                checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                onCheckedChange={(checked) => handleToggleVisible(Boolean(checked))}
              />
              Select visible
            </div>
            <Badge variant="outline" className="rounded-full text-[10px]">{filteredRows.length} shown</Badge>
            <Badge variant="outline" className="rounded-full text-[10px]">{siteOptions.length} board types</Badge>
            {isDistributionLoading ? (
              <Badge variant="outline" className="rounded-full text-[10px]">Refreshing distribution…</Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {filteredRows.length === 0 ? (
        <Card className="border-border/60 shadow-none">
          <CardContent className="flex flex-col items-center justify-center gap-2 px-3 py-10 text-center">
            <Globe2 className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">No published jobs match the current filters.</p>
            <p className="text-xs text-muted-foreground">Adjust one or more filters to bring rows back into view.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginatedRows.map((row) => (
            <PublishedJobRow
              key={row.job.id}
              row={row}
              selected={selectedJobIds.includes(row.job.id)}
              isRefreshing={refreshingJobId === row.job.id}
              onToggleSelected={(checked) => {
                if (checked) {
                  onSelectedJobIdsChange(Array.from(new Set([...selectedJobIds, row.job.id])));
                  return;
                }
                onSelectedJobIdsChange(selectedJobIds.filter((id) => id !== row.job.id));
              }}
              onPrimaryAction={() => void handlePrimaryAction(row)}
              onOpenDetails={() => {
                if (row.primaryAction === 'complete_setup') {
                  onOpenSetup(row.job);
                  return;
                }
                onNavigateToJob(row.job);
              }}
              onRowClick={() => {
                if (row.primaryAction === 'complete_setup') {
                  onOpenSetup(row.job);
                  return;
                }
                void loadJobDrawer(row.job, false);
              }}
              onContextMenu={onRowContextMenu ? (event) => onRowContextMenu(row.job, event) : undefined}
              onDragStart={onRowDragStart ? (event) => onRowDragStart(row.job, event) : undefined}
            />
          ))}

          <Card className="border-border/60 shadow-none">
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
              Hiring state, JobTarget board performance, sync health, and attribution in one place.
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
                onJobUpdated={(nextJob) => setSelectedJob(nextJob)}
              />
            ) : (
              <Card className="border-border/60 shadow-none">
                <CardContent className="p-4 text-sm text-muted-foreground">
                  Loading job details...
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
          onJobUpdated={(nextJob) => setSelectedJob(nextJob)}
          onViewDetails={() => setPromotionDialogOpen(false)}
          onSuccess={(distribution) => {
            if (distribution && selectedJob) {
              setSelectedDistribution(demoDistribution(selectedJob, distribution));
            }
            void onRefreshJob(selectedJob.id);
          }}
        />
      ) : null}
    </div>
  );
}
