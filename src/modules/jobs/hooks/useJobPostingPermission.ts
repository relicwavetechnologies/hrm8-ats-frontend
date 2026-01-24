/**
 * Hook to check if current user can post jobs
 */

import { useAuth } from '@/app/AuthProvider';

export function useJobPostingPermission() {
  const { user } = useAuth();

  const canPostJobs = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const loading = !user;

  return {
    canPostJobs,
    loading,
  };
}




