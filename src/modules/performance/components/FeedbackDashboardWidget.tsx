import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { getAllFeedback } from '@/shared/lib/collaborativeFeedbackService';
import { TeamMemberFeedback } from '@/shared/types/collaborativeFeedback';
import { MessageSquare, TrendingUp, Users, Clock, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function FeedbackDashboardWidget() {
  const navigate = useNavigate();
  const [recentFeedback, setRecentFeedback] = useState<TeamMemberFeedback[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    averageScore: 0,
    pendingReview: 5, // Mock value
  });

  useEffect(() => {
    const allFeedback = getAllFeedback();
    const recent = allFeedback.slice(-5).reverse();
    setRecentFeedback(recent);

    // Calculate stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeekCount = allFeedback.filter(
      (f) => new Date(f.submittedAt) > weekAgo
    ).length;
    const avgScore =
      allFeedback.length > 0
        ? allFeedback.reduce((sum, f) => sum + f.overallScore, 0) / allFeedback.length
        : 0;

    setStats({
      total: allFeedback.length,
      thisWeek: thisWeekCount,
      averageScore: avgScore,
      pendingReview: 5,
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Collaborative Feedback
            </CardTitle>
            <CardDescription>Recent team feedback and activity</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/collaborative-feedback')}>
            View All
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Feedback</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold text-green-600">{stats.thisWeek}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Score</p>
            <p className="text-2xl font-bold">{stats.averageScore.toFixed(1)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</p>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Activity
          </h4>
          {recentFeedback.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No feedback yet. Start evaluating candidates!
            </p>
          ) : (
            recentFeedback.map((feedback) => (
              <div key={feedback.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-sm">{feedback.reviewerName}</p>
                  <p className="text-xs text-muted-foreground">
                    Reviewed candidate • {formatDistanceToNow(new Date(feedback.submittedAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold">{feedback.overallScore}</p>
                    <Progress value={feedback.overallScore} className="h-1 w-16" />
                  </div>
                  <Badge variant={
                    feedback.recommendation.includes('hire') ? 'default' : 'secondary'
                  }>
                    {feedback.recommendation}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/collaborative-feedback')}>
              <Users className="h-4 w-4 mr-2" />
              Provide Feedback
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/collaborative-feedback')}>
              <TrendingUp className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
