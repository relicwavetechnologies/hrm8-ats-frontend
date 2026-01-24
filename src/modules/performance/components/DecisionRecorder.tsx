import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { useToast } from '@/shared/hooks/use-toast';
import { saveDecision, calculateConsensusMetrics } from '@/shared/lib/collaborativeFeedbackService';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface DecisionRecorderProps {
  candidateId: string;
  candidateName: string;
  onDecisionRecorded?: () => void;
}

export function DecisionRecorder({ candidateId, candidateName, onDecisionRecorded }: DecisionRecorderProps) {
  const { toast } = useToast();
  const [decision, setDecision] = useState<'offer-extended' | 'rejected' | 'moved-forward' | 'hold'>('moved-forward');
  const [rationale, setRationale] = useState('');
  const consensus = calculateConsensusMetrics(candidateId);

  const handleRecordDecision = () => {
    if (!rationale.trim()) {
      toast({
        title: 'Missing Rationale',
        description: 'Please provide a rationale for this decision.',
        variant: 'destructive',
      });
      return;
    }

    saveDecision({
      candidateId,
      decision,
      decidedBy: 'current-user-id', // TODO: Get from auth
      decidedByName: 'Current User', // TODO: Get from auth
      consensusScore: consensus.averageScore,
      votingResults: consensus.voteResults,
      rationale,
    });

    toast({
      title: 'Decision Recorded',
      description: `${decision.replace('-', ' ').toUpperCase()} decision has been recorded for ${candidateName}.`,
    });

    setRationale('');
    onDecisionRecorded?.();
  };

  const getDecisionIcon = (dec: string) => {
    switch (dec) {
      case 'offer-extended':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'moved-forward':
        return <AlertTriangle className="h-5 w-5 text-blue-600" />;
      case 'hold':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Hiring Decision</CardTitle>
        <CardDescription>
          Make a final decision based on team feedback and consensus for {candidateName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Consensus Summary */}
        <div className="p-4 bg-muted rounded-lg space-y-3">
          <h4 className="font-semibold">Team Consensus Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold">{consensus.averageScore.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Agreement</p>
              <p className="text-2xl font-bold">{(consensus.agreementLevel * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Feedback Count</p>
              <p className="text-2xl font-bold">{consensus.totalFeedbacks}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hire Votes</p>
              <p className="text-2xl font-bold text-green-600">{consensus.voteResults.hire}</p>
            </div>
          </div>
        </div>

        {/* Decision Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Decision Type</label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={decision === 'offer-extended' ? 'default' : 'outline'}
              onClick={() => setDecision('offer-extended')}
              className="h-auto py-4 flex-col gap-2"
            >
              <CheckCircle2 className="h-6 w-6" />
              <span>Extend Offer</span>
            </Button>
            <Button
              variant={decision === 'moved-forward' ? 'default' : 'outline'}
              onClick={() => setDecision('moved-forward')}
              className="h-auto py-4 flex-col gap-2"
            >
              <AlertTriangle className="h-6 w-6" />
              <span>Move Forward</span>
            </Button>
            <Button
              variant={decision === 'hold' ? 'default' : 'outline'}
              onClick={() => setDecision('hold')}
              className="h-auto py-4 flex-col gap-2"
            >
              <Clock className="h-6 w-6" />
              <span>Put on Hold</span>
            </Button>
            <Button
              variant={decision === 'rejected' ? 'default' : 'outline'}
              onClick={() => setDecision('rejected')}
              className="h-auto py-4 flex-col gap-2"
            >
              <XCircle className="h-6 w-6" />
              <span>Reject</span>
            </Button>
          </div>
        </div>

        {/* Rationale */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Decision Rationale</label>
          <Textarea
            placeholder="Explain the reasoning behind this decision, referencing team feedback and consensus..."
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            rows={5}
          />
        </div>

        {/* Action Button */}
        <Button onClick={handleRecordDecision} className="w-full" size="lg">
          {getDecisionIcon(decision)}
          <span className="ml-2">Record Decision: {decision.replace('-', ' ').toUpperCase()}</span>
        </Button>
      </CardContent>
    </Card>
  );
}
