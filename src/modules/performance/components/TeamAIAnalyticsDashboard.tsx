import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { TeamMemberFeedback } from '@/shared/types/collaborativeFeedback';
import { generateMockAIAnalysis } from '@/shared/lib/mockAIAnalysis';
import { calculateFeedbackQuality } from '@/shared/lib/mockFeedbackQuality';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { TrendingUp, AlertTriangle, Target, Users, Download } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/shared/components/ui/button';
import { exportAIAnalyticsReport } from '@/shared/lib/aiAnalyticsReportExport';
import { useToast } from '@/shared/hooks/use-toast';

interface TeamAIAnalyticsDashboardProps {
  allFeedback: TeamMemberFeedback[];
  candidateName?: string;
}

export const TeamAIAnalyticsDashboard = ({ allFeedback, candidateName = 'Candidate' }: TeamAIAnalyticsDashboardProps) => {
  const { toast } = useToast();
  
  const analytics = useMemo(() => {
    const analyses = allFeedback.map(fb => ({
      name: fb.reviewerName,
      role: fb.reviewerRole,
      analysis: generateMockAIAnalysis(
        fb.comments.map(c => `[${c.type.toUpperCase()}] ${c.content}`).join('\n\n')
      ),
      quality: calculateFeedbackQuality(
        fb.comments.map(c => c.content).join(' '),
        fb.comments.length
      ),
    }));

    // Sentiment distribution
    const sentimentDist = {
      positive: analyses.filter(a => a.analysis.sentiment.overall === 'positive').length,
      neutral: analyses.filter(a => a.analysis.sentiment.overall === 'neutral').length,
      negative: analyses.filter(a => a.analysis.sentiment.overall === 'negative').length,
      mixed: analyses.filter(a => a.analysis.sentiment.overall === 'mixed').length,
    };

    // Bias patterns
    const biasTypes: Record<string, number> = {};
    analyses.forEach(a => {
      a.analysis.biasDetection.forEach(b => {
        if (b.type) {
          biasTypes[b.type] = (biasTypes[b.type] || 0) + 1;
        }
      });
    });

    // Quality scores
    const avgQuality = analyses.reduce((acc, a) => acc + a.quality.overall, 0) / analyses.length;
    const qualityByRole: Record<string, { total: number; count: number }> = {};
    analyses.forEach(a => {
      if (!qualityByRole[a.role]) {
        qualityByRole[a.role] = { total: 0, count: 0 };
      }
      qualityByRole[a.role].total += a.quality.overall;
      qualityByRole[a.role].count += 1;
    });

    // Consistency score (based on sentiment variance)
    const sentimentScores = analyses.map(a => a.analysis.sentiment.score);
    const avgSentiment = sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;
    const variance = sentimentScores.reduce((acc, val) => acc + Math.pow(val - avgSentiment, 2), 0) / sentimentScores.length;
    const consistency = Math.max(0, 100 - (variance * 200));

    return {
      analyses,
      sentimentDist,
      biasTypes,
      avgQuality: Math.round(avgQuality),
      qualityByRole: Object.entries(qualityByRole).map(([role, data]) => ({
        role,
        quality: Math.round(data.total / data.count),
      })),
      consistency: Math.round(consistency),
    };
  }, [allFeedback]);

  const COLORS = {
    positive: '#22c55e',
    neutral: '#64748b',
    negative: '#ef4444',
    mixed: '#f59e0b',
  };

  const sentimentData = Object.entries(analytics.sentimentDist).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const biasData = Object.entries(analytics.biasTypes).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count: value,
  }));

  const handleExport = () => {
    try {
      exportAIAnalyticsReport(analytics, candidateName);
      toast({
        title: "Report Exported",
        description: "AI analytics report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>
      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Team Consistency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.consistency}%</div>
            <Progress value={analytics.consistency} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Quality Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.avgQuality}</div>
            <Progress value={analytics.avgQuality} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Biases Found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              {Object.values(analytics.biasTypes).reduce((a, b) => a + b, 0)}
              {Object.values(analytics.biasTypes).length > 0 && (
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Team Members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              {analytics.analyses.length}
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sentiment Distribution</CardTitle>
            <CardDescription>Overall team sentiment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quality by Role</CardTitle>
            <CardDescription>Average feedback quality scores by role</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.qualityByRole}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="role" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="quality" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {biasData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Bias Patterns Detected
            </CardTitle>
            <CardDescription>Types of potential biases found across team feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={biasData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Individual Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Individual Feedback Quality</CardTitle>
          <CardDescription>Quality scores for each team member</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.analyses.map((a, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="min-w-[150px]">
                    <div className="font-medium">{a.name}</div>
                    <div className="text-sm text-muted-foreground">{a.role}</div>
                  </div>
                  <div className="flex-1">
                    <Progress value={a.quality.overall} className="h-2" />
                  </div>
                </div>
                <Badge variant={a.quality.overall >= 70 ? 'default' : 'secondary'}>
                  {a.quality.overall}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
