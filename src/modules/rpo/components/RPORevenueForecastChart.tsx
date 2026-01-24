import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { MonthlyRevenueForecast } from '@/shared/lib/rpoTrackingUtils';
import { TrendingUp, DollarSign } from 'lucide-react';

interface RPORevenueForecastChartProps {
  forecasts: MonthlyRevenueForecast[];
}

export function RPORevenueForecastChart({ forecasts }: RPORevenueForecastChartProps) {
  const chartData = forecasts.map(forecast => ({
    month: forecast.monthLabel,
    revenue: forecast.projectedRevenue,
    contracts: forecast.activeContracts,
  }));

  const totalProjectedRevenue = forecasts.reduce((sum, f) => sum + f.projectedRevenue, 0);
  const averageMonthlyRevenue = forecasts.length > 0 ? totalProjectedRevenue / forecasts.length : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const forecast = forecasts.find(f => f.monthLabel === data.month);

      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-semibold mb-2">{data.month}</p>
          <p className="text-sm text-muted-foreground mb-2">
            Projected Revenue: <span className="font-semibold text-foreground">
              ${data.revenue.toLocaleString()}
            </span>
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            Active Contracts: <span className="font-semibold text-foreground">
              {data.contracts}
            </span>
          </p>

          {forecast && forecast.contractBreakdown.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs font-semibold mb-1">Contract Breakdown:</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {forecast.contractBreakdown.map((contract, idx) => (
                  <div key={idx} className="text-xs flex justify-between gap-2">
                    <span className="text-muted-foreground truncate">
                      {contract.clientName}
                    </span>
                    <span className="font-medium">
                      ${contract.monthlyRetainer.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Forecast (12 Months)
            </CardTitle>
            <CardDescription>
              Projected monthly recurring revenue based on active contracts
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Avg Monthly</p>
            <p className="text-2xl font-bold flex items-center gap-1">
              <DollarSign className="h-5 w-5" />
              {averageMonthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>

            <XAxis
              dataKey="month"
              className="text-xs"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              className="text-xs"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="revenue"
              name="Projected Revenue"
              fill="hsl(var(--chart-2))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Additional Line Chart for Trend */}
        <div className="mt-6">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>

              <XAxis
                dataKey="month"
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                className="text-xs"
                yAxisId="left"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                className="text-xs"
                yAxisId="right"
                orientation="right"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue Trend"
                stroke="hsl(var(--chart-2))"
                strokeWidth={3}
                yAxisId="left"
                dot={false}
                activeDot={false}
              />
              <Line
                type="monotone"
                dataKey="contracts"
                name="Active Contracts"
                stroke="hsl(var(--chart-1))"
                strokeWidth={3}
                yAxisId="right"
                dot={false}
                activeDot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Total 12-Month Projection</p>
            <p className="text-xl font-bold">
              ${totalProjectedRevenue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Monthly</p>
            <p className="text-xl font-bold">
              ${averageMonthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Contracts (Current)</p>
            <p className="text-xl font-bold">
              {chartData[0]?.contracts || 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
