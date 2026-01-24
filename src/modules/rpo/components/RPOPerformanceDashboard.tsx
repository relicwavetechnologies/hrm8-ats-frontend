import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
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
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Award,
  DollarSign,
  Star,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import type {
  ContractPerformanceMetrics,
  YearOverYearComparison,
  MonthlyPerformanceTrend,
  PerformanceBenchmark
} from '@/shared/lib/rpoPerformanceUtils';
import { cn } from '@/shared/lib/utils';

interface RPOPerformanceDashboardProps {
  contracts: ContractPerformanceMetrics[];
  summary: {
    totalPlacements: number;
    averagePlacementRate: number;
    averageTimeToFill: number;
    averageClientSatisfaction: number;
    averageCostPerHire: number;
    totalCandidatesScreened: number;
    totalCandidatesInterviewed: number;
    overallRetentionRate: number;
    topPerformingContract: ContractPerformanceMetrics | null;
  };
  yoyComparison: YearOverYearComparison[];
  monthlyTrend: MonthlyPerformanceTrend[];
  benchmarks: PerformanceBenchmark[];
}

export function RPOPerformanceDashboard({
  contracts,
  summary,
  yoyComparison,
  monthlyTrend,
  benchmarks,
}: RPOPerformanceDashboardProps) {
  const navigate = useNavigate();
  const [expandedContract, setExpandedContract] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-chart-1" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
      case 'stable': return <Minus className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  const getBenchmarkColor = (status: string) => {
    switch (status) {
      case 'above': return 'text-chart-1';
      case 'at': return 'text-chart-2';
      case 'below': return 'text-warning';
      default: return '';
    }
  };

  const getBenchmarkBadge = (status: string) => {
    switch (status) {
      case 'above': return 'Above Average';
      case 'at': return 'At Average';
      case 'below': return 'Below Average';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Placements</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalPlacements}</div>
            <p className="text-xs text-muted-foreground">
              {summary.averagePlacementRate}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time-to-Fill</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averageTimeToFill}d</div>
            <p className="text-xs text-muted-foreground">
              Days per placement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averageClientSatisfaction}%</div>
            <p className="text-xs text-muted-foreground">
              Average across contracts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Per Hire</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.averageCostPerHire.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Average cost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Year-over-Year Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Year-over-Year Performance</CardTitle>
          <CardDescription>Compare current year metrics with previous year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {yoyComparison.map((comparison, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">{comparison.metric}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Previous: {comparison.previousYear.toLocaleString()}</span>
                    <span>Current: {comparison.currentYear.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(comparison.trend)}
                  <span className={cn(
                    "text-lg font-bold",
                    comparison.trend === 'up' && "text-chart-1",
                    comparison.trend === 'down' && "text-destructive",
                    comparison.trend === 'stable' && "text-muted-foreground"
                  )}>
                    {comparison.change > 0 ? '+' : ''}{comparison.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>12-Month Performance Trends</CardTitle>
          <CardDescription>Track key metrics over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="monthLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip cursor={false} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="placements"
                name="Placements"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
                activeDot={false}
              />
              <Line
                type="monotone"
                dataKey="satisfactionScore"
                name="Satisfaction Score"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
                activeDot={false}
              />
            </LineChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={250} className="mt-6">
            <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="monthLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar
                dataKey="averageTimeToFill"
                name="Avg. Time-to-Fill (days)"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Industry Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle>Industry Benchmarks</CardTitle>
          <CardDescription>Compare performance against industry standards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              {benchmarks.map((benchmark, idx) => (
                <div key={idx} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{benchmark.metric}</span>
                    <Badge variant={benchmark.status === 'above' ? 'default' : 'outline'}>
                      {getBenchmarkBadge(benchmark.status)}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Your Performance: {benchmark.contractValue}</span>
                      <span>Industry Avg: {benchmark.industryAverage}</span>
                    </div>
                    <Progress
                      value={(benchmark.contractValue / benchmark.topPerformer) * 100}
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      Top Performer: {benchmark.topPerformer}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={benchmarks}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <Radar
                    name="Your Performance"
                    dataKey="contractValue"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Industry Average"
                    dataKey="industryAverage"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Performance Details */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Performance Details</CardTitle>
          <CardDescription>Detailed metrics for each RPO contract</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div
                key={contract.contractId}
                className={cn(
                  "border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                  expandedContract === contract.contractId && "bg-muted/30"
                )}
                onClick={() => setExpandedContract(
                  expandedContract === contract.contractId ? null : contract.contractId
                )}
              >
                {/* Contract Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {contract.clientLogo && (
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={contract.clientLogo} />
                        <AvatarFallback>{getInitials(contract.clientName)}</AvatarFallback>
                      </Avatar>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{contract.contractName}</h4>
                        <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                          {contract.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{contract.clientName}</p>
                    </div>
                  </div>

                  {expandedContract === contract.contractId ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-2 rounded">
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                    <p className="text-lg font-bold">{contract.placementSuccessRate}%</p>
                  </div>
                  <div className="p-2 rounded">
                    <p className="text-xs text-muted-foreground">Avg. Time-to-Fill</p>
                    <p className="text-lg font-bold">{contract.averageTimeToFill}d</p>
                  </div>
                  <div className="p-2 rounded">
                    <p className="text-xs text-muted-foreground">Satisfaction</p>
                    <p className="text-lg font-bold">{contract.clientSatisfactionScore}%</p>
                  </div>
                  <div className="p-2 rounded">
                    <p className="text-xs text-muted-foreground">Placements</p>
                    <p className="text-lg font-bold">{contract.actualPlacements}/{contract.targetPlacements}</p>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedContract === contract.contractId && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    {/* Detailed Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Candidate Quality</p>
                        <div className="flex items-center gap-2">
                          <Progress value={contract.candidateQualityScore} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{contract.candidateQualityScore}%</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Retention Rate</p>
                        <div className="flex items-center gap-2">
                          <Progress value={contract.retentionRate} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{contract.retentionRate}%</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Offer Acceptance</p>
                        <div className="flex items-center gap-2">
                          <Progress value={contract.offerAcceptanceRate} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{contract.offerAcceptanceRate}%</span>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">Candidates Screened</p>
                        <p className="text-xl font-bold">{contract.candidatesScreened}</p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">Candidates Interviewed</p>
                        <p className="text-xl font-bold">{contract.candidatesInterviewed}</p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">Cost Per Hire</p>
                        <p className="text-xl font-bold">${contract.costPerHire.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Funnel Metrics */}
                    <div>
                      <h5 className="text-sm font-semibold mb-3">Recruitment Funnel</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Screen → Interview</span>
                          <span className="text-sm font-medium">{contract.screenToInterviewRate}%</span>
                        </div>
                        <Progress value={contract.screenToInterviewRate} className="h-2" />

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Interview → Offer</span>
                          <span className="text-sm font-medium">{contract.interviewToOfferRate}%</span>
                        </div>
                        <Progress value={contract.interviewToOfferRate} className="h-2" />

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Offer Acceptance</span>
                          <span className="text-sm font-medium">{contract.offerAcceptanceRate}%</span>
                        </div>
                        <Progress value={contract.offerAcceptanceRate} className="h-2" />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/recruitment-services/${contract.contractId}`);
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Contract Details
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {contracts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No performance data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
