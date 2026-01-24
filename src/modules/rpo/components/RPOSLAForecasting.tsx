import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface RPOSLAForecastingProps {
  contractId: string;
}

export function RPOSLAForecasting(props: RPOSLAForecastingProps) {
  // Mock forecasting data
  const forecastData = [
    { month: 'Jan', actual: 83, forecast: null },
    { month: 'Feb', actual: 85, forecast: null },
    { month: 'Mar', actual: 88, forecast: null },
    { month: 'Apr', actual: 92, forecast: null },
    { month: 'May', actual: 95, forecast: null },
    { month: 'Jun', actual: 100, forecast: null },
    { month: 'Jul', actual: null, forecast: 98 },
    { month: 'Aug', actual: null, forecast: 96 },
    { month: 'Sep', actual: null, forecast: 94 },
  ];

  const metricForecasts = [
    {
      name: 'Time to Submit Candidates',
      current: 36,
      target: 48,
      unit: 'hours',
      forecast: [
        { month: 'Current', value: 36, target: 48 },
        { month: '+1M', value: 35, target: 48 },
        { month: '+2M', value: 34, target: 48 },
        { month: '+3M', value: 33, target: 48 },
      ],
      trend: 'improving',
      prediction: 'Expected to maintain performance above target for the next 3 months'
    },
    {
      name: 'Monthly Placement Target',
      current: 7,
      target: 10,
      unit: 'placements',
      forecast: [
        { month: 'Current', value: 7, target: 10 },
        { month: '+1M', value: 8, target: 10 },
        { month: '+2M', value: 9, target: 10 },
        { month: '+3M', value: 10, target: 10 },
      ],
      trend: 'improving',
      prediction: 'Projected to meet target by month +3 with current improvement rate'
    },
    {
      name: 'Candidate Quality Score',
      current: 88,
      target: 85,
      unit: '%',
      forecast: [
        { month: 'Current', value: 88, target: 85 },
        { month: '+1M', value: 89, target: 85 },
        { month: '+2M', value: 89, target: 85 },
        { month: '+3M', value: 90, target: 85 },
      ],
      trend: 'stable',
      prediction: 'Quality score expected to remain above target with slight improvements'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Compliance Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>Overall SLA Compliance Forecast</CardTitle>
          <CardDescription>Predicted compliance rate for the next 3 months based on historical trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" domain={[0, 100]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-medium mb-1">{data.month}</p>
                      {data.actual && (
                        <p className="text-sm text-primary">
                          Actual: {data.actual}%
                        </p>
                      )}
                      {data.forecast && (
                        <p className="text-sm text-blue-600">
                          Forecast: {data.forecast}%
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              <Legend />
              <ReferenceLine y={90} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label="Target 90%" />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Actual"
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="forecast" 
                stroke="hsl(217, 91%, 60%)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Forecast"
                dot={{ fill: 'hsl(217, 91%, 60%)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Forecast Insights</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  Overall compliance is predicted to stabilize around 95-98% over the next quarter. 
                  Minor dip expected in August due to seasonal factors.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Metric Forecasts */}
      <div className="space-y-4">
        {metricForecasts.map((metric, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {metric.name}
                    {metric.trend === 'improving' ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-yellow-600" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    Current: {metric.current} {metric.unit} | Target: {metric.target} {metric.unit}
                  </CardDescription>
                </div>
                <Badge variant={metric.trend === 'improving' ? 'default' : 'secondary'}>
                  {metric.trend}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={metric.forecast}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium mb-1">{data.month}</p>
                          <p className="text-sm text-primary">
                            Forecast: {data.value} {metric.unit}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Target: {data.target} {metric.unit}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    name="Target"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(217, 91%, 60%)" 
                    strokeWidth={2}
                    name="Forecast"
                    dot={{ fill: 'hsl(217, 91%, 60%)', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{metric.prediction}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
