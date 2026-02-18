import { useQuery } from '@tanstack/react-query';
import { jobService, JobStatus } from '@/shared/lib/jobService';
import { mapBackendJobToFrontend } from '@/shared/lib/jobDataMapper';
import { Job } from '@/shared/types/job';

const JOBS_PAGE_SIZE = 50;
const STATUS_MAP: Record<string, JobStatus> = {
  draft: 'DRAFT',
  open: 'OPEN',
  closed: 'CLOSED',
  'on-hold': 'ON_HOLD',
  filled: 'FILLED',
  cancelled: 'CANCELLED',
  template: 'TEMPLATE',
};

export interface JobsListResult {
  jobs: Job[];
  total: number;
  stats: { total: number; active: number; filled: number; applicants: number } | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useJobsList(
  selectedStatus: string | null | undefined,
  page: number | null | undefined,
  refreshKey: number | null | undefined,
  enabled = true
): JobsListResult {
  const safeStatus = typeof selectedStatus === 'string' ? selectedStatus : 'all';
  const safePage =
    typeof page === 'number' && Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeRefreshKey =
    typeof refreshKey === 'number' && Number.isFinite(refreshKey) ? refreshKey : 0;

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['jobs-list', safeStatus, safePage, safeRefreshKey],
    queryFn: async () => {
      const filters: { status?: JobStatus; page: number; limit: number } = {
        page: safePage,
        limit: JOBS_PAGE_SIZE,
      };
      if (safeStatus !== 'all') {
        filters.status = STATUS_MAP[safeStatus] ?? (safeStatus.toUpperCase() as JobStatus);
      }

      const response = await jobService.getJobs(filters);
      if (!response.success || !response.data) {
        throw new Error(response.error ?? 'Failed to fetch jobs');
      }

      const payload = response.data as any;
      const rawJobs = Array.isArray(payload?.jobs) ? payload.jobs : [];
      const jobs = rawJobs
        .filter((job: unknown) => Boolean(job) && typeof job === 'object')
        .map((job: unknown) => {
          try {
            return mapBackendJobToFrontend(job);
          } catch (mapError) {
            console.warn('Skipping malformed job row from API response', mapError, job);
            return null;
          }
        })
        .filter((job: Job | null): job is Job => job !== null);

      const totalFromApi = Number(payload?.total);
      const total = Number.isFinite(totalFromApi) ? totalFromApi : jobs.length;
      const rawStats = payload?.stats;
      const stats =
        rawStats && typeof rawStats === 'object'
          ? {
              total: Number(rawStats.total || 0),
              active: Number(rawStats.active || 0),
              filled: Number(rawStats.filled || 0),
              applicants: Number(rawStats.applicants || 0),
            }
          : null;

      return { jobs, total, stats };
    },
    staleTime: 2 * 60 * 1000,
    enabled,
    placeholderData: (previousData) => previousData,
  });

  const jobs = data?.jobs ?? [];
  const total = data?.total ?? 0;
  const stats = data?.stats ?? null;

  return {
    jobs,
    total,
    stats,
    isLoading,
    isFetching,
    error: error as Error | null,
    refetch,
  };
}
