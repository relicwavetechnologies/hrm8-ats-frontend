import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { calculateFeedbackAnalytics } from '@/shared/lib/feedbackAnalyticsService';
import { FeedbackAnalytics } from '@/shared/types/feedbackAnalytics';

export function FeedbackAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    const data = calculateFeedbackAnalytics();
    setAnalytics(data);
  };

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Feedback Analytics
        </h2>
        <p className="text-muted-foreground">
          Insights into feedback request performance and team engagement
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Completion Rate
            </CardDescription>
            <CardTitle className="text-3xl">
              {analytics.completionRate.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={analytics.completionRate} className="h-2" />
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Response Time
            </CardDescription>
            <CardTitle className="text-3xl">
              {analytics.averageResponseTime.toFixed(1)}h
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {analytics.completedRequests}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Pending
            </CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {analytics.pendingRequests}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Response Time by Member */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="text-lg">Response Time by Team Member</CardTitle>
            <CardDescription>Average time to complete feedback requests</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(analytics.responseTimeByMember).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No completed feedback yet
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(analytics.responseTimeByMember)
                  .sort(([, a], [, b]) => a - b)
                  .map(([member, hours]) => (
                    <div key={member} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{member}</span>
                        <span className="text-muted-foreground">
                          {hours.toFixed(1)} hours
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((hours / 72) * 100, 100)} 
                        className="h-2"
                      />
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completion Rate by Member */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle className="text-lg">Completion Rate by Team Member</CardTitle>
            <CardDescription>Percentage of requests completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.completionRateByMember).map(([member, data]) => {
                const rate = (data.completed / data.total) * 100;
                return (
                  <div key={member} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{member}</span>
                      <span className="text-muted-foreground">
                        {data.completed}/{data.total} ({rate.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={rate} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Requests by Candidate */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <CardHeader>
            <CardTitle className="text-lg">Requests by Candidate</CardTitle>
            <CardDescription>Total feedback requests per candidate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.requestsByCandidate)
                .sort(([, a], [, b]) => b - a)
                .map(([candidate, count]) => (
                  <div
                    key={candidate}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span className="font-medium">{candidate}</span>
                    <Badge variant="secondary">{count} requests</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Summary Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold">{analytics.totalRequests}</div>
                <div className="text-xs text-muted-foreground">Total Requests</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {analytics.overdueRequests}
                </div>
                <div className="text-xs text-muted-foreground">Overdue</div>
              </div>
            </div>
            
            <div className="space-y-2 pt-4 border-t">
              <h4 className="font-semibold text-sm">Key Insights</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                  <span>
                    {analytics.completionRate > 75 
                      ? 'Excellent feedback completion rate!'
                      : analytics.completionRate > 50
                      ? 'Good feedback engagement from team'
                      : 'Consider sending reminders to improve response rate'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 text-blue-600" />
                  <span>
                    Average response time is {analytics.averageResponseTime < 24 
                      ? 'excellent' 
                      : analytics.averageResponseTime < 48 
                      ? 'good' 
                      : 'could be improved'}
                  </span>
                </li>
                {analytics.overdueRequests > 0 && (
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 mt-0.5 text-orange-600" />
                    <span>{analytics.overdueRequests} request(s) need immediate attention</span>
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
