import type { Job } from '@/shared/types/job';

const STORAGE_KEY = 'hrm8.pending-job-setup';

type PendingJobSetupState = Record<string, string>;

function readState(): PendingJobSetupState {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as PendingJobSetupState;
  } catch {
    return {};
  }
}

function writeState(state: PendingJobSetupState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function markJobSetupPending(jobId: string) {
  if (!jobId) return;
  const state = readState();
  state[jobId] = new Date().toISOString();
  writeState(state);
}

export function clearJobSetupPending(jobId: string) {
  if (!jobId) return;
  const state = readState();
  if (!(jobId in state)) return;
  delete state[jobId];
  writeState(state);
}

export function isJobSetupPending(jobId?: string | null): boolean {
  if (!jobId) return false;
  const state = readState();
  return Boolean(state[jobId]);
}

export function isJobSetupComplete(job?: Pick<Job, 'id' | 'setupType' | 'managementType' | 'serviceType' | 'assignedConsultantId' | 'pendingConsultantAssignment' | 'advanceSetupComplete'> | null): boolean {
  if (!job?.id) return false;
  if (isJobSetupPending(job.id)) return false;

  const hasBaseSetup = Boolean(job.setupType && job.managementType);
  if (!hasBaseSetup) return false;

  const isManaged = ['shortlisting', 'full-service', 'executive-search'].includes(job.serviceType || '');
  const needsConsultant = isManaged && !job.assignedConsultantId;
  if (job.pendingConsultantAssignment || needsConsultant) return false;

  if (job.setupType === 'advanced') {
    return job.advanceSetupComplete === true;
  }

  return true;
}
