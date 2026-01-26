import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { getPerformanceGoals } from "@/shared/lib/performanceStorage";
import { getEmployees } from "@/shared/lib/employeeStorage";
import { useState, useMemo } from "react";
import { GoalCompletionTrendsChart } from "./GoalCompletionTrendsChart";
import { ProgressByCategoryChart } from "./ProgressByCategoryChart";
import { KPIAchievementChart } from "./KPIAchievementChart";
import { TeamPerformanceChart } from "./TeamPerformanceChart";
import { Target, TrendingUp, Award, Users } from "lucide-react";

export function GoalAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("6months");
  const goals = useMemo(() => getPerformanceGoals(), []);
  const employees = useMemo(() => getEmployees(), []);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const inProgress = goals.filter(g => g.status === 'in-progress').length;
    const avgProgress = goals.length > 0 
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Calculate KPI achievement
    let totalKPIs = 0;
    let achievedKPIs = 0;
    goals.forEach(goal => {
      goal.kpis?.forEach(kpi => {
        totalKPIs++;
        if (kpi.current >= kpi.target) achievedKPIs++;
      });
    });
    const kpiAchievementRate = totalKPIs > 0 ? Math.round((achievedKPIs / totalKPIs) * 100) : 0;

    return { total, completed, inProgress, avgProgress, completionRate, kpiAchievementRate };
  }, [goals]);

  return (
    <div className="space-y-6">
      {/* Header with Time Range Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Goal Analytics</h2>
          <p className="text-muted-foreground">Track goal performance and team progress</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completed} completed, {stats.inProgress} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Average progress: {stats.avgProgress}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KPI Achievement</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kpiAchievementRate}%</div>
            <p className="text-xs text-muted-foreground">
              Of all KPI targets met
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(goals.map(g => g.employeeId)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              With active goals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Completion Trends</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="kpi">KPI Achievement</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <GoalCompletionTrendsChart goals={goals} timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <ProgressByCategoryChart goals={goals} />
        </TabsContent>

        <TabsContent value="kpi" className="space-y-4">
          <KPIAchievementChart goals={goals} />
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <TeamPerformanceChart goals={goals} employees={employees} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
