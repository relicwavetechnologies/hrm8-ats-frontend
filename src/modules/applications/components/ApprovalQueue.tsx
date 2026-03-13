/**
 * HR approval queue for consultant offer/reject requests (HRM8-managed jobs).
 * Shows pending requests and allows HR to approve or reject.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { Check, X, Clock, User } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/shared/hooks/use-toast';
import { decisionRequestService, type DecisionRequest } from '@/shared/lib/decisionRequestService';
import { format } from 'date-fns';

interface ApprovalQueueProps {
  jobId?: string;
  onRequestApproved?: () => void;
}

export function ApprovalQueue({ jobId, onRequestApproved }: ApprovalQueueProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchRequests = jobId
    ? () => decisionRequestService.listByJob(jobId, 'PENDING')
    : () => decisionRequestService.listByCompany('PENDING');

  const { data, isLoading } = useQuery({
    queryKey: ['decision-requests', jobId ?? 'company', 'PENDING'],
    queryFn: async () => {
      const res = await fetchRequests();
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch');
      return res.data.requests || [];
    },
  });

  const pendingRequests = (data || []) as DecisionRequest[];

  const handleApprove = async (requestId: string) => {
    const res = await decisionRequestService.approve(requestId);
    if (res.success) {
      toast({ title: 'Approved', description: 'The move has been executed.' });
      queryClient.invalidateQueries({ queryKey: ['decision-requests'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      onRequestApproved?.();
    } else {
      toast({ title: 'Error', description: res.error || 'Failed to approve', variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    if (!rejectReason.trim()) {
      toast({ title: 'Reason required', description: 'Please provide a reason for rejection.', variant: 'destructive' });
      return;
    }
    const res = await decisionRequestService.reject(rejectingId, rejectReason.trim());
    if (res.success) {
      toast({ title: 'Rejected', description: 'The consultant has been notified.' });
      setRejectingId(null);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['decision-requests'] });
      onRequestApproved?.();
    } else {
      toast({ title: 'Error', description: res.error || 'Failed to reject', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (pendingRequests.length === 0) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Consultant Decisions
              </CardTitle>
              <CardDescription>
                Review and approve or reject consultant requests to offer or reject candidates.
              </CardDescription>
            </div>
            <Badge variant="secondary">{pendingRequests.length} pending</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingRequests.map((req) => {
            const candidateName = req.application?.candidate
              ? `${req.application.candidate.first_name || ''} ${req.application.candidate.last_name || ''}`.trim() || 'Candidate'
              : 'Candidate';
            const consultantName = req.consultant
              ? `${req.consultant.first_name || ''} ${req.consultant.last_name || ''}`.trim() || 'Consultant'
              : 'Consultant';

            return (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{candidateName}</span>
                    <Badge variant="outline">{req.action}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Requested by {consultantName} · {format(new Date(req.requested_at), 'MMM d, yyyy HH:mm')}
                  </p>
                  {req.reason && (
                    <p className="text-sm text-muted-foreground italic">&ldquo;{req.reason}&rdquo;</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="default" onClick={() => handleApprove(req.id)}>
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRejectingId(req.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <AlertDialog open={!!rejectingId} onOpenChange={(open) => !open && setRejectingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject request</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason. The consultant will see this when their request is rejected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} disabled={!rejectReason.trim()}>
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
