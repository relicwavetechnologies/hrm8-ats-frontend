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
  selectedStatus: string,
  page: number,
  refreshKey: number
): JobsListResult {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['jobs-list', selectedStatus, page, refreshKey],
    queryFn: async () => {
      const filters: { status?: JobStatus; page: number; limit: number } = {
        page,
        limit: JOBS_PAGE_SIZE,
      };
      if (selectedStatus && selectedStatus !== 'all') {
        filters.status = STATUS_MAP[selectedStatus] ?? (selectedStatus.toUpperCase() as JobStatus);
      }
      const response = await jobService.getJobs(filters);
      if (!response.success || !response.data) {
        throw new Error(response.error ?? 'Failed to fetch jobs');
      }
      const { jobs: rawJobs = [], total = 0, stats } = response.data;
      const jobs = Array.isArray(rawJobs) ? rawJobs.map(mapBackendJobToFrontend) : [];
      return { jobs, total, stats: stats ?? null };
    },
    staleTime: 2 * 60 * 1000,
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
