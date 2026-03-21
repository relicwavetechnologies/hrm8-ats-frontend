import { formatDistanceToNow } from 'date-fns';
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock3,
  LineChart,
  RefreshCcw,
  Users,
} from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { BoardBrandBadge } from '@/shared/components/ui/board-brand-badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { cn } from '@/shared/lib/utils';
import type { PublishedJobDistributionState, PublishedJobListRow, PublishedJobSetupState } from '@/shared/types/job';

function formatRelative(value?: string | null) {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return formatDistanceToNow(date, { addSuffix: true });
}

function setupTone(state: PublishedJobSetupState) {
  switch (state) {
    case 'PENDING_CONSULTANT':
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200';
    case 'PENDING_SETUP':
      return 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-200';
    case 'ADVANCED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200';
    case 'SIMPLE':
      return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-200';
    default:
      return 'border-border bg-muted/50 text-muted-foreground';
  }
}

function distributionTone(state: PublishedJobDistributionState) {
  switch (state) {
    case 'LIVE':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200';
    case 'SYNC_NEEDED':
      return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200';
    case 'LAUNCH_PENDING':
      return 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-200';
    case 'CLOSED':
      return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200';
    default:
      return 'border-border bg-muted/50 text-muted-foreground';
  }
}

function setupLabel(state: PublishedJobSetupState) {
  switch (state) {
    case 'PENDING_CONSULTANT':
      return 'Pending consultant';
    case 'PENDING_SETUP':
      return 'Pending setup';
    case 'ADVANCED':
      return 'Advanced';
    case 'SIMPLE':
      return 'Simple';
    default:
      return 'Setup';
  }
}

function distributionLabel(state: PublishedJobDistributionState) {
  switch (state) {
    case 'HRM8_ONLY':
      return 'HRM8 only';
    case 'LAUNCH_PENDING':
      return 'Launch pending';
    case 'SYNC_NEEDED':
      return 'Sync needed';
    case 'LIVE':
      return 'Live';
    case 'CLOSED':
      return 'Closed';
  }
}

function primaryActionLabel(action?: PublishedJobListRow['primaryAction']) {
  switch (action) {
    case 'complete_setup':
      return 'Complete setup';
    case 'launch_marketplace':
      return 'Launch Marketplace';
    case 'sync':
      return 'Sync';
    case 'view_distribution':
      return 'View live distribution';
    default:
      return null;
  }
}

function SparkBars({
  values,
  colorClassName,
}: {
  values: number[];
  colorClassName: string;
}) {
  const safeValues = values.length > 0 ? values : [0, 0, 0, 0, 0, 0];
  const max = Math.max(...safeValues, 1);

  return (
    <div className="flex h-8 items-end gap-1">
      {safeValues.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className={cn('w-1.5 rounded-full', colorClassName)}
          style={{
            height: `${Math.max((value / max) * 100, value > 0 ? 18 : 6)}%`,
            opacity: 0.45 + index * 0.08,
          }}
        />
      ))}
    </div>
  );
}

type PublishedJobRowProps = {
  row: PublishedJobListRow;
  selected: boolean;
  isRefreshing: boolean;
  onToggleSelected: (checked: boolean) => void;
  onPrimaryAction: () => void;
  onOpenDetails: () => void;
  onRowClick: () => void;
  onContextMenu?: (event: React.MouseEvent) => void;
  onDragStart?: (event: React.DragEvent) => void;
};

export function PublishedJobRow({
  row,
  selected,
  isRefreshing,
  onToggleSelected,
  onPrimaryAction,
  onOpenDetails,
  onRowClick,
  onContextMenu,
  onDragStart,
}: PublishedJobRowProps) {
  const primaryLabel = primaryActionLabel(row.primaryAction);
  const activeSites = row.distribution?.activeSites || [];
  const rowMetricsMuted = row.distributionState === 'HRM8_ONLY';
  const postedAt = row.job.postingDate || row.job.createdAt;
  const lastRefresh = row.distribution?.lastPostingsRefreshAt || null;
  const mergedClicks = row.careerMetrics.applyClicks + (row.distribution?.totalClicks || 0);
  const mergedApplies = row.totals.totalAtsApplies;
  const distributionBadgeLabel =
    row.distribution?.trackingHealth?.status === 'ERROR'
      ? 'Tracking issue'
      : row.distribution?.feedState === 'NOT_ENABLED_BY_JOBTARGET'
        ? 'Feed pending'
        : distributionLabel(row.distributionState);
  const distributionBadgeTone =
    row.distribution?.trackingHealth?.status === 'ERROR'
      ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200'
      : row.distribution?.feedState === 'NOT_ENABLED_BY_JOBTARGET'
        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200'
        : distributionTone(row.distributionState);

  return (
    <Card
      className={cn(
        'border-border/60 bg-background shadow-none transition-colors hover:border-primary/30 hover:bg-muted/[0.03]',
        selected && 'border-primary/40 bg-primary/[0.04]'
      )}
      onClick={onRowClick}
      onContextMenu={onContextMenu}
      draggable={Boolean(onDragStart)}
      onDragStart={onDragStart}
    >
      <CardContent className="px-3 py-3">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,1fr)] xl:items-stretch">
          <div className="flex gap-3">
            <div className="pt-0.5" onClick={(event) => event.stopPropagation()}>
              <Checkbox checked={selected} onCheckedChange={(checked) => onToggleSelected(Boolean(checked))} />
            </div>

            <div className="min-w-0 space-y-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{row.job.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{row.job.employerName || 'Company'}</span>
                  <span>{row.job.location || 'Location not set'}</span>
                  <span className="capitalize">{row.job.employmentType}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                  {row.job.status}
                </Badge>
                <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                  {row.job.serviceType?.replaceAll('-', ' ') || 'Service'}
                </Badge>
                <Badge variant="outline" className={cn('rounded-full text-[10px]', setupTone(row.setupState))}>
                  {setupLabel(row.setupState)}
                </Badge>
                <Badge variant="outline" className="rounded-full text-[10px]">
                  {row.job.distributionScope === 'GLOBAL' ? 'Global' : 'HRM8 only'}
                </Badge>
                <Badge variant="outline" className={cn('rounded-full text-[10px]', distributionBadgeTone)}>
                  {distributionBadgeLabel}
                </Badge>
                {row.distribution?.easyApplyEnabled ? (
                  <Badge variant="outline" className="rounded-full border-sky-200 bg-sky-50 text-[10px] text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-200">
                    Easy Apply
                  </Badge>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  Posted {formatRelative(postedAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {row.job.applicantsCount || 0} applicants
                </span>
              </div>

            </div>
          </div>

          <div className="flex h-full flex-col gap-2 rounded-xl border border-border/60 bg-gradient-to-r from-background to-primary/[0.04] px-3 py-2.5 dark:to-primary/[0.08]">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-border/60 bg-emerald-50/70 px-2.5 py-2 dark:bg-emerald-950/30">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Boards</p>
                <p className="mt-1 text-sm font-semibold">{rowMetricsMuted ? '—' : row.distribution?.activePostingCount || 0}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-teal-50/70 px-2.5 py-2 dark:bg-teal-950/30">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Clicks</p>
                <p className="mt-1 text-sm font-semibold">{mergedClicks}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-amber-50/80 px-2.5 py-2 dark:bg-amber-950/30">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Applies</p>
                <p className="mt-1 text-sm font-semibold">{mergedApplies}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/80 px-2.5 py-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Refresh</p>
                <p className="mt-1 truncate text-xs font-medium">
                  {rowMetricsMuted ? 'Not applicable' : formatRelative(lastRefresh)}
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-background/80 px-2.5 py-2">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Traffic trend</p>
                  <LineChart className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <SparkBars values={row.careerViewSeries} colorClassName="bg-teal-500 dark:bg-teal-400" />
              </div>
              <div className="rounded-lg border border-border/60 bg-background/80 px-2.5 py-2">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">ATS applies (7d)</p>
                  <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <SparkBars values={row.atsApplySeries} colorClassName="bg-amber-500 dark:bg-amber-400" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span>Row totals merge HRM8 and JobTarget activity</span>
              {row.totals.otherAtsApplies > 0 ? <span>+{row.totals.otherAtsApplies} other applies</span> : null}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-t border-border/60 pt-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {activeSites.map((site) => (
              <BoardBrandBadge
                key={site}
                siteName={site}
                className="h-7 px-2 py-0.5"
                iconClassName="h-5 w-5 text-[10px]"
                labelClassName="max-w-[140px] text-[11px]"
              />
            ))}
            {row.distribution?.syncStatus ? (
              <Badge variant="outline" className="h-7 rounded-full px-2.5 text-[10px]">
                {row.distribution.syncStatus.replaceAll('_', ' ')}
              </Badge>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {primaryLabel ? (
              <Button
                size="sm"
                variant={row.primaryAction === 'complete_setup' ? 'default' : row.primaryAction === 'view_distribution' ? 'outline' : 'default'}
                className="h-8 gap-2 text-xs"
                onClick={(event) => {
                  event.stopPropagation();
                  onPrimaryAction();
                }}
                disabled={row.primaryAction === 'sync' && isRefreshing}
              >
                {row.primaryAction === 'complete_setup' ? <Briefcase className="h-3.5 w-3.5" /> : null}
                {row.primaryAction === 'launch_marketplace' ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
                {row.primaryAction === 'sync' ? <RefreshCcw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} /> : null}
                {row.primaryAction === 'view_distribution' ? <LineChart className="h-3.5 w-3.5" /> : null}
                {row.primaryAction === 'sync' && isRefreshing ? 'Syncing' : primaryLabel}
              </Button>
            ) : null}

            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1 text-xs"
              onClick={(event) => {
                event.stopPropagation();
                onOpenDetails();
              }}
            >
              Open details
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
