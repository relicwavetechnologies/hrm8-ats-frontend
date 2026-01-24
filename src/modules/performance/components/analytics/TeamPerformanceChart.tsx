import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import type { PerformanceGoal } from "@/shared/types/performance";
import type { Employee } from "@/shared/types/employee";
import { useMemo } from "react";

interface TeamPerformanceChartProps {
  goals: PerformanceGoal[];
  employees: Employee[];
}

export function TeamPerformanceChart({ goals, employees }: TeamPerformanceChartProps) {
  const { employeeData, departmentData } = useMemo(() => {
    // Group by employee
    const employeeMap = new Map<string, {
      name: string;
      department: string;
      totalGoals: number;
      completedGoals: number;
      avgProgress: number;
      totalProgress: number;
      kpiAchievement: number;
      totalKPIs: number;
      achievedKPIs: number;
    }>();

    goals.forEach(goal => {
      const employee = employees.find(e => e.id === goal.employeeId);
      const employeeId = goal.employeeId;
      
      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          name: goal.employeeName || 'Unknown',
          department: employee?.department || 'Unknown',
          totalGoals: 0,
          completedGoals: 0,
          avgProgress: 0,
          totalProgress: 0,
          kpiAchievement: 0,
          totalKPIs: 0,
          achievedKPIs: 0,
        });
      }

      const stats = employeeMap.get(employeeId)!;
      stats.totalGoals++;
      stats.totalProgress += goal.progress;
      if (goal.status === 'completed') {
        stats.completedGoals++;
      }

      // Calculate KPI achievement
      goal.kpis?.forEach(kpi => {
        stats.totalKPIs++;
        if (kpi.current >= kpi.target) {
          stats.achievedKPIs++;
        }
      });
    });

    // Calculate averages and format data
    const employeeData = Array.from(employeeMap.values()).map(stats => ({
      name: stats.name.length > 20 ? stats.name.substring(0, 20) + '...' : stats.name,
      fullName: stats.name,
      department: stats.department,
      totalGoals: stats.totalGoals,
      completedGoals: stats.completedGoals,
      completionRate: stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0,
      avgProgress: stats.totalGoals > 0 ? Math.round(stats.totalProgress / stats.totalGoals) : 0,
      kpiAchievement: stats.totalKPIs > 0 ? Math.round((stats.achievedKPIs / stats.totalKPIs) * 100) : 0,
    })).sort((a, b) => b.completionRate - a.completionRate);

    // Group by department
    const departmentMap = new Map<string, {
      totalGoals: number;
      completedGoals: number;
      avgProgress: number;
      totalProgress: number;
      employeeCount: number;
      kpiAchievement: number;
      totalKPIs: number;
      achievedKPIs: number;
    }>();

    employeeData.forEach(emp => {
      const dept = emp.department;
      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, {
          totalGoals: 0,
          completedGoals: 0,
          avgProgress: 0,
          totalProgress: 0,
          employeeCount: 0,
          kpiAchievement: 0,
          totalKPIs: 0,
          achievedKPIs: 0,
        });
      }

      const stats = departmentMap.get(dept)!;
      stats.totalGoals += emp.totalGoals;
      stats.completedGoals += emp.completedGoals;
      stats.totalProgress += emp.avgProgress;
      stats.employeeCount++;
    });

    const departmentData = Array.from(departmentMap.entries()).map(([dept, stats]) => ({
      department: dept,
      avgProgress: Math.round(stats.totalProgress / stats.employeeCount),
      completionRate: stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0,
      totalGoals: stats.totalGoals,
      employeeCount: stats.employeeCount,
    }));

    return { employeeData, departmentData };
  }, [goals, employees]);

  const chartConfig = {
    completionRate: {
      label: "Completion Rate",
      color: "hsl(var(--chart-2))",
    },
    avgProgress: {
      label: "Avg Progress",
      color: "hsl(var(--chart-1))",
    },
    kpiAchievement: {
      label: "KPI Achievement",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Employee Performance Comparison</CardTitle>
          <CardDescription>
            Top performing employees by completion rate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeeData.slice(0, 10)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number"
                  domain={[0, 100]}
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  width={120}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Legend />
                <Bar 
                  dataKey="completionRate" 
                  fill="var(--color-completionRate)"
                  radius={[0, 4, 4, 0]}
                  label={{ position: 'right', fill: 'hsl(var(--foreground))', fontSize: 10 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department Performance Overview</CardTitle>
          <CardDescription>
            Performance metrics across departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer 
            config={{
              ...chartConfig,
              totalGoals: {
                label: "Total Goals",
                color: "hsl(var(--chart-4))",
              }
            }} 
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={departmentData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="department" 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                />
                <Radar 
                  name="Completion Rate" 
                  dataKey="completionRate" 
                  stroke="var(--color-completionRate)" 
                  fill="var(--color-completionRate)" 
                  fillOpacity={0.6}
                />
                <Radar 
                  name="Avg Progress" 
                  dataKey="avgProgress" 
                  stroke="var(--color-avgProgress)" 
                  fill="var(--color-avgProgress)" 
                  fillOpacity={0.3}
                />
                <Legend />
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
