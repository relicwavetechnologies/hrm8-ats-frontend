import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { PerformanceGoal } from "@/shared/types/performance";
import { useMemo } from "react";

interface KPIAchievementChartProps {
  goals: PerformanceGoal[];
}

export function KPIAchievementChart({ goals }: KPIAchievementChartProps) {
  const { distributionData, achievementData } = useMemo(() => {
    // Calculate KPI achievement distribution
    const distribution = {
      overachieved: 0, // >120%
      achieved: 0, // 100-120%
      nearTarget: 0, // 80-99%
      belowTarget: 0, // <80%
    };

    const kpiDetails: Array<{
      goalTitle: string;
      kpiName: string;
      achievement: number;
      target: number;
      current: number;
    }> = [];

    goals.forEach(goal => {
      goal.kpis?.forEach(kpi => {
        const achievement = kpi.target > 0 ? (kpi.current / kpi.target) * 100 : 0;
        
        if (achievement >= 120) {
          distribution.overachieved++;
        } else if (achievement >= 100) {
          distribution.achieved++;
        } else if (achievement >= 80) {
          distribution.nearTarget++;
        } else {
          distribution.belowTarget++;
        }

        kpiDetails.push({
          goalTitle: goal.title,
          kpiName: kpi.name,
          achievement: Math.round(achievement),
          target: kpi.target,
          current: kpi.current,
        });
      });
    });

    const distributionData = [
      { name: 'Over-achieved (>120%)', value: distribution.overachieved, fill: 'hsl(var(--chart-2))' },
      { name: 'Achieved (100-120%)', value: distribution.achieved, fill: 'hsl(var(--chart-1))' },
      { name: 'Near Target (80-99%)', value: distribution.nearTarget, fill: 'hsl(var(--chart-3))' },
      { name: 'Below Target (<80%)', value: distribution.belowTarget, fill: 'hsl(var(--chart-4))' },
    ].filter(d => d.value > 0);

    // Top and bottom performing KPIs
    const sortedKPIs = [...kpiDetails].sort((a, b) => b.achievement - a.achievement);
    const topKPIs = sortedKPIs.slice(0, 5);
    const bottomKPIs = sortedKPIs.slice(-5).reverse();

    return {
      distributionData,
      achievementData: { topKPIs, bottomKPIs },
    };
  }, [goals]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>KPI Achievement Distribution</CardTitle>
          <CardDescription>
            Breakdown of KPI performance across all goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer 
            config={{
              value: {
                label: "KPIs",
                color: "hsl(var(--chart-1))",
              }
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top & Bottom Performing KPIs</CardTitle>
          <CardDescription>
            Best and worst KPI achievement rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-3 text-green-600">Top Performers</h4>
              <div className="space-y-2">
                {achievementData.topKPIs.map((kpi, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{kpi.kpiName}</p>
                      <p className="text-xs text-muted-foreground truncate">{kpi.goalTitle}</p>
                    </div>
                    <div className="text-right ml-2">
                      <span className="font-semibold text-green-600">{kpi.achievement}%</span>
                      <p className="text-xs text-muted-foreground">
                        {kpi.current}/{kpi.target}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 text-orange-600">Needs Attention</h4>
              <div className="space-y-2">
                {achievementData.bottomKPIs.map((kpi, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{kpi.kpiName}</p>
                      <p className="text-xs text-muted-foreground truncate">{kpi.goalTitle}</p>
                    </div>
                    <div className="text-right ml-2">
                      <span className="font-semibold text-orange-600">{kpi.achievement}%</span>
                      <p className="text-xs text-muted-foreground">
                        {kpi.current}/{kpi.target}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
