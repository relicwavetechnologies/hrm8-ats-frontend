import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { useToast } from '@/shared/hooks/use-toast';
import { getCandidateVotes, saveVote } from '@/shared/lib/collaborativeFeedbackService';
import { HiringVote } from '@/shared/types/collaborativeFeedback';
import { ThumbsUp, ThumbsDown, Minus, Users, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TeamVotingProps {
  candidateId: string;
  candidateName: string;
}

export function TeamVoting({ candidateId, candidateName }: TeamVotingProps) {
  const { toast } = useToast();
  const [votes, setVotes] = useState<HiringVote[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<'hire' | 'no-hire' | 'abstain' | null>(null);
  const [reasoning, setReasoning] = useState('');

  const loadVotes = () => {
    const voteData = getCandidateVotes(candidateId);
    setVotes(voteData);
  };

  useEffect(() => {
    loadVotes();
  }, [candidateId]);

  const handleVote = () => {
    if (!selectedDecision) {
      toast({
        title: 'Select a Decision',
        description: 'Please select hire, no-hire, or abstain.',
        variant: 'destructive',
      });
      return;
    }

    if (!reasoning.trim()) {
      toast({
        title: 'Provide Reasoning',
        description: 'Please provide reasoning for your vote.',
        variant: 'destructive',
      });
      return;
    }

    try {
      saveVote({
        candidateId,
        voterId: 'current-user-id', // TODO: Get from auth
        voterName: 'Current User', // TODO: Get from auth
        voterRole: 'Team Member', // TODO: Get from auth
        decision: selectedDecision,
        reasoning,
      });

      toast({
        title: 'Vote Submitted',
        description: 'Your hiring decision has been recorded.',
      });

      setSelectedDecision(null);
      setReasoning('');
      loadVotes();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit vote. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const voteResults = {
    hire: votes.filter(v => v.decision === 'hire').length,
    noHire: votes.filter(v => v.decision === 'no-hire').length,
    abstain: votes.filter(v => v.decision === 'abstain').length,
  };

  const totalVotes = votes.length;
  const hirePercentage = totalVotes > 0 ? (voteResults.hire / totalVotes) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Vote Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Voting Results
          </CardTitle>
          <CardDescription>Team voting on hiring decision for {candidateName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{voteResults.hire}</p>
              <p className="text-sm text-muted-foreground">Hire</p>
            </div>

            <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <ThumbsDown className="h-8 w-8 mx-auto mb-2 text-red-600 dark:text-red-400" />
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{voteResults.noHire}</p>
              <p className="text-sm text-muted-foreground">No Hire</p>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <Minus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-3xl font-bold">{voteResults.abstain}</p>
              <p className="text-sm text-muted-foreground">Abstain</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Consensus: {hirePercentage.toFixed(0)}% Hire</span>
              <span className="text-muted-foreground">{totalVotes} total votes</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 dark:bg-green-400"
                style={{ width: `${hirePercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cast Vote */}
      <Card>
        <CardHeader>
          <CardTitle>Cast Your Vote</CardTitle>
          <CardDescription>Make your hiring decision and provide reasoning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              variant={selectedDecision === 'hire' ? 'default' : 'outline'}
              onClick={() => setSelectedDecision('hire')}
              className="flex-1"
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Hire
            </Button>
            <Button
              variant={selectedDecision === 'no-hire' ? 'default' : 'outline'}
              onClick={() => setSelectedDecision('no-hire')}
              className="flex-1"
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              No Hire
            </Button>
            <Button
              variant={selectedDecision === 'abstain' ? 'default' : 'outline'}
              onClick={() => setSelectedDecision('abstain')}
              className="flex-1"
            >
              <Minus className="h-4 w-4 mr-2" />
              Abstain
            </Button>
          </div>

          <Textarea
            placeholder="Provide your reasoning for this decision..."
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            rows={4}
          />

          <Button onClick={handleVote} className="w-full">
            Submit Vote
          </Button>
        </CardContent>
      </Card>

      {/* Individual Votes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Votes ({votes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {votes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No votes yet. Be the first to vote!</p>
          ) : (
            votes.map((vote) => (
              <div key={vote.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <Avatar>
                  <AvatarFallback>{vote.voterName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{vote.voterName}</p>
                      <p className="text-sm text-muted-foreground">{vote.voterRole}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          vote.decision === 'hire'
                            ? 'default'
                            : vote.decision === 'no-hire'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {vote.decision === 'hire' && <ThumbsUp className="h-3 w-3 mr-1" />}
                        {vote.decision === 'no-hire' && <ThumbsDown className="h-3 w-3 mr-1" />}
                        {vote.decision === 'abstain' && <Minus className="h-3 w-3 mr-1" />}
                        {vote.decision}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(vote.votedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm mt-2">{vote.reasoning}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
