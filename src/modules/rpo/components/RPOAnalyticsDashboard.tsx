import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Users, Award, FileText, Download, Filter } from 'lucide-react';
import { exportToCSV } from '@/utils/exportHelpers';

// ML-based revenue forecasting data
const revenueForecastData = [
  { month: 'Jan', actual: 580000, predicted: 580000, lower: 570000, upper: 590000 },
  { month: 'Feb', actual: 620000, predicted: 620000, lower: 605000, upper: 635000 },
  { month: 'Mar', actual: 650000, predicted: 645000, lower: 625000, upper: 665000 },
  { month: 'Apr', actual: 680000, predicted: 685000, lower: 660000, upper: 710000 },
  { month: 'May', actual: 710000, predicted: 705000, lower: 680000, upper: 730000 },
  { month: 'Jun', actual: 740000, predicted: 740000, lower: 710000, upper: 770000 },
  { month: 'Jul', actual: null, predicted: 775000, lower: 740000, upper: 810000 },
  { month: 'Aug', actual: null, predicted: 810000, lower: 770000, upper: 850000 },
  { month: 'Sep', actual: null, predicted: 845000, lower: 800000, upper: 890000 },
  { month: 'Oct', actual: null, predicted: 880000, lower: 830000, upper: 930000 },
  { month: 'Nov', actual: null, predicted: 915000, lower: 860000, upper: 970000 },
  { month: 'Dec', actual: null, predicted: 950000, lower: 890000, upper: 1010000 },
];

// Placement success prediction data
const placementPredictionData = [
  { role: 'Senior Developer', historicalSuccess: 85, predictedSuccess: 88, placements: 45 },
  { role: 'Product Manager', historicalSuccess: 78, predictedSuccess: 82, placements: 32 },
  { role: 'Data Scientist', historicalSuccess: 72, predictedSuccess: 76, placements: 28 },
  { role: 'UX Designer', historicalSuccess: 90, predictedSuccess: 92, placements: 38 },
  { role: 'DevOps Engineer', historicalSuccess: 68, predictedSuccess: 71, placements: 25 },
];

// Market trend analysis data
const marketTrendData = [
  { quarter: 'Q1 2024', demandIndex: 75, supplyIndex: 65, competitionIndex: 70 },
  { quarter: 'Q2 2024', demandIndex: 82, supplyIndex: 68, competitionIndex: 75 },
  { quarter: 'Q3 2024', demandIndex: 88, supplyIndex: 72, competitionIndex: 78 },
  { quarter: 'Q4 2024', demandIndex: 92, supplyIndex: 75, competitionIndex: 82 },
  { quarter: 'Q1 2025', demandIndex: 95, supplyIndex: 78, competitionIndex: 85 },
];

// Competitor benchmarking data
const competitorData = [
  { metric: 'Time to Fill', ourCompany: 28, competitor1: 35, competitor2: 32, industry: 40 },
  { metric: 'Fill Rate', ourCompany: 85, competitor1: 78, competitor2: 80, industry: 75 },
  { metric: 'Retention', ourCompany: 92, competitor1: 85, competitor2: 88, industry: 82 },
  { metric: 'Client Satisfaction', ourCompany: 4.6, competitor1: 4.2, competitor2: 4.3, industry: 4.0 },
  { metric: 'Cost per Hire', ourCompany: 4500, competitor1: 5200, competitor2: 4900, industry: 5500 },
];

// Executive KPIs
const executiveKPIs = [
  { name: 'Revenue Growth', value: '+24%', trend: 'up', target: '20%', status: 'exceeding' },
  { name: 'Placement Success', value: '87%', trend: 'up', target: '85%', status: 'exceeding' },
  { name: 'Client Retention', value: '94%', trend: 'up', target: '90%', status: 'exceeding' },
  { name: 'Consultant Utilization', value: '82%', trend: 'down', target: '85%', status: 'below' },
  { name: 'Time to Fill', value: '28 days', trend: 'up', target: '25 days', status: 'below' },
  { name: 'Net Promoter Score', value: '72', trend: 'up', target: '70', status: 'exceeding' },
];

// Radar chart data for comprehensive metrics
const comprehensiveMetrics = [
  { metric: 'Quality', value: 90, fullMark: 100 },
  { metric: 'Speed', value: 85, fullMark: 100 },
  { metric: 'Cost Efficiency', value: 78, fullMark: 100 },
  { metric: 'Client Satisfaction', value: 92, fullMark: 100 },
  { metric: 'Innovation', value: 75, fullMark: 100 },
  { metric: 'Scalability', value: 88, fullMark: 100 },
];

export function RPOAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('12m');
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(['all']);

  const handleExportReport = () => {
    const reportData = [
      { Section: 'Executive Summary', ...executiveKPIs.reduce((acc, kpi) => ({ ...acc, [kpi.name]: kpi.value }), {}) },
      ...revenueForecastData.map(d => ({ Section: 'Revenue Forecast', ...d })),
      ...placementPredictionData.map(d => ({ Section: 'Placement Predictions', ...d })),
      ...marketTrendData.map(d => ({ Section: 'Market Trends', ...d })),
    ];
    exportToCSV(reportData, 'rpo_analytics_report', {
      currencyFields: ['actual', 'predicted', 'lower', 'upper']
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">RPO Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive insights with predictive analytics and benchmarking</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
              <SelectItem value="24m">Last 24 months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {executiveKPIs.map((kpi) => (
          <Card key={kpi.name}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.name}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">Target: {kpi.target}</p>
                </div>
                <Badge variant={kpi.status === 'exceeding' ? 'default' : 'secondary'}>
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {kpi.status === 'exceeding' ? 'On Track' : 'Below Target'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="forecast">Revenue Forecast</TabsTrigger>
          <TabsTrigger value="placements">Placement Predictions</TabsTrigger>
          <TabsTrigger value="market">Market Trends</TabsTrigger>
          <TabsTrigger value="benchmark">Benchmarking</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Revenue Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Revenue Forecasting</CardTitle>
              <CardDescription>ML-based revenue predictions with confidence intervals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={revenueForecastData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="upper" 
                    stackId="1" 
                    stroke="none" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.1}
                    name="Upper Bound"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lower" 
                    stackId="1" 
                    stroke="none" 
                    fill="hsl(var(--background))" 
                    fillOpacity={1}
                    name="Lower Bound"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Actual Revenue"
                    connectNulls
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted Revenue"
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Forecast Accuracy</p>
                  <p className="text-2xl font-bold text-primary">94.2%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Growth Prediction</p>
                  <p className="text-2xl font-bold text-success">+28.4%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Confidence Level</p>
                  <p className="text-2xl font-bold">87%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placement Predictions Tab */}
        <TabsContent value="placements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Placement Success Predictions</CardTitle>
              <CardDescription>Historical vs predicted success rates by role type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={placementPredictionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="role" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="historicalSuccess" fill="hsl(var(--chart-1))" name="Historical Success %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="predictedSuccess" fill="hsl(var(--chart-2))" name="Predicted Success %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-3">
                {placementPredictionData.map((item) => (
                  <div key={item.role} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.role}</p>
                      <p className="text-sm text-muted-foreground">{item.placements} placements</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {item.predictedSuccess > item.historicalSuccess ? (
                          <span className="text-success">↑ +{item.predictedSuccess - item.historicalSuccess}%</span>
                        ) : (
                          <span className="text-muted-foreground">→ Stable</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Trends Tab */}
        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Trend Analysis</CardTitle>
              <CardDescription>Demand, supply, and competition indices over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={marketTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="quarter" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="demandIndex" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Demand Index" />
                  <Line type="monotone" dataKey="supplyIndex" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Supply Index" />
                  <Line type="monotone" dataKey="competitionIndex" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Competition Index" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-chart-1" />
                      <p className="text-sm text-muted-foreground">Market Demand</p>
                      <p className="text-2xl font-bold">High</p>
                      <Badge className="mt-2" variant="default">Growing +15%</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-chart-2" />
                      <p className="text-sm text-muted-foreground">Talent Supply</p>
                      <p className="text-2xl font-bold">Moderate</p>
                      <Badge className="mt-2" variant="secondary">Stable +4%</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Award className="h-8 w-8 mx-auto mb-2 text-chart-3" />
                      <p className="text-sm text-muted-foreground">Competition</p>
                      <p className="text-2xl font-bold">Medium</p>
                      <Badge className="mt-2" variant="outline">Rising +9%</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benchmarking Tab */}
        <TabsContent value="benchmark" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competitor Benchmarking</CardTitle>
              <CardDescription>Performance comparison against key competitors and industry average</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={competitorData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="metric" type="category" className="text-xs" width={120} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="ourCompany" fill="hsl(var(--primary))" name="Our Company" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="competitor1" fill="hsl(var(--chart-2))" name="Competitor A" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="competitor2" fill="hsl(var(--chart-3))" name="Competitor B" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="industry" fill="hsl(var(--muted))" name="Industry Avg" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Competitive Advantages:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    20% faster time-to-fill than industry average
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    Highest fill rate at 85% (10% above industry)
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    Superior retention rate of 92%
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    18% lower cost per hire
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Comprehensive Performance Metrics</CardTitle>
                <CardDescription>360° view of operational excellence</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={comprehensiveMetrics}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" className="text-xs" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs" />
                    <Radar name="Performance" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Insights & Recommendations</CardTitle>
                <CardDescription>Data-driven actionable recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">Revenue Opportunity</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          ML models predict 28% revenue growth potential. Focus on UX Designer placements (92% success rate) to maximize returns.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-chart-2/20 bg-chart-2/5 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-chart-2 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">Consultant Utilization</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Current utilization at 82%. Recommend rebalancing workload across 3 underutilized consultants to reach 85% target.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-chart-3/20 bg-chart-3/5 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-chart-3 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">Market Positioning</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Rising competition (+9%) detected. Leverage 20% faster time-to-fill advantage in marketing to maintain market share.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-warning/20 bg-warning/5 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">DevOps Improvement Needed</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          DevOps Engineer placements showing lowest success rate (68%). Recommend specialized training or partnership expansion.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
