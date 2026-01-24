import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { CheckCircle2, AlertCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { RPOSLAAlerts } from './RPOSLAAlerts';
import { RPOSLAForecasting } from './RPOSLAForecasting';
import { RPOSLAComparison } from './RPOSLAComparison';
import { RPOSLAExport } from './RPOSLAExport';

interface SLAMetric {
  name: string;
  target: number;
  current: number;
  unit: string;
  status: 'met' | 'at-risk' | 'missed';
  trend: 'up' | 'down' | 'stable';
}

interface RPOSLATrackerProps {
  contractId: string;
}

export function RPOSLATracker({ contractId }: RPOSLATrackerProps) {
  // Mock data - will be replaced with real data later
  const slaMetrics: SLAMetric[] = [
    {
      name: 'Time to Submit Candidates',
      target: 48,
      current: 36,
      unit: 'hours',
      status: 'met',
      trend: 'up'
    },
    {
      name: 'Candidate Quality Score',
      target: 85,
      current: 88,
      unit: '%',
      status: 'met',
      trend: 'up'
    },
    {
      name: 'Interview-to-Offer Ratio',
      target: 30,
      current: 28,
      unit: '%',
      status: 'met',
      trend: 'stable'
    },
    {
      name: 'Monthly Placement Target',
      target: 10,
      current: 7,
      unit: 'placements',
      status: 'at-risk',
      trend: 'down'
    },
    {
      name: 'Client Response Time',
      target: 24,
      current: 18,
      unit: 'hours',
      status: 'met',
      trend: 'up'
    },
    {
      name: 'Consultant Availability',
      target: 95,
      current: 98,
      unit: '%',
      status: 'met',
      trend: 'stable'
    }
  ];

  // Historical compliance data
  const complianceHistory = [
    { month: 'Jan', compliance: 83, target: 90 },
    { month: 'Feb', compliance: 85, target: 90 },
    { month: 'Mar', compliance: 88, target: 90 },
    { month: 'Apr', compliance: 92, target: 90 },
    { month: 'May', compliance: 95, target: 90 },
    { month: 'Jun', compliance: 100, target: 90 },
  ];

  // Historical data for each metric
  const metricsHistory = {
    'Time to Submit Candidates': [
      { month: 'Jan', actual: 45, target: 48 },
      { month: 'Feb', actual: 42, target: 48 },
      { month: 'Mar', actual: 40, target: 48 },
      { month: 'Apr', actual: 38, target: 48 },
      { month: 'May', actual: 37, target: 48 },
      { month: 'Jun', actual: 36, target: 48 },
    ],
    'Candidate Quality Score': [
      { month: 'Jan', actual: 82, target: 85 },
      { month: 'Feb', actual: 84, target: 85 },
      { month: 'Mar', actual: 85, target: 85 },
      { month: 'Apr', actual: 86, target: 85 },
      { month: 'May', actual: 87, target: 85 },
      { month: 'Jun', actual: 88, target: 85 },
    ],
    'Monthly Placement Target': [
      { month: 'Jan', actual: 8, target: 10 },
      { month: 'Feb', actual: 9, target: 10 },
      { month: 'Mar', actual: 10, target: 10 },
      { month: 'Apr', actual: 9, target: 10 },
      { month: 'May', actual: 8, target: 10 },
      { month: 'Jun', actual: 7, target: 10 },
    ],
  };

  const getStatusIcon = (status: string) => {
    if (status === 'met') return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (status === 'at-risk') return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <AlertCircle className="h-5 w-5 text-destructive" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'met') return <Badge variant="default" className="bg-green-600">Met</Badge>;
    if (status === 'at-risk') return <Badge variant="outline" className="text-yellow-600 border-yellow-600">At Risk</Badge>;
    return <Badge variant="destructive">Missed</Badge>;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingUp className="h-4 w-4 text-destructive rotate-180" />;
    return <div className="h-4 w-4" />;
  };

  const getPerformancePercentage = (metric: SLAMetric) => {
    // For metrics where lower is better (like time)
    if (metric.name.includes('Time')) {
      return Math.min(100, (metric.target / metric.current) * 100);
    }
    // For metrics where higher is better
    return Math.min(100, (metric.current / metric.target) * 100);
  };

  const metCount = slaMetrics.filter(m => m.status === 'met').length;
  const overallCompliance = (metCount / slaMetrics.length) * 100;

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
        <TabsTrigger value="comparison">Comparison</TabsTrigger>
        <TabsTrigger value="alerts">Alerts</TabsTrigger>
        <TabsTrigger value="forecast">Forecast</TabsTrigger>
        <TabsTrigger value="export">Export</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6">
        {/* Overview Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>SLA Compliance Overview</CardTitle>
                <CardDescription>Real-time tracking of service level agreements</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">{overallCompliance.toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Overall Compliance</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{metCount}</div>
                <div className="text-sm text-muted-foreground">Met</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {slaMetrics.filter(m => m.status === 'at-risk').length}
                </div>
                <div className="text-sm text-muted-foreground">At Risk</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-2xl font-bold text-destructive">
                  {slaMetrics.filter(m => m.status === 'missed').length}
                </div>
                <div className="text-sm text-muted-foreground">Missed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SLA Metrics Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {slaMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(metric.status)}
                      <div>
                        <h4 className="font-semibold">{metric.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Target: {metric.target} {metric.unit}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(metric.status)}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">
                        {metric.current} {metric.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span className="text-xs text-muted-foreground">
                        {metric.trend === 'up' ? 'Improving' : metric.trend === 'down' ? 'Declining' : 'Stable'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Progress 
                      value={getPerformancePercentage(metric)} 
                      className="h-2"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Performance</span>
                      <span className="text-xs font-medium">
                        {getPerformancePercentage(metric).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* Historical Trends Tab */}
      <TabsContent value="trends" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Compliance Trend</CardTitle>
            <CardDescription>6-month compliance rate history</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={complianceHistory}>
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
                        <p className="text-sm text-green-600">
                          Compliance: {data.compliance}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Target: {data.target}%
                        </p>
                      </div>
                    );
                  }}
                />
                <Legend />
                <ReferenceLine y={90} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label="Target" />
                <Area 
                  type="monotone" 
                  dataKey="compliance" 
                  stroke="hsl(142, 76%, 36%)" 
                  fill="hsl(142, 76%, 36%, 0.2)"
                  strokeWidth={2}
                  name="Compliance Rate"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(metricsHistory).map(([metricName, history]) => (
            <Card key={metricName}>
              <CardHeader>
                <CardTitle className="text-lg">{metricName}</CardTitle>
                <CardDescription>6-month trend</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={history}>
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
                              Actual: {data.actual}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Target: {data.target}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend />
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
                      dataKey="target" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Target"
                      dot={{ fill: 'hsl(var(--muted-foreground))', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* Target vs Actual Comparison Tab */}
      <TabsContent value="comparison" className="space-y-6">
        <div className="grid gap-6">
          {slaMetrics.map((metric, index) => {
            const history = metricsHistory[metric.name as keyof typeof metricsHistory];
            if (!history) return null;

            const isPerforming = metric.current >= metric.target;
            const performanceDiff = metric.current - metric.target;

            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {metric.name}
                        {isPerforming ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-destructive" />
                        )}
                      </CardTitle>
                      <CardDescription>
                        Current: {metric.current} {metric.unit} | Target: {metric.target} {metric.unit}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${isPerforming ? 'text-green-600' : 'text-destructive'}`}>
                        {performanceDiff > 0 ? '+' : ''}{performanceDiff} {metric.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">vs Target</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0].payload;
                          const diff = data.actual - data.target;
                          return (
                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                              <p className="font-medium mb-1">{data.month}</p>
                              <p className="text-sm text-primary">
                                Actual: {data.actual} {metric.unit}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Target: {data.target} {metric.unit}
                              </p>
                              <p className={`text-sm font-medium ${diff >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                                {diff > 0 ? '+' : ''}{diff} {metric.unit}
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="target" 
                        stroke="hsl(var(--muted-foreground))" 
                        fill="hsl(var(--muted), 0.3)"
                        strokeWidth={2}
                        name="Target"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="actual" 
                        stroke={isPerforming ? "hsl(142, 76%, 36%)" : "hsl(var(--destructive))"} 
                        fill={isPerforming ? "hsl(142, 76%, 36%, 0.2)" : "hsl(var(--destructive), 0.2)"}
                        strokeWidth={2}
                        name="Actual"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TabsContent>

      {/* Alerts Tab */}
      <TabsContent value="alerts">
        <RPOSLAAlerts contractId={contractId} />
      </TabsContent>

      {/* Forecasting Tab */}
      <TabsContent value="forecast">
        <RPOSLAForecasting contractId={contractId} />
      </TabsContent>

      {/* Multi-Contract Comparison Tab */}
      <TabsContent value="comparison">
        <Card>
          <CardHeader>
            <CardTitle>Multi-Contract Comparison</CardTitle>
            <CardDescription>Compare SLA performance across all RPO contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <RPOSLAComparison />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Export Tab */}
      <TabsContent value="export">
        <RPOSLAExport contractId={contractId} />
      </TabsContent>
    </Tabs>
  );
}
