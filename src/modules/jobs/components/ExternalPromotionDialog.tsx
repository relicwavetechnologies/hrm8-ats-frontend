import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ExternalLink, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Job } from '@/shared/types/job';
import { useToast } from '@/shared/hooks/use-toast';
import { jobService } from '@/shared/lib/jobService';

interface ExternalPromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
  onSuccess?: () => void;
}

export function ExternalPromotionDialog({ open, onOpenChange, job, onSuccess }: ExternalPromotionDialogProps) {
  const [launching, setLaunching] = useState(false);
  const { toast } = useToast();

  const sync = job.jobTargetSync;
  const isGlobal = job.distributionScope === 'GLOBAL';

  const handleLaunch = async () => {
    if (!isGlobal) {
      toast({
        title: 'Global publish required',
        description: 'Switch this job to GLOBAL publish scope before launching JobTarget Marketplace.',
        variant: 'destructive',
      });
      return;
    }

    setLaunching(true);
    try {
      const response = await jobService.createJobTargetSession(job.id);
      if (!response.success || !response.data?.session?.url) {
        throw new Error(response.error || 'Failed to generate JobTarget marketplace session');
      }

      window.open(response.data.session.url, '_blank', 'noopener,noreferrer');
      toast({
        title: 'Marketplace launched',
        description: 'A fresh JobTarget marketplace session has been opened in a new tab.',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Launch failed',
        description: error?.message || 'Unable to open JobTarget Marketplace right now.',
        variant: 'destructive',
      });
    } finally {
      setLaunching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Launch in JobTarget Marketplace</DialogTitle>
          <DialogDescription>
            HRM8 will ensure company, user, and job sync are current, then generate a fresh SSO URL.
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Sync Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {sync?.syncStatus === 'SYNCED' ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              )}
              <span>Status: {sync?.syncStatus || 'NOT_SYNCED'}</span>
            </div>
            {sync?.remoteJobId && <p>Remote Job ID: {sync.remoteJobId}</p>}
            {sync?.lastError && <p className="text-destructive">Last Error: {sync.lastError}</p>}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleLaunch} disabled={launching || !isGlobal}>
            {launching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ExternalLink className="h-4 w-4 mr-2" />}
            Launch Marketplace
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
