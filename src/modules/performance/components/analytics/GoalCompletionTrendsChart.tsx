import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import type { PerformanceGoal } from "@/shared/types/performance";
import { useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

interface GoalCompletionTrendsChartProps {
  goals: PerformanceGoal[];
  timeRange: string;
}

export function GoalCompletionTrendsChart({ goals, timeRange }: GoalCompletionTrendsChartProps) {
  const chartData = useMemo(() => {
    // Determine date range
    const now = new Date();
    let startDate: Date;
    
    switch(timeRange) {
      case '1month':
        startDate = subMonths(now, 1);
        break;
      case '3months':
        startDate = subMonths(now, 3);
        break;
      case '6months':
        startDate = subMonths(now, 6);
        break;
      case '1year':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subMonths(now, 12); // default to 1 year
    }

    // Generate monthly data points
    const months: Date[] = [];
    let currentMonth = startOfMonth(startDate);
    while (currentMonth <= now) {
      months.push(currentMonth);
      currentMonth = startOfMonth(subMonths(currentMonth, -1));
    }

    // Calculate metrics for each month
    return months.map(month => {
      const monthEnd = endOfMonth(month);
      const monthInterval = { start: month, end: monthEnd };

      const goalsCreated = goals.filter(g => {
        const createdDate = new Date(g.createdAt);
        return isWithinInterval(createdDate, monthInterval);
      }).length;

      const goalsCompleted = goals.filter(g => {
        if (!g.completedDate) return false;
        const completedDate = new Date(g.completedDate);
        return isWithinInterval(completedDate, monthInterval);
      }).length;

      const goalsInProgress = goals.filter(g => {
        const createdDate = new Date(g.createdAt);
        const isCreatedBefore = createdDate <= monthEnd;
        const isNotCompletedYet = !g.completedDate || new Date(g.completedDate) > monthEnd;
        return isCreatedBefore && isNotCompletedYet && g.status === 'in-progress';
      }).length;

      return {
        month: format(month, 'MMM yyyy'),
        created: goalsCreated,
        completed: goalsCompleted,
        inProgress: goalsInProgress,
      };
    });
  }, [goals, timeRange]);

  const chartConfig = {
    created: {
      label: "Created",
      color: "hsl(var(--chart-1))",
    },
    completed: {
      label: "Completed",
      color: "hsl(var(--chart-2))",
    },
    inProgress: {
      label: "In Progress",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Completion Trends</CardTitle>
        <CardDescription>
          Track goal creation, completion, and progress over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="created" 
                stroke="var(--color-created)" 
                strokeWidth={2}
                dot={{ fill: 'var(--color-created)' }}
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="var(--color-completed)" 
                strokeWidth={2}
                dot={{ fill: 'var(--color-completed)' }}
              />
              <Line 
                type="monotone" 
                dataKey="inProgress" 
                stroke="var(--color-inProgress)" 
                strokeWidth={2}
                dot={{ fill: 'var(--color-inProgress)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
