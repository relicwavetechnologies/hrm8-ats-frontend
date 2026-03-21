import { useEffect, useMemo, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  ExternalLink,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { BoardBrandBadge } from '@/shared/components/ui/board-brand-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { useToast } from '@/shared/hooks/use-toast';
import { jobService } from '@/shared/lib/jobService';
import type { Job, JobTargetDistributionDetail, JobTargetEasyApplyReadiness } from '@/shared/types/job';

type LaunchStep = 'review' | 'sync' | 'results';

interface ExternalPromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
  onSuccess?: (distribution?: JobTargetDistributionDetail | null) => void;
  onViewDetails?: () => void;
  onJobUpdated?: (job: Job) => void;
}

const DEFAULT_EASY_APPLY_CONFIG = {
  enabled: false,
  type: 'full' as const,
  hostedApply: false,
  questionnaireEnabled: false,
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
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return formatDistanceToNow(date, { addSuffix: true });
}

function getFallbackEasyApplyReadiness(job: Job): JobTargetEasyApplyReadiness {
  const config = job.globalPublishConfig?.easyApplyConfig;
  const enabled = Boolean(config?.enabled);
  const questionnaireEnabled = enabled && Boolean(config?.questionnaireEnabled);

  return {
    enabled,
    type: config?.type === 'basic' ? 'basic' : 'full',
    hostedApply: enabled ? Boolean(config?.hostedApply) : false,
    questionnaireEnabled,
    questionnaireReady: questionnaireEnabled,
    deliveryReady: enabled,
    issues: [],
  };
}

function getCurrentFeedWarning(job: Job, explicitWarning?: string) {
  if (explicitWarning) return explicitWarning;
  const lastError = String(job.jobTargetSync?.lastError || '').trim();
  if (lastError.includes('JobTarget company feed failed')) {
    return 'Company feed setup needs attention. Marketplace launch can still continue.';
  }
  return undefined;
}

function StepPill({
  label,
  active,
  complete,
}: {
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div
      className={[
        'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs',
        active ? 'border-primary/40 bg-primary/10 text-foreground' : 'border-border/60 text-muted-foreground',
      ].join(' ')}
    >
      {complete ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Circle className="h-3.5 w-3.5" />}
      <span>{label}</span>
    </div>
  );
}

function TimelineItem({
  label,
  detail,
  active,
  complete,
}: {
  label: string;
  detail: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div className="flex gap-2.5">
      <div className="flex flex-col items-center">
        <div
          className={[
            'flex h-6 w-6 items-center justify-center rounded-full border',
            active ? 'border-primary/50 bg-primary/12 text-primary' : 'border-border/60 bg-background text-muted-foreground',
          ].join(' ')}
        >
          {complete ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Circle className="h-3 w-3" />}
        </div>
        <div className="mt-1.5 h-full min-h-6 w-px bg-border/70" />
      </div>
      <div className="min-w-0 pb-3">
        <p className={['text-xs font-medium', active ? 'text-foreground' : 'text-muted-foreground'].join(' ')}>{label}</p>
        <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function CompactStat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  tone?: 'default' | 'success' | 'warning' | 'accent';
}) {
  const toneClass = tone === 'success'
    ? 'bg-emerald-50/80 dark:bg-emerald-950/30'
    : tone === 'warning'
      ? 'bg-amber-50/80 dark:bg-amber-950/30'
      : tone === 'accent'
        ? 'bg-sky-50/80 dark:bg-sky-950/30'
        : 'bg-muted/40';

  return (
    <div className={`rounded-lg border border-border/60 px-2.5 py-2 ${toneClass}`}>
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xs font-semibold">{value}</p>
    </div>
  );
}

function ResultPostingCard({ posting }: { posting: JobTargetDistributionDetail['postings'][number] }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <BoardBrandBadge
              siteName={posting.siteName || 'Job board'}
              className="max-w-full rounded-full px-1.5 py-0.5"
              iconClassName="h-4 w-4 text-[9px]"
              labelClassName="max-w-[180px] text-[11px]"
            />
            <Badge variant="outline" className="h-5 rounded-full px-2 text-[10px]">
              {posting.status || 'Pending'}
            </Badge>
            {posting.easyApply ? (
              <Badge className="h-5 rounded-full bg-sky-100 px-2 text-[10px] text-sky-700 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300">
                Easy Apply
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {posting.createdAt ? `Created ${formatRelative(posting.createdAt)}` : 'Created time unavailable'}
            {posting.expiredAt ? ` • Expires ${formatRelative(posting.expiredAt)}` : ''}
          </p>
        </div>

        {posting.viewUrl ? (
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" asChild>
            <a href={posting.viewUrl} target="_blank" rel="noreferrer">
              Open
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </Button>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-border/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Clicks</p>
          <p className="mt-1 text-sm font-semibold">{posting.analytics.clicks}</p>
        </div>
        <div className="rounded-lg border border-border/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Applies</p>
          <p className="mt-1 text-sm font-semibold">{posting.analytics.apps}</p>
        </div>
        <div className="rounded-lg border border-border/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Spend</p>
          <p className="mt-1 text-sm font-semibold">${Math.round(posting.totalCost || posting.postingCost || 0)}</p>
        </div>
      </div>
    </div>
  );
}

export function ExternalPromotionDialog({
  open,
  onOpenChange,
  job,
  onSuccess,
  onViewDetails,
  onJobUpdated,
}: ExternalPromotionDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<LaunchStep>('review');
  const [launching, setLaunching] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [marketplaceUrl, setMarketplaceUrl] = useState<string | null>(null);
  const [marketplaceOpened, setMarketplaceOpened] = useState(false);
  const [launchedAt, setLaunchedAt] = useState<number | null>(null);
  const [resultDistribution, setResultDistribution] = useState<JobTargetDistributionDetail | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);
  const [feedWarning, setFeedWarning] = useState<string | undefined>();
  const [easyApplyReadiness, setEasyApplyReadiness] = useState<JobTargetEasyApplyReadiness>(() => getFallbackEasyApplyReadiness(job));
  const [easyApplyDraft, setEasyApplyDraft] = useState(() => getEasyApplyConfig(job));
  const [savedEasyApplyConfig, setSavedEasyApplyConfig] = useState(() => getEasyApplyConfig(job));
  const [savingEasyApply, setSavingEasyApply] = useState(false);
  const [diagnostics, setDiagnostics] = useState<{
    remoteCompanyId?: string;
    feedUrl?: string;
    feedLastSyncedAt?: string;
    feedLastAttemptAt?: string;
    feedLastError?: string;
    feedLastStatus?: number;
    feedRegistrationState?: 'NEVER_REGISTERED' | 'REGISTERED' | 'INVALID';
    feedState?: 'READY' | 'NOT_ENABLED_BY_JOBTARGET' | 'SYNCING' | 'ERROR';
  } | null>(null);
  const autoSyncAttemptedRef = useRef(false);

  const sync = job.jobTargetSync;
  const isGlobal = job.distributionScope === 'GLOBAL';
  const currentFeedWarning = getCurrentFeedWarning(job, feedWarning);
  const hasEasyApplyIssues = easyApplyReadiness.enabled && easyApplyReadiness.issues.length > 0;
  const hasPurchasedSites = (resultDistribution?.postings.length || 0) > 0;
  const hasEasyApplyChanges = JSON.stringify(easyApplyDraft) !== JSON.stringify(savedEasyApplyConfig);

  const closeDialog = (withSuccess = false) => {
    if (withSuccess) {
      onSuccess?.(resultDistribution);
    }
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) {
      setStep('review');
      setLaunching(false);
      setSyncing(false);
      setMarketplaceUrl(null);
      setMarketplaceOpened(false);
      setLaunchedAt(null);
      setResultDistribution(null);
      setResultError(null);
      setFeedWarning(undefined);
      setEasyApplyReadiness(getFallbackEasyApplyReadiness(job));
      setEasyApplyDraft(getEasyApplyConfig(job));
      setSavedEasyApplyConfig(getEasyApplyConfig(job));
      setSavingEasyApply(false);
      setDiagnostics(null);
      autoSyncAttemptedRef.current = false;
      return;
    }

    setEasyApplyReadiness(getFallbackEasyApplyReadiness(job));
    setEasyApplyDraft(getEasyApplyConfig(job));
    setSavedEasyApplyConfig(getEasyApplyConfig(job));
  }, [job, open]);

  const saveEasyApplyConfig = async (silent = false) => {
    setSavingEasyApply(true);
    try {
      const response = await jobService.updateJob(job.id, {
        distributionScope: job.distributionScope || 'HRM8_ONLY',
        globalPublishConfig: buildGlobalPublishConfig(job, easyApplyDraft),
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Unable to save Easy Apply settings right now.');
      }

      setSavedEasyApplyConfig(easyApplyDraft);
      setEasyApplyReadiness(getFallbackEasyApplyReadiness(response.data));
      onJobUpdated?.(response.data);

      if (!silent) {
        toast({
          title: 'Easy Apply updated',
          description: 'JobTarget settings were saved and will be used on the next launch or sync.',
        });
      }

      return response.data;
    } catch (error: any) {
      if (!silent) {
        toast({
          title: 'Unable to save Easy Apply',
          description: error?.message || 'Try again in a moment.',
          variant: 'destructive',
        });
      }
      throw error;
    } finally {
      setSavingEasyApply(false);
    }
  };

  const handleSync = async (source: 'manual' | 'auto' = 'manual') => {
    setSyncing(true);
    setResultError(null);

    try {
      const response = await jobService.refreshJobDistribution(job.id);
      if (!response.success || !response.data?.distribution) {
        throw new Error(response.error || 'Unable to sync JobTarget results right now.');
      }

      setResultDistribution(response.data.distribution);
      setStep('results');

      if (source === 'manual') {
        toast({
          title: response.data.distribution.postings.length > 0 ? 'Posting results synced' : 'No postings found yet',
          description: response.data.distribution.postings.length > 0
            ? 'HRM8 pulled the latest sites and posting statuses from JobTarget.'
            : 'No postings were returned yet. This usually means nothing was purchased yet or JobTarget is still processing.',
        });
      }
    } catch (error: any) {
      const message = error?.message || 'Unable to sync JobTarget results right now.';
      setResultError(message);
      setStep('sync');

      if (source === 'manual') {
        toast({
          title: 'Sync failed',
          description: message,
          variant: 'destructive',
        });
      }
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (!open || step !== 'sync' || !marketplaceOpened || autoSyncAttemptedRef.current) return;

    const attemptAutoSync = () => {
      if (document.visibilityState === 'hidden' || autoSyncAttemptedRef.current) return;
      autoSyncAttemptedRef.current = true;
      void handleSync('auto');
    };

    window.addEventListener('focus', attemptAutoSync);
    document.addEventListener('visibilitychange', attemptAutoSync);

    return () => {
      window.removeEventListener('focus', attemptAutoSync);
      document.removeEventListener('visibilitychange', attemptAutoSync);
    };
  }, [marketplaceOpened, open, step]);

  const handleLaunch = async () => {
    if (!isGlobal) {
      toast({
        title: 'Global publish required',
        description: 'Switch this job to GLOBAL publish scope before launching JobTarget Marketplace.',
        variant: 'destructive',
      });
      return;
    }

    const launchWindow = window.open('', '_blank');
    if (!launchWindow) {
      toast({
        title: 'Pop-up blocked',
        description: 'Allow pop-ups for HRM8 to open JobTarget Marketplace in a new tab.',
        variant: 'destructive',
      });
      return;
    }

    setLaunching(true);
    setResultError(null);

    try {
      if (hasEasyApplyChanges) {
        await saveEasyApplyConfig(true);
      }

      const response = await jobService.createJobTargetSession(job.id);
      if (!response.success || !response.data?.session?.url) {
        throw new Error(response.error || 'Failed to generate JobTarget marketplace session');
      }

      const session = response.data.session;
      const launchUrl = session.launchUrl || session.url;
      if (!launchUrl) {
        throw new Error('Marketplace URL unavailable');
      }
      setMarketplaceUrl(launchUrl);
      setMarketplaceOpened(true);
      setLaunchedAt(Date.now());
      setStep('sync');
      setFeedWarning(session.warnings?.[0] || session.feedWarning);
      setDiagnostics(session.diagnostics ? { ...session.diagnostics, feedState: session.feedState === 'PENDING_ENABLEMENT' ? 'NOT_ENABLED_BY_JOBTARGET' : session.feedState } : null);
      if (session.easyApplyReadiness) {
        setEasyApplyReadiness(session.easyApplyReadiness);
      }

      launchWindow.opener = null;
      launchWindow.location.href = launchUrl;

      toast({
        title: 'Marketplace opened',
        description: 'Complete board selection and checkout in JobTarget, then return here and sync.',
      });
    } catch (error: any) {
      launchWindow.close();
      toast({
        title: 'Launch failed',
        description: error?.message || 'Unable to open JobTarget Marketplace right now.',
        variant: 'destructive',
      });
    } finally {
      setLaunching(false);
    }
  };

  const feedStatusTone = useMemo(() => {
    if (!currentFeedWarning) return 'border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/30';
    return 'border-amber-200 bg-amber-50/70 dark:bg-amber-950/30';
  }, [currentFeedWarning]);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen && resultDistribution) {
        closeDialog(true);
        return;
      }
      onOpenChange(nextOpen);
    }}>
      <DialogContent className="max-h-[86vh] w-[min(1040px,calc(100vw-32px))] max-w-5xl overflow-y-auto border-border/70 p-0">
        <DialogHeader>
          <div className="border-b border-border/70 px-5 py-4">
            <DialogTitle>
              {step === 'review' ? 'Launch JobTarget' : step === 'sync' ? 'Return And Sync' : 'Posting Results'}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs">
              One flow inside HRM8: review, launch, come back, sync, and confirm what was actually posted.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="grid gap-0 lg:grid-cols-[210px_1fr]">
          <div className="border-b border-border/70 bg-muted/10 px-4 py-4 lg:border-b-0 lg:border-r">
            <div className="mb-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Timeline</p>
              <p className="mt-1 line-clamp-2 text-xs font-semibold">{job.title}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {marketplaceOpened
                  ? `Marketplace opened ${launchedAt ? formatDistanceToNow(launchedAt, { addSuffix: true }) : 'recently'}.`
                  : 'Start posting from here and keep HRM8 open.'}
              </p>
            </div>

            <div className="space-y-0.5">
              <TimelineItem
                label="Review"
                detail="Launch from HRM8."
                active={step === 'review'}
                complete={step !== 'review'}
              />
              <TimelineItem
                label="Launch + return"
                detail="Finish checkout in JobTarget."
                active={step === 'sync'}
                complete={step === 'results'}
              />
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={['flex h-7 w-7 items-center justify-center rounded-full border', step === 'results' ? 'border-primary/50 bg-primary/12 text-primary' : 'border-border/60 bg-background text-muted-foreground'].join(' ')}>
                    {hasPurchasedSites ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-3.5 w-3.5" />}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className={['text-sm font-medium', step === 'results' ? 'text-foreground' : 'text-muted-foreground'].join(' ')}>Confirm results</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">See what actually posted.</p>
                </div>
              </div>
            </div>

            {currentFeedWarning ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2.5 text-[11px] dark:bg-amber-950/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-amber-600" />
                  <div>
                    <p className="font-medium text-foreground">Feed setup needs attention</p>
                    <p className="mt-1 text-muted-foreground">Launch still works. Feed registration is tracked separately.</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="bg-background px-5 py-4">
            {step === 'review' ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Launch marketplace</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Open JobTarget in a new tab to choose boards and complete checkout. After that, return to this same modal and sync the result back into HRM8.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="line-clamp-1 text-sm font-medium">{job.title}</p>
                    </div>
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {sync?.remoteJobId ? 'Ready to relaunch' : 'First launch'}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <CompactStat label="Current sync" value={sync?.syncStatus || 'NOT_SYNCED'} />
                    <CompactStat label="Remote job" value={sync?.remoteJobId || 'Not created yet'} tone="accent" />
                    <CompactStat label="Last activity" value={formatRelative(sync?.lastSyncedAt ? String(sync.lastSyncedAt) : null)} />
                  </div>
                </div>

                <Card className="border-border/60 shadow-none">
                  <CardHeader className="px-4 pt-4 pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-sm font-semibold">Easy Apply</CardTitle>
                        <CardDescription className="text-xs">
                          Configure this before launch. Changes are saved automatically when you open JobTarget.
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="rounded-full text-[10px]">
                        {easyApplyDraft.enabled ? 'Enabled' : 'Off'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-3 px-4 pb-4 pt-0">
                    <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-3">
                      <div>
                        <p className="text-sm font-medium">Enable Easy Apply</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Let supported boards keep candidates on-platform and deliver completed applications back to HRM8.
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
                        disabled={launching || savingEasyApply}
                      />
                    </div>

                    {easyApplyDraft.enabled ? (
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Type</p>
                          <Select
                            value={easyApplyDraft.type}
                            onValueChange={(value: 'basic' | 'full') =>
                              setEasyApplyDraft((current) => ({ ...current, type: value }))
                            }
                            disabled={launching || savingEasyApply}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="full">Full</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-3">
                          <div>
                            <p className="text-sm font-medium">Hosted Apply</p>
                            <p className="mt-1 text-[11px] text-muted-foreground">Use hosted-apply behavior where supported.</p>
                          </div>
                          <Switch
                            checked={!!easyApplyDraft.hostedApply}
                            onCheckedChange={(next) =>
                              setEasyApplyDraft((current) => ({ ...current, hostedApply: !!next }))
                            }
                            disabled={launching || savingEasyApply}
                          />
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-3">
                          <div>
                            <p className="text-sm font-medium">Use HRM8 Questions</p>
                            <p className="mt-1 text-[11px] text-muted-foreground">Include questionnaire webhook support.</p>
                          </div>
                          <Switch
                            checked={!!easyApplyDraft.questionnaireEnabled}
                            onCheckedChange={(next) =>
                              setEasyApplyDraft((current) => ({ ...current, questionnaireEnabled: !!next }))
                            }
                            disabled={launching || savingEasyApply}
                          />
                        </div>
                      </div>
                    ) : null}

                    {hasEasyApplyChanges ? (
                      <div className="rounded-xl border border-sky-200 bg-sky-50/80 px-3 py-2 text-[11px] text-sky-700 dark:bg-sky-950/30 dark:text-sky-200">
                        These Easy Apply changes will be saved before JobTarget opens.
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {step === 'sync' ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Return here to sync</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Finish checkout in JobTarget, then sync here to see whether postings were actually created. We also check once automatically when you return.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Marketplace opened</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Select boards and complete checkout in JobTarget</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Return here and click sync</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <CompactStat label="Sync" value={sync?.syncStatus || 'NOT_SYNCED'} />
                  <CompactStat label="Remote job" value={sync?.remoteJobId || 'Not created yet'} tone="accent" />
                  <CompactStat
                    label="Feed state"
                    value={
                      diagnostics?.feedState === 'NOT_ENABLED_BY_JOBTARGET'
                        ? 'Awaiting mapping'
                        : diagnostics?.feedState === 'READY'
                          ? 'Ready'
                          : diagnostics?.feedState === 'ERROR'
                            ? 'Needs attention'
                            : diagnostics?.feedRegistrationState || 'Pending'
                    }
                    tone={currentFeedWarning ? 'warning' : 'default'}
                  />
                  <CompactStat label="Feed attempt" value={formatRelative(diagnostics?.feedLastAttemptAt)} />
                </div>

                <div className={`rounded-2xl border px-4 py-4 ${feedStatusTone}`}>
                  <div className="flex items-start gap-3">
                    {currentFeedWarning ? <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" /> : <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Company feed</p>
                      <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                        {currentFeedWarning
                          ? 'Marketplace launch still works. The company feed registration used for automatic parity needs admin follow-up.'
                          : 'Company sync is healthy. Feed registration is tracked separately from this posting action.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/10 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Easy Apply readiness</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Status only. HRM8 still controls questionnaire and application delivery webhooks.
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {easyApplyReadiness.enabled ? 'Enabled' : 'Off'}
                    </Badge>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <CompactStat
                      label="Questionnaire"
                      value={!easyApplyReadiness.enabled ? 'Not needed' : easyApplyReadiness.questionnaireEnabled ? (easyApplyReadiness.questionnaireReady ? 'Configured' : 'Needs attention') : 'Not enabled'}
                    />
                    <CompactStat
                      label="Delivery"
                      value={!easyApplyReadiness.enabled ? 'Not needed' : easyApplyReadiness.deliveryReady ? 'Configured' : 'Needs attention'}
                      tone={hasEasyApplyIssues ? 'warning' : 'success'}
                    />
                    <CompactStat label="Mode" value={easyApplyReadiness.enabled ? easyApplyReadiness.type : 'Standard apply'} />
                  </div>

                  {hasEasyApplyIssues ? (
                    <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-[11px] dark:bg-amber-950/30">
                      {easyApplyReadiness.issues.join(' ')}
                    </div>
                  ) : null}
                </div>

                {resultError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-3 text-sm dark:bg-rose-950/30">
                    <p className="font-medium">Sync failed</p>
                    <p className="mt-1 text-muted-foreground">{resultError}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === 'results' ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Posting results</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {hasPurchasedSites
                        ? 'These sites were returned by JobTarget after sync.'
                        : 'Nothing came back yet. That usually means nothing was purchased yet or JobTarget is still processing the order.'}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    {formatRelative(resultDistribution?.sync.postingsLastRefreshedAt || resultDistribution?.sync.lastSyncedAt || null)}
                  </Badge>
                </div>

                <div className="grid gap-2 sm:grid-cols-4">
                  <CompactStat label="Boards live" value={resultDistribution?.rollups.activePostingCount || 0} tone="success" />
                  <CompactStat label="Clicks" value={resultDistribution?.rollups.totalClicks || 0} tone="accent" />
                  <CompactStat label="Applies" value={resultDistribution?.rollups.totalApplies || 0} tone="warning" />
                  <CompactStat label="Sync" value={resultDistribution?.sync.syncStatus || 'SYNCED'} />
                </div>

                {hasPurchasedSites ? (
                  <div className="space-y-2">
                    {resultDistribution?.postings.slice(0, 4).map((posting) => (
                      <ResultPostingCard key={posting.id} posting={posting} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/70 px-4 py-6 text-center">
                    <p className="text-sm font-medium">No postings purchased yet</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      You can sync again in a moment if checkout just finished.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 px-5 py-3">
          <div className="text-xs text-muted-foreground">
            {marketplaceOpened ? 'One modal, one timeline, one return path back into HRM8.' : 'Launch opens JobTarget in a new tab and keeps this modal open.'}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {step === 'review' ? (
              <>
                <Button variant="outline" onClick={() => closeDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleLaunch} disabled={launching || savingEasyApply || !isGlobal}>
                  {launching || savingEasyApply ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                  Launch Marketplace
                </Button>
              </>
            ) : null}

            {step === 'sync' ? (
              <>
                <Button variant="outline" onClick={() => setStep('review')}>
                  Back to review
                </Button>
                {marketplaceUrl ? (
                  <Button variant="outline" onClick={() => window.open(marketplaceUrl, '_blank', 'noopener,noreferrer')}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open JobTarget again
                  </Button>
                ) : null}
                <Button onClick={() => void handleSync('manual')} disabled={syncing}>
                  {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                  Sync now
                </Button>
              </>
            ) : null}

            {step === 'results' ? (
              <>
                {onViewDetails ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onViewDetails();
                      closeDialog(true);
                    }}
                  >
                    Open full distribution details
                  </Button>
                ) : null}
                <Button variant="outline" onClick={() => void handleSync('manual')} disabled={syncing}>
                  {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                  Sync again
                </Button>
                <Button onClick={() => closeDialog(true)}>Done</Button>
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
