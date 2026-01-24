import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  generateCandidateComparison,
  getRecommendationColor,
  getRecommendationLabel,
  getRatingCriteria,
} from '@/shared/lib/collaborativeFeedbackService';
import { CandidateComparison } from '@/shared/types/collaborativeFeedback';
import { TrendingUp, Users, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ExportReportButton } from './ExportReportButton';

interface CandidateComparisonReportProps {
  candidateIds: string[];
}

export function CandidateComparisonReport({ candidateIds }: CandidateComparisonReportProps) {
  const [comparisons, setComparisons] = useState<CandidateComparison[]>([]);
  const criteria = getRatingCriteria();

  useEffect(() => {
    const data = generateCandidateComparison(candidateIds);
    setComparisons(data);
  }, [candidateIds]);


  if (comparisons.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No candidates selected for comparison.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Candidate Comparison Report
              </CardTitle>
              <CardDescription>Comparing {comparisons.length} candidates</CardDescription>
            </div>
            <ExportReportButton data={comparisons} filename={`candidate-comparison-${Date.now()}`} />
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="criteria">Criteria Comparison</TabsTrigger>
          <TabsTrigger value="voting">Voting Results</TabsTrigger>
          <TabsTrigger value="timeline">Decision Timeline</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisons.map((comparison) => (
              <Card key={comparison.candidateId}>
                <CardHeader>
                  <CardTitle className="text-lg">{comparison.candidateName}</CardTitle>
                  <CardDescription>{comparison.jobTitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4 bg-muted rounded-lg">
                    <p className="text-4xl font-bold">
                      {comparison.consensusMetrics.averageScore.toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Agreement Level</span>
                      <span className="font-medium">
                        {(comparison.consensusMetrics.agreementLevel * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={comparison.consensusMetrics.agreementLevel * 100} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Feedback
                    </span>
                    <span className="font-medium">{comparison.consensusMetrics.totalFeedbacks}</span>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Recommendations</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(comparison.consensusMetrics.recommendationDistribution).map(
                        ([rec, count]) => (
                          <Badge key={rec} className={getRecommendationColor(rec)} variant="secondary">
                            {getRecommendationLabel(rec)}: {count}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {comparison.consensusMetrics.voteResults.hire}
                        </p>
                        <p className="text-xs text-muted-foreground">Hire</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">
                          {comparison.consensusMetrics.voteResults.noHire}
                        </p>
                        <p className="text-xs text-muted-foreground">No Hire</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{comparison.consensusMetrics.voteResults.abstain}</p>
                        <p className="text-xs text-muted-foreground">Abstain</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Criteria Comparison Tab */}
        <TabsContent value="criteria" className="space-y-4">
          {criteria.map((criterion) => (
            <Card key={criterion.id}>
              <CardHeader>
                <CardTitle className="text-base">{criterion.name}</CardTitle>
                <CardDescription>{criterion.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {comparisons.map((comparison) => {
                    const score = comparison.consensusMetrics.criteriaAverages[criterion.id] || 0;
                    return (
                      <div key={comparison.candidateId}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{comparison.candidateName}</span>
                          <span className="text-sm font-bold">{score.toFixed(1)}/10</span>
                        </div>
                        <Progress value={score * 10} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Voting Results Tab */}
        <TabsContent value="voting" className="space-y-4">
          {comparisons.map((comparison) => (
            <Card key={comparison.candidateId}>
              <CardHeader>
                <CardTitle className="text-lg">{comparison.candidateName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {comparison.consensusMetrics.voteResults.hire}
                      </p>
                      <p className="text-sm">Hire Votes</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {comparison.consensusMetrics.voteResults.noHire}
                      </p>
                      <p className="text-sm">No Hire Votes</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <p className="text-2xl font-bold">{comparison.consensusMetrics.voteResults.abstain}</p>
                      <p className="text-sm">Abstained</p>
                    </div>
                  </div>

                  {comparison.votes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Individual Votes</h4>
                      {comparison.votes.slice(0, 3).map((vote) => (
                        <div key={vote.id} className="text-sm p-2 bg-muted rounded">
                          <div className="flex justify-between">
                            <span className="font-medium">{vote.voterName}</span>
                            <Badge variant="outline">{vote.decision}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{vote.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Decision Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          {comparisons.map((comparison) => (
            <Card key={comparison.candidateId}>
              <CardHeader>
                <CardTitle className="text-lg">{comparison.candidateName}</CardTitle>
              </CardHeader>
              <CardContent>
                {comparison.decisionHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No decision history yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {comparison.decisionHistory.map((decision) => (
                      <div key={decision.id} className="p-3 border-l-4 border-primary bg-muted rounded">
                        <div className="flex justify-between items-start mb-2">
                          <Badge>{decision.decision}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(decision.decidedAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm font-medium">By: {decision.decidedByName}</p>
                        <p className="text-sm text-muted-foreground mt-1">{decision.rationale}</p>
                        <div className="flex gap-2 mt-2 text-xs">
                          <span>Score: {decision.consensusScore.toFixed(1)}</span>
                          <span>•</span>
                          <span>
                            Votes: {decision.votingResults.hire}H / {decision.votingResults.noHire}NH
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
