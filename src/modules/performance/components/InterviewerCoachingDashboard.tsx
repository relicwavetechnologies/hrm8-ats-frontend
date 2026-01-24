import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { TeamMemberFeedback } from '@/shared/types/collaborativeFeedback';
import { generateInterviewerCoaching, InterviewerPerformance } from '@/shared/lib/mockInterviewerCoaching';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Award, 
  AlertTriangle, 
  BookOpen,
  Target,
  CheckCircle2
} from 'lucide-react';
import { useMemo } from 'react';

interface InterviewerCoachingDashboardProps {
  allFeedback: TeamMemberFeedback[];
  reviewerName?: string;
}

export const InterviewerCoachingDashboard = ({ 
  allFeedback, 
  reviewerName 
}: InterviewerCoachingDashboardProps) => {
  const performance = useMemo(() => {
    if (!reviewerName) return null;
    return generateInterviewerCoaching(allFeedback, reviewerName);
  }, [allFeedback, reviewerName]);

  const allPerformances = useMemo(() => {
    const uniqueReviewers = Array.from(new Set(allFeedback.map(f => f.reviewerName)));
    return uniqueReviewers.map(name => generateInterviewerCoaching(allFeedback, name));
  }, [allFeedback]);

  if (!reviewerName && allPerformances.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No interviewer data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const renderPerformanceCard = (perf: InterviewerPerformance) => (
    <div key={perf.reviewerName} className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Quality Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{perf.avgQualityScore}%</div>
            <Progress value={perf.avgQualityScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Consistency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{perf.consistencyScore}%</div>
            <Progress value={perf.consistencyScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Objectivity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{perf.objectivityScore}%</div>
            <Progress value={perf.objectivityScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-bold">
              {getTrendIcon(perf.improvementTrend)}
              <span className="text-base capitalize">{perf.improvementTrend}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths */}
      {perf.strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {perf.strengths.map((strength, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coaching Suggestions */}
      {perf.coachingSuggestions.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Personalized Coaching
          </h4>
          {perf.coachingSuggestions.map((suggestion) => (
            <Alert key={suggestion.id} variant={suggestion.severity === 'high' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                <span>{suggestion.title}</span>
                <Badge variant={getSeverityColor(suggestion.severity) as any}>
                  {suggestion.severity}
                </Badge>
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                <p className="text-sm">{suggestion.description}</p>
                
                <div>
                  <div className="font-medium text-sm mb-2">Action Items:</div>
                  <ul className="space-y-1 text-sm">
                    {suggestion.actionItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="font-medium text-sm mb-2 flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Resources:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.resources.map((resource, idx) => (
                      <Button key={idx} variant="outline" size="sm" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          {resource.title}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Performance Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Detail Score</span>
              <span className="font-medium">{perf.detailScore}%</span>
            </div>
            <Progress value={perf.detailScore} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Avg Bias Count</span>
              <span className="font-medium">{perf.avgBiasCount.toFixed(1)}</span>
            </div>
            <Progress value={Math.max(0, 100 - perf.avgBiasCount * 50)} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Feedbacks</span>
              <span className="font-medium">{perf.totalFeedbacks}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {reviewerName ? (
        // Individual view
        performance && renderPerformanceCard(performance)
      ) : (
        // Team view
        <Tabs defaultValue={allPerformances[0]?.reviewerName || ''}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {allPerformances.map(perf => (
              <TabsTrigger key={perf.reviewerName} value={perf.reviewerName}>
                {perf.reviewerName}
              </TabsTrigger>
            ))}
          </TabsList>

          {allPerformances.map(perf => (
            <TabsContent key={perf.reviewerName} value={perf.reviewerName}>
              {renderPerformanceCard(perf)}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};
