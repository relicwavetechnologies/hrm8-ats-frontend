import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  Zap,
  Target,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { useState } from 'react';
import { useToast } from '@/shared/hooks/use-toast';

interface ConsultantWorkload {
  id: string;
  name: string;
  avatar?: string;
  specialization: string;
  activeAssignments: number;
  capacity: number; // max assignments
  utilizationRate: number; // percentage
  hoursThisWeek: number;
  maxHoursPerWeek: number;
  burnoutRisk: 'low' | 'medium' | 'high' | 'critical';
  avgResponseTime: number; // hours
  satisfactionScore: number;
  consecutiveWeeksOverload: number;
  upcomingDeadlines: number;
  workloadTrend: 'increasing' | 'stable' | 'decreasing';
}

interface OptimizationRecommendation {
  type: 'redistribute' | 'reduce' | 'hire' | 'optimize';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedConsultants: string[];
  expectedImpact: string;
  actionItems: string[];
}

export function RPOWorkloadBalancingDashboard() {
  const { toast } = useToast();
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(null);

  // Mock workload data
  const consultants: ConsultantWorkload[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      specialization: 'Tech & IT',
      activeAssignments: 8,
      capacity: 10,
      utilizationRate: 95,
      hoursThisWeek: 48,
      maxHoursPerWeek: 40,
      burnoutRisk: 'high',
      avgResponseTime: 3.5,
      satisfactionScore: 4.2,
      consecutiveWeeksOverload: 3,
      upcomingDeadlines: 5,
      workloadTrend: 'increasing'
    },
    {
      id: '2',
      name: 'Michael Chen',
      specialization: 'Executive Search',
      activeAssignments: 6,
      capacity: 10,
      utilizationRate: 60,
      hoursThisWeek: 32,
      maxHoursPerWeek: 40,
      burnoutRisk: 'low',
      avgResponseTime: 2.8,
      satisfactionScore: 4.7,
      consecutiveWeeksOverload: 0,
      upcomingDeadlines: 2,
      workloadTrend: 'stable'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      specialization: 'Healthcare',
      activeAssignments: 9,
      capacity: 10,
      utilizationRate: 90,
      hoursThisWeek: 42,
      maxHoursPerWeek: 40,
      burnoutRisk: 'medium',
      avgResponseTime: 4.2,
      satisfactionScore: 4.4,
      consecutiveWeeksOverload: 1,
      upcomingDeadlines: 4,
      workloadTrend: 'stable'
    },
    {
      id: '4',
      name: 'David Kim',
      specialization: 'Finance',
      activeAssignments: 10,
      capacity: 10,
      utilizationRate: 100,
      hoursThisWeek: 52,
      maxHoursPerWeek: 40,
      burnoutRisk: 'critical',
      avgResponseTime: 6.5,
      satisfactionScore: 3.8,
      consecutiveWeeksOverload: 4,
      upcomingDeadlines: 7,
      workloadTrend: 'increasing'
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      specialization: 'Sales & Marketing',
      activeAssignments: 5,
      capacity: 10,
      utilizationRate: 50,
      hoursThisWeek: 28,
      maxHoursPerWeek: 40,
      burnoutRisk: 'low',
      avgResponseTime: 2.2,
      satisfactionScore: 4.8,
      consecutiveWeeksOverload: 0,
      upcomingDeadlines: 1,
      workloadTrend: 'decreasing'
    },
    {
      id: '6',
      name: 'James Wilson',
      specialization: 'Engineering',
      activeAssignments: 7,
      capacity: 10,
      utilizationRate: 70,
      hoursThisWeek: 35,
      maxHoursPerWeek: 40,
      burnoutRisk: 'low',
      avgResponseTime: 3.0,
      satisfactionScore: 4.5,
      consecutiveWeeksOverload: 0,
      upcomingDeadlines: 3,
      workloadTrend: 'stable'
    }
  ];

  // Historical workload data
  const workloadHistory = [
    { week: 'Week 1', avg: 65, peak: 85 },
    { week: 'Week 2', avg: 68, peak: 90 },
    { week: 'Week 3', avg: 72, peak: 95 },
    { week: 'Week 4', avg: 75, peak: 100 },
    { week: 'Week 5', avg: 77, peak: 100 },
    { week: 'Week 6', avg: 75, peak: 95 },
  ];

  // Generate optimization recommendations
  const recommendations: OptimizationRecommendation[] = [
    {
      type: 'redistribute',
      priority: 'high',
      title: 'Redistribute from David Kim',
      description: 'David Kim is at 100% capacity with critical burnout risk. Redistribute 2-3 assignments immediately.',
      affectedConsultants: ['David Kim', 'Michael Chen', 'Lisa Thompson'],
      expectedImpact: 'Reduce burnout risk to medium, improve response time by 40%',
      actionItems: [
        'Move 2 finance assignments to Michael Chen (has capacity)',
        'Transfer 1 low-priority assignment to Lisa Thompson',
        'Schedule check-in meeting with David Kim',
        'Monitor workload for next 2 weeks'
      ]
    },
    {
      type: 'reduce',
      priority: 'high',
      title: 'Address Sarah Johnson Overload',
      description: 'Sarah has worked overtime for 3 consecutive weeks. Risk of decreased quality and burnout.',
      affectedConsultants: ['Sarah Johnson', 'James Wilson'],
      expectedImpact: 'Prevent burnout, maintain quality standards',
      actionItems: [
        'Reduce active assignments from 8 to 6',
        'Reassign 2 tech positions to James Wilson',
        'Implement mandatory time off this weekend',
        'Review workload allocation process'
      ]
    },
    {
      type: 'optimize',
      priority: 'medium',
      title: 'Better Utilize Available Capacity',
      description: 'Michael Chen and Lisa Thompson have 40% and 50% available capacity respectively.',
      affectedConsultants: ['Michael Chen', 'Lisa Thompson'],
      expectedImpact: 'Increase team efficiency by 15%, better resource utilization',
      actionItems: [
        'Assign new executive search positions to Michael Chen',
        'Allocate marketing roles to Lisa Thompson',
        'Cross-train for additional specializations',
        'Review capacity planning monthly'
      ]
    },
    {
      type: 'hire',
      priority: 'medium',
      title: 'Consider Additional Finance Consultant',
      description: 'Finance specialization is consistently at or above capacity. Consider hiring.',
      affectedConsultants: ['David Kim'],
      expectedImpact: 'Reduce individual workload by 30%, improve service quality',
      actionItems: [
        'Analyze finance sector demand trends',
        'Prepare job description for finance consultant',
        'Budget approval for new hire',
        'Start recruitment process within 30 days'
      ]
    }
  ];

  const getBurnoutRiskColor = (risk: string) => {
    if (risk === 'critical') return 'destructive';
    if (risk === 'high') return 'default';
    if (risk === 'medium') return 'secondary';
    return 'outline';
  };

  const getBurnoutRiskIcon = (risk: string) => {
    if (risk === 'critical' || risk === 'high') return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <TrendingUp className="h-4 w-4 text-destructive" />;
    if (trend === 'decreasing') return <TrendingDown className="h-4 w-4 text-green-600" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  const avgUtilization = consultants.reduce((acc, c) => acc + c.utilizationRate, 0) / consultants.length;
  const atRiskCount = consultants.filter(c => c.burnoutRisk === 'high' || c.burnoutRisk === 'critical').length;
  const underutilizedCount = consultants.filter(c => c.utilizationRate < 60).length;
  const optimalCount = consultants.filter(c => c.utilizationRate >= 70 && c.utilizationRate <= 85 && c.burnoutRisk === 'low').length;

  // Distribution data for pie chart
  const distributionData = [
    { name: 'Optimal (70-85%)', value: optimalCount, color: 'hsl(142, 76%, 36%)' },
    { name: 'Underutilized (<60%)', value: underutilizedCount, color: 'hsl(217, 91%, 60%)' },
    { name: 'Overloaded (>85%)', value: consultants.filter(c => c.utilizationRate > 85).length, color: 'hsl(48, 96%, 53%)' },
    { name: 'At Risk', value: atRiskCount, color: 'hsl(0, 84%, 60%)' }
  ];

  const handleApplyRecommendation = (recommendation: OptimizationRecommendation) => {
    toast({
      title: 'Recommendation Applied',
      description: `${recommendation.title} has been scheduled for implementation.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Workload Balancing</h2>
          <p className="text-muted-foreground">Optimize capacity and prevent burnout</p>
        </div>
        <Button>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate AI Insights
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Utilization</p>
                <p className="text-2xl font-bold">{avgUtilization.toFixed(0)}%</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <Progress value={avgUtilization} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-destructive">{atRiskCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">High/Critical burnout risk</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Underutilized</p>
                <p className="text-2xl font-bold text-blue-600">{underutilizedCount}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Below 60% capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Optimal Balance</p>
                <p className="text-2xl font-bold text-green-600">{optimalCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">70-85% utilization</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="individuals">Individual Load</TabsTrigger>
          <TabsTrigger value="burnout">Burnout Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workload Distribution</CardTitle>
                <CardDescription>Current capacity utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workload Trends</CardTitle>
                <CardDescription>6-week capacity analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={workloadHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis className="text-xs" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="avg" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Average Utilization"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="peak" 
                      stroke="hsl(0, 84%, 60%)" 
                      strokeWidth={2}
                      name="Peak Load"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Team Capacity Overview</CardTitle>
              <CardDescription>Current assignments and capacity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={consultants}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="activeAssignments" fill="hsl(var(--primary))" name="Active Assignments" />
                  <Bar dataKey="capacity" fill="hsl(var(--muted-foreground))" name="Max Capacity" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Load Tab */}
        <TabsContent value="individuals" className="space-y-6">
          <div className="space-y-4">
            {consultants.map((consultant) => (
              <Card key={consultant.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={consultant.avatar} />
                      <AvatarFallback>{consultant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{consultant.name}</h4>
                          <p className="text-sm text-muted-foreground">{consultant.specialization}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getBurnoutRiskColor(consultant.burnoutRisk) as any}>
                            {getBurnoutRiskIcon(consultant.burnoutRisk)}
                            <span className="ml-1">{consultant.burnoutRisk} Risk</span>
                          </Badge>
                          {getTrendIcon(consultant.workloadTrend)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Utilization</p>
                          <p className="text-lg font-semibold">{consultant.utilizationRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Assignments</p>
                          <p className="text-lg font-semibold">{consultant.activeAssignments}/{consultant.capacity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Hours/Week</p>
                          <p className={`text-lg font-semibold ${consultant.hoursThisWeek > consultant.maxHoursPerWeek ? 'text-destructive' : ''}`}>
                            {consultant.hoursThisWeek}h
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Response Time</p>
                          <p className="text-lg font-semibold">{consultant.avgResponseTime}h</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Satisfaction</p>
                          <p className="text-lg font-semibold">{consultant.satisfactionScore}/5.0</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Capacity Utilization</span>
                          <span className="font-medium">{consultant.utilizationRate}%</span>
                        </div>
                        <Progress value={consultant.utilizationRate} className="h-2" />
                        {consultant.hoursThisWeek > consultant.maxHoursPerWeek && (
                          <p className="text-xs text-destructive">
                            ⚠ {consultant.hoursThisWeek - consultant.maxHoursPerWeek}h overtime this week
                          </p>
                        )}
                        {consultant.consecutiveWeeksOverload > 0 && (
                          <p className="text-xs text-yellow-600">
                            ⚠ Overloaded for {consultant.consecutiveWeeksOverload} consecutive weeks
                          </p>
                        )}
                      </div>

                      {consultant.upcomingDeadlines > 3 && (
                        <Alert>
                          <Calendar className="h-4 w-4" />
                          <AlertDescription>
                            {consultant.upcomingDeadlines} upcoming deadlines in the next 7 days
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Burnout Analysis Tab */}
        <TabsContent value="burnout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Burnout Risk Assessment</CardTitle>
              <CardDescription>Multi-factor analysis of consultant well-being</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {consultants
                  .filter(c => c.burnoutRisk === 'critical' || c.burnoutRisk === 'high')
                  .sort((a, b) => {
                    const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                    return riskOrder[a.burnoutRisk] - riskOrder[b.burnoutRisk];
                  })
                  .map((consultant) => (
                    <div key={consultant.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={consultant.avatar} />
                            <AvatarFallback>{consultant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{consultant.name}</h4>
                            <p className="text-sm text-muted-foreground">{consultant.specialization}</p>
                          </div>
                        </div>
                        <Badge variant={getBurnoutRiskColor(consultant.burnoutRisk) as any} className="text-base px-3 py-1">
                          {consultant.burnoutRisk.toUpperCase()} RISK
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h5 className="font-medium">Risk Factors</h5>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">Capacity Overload</span>
                              <Badge variant={consultant.utilizationRate > 90 ? 'destructive' : 'secondary'}>
                                {consultant.utilizationRate}%
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">Overtime Hours</span>
                              <Badge variant={consultant.hoursThisWeek > consultant.maxHoursPerWeek ? 'destructive' : 'secondary'}>
                                +{Math.max(0, consultant.hoursThisWeek - consultant.maxHoursPerWeek)}h
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">Consecutive Overload Weeks</span>
                              <Badge variant={consultant.consecutiveWeeksOverload > 2 ? 'destructive' : 'secondary'}>
                                {consultant.consecutiveWeeksOverload}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">Response Time Degradation</span>
                              <Badge variant={consultant.avgResponseTime > 5 ? 'destructive' : 'secondary'}>
                                {consultant.avgResponseTime}h
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h5 className="font-medium">Recommended Actions</h5>
                          <ul className="space-y-2">
                            {consultant.utilizationRate > 90 && (
                              <li className="text-sm flex items-start gap-2">
                                <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Reduce active assignments by 20-30%</span>
                              </li>
                            )}
                            {consultant.hoursThisWeek > consultant.maxHoursPerWeek && (
                              <li className="text-sm flex items-start gap-2">
                                <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Implement mandatory time off this weekend</span>
                              </li>
                            )}
                            {consultant.consecutiveWeeksOverload > 2 && (
                              <li className="text-sm flex items-start gap-2">
                                <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Schedule wellness check-in meeting</span>
                              </li>
                            )}
                            {consultant.satisfactionScore < 4.0 && (
                              <li className="text-sm flex items-start gap-2">
                                <Users className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>Assess client relationship satisfaction</span>
                              </li>
                            )}
                            <li className="text-sm flex items-start gap-2">
                              <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>Redistribute {Math.ceil(consultant.activeAssignments * 0.3)} assignments</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}

                {consultants.filter(c => c.burnoutRisk === 'critical' || c.burnoutRisk === 'high').length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No High Risk Consultants</h3>
                    <p className="text-muted-foreground">All team members are within healthy workload ranges</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Optimization</CardTitle>
              <CardDescription>Smart recommendations to balance workload</CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={rec.priority === 'high' ? 'destructive' : 'default'}>
                            {rec.priority} Priority
                          </Badge>
                          <Badge variant="outline">{rec.type}</Badge>
                        </div>
                        <h4 className="text-lg font-semibold mb-1">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                      <Button onClick={() => handleApplyRecommendation(rec)}>
                        Apply Now
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Affected Consultants</h5>
                        <div className="flex flex-wrap gap-2">
                          {rec.affectedConsultants.map((name, nameIdx) => (
                            <Badge key={nameIdx} variant="secondary">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium mb-2">Expected Impact</h5>
                        <p className="text-sm text-green-600">{rec.expectedImpact}</p>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium mb-2">Action Items</h5>
                      <ul className="space-y-1">
                        {rec.actionItems.map((item, itemIdx) => (
                          <li key={itemIdx} className="text-sm flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
