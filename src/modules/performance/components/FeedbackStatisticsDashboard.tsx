import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { TeamMemberFeedback } from '@/shared/types/collaborativeFeedback';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, Users, FileText, Clock, Star, CheckCircle } from 'lucide-react';
import { useMemo } from 'react';

interface FeedbackStatisticsDashboardProps {
  allFeedback: TeamMemberFeedback[];
}

export const FeedbackStatisticsDashboard = ({ allFeedback }: FeedbackStatisticsDashboardProps) => {
  const statistics = useMemo(() => {
    // Overall stats
    const totalFeedbacks = allFeedback.length;
    const uniqueReviewers = new Set(allFeedback.map(f => f.reviewerName)).size;
    const avgScore = allFeedback.reduce((acc, f) => acc + f.overallScore, 0) / totalFeedbacks;
    
    // Recommendation breakdown
    const recommendations = {
      'Strong Hire': allFeedback.filter(f => f.recommendation === 'strong-hire').length,
      'Hire': allFeedback.filter(f => f.recommendation === 'hire').length,
      'Maybe': allFeedback.filter(f => f.recommendation === 'maybe').length,
      'No Hire': allFeedback.filter(f => f.recommendation === 'no-hire').length,
      'Strong No Hire': allFeedback.filter(f => f.recommendation === 'strong-no-hire').length,
    };

    // Score distribution (group scores into ranges)
    const scoreRanges = ['0-20', '21-40', '41-60', '61-80', '81-100'];
    const scoreDist = scoreRanges.map(range => {
      const [min, max] = range.split('-').map(Number);
      return {
        range,
        count: allFeedback.filter(f => f.overallScore >= min && f.overallScore <= max).length,
      };
    });

    // Feedback by role
    const roleStats: Record<string, number> = {};
    allFeedback.forEach(f => {
      roleStats[f.reviewerRole] = (roleStats[f.reviewerRole] || 0) + 1;
    });

    const roleData = Object.entries(roleStats).map(([role, count]) => ({
      role,
      count,
    }));

    // Average comments per feedback
    const avgComments = allFeedback.reduce((acc, f) => acc + f.comments.length, 0) / totalFeedbacks;

    // Time trend (mock data for demonstration)
    const timeTrend = [
      { month: 'Jan', feedbacks: Math.floor(Math.random() * 20 + 10) },
      { month: 'Feb', feedbacks: Math.floor(Math.random() * 20 + 15) },
      { month: 'Mar', feedbacks: Math.floor(Math.random() * 20 + 18) },
      { month: 'Apr', feedbacks: Math.floor(Math.random() * 20 + 20) },
      { month: 'May', feedbacks: Math.floor(Math.random() * 20 + 22) },
      { month: 'Jun', feedbacks: totalFeedbacks },
    ];

    // Comment type distribution
    const commentTypes: Record<string, number> = {};
    allFeedback.forEach(f => {
      f.comments.forEach(c => {
        commentTypes[c.type] = (commentTypes[c.type] || 0) + 1;
      });
    });

    const commentTypeData = Object.entries(commentTypes).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
    }));

    return {
      totalFeedbacks,
      uniqueReviewers,
      avgScore: avgScore.toFixed(1),
      avgComments: avgComments.toFixed(1),
      recommendations,
      scoreDist,
      roleData,
      timeTrend,
      commentTypeData,
    };
  }, [allFeedback]);

  const COLORS = {
    'Strong Hire': '#22c55e',
    'Hire': '#84cc16',
    'No Hire': '#f59e0b',
    'Strong No Hire': '#ef4444',
  };

  const recommendationData = Object.entries(statistics.recommendations).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Feedbacks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.totalFeedbacks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Reviewers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.uniqueReviewers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Avg Score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.avgScore}</div>
            <Progress value={parseFloat(statistics.avgScore)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Avg Comments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.avgComments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recommendation Breakdown</CardTitle>
            <CardDescription>Distribution of hiring decisions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={recommendationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {recommendationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score Distribution</CardTitle>
            <CardDescription>Frequency of score ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statistics.scoreDist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Feedback by Reviewer Role</CardTitle>
            <CardDescription>Contribution by role</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statistics.roleData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="role" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Feedback Trend Over Time</CardTitle>
            <CardDescription>Monthly feedback volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={statistics.timeTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="feedbacks" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.2)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comment Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comment Type Distribution</CardTitle>
          <CardDescription>Types of feedback provided</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statistics.commentTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
