import { PageHeader } from '@/shared/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { getAIInterviewSessions } from '@/shared/lib/aiInterview/aiInterviewStorage';
import { BarChart3, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { AIInterviewPerformanceChart } from '@/components/aiInterview/dashboard/AIInterviewPerformanceChart';
import { AIInterviewCalendar } from '@/components/aiInterview/calendar/AIInterviewCalendar';
import { InterviewComparisonTool } from '@/components/aiInterview/comparison/InterviewComparisonTool';
import { StandardChartCard } from '@/components/dashboard/charts/StandardChartCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

export default function AIInterviewAnalytics() {
  const sessions = getAIInterviewSessions();
  const completedSessions = sessions.filter(s => s.status === 'completed');

  const totalInterviews = sessions.length;
  const completionRate = totalInterviews > 0
    ? Math.round((completedSessions.length / totalInterviews) * 100)
    : 0;

  const avgScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.analysis?.overallScore || 0), 0) / completedSessions.length)
    : 0;

  const avgDuration = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length / 60)
    : 0;

  // Trend data for the last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - i));
    const monthName = month.toLocaleDateString('en-US', { month: 'short' });

    return {
      month: monthName,
      interviews: Math.floor(Math.random() * 10) + 5,
      avgScore: Math.floor(Math.random() * 20) + 70,
    };
  });

  // Mode distribution data
  const modeData = [
    { name: 'Video', value: sessions.filter(s => s.interviewMode === 'video').length, color: 'hsl(var(--primary))' },
    { name: 'Phone', value: sessions.filter(s => s.interviewMode === 'phone').length, color: 'hsl(var(--secondary))' },
    { name: 'Text', value: sessions.filter(s => s.interviewMode === 'text').length, color: 'hsl(var(--accent))' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="AI Interview Analytics"
        description="Comprehensive insights and metrics from AI interviews"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInterviews}</div>
            <p className="text-xs text-muted-foreground">
              {completedSessions.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Of scheduled interviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}</div>
            <p className="text-xs text-muted-foreground">
              Out of 100
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDuration} min</div>
            <p className="text-xs text-muted-foreground">
              Per interview
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <StandardChartCard
            title="Interview Trends"
            description="Interview volume and average scores over time"
            className="bg-transparent border-0 shadow-none"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip cursor={false} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="interviews"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={false}
                  name="Interviews"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={false}
                  activeDot={false}
                  name="Avg Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </StandardChartCard>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Interview Performance Overview</CardTitle>
              <CardDescription>Current interview statistics by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled</p>
                    <p className="text-2xl font-bold">
                      {sessions.filter(s => s.status === 'scheduled').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">
                      {sessions.filter(s => s.status === 'in-progress').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">
                      {completedSessions.length}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <StandardChartCard
              title="Interview Modes Distribution"
              className="bg-transparent border-0 shadow-none"
            >
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={modeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    labelLine={false}
                    label={false}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {modeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </StandardChartCard>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Top Performing Candidates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedSessions
                    .sort((a, b) => (b.analysis?.overallScore || 0) - (a.analysis?.overallScore || 0))
                    .slice(0, 5)
                    .map(session => (
                      <div key={session.id} className="text-base font-semibold flex items-center justify-between">
                        <div>
                          <p className="font-medium">{session.candidateName}</p>
                          <p className="text-sm text-muted-foreground">{session.jobTitle}</p>
                        </div>
                        <div className="text-lg font-bold">{session.analysis?.overallScore}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <AIInterviewPerformanceChart />
        </TabsContent>

        <TabsContent value="calendar">
          <AIInterviewCalendar />
        </TabsContent>

        <TabsContent value="comparison">
          <InterviewComparisonTool />
        </TabsContent>
      </Tabs>
    </div>
  );
}
