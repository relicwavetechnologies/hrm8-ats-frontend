import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ShieldCheck, Plus, AlertCircle } from 'lucide-react';
import { BackgroundCheckWizard } from '@/modules/background-checks/components/BackgroundCheckWizard';
import { getBackgroundChecksByCandidate } from '@/shared/lib/mockBackgroundCheckStorage';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';
import { format } from 'date-fns';

interface BackgroundChecksTabProps {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
}

export function BackgroundChecksTab({ candidateId, candidateName, candidateEmail }: BackgroundChecksTabProps) {
  const [checks, setChecks] = useState<BackgroundCheck[]>(() => getBackgroundChecksByCandidate(candidateId));
  const [wizardOpen, setWizardOpen] = useState(false);

  const handleWizardComplete = () => {
    setChecks(getBackgroundChecksByCandidate(candidateId));
  };

  const getStatusBadge = (status: BackgroundCheck['status']) => {
    const variants = {
      'not-started': 'secondary',
      'pending-consent': 'warning',
      'in-progress': 'default',
      'completed': 'success',
      'issues-found': 'destructive',
      'cancelled': 'secondary'
    };
    return <Badge variant={variants[status] as any}>{status.replace('-', ' ')}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Background Checks</h3>
          <p className="text-sm text-muted-foreground">
            View and manage background check requests for this candidate
          </p>
        </div>
        <Button onClick={() => setWizardOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Start Verification
        </Button>
      </div>

      {checks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShieldCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Background Checks</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              No background checks have been initiated for this candidate yet
            </p>
            <Button onClick={() => setWizardOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Initiate Background Check
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {checks.map((check) => (
            <Card key={check.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {check.checkTypes.length} Check{check.checkTypes.length !== 1 ? 's' : ''} • {check.provider}
                  </CardTitle>
                  {getStatusBadge(check.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Initiated by:</span>
                    <div className="font-medium">{check.initiatedByName}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <div className="font-medium">{format(new Date(check.initiatedDate), 'PPP')}</div>
                  </div>
                </div>
                {check.totalCost && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Total Cost</span>
                    <span className="font-semibold">${check.totalCost}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BackgroundCheckWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        candidateId={candidateId}
        candidateName={candidateName}
        candidateEmail={candidateEmail}
        onComplete={handleWizardComplete}
      />
    </div>
  );
}
