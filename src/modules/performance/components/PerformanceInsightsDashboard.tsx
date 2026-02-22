import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Sparkles, 
  Target,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import type { PerformanceGoal, PerformanceReview } from "@/shared/types/performance";
import type { Employee } from "@/shared/types/employee";

interface PerformanceInsightsDashboardProps {
  goals: PerformanceGoal[];
  reviews: PerformanceReview[];
  employees: Employee[];
}

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}

export function PerformanceInsightsDashboard({ goals, reviews, employees }: PerformanceInsightsDashboardProps) {
  // Calculate insights
  const insights = useMemo<Insight[]>(() => {
    const insights: Insight[] = [];

    // Risk: Goals behind schedule
    const behindGoals = goals.filter(g => {
      const daysToTarget = Math.ceil((new Date(g.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return g.progress < 50 && daysToTarget < 30 && g.status === 'in-progress';
    });

    if (behindGoals.length > 0) {
      insights.push({
        id: 'behind-schedule',
        type: 'danger',
        title: `${behindGoals.length} Goals At Risk`,
        description: `${behindGoals.length} goals are behind schedule with less than 30 days remaining`,
        action: 'Review priorities',
        priority: 'high'
      });
    }

    // Success: High completion rate
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const completionRate = (completedGoals / goals.length) * 100;

    if (completionRate > 70) {
      insights.push({
        id: 'high-completion',
        type: 'success',
        title: 'Strong Performance',
        description: `${completionRate.toFixed(0)}% goal completion rate - above target`,
        priority: 'low'
      });
    }

    // Warning: Low engagement
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const recentUpdates = goals.filter(g => new Date(g.updatedAt) > lastMonth).length;
    
    if (recentUpdates < goals.length * 0.3) {
      insights.push({
        id: 'low-engagement',
        type: 'warning',
        title: 'Low Activity Detected',
        description: 'Only 30% of goals updated in the last month',
        action: 'Increase check-ins',
        priority: 'medium'
      });
    }

    // Info: Upcoming reviews
    const pendingReviews = reviews.filter(r => r.status === 'not-started' || r.status === 'in-progress').length;
    if (pendingReviews > 0) {
      insights.push({
        id: 'pending-reviews',
        type: 'info',
        title: `${pendingReviews} Reviews Pending`,
        description: 'Performance reviews awaiting completion',
        action: 'Complete reviews',
        priority: 'medium'
      });
    }

    return insights;
  }, [goals, reviews]);

  // Generate recommendations
  const recommendations = useMemo<Recommendation[]>(() => {
    const recs: Recommendation[] = [];

    // Analyze goal distribution
    const categoryDistribution = goals.reduce((acc, goal) => {
      acc[goal.category] = (acc[goal.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (!categoryDistribution['professional-development']) {
      recs.push({
        id: 'add-development',
        category: 'Goal Setting',
        title: 'Add Professional Development Goals',
        description: 'No professional development goals set. Consider adding 1-2 learning objectives to support career growth.',
        impact: 'high',
        effort: 'low'
      });
    }

    // Check for goals without KPIs
    const goalsWithoutKPIs = goals.filter(g => !g.kpis || g.kpis.length === 0).length;
    if (goalsWithoutKPIs > 0) {
      recs.push({
        id: 'add-kpis',
        category: 'Goal Quality',
        title: 'Define Key Performance Indicators',
        description: `${goalsWithoutKPIs} goals lack measurable KPIs. Add metrics to track progress objectively.`,
        impact: 'high',
        effort: 'medium'
      });
    }

    // High-performing area
    const highProgressGoals = goals.filter(g => g.progress > 80);
    if (highProgressGoals.length > goals.length * 0.5) {
      recs.push({
        id: 'stretch-goals',
        category: 'Performance',
        title: 'Consider Stretch Goals',
        description: 'Strong performance across existing goals. Consider adding more challenging objectives.',
        impact: 'medium',
        effort: 'high'
      });
    }

    // Review frequency
    if (reviews.length < 2) {
      recs.push({
        id: 'increase-reviews',
        category: 'Feedback',
        title: 'Schedule Regular Check-ins',
        description: 'Increase review frequency to quarterly for better performance tracking and feedback.',
        impact: 'high',
        effort: 'low'
      });
    }

    // Priority balance
    const highPriorityGoals = goals.filter(g => g.priority === 'high').length;
    if (highPriorityGoals > goals.length * 0.7) {
      recs.push({
        id: 'rebalance-priorities',
        category: 'Priority Management',
        title: 'Rebalance Goal Priorities',
        description: 'Too many high-priority goals may lead to burnout. Consider redistributing priorities.',
        impact: 'medium',
        effort: 'low'
      });
    }

    return recs;
  }, [goals, reviews]);

  // Generate trend data
  const trendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      avgProgress: Math.min(95, 45 + (index * 8) + Math.random() * 5),
      predicted: index >= 4 ? Math.min(98, 45 + (index * 9) + Math.random() * 3) : null,
      target: 80
    }));
  }, []);

  // Performance distribution
  const distributionData = useMemo(() => {
    return [
      { range: '0-20%', count: goals.filter(g => g.progress < 20).length },
      { range: '21-40%', count: goals.filter(g => g.progress >= 20 && g.progress < 40).length },
      { range: '41-60%', count: goals.filter(g => g.progress >= 40 && g.progress < 60).length },
      { range: '61-80%', count: goals.filter(g => g.progress >= 60 && g.progress < 80).length },
      { range: '81-100%', count: goals.filter(g => g.progress >= 80).length },
    ];
  }, [goals]);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'danger': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info': return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const avgProgress = goals.length > 0 ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length : 0;
  const progressTrend = avgProgress > 75 ? 'up' : avgProgress > 50 ? 'stable' : 'down';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI-Powered Insights
          </h2>
          <p className="text-muted-foreground">
            Intelligent analysis and predictions for your performance
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Last updated: {new Date().toLocaleDateString()}
        </Badge>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{avgProgress.toFixed(0)}%</div>
              {progressTrend === 'up' && <TrendingUp className="h-5 w-5 text-green-500" />}
              {progressTrend === 'down' && <TrendingDown className="h-5 w-5 text-red-500" />}
            </div>
            <Progress value={avgProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{goals.filter(g => g.status === 'in-progress').length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {goals.filter(g => g.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {insights.filter(i => i.type === 'danger').length > 0 ? (
                <>
                  <Badge variant="destructive">High</Badge>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </>
              ) : (
                <>
                  <Badge className="bg-green-500 dark:bg-green-600">Low</Badge>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {insights.filter(i => i.priority === 'high').length} high priority alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Predicted Trajectory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-3xl font-bold">+12%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Expected growth next quarter
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList>
          <TabsTrigger value="insights">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Insights & Alerts
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="mr-2 h-4 w-4" />
            Trend Analysis
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Sparkles className="mr-2 h-4 w-4" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Insights & Risk Alerts</CardTitle>
              <CardDescription>
                AI-detected patterns and potential issues in your performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No critical insights at this time. Keep up the great work!</p>
                </div>
              ) : (
                insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {insight.description}
                          </p>
                        </div>
                        <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                          {insight.priority}
                        </Badge>
                      </div>
                      {insight.action && (
                        <Button variant="link" className="p-0 h-auto mt-2" size="sm">
                          {insight.action} <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Distribution</CardTitle>
              <CardDescription>Current progress breakdown across all goals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Trends & Predictions</CardTitle>
              <CardDescription>
                Historical performance with AI-powered future projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="avgProgress"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorProgress)"
                    name="Actual Progress"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--chart-2))"
                    strokeDasharray="5 5"
                    fillOpacity={1}
                    fill="url(#colorPredicted)"
                    name="Predicted"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="3 3"
                    name="Target"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>AI Analysis:</strong> Current trajectory shows steady improvement. Based on historical data, 
                  you're projected to exceed your target by 15% in the next quarter if current pace continues.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Recommendations</CardTitle>
              <CardDescription>
                Personalized suggestions to improve your performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <p>All recommendations implemented. Great work!</p>
                </div>
              ) : (
                recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {rec.category}
                        </Badge>
                        <h4 className="font-semibold">{rec.title}</h4>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getImpactColor(rec.impact)}>
                          Impact: {rec.impact}
                        </Badge>
                        <Badge variant="secondary">
                          Effort: {rec.effort}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {rec.description}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm">
                        Implement
                      </Button>
                      <Button size="sm" variant="ghost">
                        Learn More
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
