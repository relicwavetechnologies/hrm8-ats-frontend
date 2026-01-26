import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import type { PerformanceGoal } from "@/types/performance";
import { useMemo } from "react";

interface ProgressByCategoryChartProps {
  goals: PerformanceGoal[];
}

export function ProgressByCategoryChart({ goals }: ProgressByCategoryChartProps) {
  const chartData = useMemo(() => {
    // Group goals by category
    const categoryMap = new Map<string, {
      total: number;
      completed: number;
      inProgress: number;
      notStarted: number;
      avgProgress: number;
      totalProgress: number;
    }>();

    goals.forEach(goal => {
      const category = goal.category || 'Uncategorized';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          total: 0,
          completed: 0,
          inProgress: 0,
          notStarted: 0,
          avgProgress: 0,
          totalProgress: 0,
        });
      }

      const stats = categoryMap.get(category)!;
      stats.total++;
      stats.totalProgress += goal.progress;

      if (goal.status === 'completed') {
        stats.completed++;
      } else if (goal.status === 'in-progress') {
        stats.inProgress++;
      } else if (goal.status === 'not-started') {
        stats.notStarted++;
      }
    });

    // Convert to chart data format
    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category: category.length > 15 ? category.substring(0, 15) + '...' : category,
      fullCategory: category,
      completed: stats.completed,
      inProgress: stats.inProgress,
      notStarted: stats.notStarted,
      avgProgress: Math.round(stats.totalProgress / stats.total),
      total: stats.total,
    })).sort((a, b) => b.total - a.total);
  }, [goals]);

  const chartConfig = {
    completed: {
      label: "Completed",
      color: "hsl(var(--chart-2))",
    },
    inProgress: {
      label: "In Progress",
      color: "hsl(var(--chart-3))",
    },
    notStarted: {
      label: "Not Started",
      color: "hsl(var(--chart-4))",
    },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Goals by Category</CardTitle>
          <CardDescription>
            Distribution of goals across categories by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="category" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Legend />
                <Bar 
                  dataKey="completed" 
                  stackId="a"
                  fill="var(--color-completed)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="inProgress" 
                  stackId="a"
                  fill="var(--color-inProgress)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="notStarted" 
                  stackId="a"
                  fill="var(--color-notStarted)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Progress by Category</CardTitle>
          <CardDescription>
            Mean progress percentage across categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer 
            config={{
              avgProgress: {
                label: "Avg Progress",
                color: "hsl(var(--chart-1))",
              }
            }} 
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="category" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  domain={[0, 100]}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent formatter={(value) => `${value}%`} />}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar 
                  dataKey="avgProgress" 
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                  label={{ position: 'top', fill: 'hsl(var(--foreground))', fontSize: 12 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
