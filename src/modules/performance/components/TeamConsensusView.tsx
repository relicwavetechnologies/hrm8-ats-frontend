import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';
import { ConsensusMetrics } from '@/shared/types/collaborativeFeedback';
import { Users, TrendingUp, AlertCircle, CheckCircle, Award } from 'lucide-react';

interface TeamConsensusViewProps {
  metrics: ConsensusMetrics;
}

export function TeamConsensusView({ metrics }: TeamConsensusViewProps) {
  const getAgreementColor = (level: number) => {
    if (level >= 0.8) return 'text-green-600';
    if (level >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAgreementLabel = (level: number) => {
    if (level >= 0.8) return 'Strong Consensus';
    if (level >= 0.6) return 'Moderate Consensus';
    return 'Low Consensus';
  };

  const totalVotes = metrics.voteResults.hire + metrics.voteResults.noHire + metrics.voteResults.abstain;
  const hirePercentage = totalVotes > 0 ? (metrics.voteResults.hire / totalVotes) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Consensus Overview
          </CardTitle>
          <CardDescription>
            Based on {metrics.totalFeedbacks} feedback{metrics.totalFeedbacks !== 1 ? 's' : ''} and {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Agreement Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Agreement Level</span>
              <Badge variant="outline" className={getAgreementColor(metrics.agreementLevel)}>
                {getAgreementLabel(metrics.agreementLevel)}
              </Badge>
            </div>
            <Progress value={metrics.agreementLevel * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {(metrics.agreementLevel * 100).toFixed(0)}% alignment across team members
            </p>
          </div>

          {/* Average Score */}
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Average Score</p>
                <p className="text-xs text-muted-foreground">Overall evaluation</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{metrics.averageScore.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">out of 100</p>
            </div>
          </div>

          {/* Score Consistency */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Score Variance</p>
                <p className="text-xs text-muted-foreground">Standard deviation</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{metrics.scoreStdDev.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">
                {metrics.scoreStdDev < 10 ? 'Very consistent' : metrics.scoreStdDev < 15 ? 'Consistent' : 'Varied opinions'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voting Results Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Voting Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Hire ({metrics.voteResults.hire})</span>
              <span className="font-medium">{hirePercentage.toFixed(0)}%</span>
            </div>
            <Progress value={hirePercentage} className="h-2 bg-red-100 [&>div]:bg-green-600" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{metrics.voteResults.hire}</p>
              <p className="text-xs text-muted-foreground">Hire</p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{metrics.voteResults.noHire}</p>
              <p className="text-xs text-muted-foreground">No Hire</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{metrics.voteResults.abstain}</p>
              <p className="text-xs text-muted-foreground">Abstain</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criteria Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Criteria Breakdown
          </CardTitle>
          <CardDescription>Average ratings per criterion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(metrics.criteriaAverages).map(([criterion, average]) => (
            <div key={criterion} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{criterion}</span>
                <span className="text-muted-foreground">{average.toFixed(1)}/10</span>
              </div>
              <Progress value={(average / 10) * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Key Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.topStrengths.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-green-600">Top Strengths</h4>
              <ul className="space-y-1">
                {metrics.topStrengths.map((strength, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {metrics.topConcerns.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-red-600">Top Concerns</h4>
              <ul className="space-y-1">
                {metrics.topConcerns.map((concern, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span>{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendation Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendation Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(metrics.recommendationDistribution).map(([rec, count]) => (
              <div key={rec} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{rec.replace('-', ' ')}</span>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                  <Progress value={(count / metrics.totalFeedbacks) * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
