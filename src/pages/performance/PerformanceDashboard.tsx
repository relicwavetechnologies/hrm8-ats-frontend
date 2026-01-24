import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { EnhancedStatCard } from "@/components/dashboard/EnhancedStatCard";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker-v2";
import { Badge } from "@/shared/components/ui/badge";
import { EditModeToggle } from '@/components/dashboard/EditModeToggle';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";
import {
  Target, TrendingUp, TrendingDown, Users,
  CheckCircle, Clock, Download, Eye, Filter, BarChart3, Calendar, Star, Plus
} from "lucide-react";
import { getPerformanceGoals, getPerformanceReviews } from "@/shared/lib/performanceStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { StandardChartCard } from "@/components/dashboard/charts/StandardChartCard";
import { useToast } from "@/shared/hooks/use-toast";
import type { DateRange } from "react-day-picker";

export default function PerformanceDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const goals = getPerformanceGoals();
  const reviews = getPerformanceReviews();

  const handleExport = () => {
    toast({ title: "Exporting performance analytics..." });
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const onTrackGoals = goals.filter(g => g.status === 'in-progress').length;
    const atRiskGoals = goals.filter(g => g.status === 'on-hold').length;

    const completedReviews = reviews.filter(r => r.status === 'completed').length;
    const pendingReviews = reviews.filter(r => r.status === 'in-progress' || r.status === 'not-started').length;

    const completedReviewsWithRatings = reviews.filter(r => r.status === 'completed' && r.overallRating);
    const avgRating = completedReviewsWithRatings.length > 0
      ? (completedReviewsWithRatings.reduce((sum, r) => sum + (r.overallRating || 0), 0) / completedReviewsWithRatings.length).toFixed(1)
      : 0;

    return {
      totalGoals,
      completedGoals,
      onTrackGoals,
      atRiskGoals,
      completionRate: totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(1) : 0,
      completedReviews,
      pendingReviews,
      avgRating,
    };
  }, [goals, reviews]);

  // Goal completion trends
  const goalTrends = [
    { month: 'Jan', completed: 23, onTrack: 45, atRisk: 12 },
    { month: 'Feb', completed: 28, onTrack: 48, atRisk: 10 },
    { month: 'Mar', completed: 31, onTrack: 52, atRisk: 9 },
    { month: 'Apr', completed: 35, onTrack: 54, atRisk: 8 },
    { month: 'May', completed: 38, onTrack: 58, atRisk: 7 },
    { month: 'Jun', completed: 42, onTrack: 61, atRisk: 6 },
  ];

  // Performance ratings distribution
  const ratingsData = [
    { rating: '5 - Exceptional', count: 34, color: '#10b981' },
    { rating: '4 - Exceeds', count: 89, color: '#3b82f6' },
    { rating: '3 - Meets', count: 156, color: '#f59e0b' },
    { rating: '2 - Needs Improvement', count: 45, color: '#ec4899' },
    { rating: '1 - Unsatisfactory', count: 12, color: '#ef4444' },
  ];

  // Department performance
  const departmentPerformance = [
    { department: 'Engineering', avgRating: 4.2, goalCompletion: 87 },
    { department: 'Sales', avgRating: 4.5, goalCompletion: 92 },
    { department: 'Marketing', avgRating: 4.1, goalCompletion: 85 },
    { department: 'Product', avgRating: 4.3, goalCompletion: 89 },
    { department: 'Operations', avgRating: 3.9, goalCompletion: 78 },
    { department: 'HR', avgRating: 4.4, goalCompletion: 91 },
  ];

  // Competency scores
  const competencyData = [
    { competency: 'Leadership', score: 4.2, fullMark: 5 },
    { competency: 'Communication', score: 4.5, fullMark: 5 },
    { competency: 'Collaboration', score: 4.3, fullMark: 5 },
    { competency: 'Innovation', score: 3.9, fullMark: 5 },
    { competency: 'Technical Skills', score: 4.4, fullMark: 5 },
    { competency: 'Problem Solving', score: 4.1, fullMark: 5 },
  ];

  // Goal categories
  const goalCategories = [
    { category: 'Individual', count: 178, color: '#3b82f6' },
    { category: 'Team', count: 89, color: '#10b981' },
    { category: 'Company', count: 45, color: '#8b5cf6' },
    { category: 'Development', count: 67, color: '#f59e0b' },
  ];

  // Review completion timeline
  const reviewTimeline = [
    { week: 'W1', scheduled: 45, completed: 42 },
    { week: 'W2', scheduled: 38, completed: 36 },
    { week: 'W3', scheduled: 52, completed: 48 },
    { week: 'W4', scheduled: 41, completed: 39 },
    { week: 'W5', scheduled: 48, completed: 45 },
    { week: 'W6', scheduled: 39, completed: 37 },
  ];

  // Performance improvement trends
  const improvementData = [
    { quarter: 'Q1', improved: 67, maintained: 23, declined: 10 },
    { quarter: 'Q2', improved: 72, maintained: 21, declined: 7 },
    { quarter: 'Q3', improved: 78, maintained: 18, declined: 4 },
    { quarter: 'Q4', improved: 81, maintained: 16, declined: 3 },
  ];

  return (
    <DashboardPageLayout
      dashboardActions={<EditModeToggle isEditMode={isEditMode} onToggle={() => setIsEditMode(!isEditMode)} />}
    >
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Performance Analytics</h1>
            <p className="text-muted-foreground">
              Goals, reviews, ratings, and employee development insights
            </p>
          </div>

          {!isEditMode && (
            <div className="flex items-center gap-3">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder="Select period"
                align="end"
              />

              <Button variant="secondary" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard
            title="Total Goals"
            value={metrics.totalGoals.toString()}
            change={`${metrics.completionRate}% completed`}
            trend="up"
            icon={<Target className="h-6 w-6" />}
            variant="neutral"
            showMenu={true}
            menuItems={[
              { label: "View All Goals", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/performance') },
              { label: "Create Goal", icon: <Plus className="h-4 w-4" />, onClick: () => navigate('/performance/goals/new') },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="On Track Goals"
            value={metrics.onTrackGoals.toString()}
            change="+12.5%"
            trend="up"
            icon={<CheckCircle className="h-6 w-6" />}
            variant="success"
            showMenu={true}
            menuItems={[
              { label: "View On Track", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/performance?status=on-track') },
              { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="Avg. Performance"
            value={`${metrics.avgRating}/5.0`}
            change="+0.2"
            trend="up"
            icon={<Star className="h-6 w-6" />}
            variant="warning"
            showMenu={true}
            menuItems={[
              { label: "View Ratings", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/performance/reviews') },
              { label: "Compare Periods", icon: <Calendar className="h-4 w-4" />, onClick: () => { } },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />

          <EnhancedStatCard
            title="Pending Reviews"
            value={metrics.pendingReviews.toString()}
            change={`${metrics.completedReviews} completed`}
            trend="down"
            icon={<Clock className="h-6 w-6" />}
            variant="primary"
            showMenu={true}
            menuItems={[
              { label: "View Pending", icon: <Eye className="h-4 w-4" />, onClick: () => navigate('/performance/reviews?status=pending') },
              { label: "View All Reviews", icon: <Filter className="h-4 w-4" />, onClick: () => navigate('/performance/reviews') },
              { label: "Export", icon: <Download className="h-4 w-4" />, onClick: handleExport }
            ]}
          />
        </div>

        {/* Charts */}
        <Tabs defaultValue="goals" className="space-y-4">
          <TabsList>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="competencies">Competencies</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <StandardChartCard
                title="Goal Progress Trends"
                description="Monthly goal status distribution"
                showDatePicker={true}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onDownload={() => toast({ title: "Downloading goal trends..." })}
                menuItems={[
                  { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
                  { label: "Compare Periods", icon: <Calendar className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={goalTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                    <Bar dataKey="onTrack" stackId="a" fill="#3b82f6" name="On Track" />
                    <Bar dataKey="atRisk" stackId="a" fill="#ef4444" name="At Risk" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </StandardChartCard>

              <StandardChartCard
                title="Goal Categories"
                description="Distribution by goal type"
                onDownload={() => toast({ title: "Downloading goal categories..." })}
                menuItems={[
                  { label: "View Breakdown", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  { label: "Filter", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={goalCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      strokeWidth={0}
                    >
                      {goalCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </StandardChartCard>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Goal Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <div>
                          <div className="font-semibold">Completed Goals</div>
                          <div className="text-sm text-muted-foreground">Successfully achieved</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{metrics.completedGoals}</div>
                        <div className="text-sm text-muted-foreground">{metrics.completionRate}%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <div>
                          <div className="font-semibold">On Track Goals</div>
                          <div className="text-sm text-muted-foreground">Progressing well</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{metrics.onTrackGoals}</div>
                        <div className="text-sm text-muted-foreground">
                          {((metrics.onTrackGoals / metrics.totalGoals) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div>
                          <div className="font-semibold">At Risk Goals</div>
                          <div className="text-sm text-muted-foreground">Needs attention</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{metrics.atRiskGoals}</div>
                        <div className="text-sm text-muted-foreground">
                          {((metrics.atRiskGoals / metrics.totalGoals) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <StandardChartCard
                title="Performance Ratings Distribution"
                description="Employee rating breakdown"
                onDownload={() => toast({ title: "Downloading ratings data..." })}
                menuItems={[
                  { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ratingsData} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis dataKey="rating" type="category" width={150} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {ratingsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </StandardChartCard>

              <StandardChartCard
                title="Review Completion"
                description="Weekly review schedule vs completion"
                showDatePicker={true}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onDownload={() => toast({ title: "Downloading review data..." })}
                menuItems={[
                  { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  { label: "Filter", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reviewTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={false} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line
                      type="monotone"
                      dataKey="scheduled"
                      stroke="#94a3b8"
                      strokeWidth={3}
                      name="Scheduled"
                      dot={false}
                      activeDot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Completed"
                      dot={false}
                      activeDot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </StandardChartCard>

              <StandardChartCard
                title="Performance Improvement Trends"
                description="Quarterly employee performance changes"
                showDatePicker={true}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onDownload={() => toast({ title: "Downloading improvement data..." })}
                menuItems={[
                  { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
                  { label: "Compare Periods", icon: <Calendar className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
                className="md:col-span-2"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={improvementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="improved" fill="#10b981" name="Improved" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="maintained" fill="#3b82f6" name="Maintained" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="declined" fill="#ef4444" name="Declined" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </StandardChartCard>
            </div>
          </TabsContent>

          <TabsContent value="competencies" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <StandardChartCard
                title="Competency Radar"
                description="Average scores across key competencies"
                onDownload={() => toast({ title: "Downloading competency data..." })}
                menuItems={[
                  { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={competencyData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="competency" />
                    <PolarRadiusAxis angle={90} domain={[0, 5]} />
                    <Radar
                      name="Average Score"
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </StandardChartCard>

              <StandardChartCard
                title="Competency Scores"
                description="Detailed breakdown by competency area"
                onDownload={() => toast({ title: "Downloading scores..." })}
                menuItems={[
                  { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                  { label: "Filter", icon: <Filter className="h-4 w-4" />, onClick: () => { } },
                  { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
                ]}
              >
                <div className="space-y-4">
                  {competencyData.map((comp, index) => (
                    <div key={index} className="space-y-2">
                      <div className="text-base font-semibold flex items-center justify-between">
                        <span className="text-sm font-medium">{comp.competency}</span>
                        <Badge variant="secondary">
                          {comp.score.toFixed(1)}/5.0
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500 transition-all"
                          style={{ width: `${(comp.score / comp.fullMark) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </StandardChartCard>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <StandardChartCard
              title="Department Performance Comparison"
              description="Average ratings and goal completion by department"
              onDownload={() => toast({ title: "Downloading department data..." })}
              menuItems={[
                { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
                { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
                { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
              ]}
            >
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={departmentPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                  <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar yAxisId="left" dataKey="avgRating" fill="#3b82f6" name="Avg Rating (out of 5)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="goalCompletion" fill="#10b981" name="Goal Completion %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-500">86%</div>
                    <div className="text-xs text-muted-foreground">Avg Goal Completion</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">4.2</div>
                    <div className="text-xs text-muted-foreground">Avg Performance Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-500">92%</div>
                    <div className="text-xs text-muted-foreground">Review Completion</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-500">78%</div>
                    <div className="text-xs text-muted-foreground">Employee Engagement</div>
                  </div>
                </div>
              </div>
            </StandardChartCard>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
