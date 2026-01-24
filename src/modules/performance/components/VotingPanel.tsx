import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { ThumbsUp, ThumbsDown, MinusCircle } from 'lucide-react';
import { saveVote, getVotesByCandidateId } from '@/shared/lib/collaborativeFeedbackService';
import { HiringVote } from '@/shared/types/collaborativeFeedback';
import { toast } from 'sonner';

interface VotingPanelProps {
  candidateId: string;
  candidateName: string;
  onVoteCast?: () => void;
}

export function VotingPanel({ candidateId, candidateName, onVoteCast }: VotingPanelProps) {
  const [decision, setDecision] = useState<'hire' | 'no-hire' | 'abstain'>('hire');
  const [reasoning, setReasoning] = useState('');
  const [existingVotes, setExistingVotes] = useState<HiringVote[]>([]);
  const [loading, setLoading] = useState(false);

  useState(() => {
    const votes = getVotesByCandidateId(candidateId);
    setExistingVotes(votes);
  });

  const handleCastVote = async () => {
    if (!reasoning.trim()) {
      toast.error('Please provide reasoning for your vote');
      return;
    }

    setLoading(true);
    try {
      const vote: Omit<HiringVote, 'id' | 'votedAt'> = {
        candidateId,
        voterId: 'current-user', // Mock user ID
        voterName: 'Current User', // Mock user name
        voterRole: 'Team Member', // Mock role
        decision,
        reasoning: reasoning.trim(),
      };

      saveVote(vote);
      toast.success('Vote cast successfully');
      setReasoning('');
      
      // Refresh votes
      const votes = getVotesByCandidateId(candidateId);
      setExistingVotes(votes);
      
      onVoteCast?.();
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error('Failed to cast vote');
    } finally {
      setLoading(false);
    }
  };

  const voteCount = {
    hire: existingVotes.filter(v => v.decision === 'hire').length,
    noHire: existingVotes.filter(v => v.decision === 'no-hire').length,
    abstain: existingVotes.filter(v => v.decision === 'abstain').length,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cast Your Vote</CardTitle>
          <CardDescription>
            Make your hiring decision for {candidateName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Your Decision</Label>
            <RadioGroup value={decision} onValueChange={(v) => setDecision(v as any)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                <RadioGroupItem value="hire" id="hire" />
                <Label htmlFor="hire" className="flex items-center gap-2 cursor-pointer flex-1">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <span>Hire</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                <RadioGroupItem value="no-hire" id="no-hire" />
                <Label htmlFor="no-hire" className="flex items-center gap-2 cursor-pointer flex-1">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <span>No Hire</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                <RadioGroupItem value="abstain" id="abstain" />
                <Label htmlFor="abstain" className="flex items-center gap-2 cursor-pointer flex-1">
                  <MinusCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Abstain</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reasoning">Reasoning *</Label>
            <Textarea
              id="reasoning"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Explain your decision..."
              rows={4}
              className="resize-none"
            />
          </div>

          <Button onClick={handleCastVote} disabled={loading} className="w-full">
            Cast Vote
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Voting Results</CardTitle>
          <CardDescription>
            {existingVotes.length} {existingVotes.length === 1 ? 'vote' : 'votes'} cast
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-green-600" />
                <span className="font-medium">Hire</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{voteCount.hire}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <ThumbsDown className="h-5 w-5 text-red-600" />
                <span className="font-medium">No Hire</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{voteCount.noHire}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <MinusCircle className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Abstain</span>
              </div>
              <span className="text-2xl font-bold">{voteCount.abstain}</span>
            </div>
          </div>

          {existingVotes.length > 0 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Recent Votes</h4>
              {existingVotes.slice(0, 5).map((vote) => (
                <div key={vote.id} className="border-l-2 border-primary pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{vote.voterName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(vote.votedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {vote.decision === 'hire' && <ThumbsUp className="h-3 w-3 text-green-600" />}
                    {vote.decision === 'no-hire' && <ThumbsDown className="h-3 w-3 text-red-600" />}
                    {vote.decision === 'abstain' && <MinusCircle className="h-3 w-3 text-muted-foreground" />}
                    <span className="text-xs font-medium capitalize">{vote.decision.replace('-', ' ')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{vote.reasoning}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
