import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Star,
  Shield,
  Target,
  Bell,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useState } from 'react';
import { useToast } from '@/shared/hooks/use-toast';

interface HealthFactors {
  slaCompliance: number; // 0-100
  revenueTrends: number; // 0-100
  consultantUtilization: number; // 0-100
  clientSatisfaction: number; // 0-100
  riskIndicators: number; // 0-100 (higher is better, meaning lower risk)
}

interface ContractHealth {
  id: string;
  contractName: string;
  clientName: string;
  overallScore: number;
  healthLevel: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  factors: HealthFactors;
  trend: 'improving' | 'stable' | 'declining';
  alerts: Alert[];
  recommendations: Recommendation[];
  historicalScores: Array<{
    month: string;
    score: number;
  }>;
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  actionRequired: boolean;
}

interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  expectedImpact: string;
  actions: string[];
}

export function RPOContractHealthScoring() {
  const { toast } = useToast();
  const [selectedContract, setSelectedContract] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('6months');

  // Weight configuration
  const weights = {
    slaCompliance: 0.30,
    revenueTrends: 0.25,
    consultantUtilization: 0.20,
    clientSatisfaction: 0.15,
    riskIndicators: 0.10
  };

  // Calculate overall health score
  const calculateHealthScore = (factors: HealthFactors): number => {
    return (
      factors.slaCompliance * weights.slaCompliance +
      factors.revenueTrends * weights.revenueTrends +
      factors.consultantUtilization * weights.consultantUtilization +
      factors.clientSatisfaction * weights.clientSatisfaction +
      factors.riskIndicators * weights.riskIndicators
    );
  };

  const getHealthLevel = (score: number): ContractHealth['healthLevel'] => {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 45) return 'poor';
    return 'critical';
  };

  // Mock contract health data
  const contracts: ContractHealth[] = [
    {
      id: '1',
      contractName: 'Enterprise Tech RPO',
      clientName: 'TechCorp Inc',
      overallScore: 92,
      healthLevel: 'excellent',
      factors: {
        slaCompliance: 100,
        revenueTrends: 95,
        consultantUtilization: 88,
        clientSatisfaction: 92,
        riskIndicators: 85
      },
      trend: 'improving',
      alerts: [
        {
          id: 'a1',
          severity: 'info',
          title: 'Contract Renewal Approaching',
          message: 'Contract renewal is due in 60 days. Client satisfaction is high.',
          timestamp: '2 hours ago',
          actionRequired: false
        }
      ],
      recommendations: [
        {
          id: 'r1',
          priority: 'low',
          category: 'Growth Opportunity',
          title: 'Expand Service Scope',
          description: 'Strong performance metrics indicate potential for scope expansion',
          expectedImpact: '+15% revenue increase',
          actions: [
            'Schedule strategic discussion with client',
            'Prepare proposal for additional services',
            'Review resource capacity for expansion'
          ]
        }
      ],
      historicalScores: [
        { month: 'Jul', score: 85 },
        { month: 'Aug', score: 87 },
        { month: 'Sep', score: 89 },
        { month: 'Oct', score: 90 },
        { month: 'Nov', score: 91 },
        { month: 'Dec', score: 92 }
      ]
    },
    {
      id: '2',
      contractName: 'Healthcare Recruiting',
      clientName: 'Global Dynamics',
      overallScore: 68,
      healthLevel: 'fair',
      factors: {
        slaCompliance: 75,
        revenueTrends: 65,
        consultantUtilization: 70,
        clientSatisfaction: 68,
        riskIndicators: 60
      },
      trend: 'declining',
      alerts: [
        {
          id: 'a2',
          severity: 'warning',
          title: 'SLA Compliance Below Target',
          message: 'Multiple SLA metrics below target for 2 consecutive months',
          timestamp: '1 day ago',
          actionRequired: true
        },
        {
          id: 'a3',
          severity: 'warning',
          title: 'Client Satisfaction Declining',
          message: 'Client satisfaction dropped from 4.5 to 3.8 in recent quarter',
          timestamp: '3 days ago',
          actionRequired: true
        }
      ],
      recommendations: [
        {
          id: 'r2',
          priority: 'high',
          category: 'Performance Improvement',
          title: 'Immediate SLA Compliance Review',
          description: 'Conduct comprehensive review of SLA performance and implement corrective actions',
          expectedImpact: 'Restore compliance to 90%+ within 30 days',
          actions: [
            'Schedule emergency team meeting',
            'Analyze root causes of SLA misses',
            'Implement process improvements',
            'Increase consultant support temporarily'
          ]
        },
        {
          id: 'r3',
          priority: 'high',
          category: 'Client Relations',
          title: 'Client Relationship Intervention',
          description: 'Schedule executive-level meeting to address satisfaction concerns',
          expectedImpact: 'Prevent potential contract loss',
          actions: [
            'Executive sponsor engagement',
            'Conduct client satisfaction survey',
            'Develop remediation plan',
            'Weekly status updates to client'
          ]
        }
      ],
      historicalScores: [
        { month: 'Jul', score: 78 },
        { month: 'Aug', score: 76 },
        { month: 'Sep', score: 73 },
        { month: 'Oct', score: 71 },
        { month: 'Nov', score: 69 },
        { month: 'Dec', score: 68 }
      ]
    },
    {
      id: '3',
      contractName: 'Financial Services RPO',
      clientName: 'Innovate Solutions',
      overallScore: 82,
      healthLevel: 'good',
      factors: {
        slaCompliance: 88,
        revenueTrends: 80,
        consultantUtilization: 85,
        clientSatisfaction: 78,
        riskIndicators: 75
      },
      trend: 'stable',
      alerts: [
        {
          id: 'a4',
          severity: 'info',
          title: 'Utilization Optimal',
          message: 'Consultant utilization is within ideal range (80-90%)',
          timestamp: '1 week ago',
          actionRequired: false
        }
      ],
      recommendations: [
        {
          id: 'r4',
          priority: 'medium',
          category: 'Client Satisfaction',
          title: 'Improve Client Communication',
          description: 'Enhance reporting frequency and transparency to boost satisfaction',
          expectedImpact: '+10 points satisfaction increase',
          actions: [
            'Implement weekly progress reports',
            'Schedule monthly strategic reviews',
            'Introduce client portal access'
          ]
        }
      ],
      historicalScores: [
        { month: 'Jul', score: 80 },
        { month: 'Aug', score: 81 },
        { month: 'Sep', score: 82 },
        { month: 'Oct', score: 81 },
        { month: 'Nov', score: 82 },
        { month: 'Dec', score: 82 }
      ]
    },
    {
      id: '4',
      contractName: 'Engineering Talent',
      clientName: 'Enterprise Systems',
      overallScore: 55,
      healthLevel: 'poor',
      factors: {
        slaCompliance: 60,
        revenueTrends: 52,
        consultantUtilization: 55,
        clientSatisfaction: 58,
        riskIndicators: 48
      },
      trend: 'declining',
      alerts: [
        {
          id: 'a5',
          severity: 'critical',
          title: 'Contract at Risk',
          message: 'Multiple critical indicators below acceptable thresholds. Immediate action required.',
          timestamp: '2 hours ago',
          actionRequired: true
        },
        {
          id: 'a6',
          severity: 'critical',
          title: 'Revenue Trending Negative',
          message: 'Revenue down 25% over last quarter. Client may reduce scope.',
          timestamp: '1 day ago',
          actionRequired: true
        }
      ],
      recommendations: [
        {
          id: 'r5',
          priority: 'high',
          category: 'Contract Recovery',
          title: 'Execute Contract Rescue Plan',
          description: 'Immediate comprehensive intervention to stabilize and recover contract',
          expectedImpact: 'Prevent contract termination, restore to 70+ score',
          actions: [
            'Deploy senior leadership immediately',
            'Conduct full contract audit',
            'Develop 30-60-90 day recovery plan',
            'Reallocate top performers to account',
            'Weekly executive sponsor check-ins'
          ]
        }
      ],
      historicalScores: [
        { month: 'Jul', score: 72 },
        { month: 'Aug', score: 68 },
        { month: 'Sep', score: 64 },
        { month: 'Oct', score: 60 },
        { month: 'Nov', score: 57 },
        { month: 'Dec', score: 55 }
      ]
    }
  ];

  const getHealthColor = (level: string) => {
    if (level === 'excellent') return 'hsl(142, 76%, 36%)';
    if (level === 'good') return 'hsl(217, 91%, 60%)';
    if (level === 'fair') return 'hsl(48, 96%, 53%)';
    if (level === 'poor') return 'hsl(25, 95%, 53%)';
    return 'hsl(0, 84%, 60%)';
  };

  const getHealthBadgeVariant = (level: string) => {
    if (level === 'excellent' || level === 'good') return 'default';
    if (level === 'fair') return 'secondary';
    return 'destructive';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  const getAlertIcon = (severity: string) => {
    if (severity === 'critical') return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (severity === 'warning') return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <Bell className="h-4 w-4 text-blue-600" />;
  };

  const avgHealth = contracts.reduce((acc, c) => acc + c.overallScore, 0) / contracts.length;
  const criticalContracts = contracts.filter(c => c.healthLevel === 'critical' || c.healthLevel === 'poor').length;
  const totalAlerts = contracts.reduce((acc, c) => acc + c.alerts.filter(a => a.actionRequired).length, 0);

  const handleApplyRecommendation = (recommendation: Recommendation) => {
    toast({
      title: 'Recommendation Applied',
      description: `${recommendation.title} has been added to action plan.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Contract Health Scoring</h2>
          <p className="text-muted-foreground">AI-powered health analysis with predictive alerts</p>
        </div>
        <Button>
          <Target className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Health Score</p>
                <p className="text-2xl font-bold">{avgHealth.toFixed(0)}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <Progress value={avgHealth} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Contracts</p>
                <p className="text-2xl font-bold text-destructive">{criticalContracts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-yellow-600">{totalAlerts}</p>
              </div>
              <Bell className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Action required</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Excellent Health</p>
                <p className="text-2xl font-bold text-green-600">
                  {contracts.filter(c => c.healthLevel === 'excellent').length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Score 90+</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Contract Details</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Risks</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Health Score Distribution</CardTitle>
              <CardDescription>Contract health across portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={contracts}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="clientName" angle={-45} textAnchor="end" height={100} className="text-xs" />
                  <YAxis className="text-xs" domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="overallScore" name="Health Score" radius={[4, 4, 0, 0]}>
                    {contracts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getHealthColor(entry.healthLevel)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Score Weights</CardTitle>
                <CardDescription>Factor contribution to overall score</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(weights).map(([key, value]) => {
                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{label}</span>
                        <span className="font-medium">{(value * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={value * 100} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contract Status Summary</CardTitle>
                <CardDescription>Health level distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['excellent', 'good', 'fair', 'poor', 'critical'].map(level => {
                    const count = contracts.filter(c => c.healthLevel === level).length;
                    const percentage = (count / contracts.length) * 100;
                    return (
                      <div key={level} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{level}</span>
                          <span className="font-medium">{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contract Details Tab */}
        <TabsContent value="details" className="space-y-6">
          {contracts.map(contract => (
            <Card key={contract.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{contract.contractName}</CardTitle>
                    <CardDescription>{contract.clientName}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getHealthBadgeVariant(contract.healthLevel) as any} className="text-lg px-3 py-1">
                      {contract.overallScore}
                    </Badge>
                    {getTrendIcon(contract.trend)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Health Score Breakdown */}
                <div>
                  <h4 className="font-semibold mb-3">Health Factor Breakdown</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">SLA Compliance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{contract.factors.slaCompliance}%</span>
                          <Badge variant="outline" className="text-xs">30%</Badge>
                        </div>
                      </div>
                      <Progress value={contract.factors.slaCompliance} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Revenue Trends</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{contract.factors.revenueTrends}%</span>
                          <Badge variant="outline" className="text-xs">25%</Badge>
                        </div>
                      </div>
                      <Progress value={contract.factors.revenueTrends} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Consultant Utilization</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{contract.factors.consultantUtilization}%</span>
                          <Badge variant="outline" className="text-xs">20%</Badge>
                        </div>
                      </div>
                      <Progress value={contract.factors.consultantUtilization} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Client Satisfaction</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{contract.factors.clientSatisfaction}%</span>
                          <Badge variant="outline" className="text-xs">15%</Badge>
                        </div>
                      </div>
                      <Progress value={contract.factors.clientSatisfaction} className="h-2" />
                    </div>

                    <div className="space-y-3 md:col-span-2">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Risk Indicators</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{contract.factors.riskIndicators}%</span>
                          <Badge variant="outline" className="text-xs">10%</Badge>
                        </div>
                      </div>
                      <Progress value={contract.factors.riskIndicators} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Historical Trend */}
                <div>
                  <h4 className="font-semibold mb-3">6-Month Health Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={contract.historicalScores}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" domain={[0, 100]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke={getHealthColor(contract.healthLevel)} 
                        strokeWidth={2}
                        dot={{ fill: getHealthColor(contract.healthLevel), r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Alerts & Risks Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {contracts.map(contract => {
            if (contract.alerts.length === 0) return null;
            return (
              <Card key={contract.id}>
                <CardHeader>
                  <CardTitle>{contract.contractName}</CardTitle>
                  <CardDescription>{contract.alerts.length} active alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contract.alerts.map(alert => (
                    <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                      {getAlertIcon(alert.severity)}
                      <AlertTitle className="flex items-center justify-between">
                        <span>{alert.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {alert.timestamp}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription>
                        <p className="mb-2">{alert.message}</p>
                        {alert.actionRequired && (
                          <Button size="sm" variant="outline">
                            Take Action
                          </Button>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          {contracts.map(contract => (
            <Card key={contract.id}>
              <CardHeader>
                <CardTitle>{contract.contractName}</CardTitle>
                <CardDescription>{contract.recommendations.length} recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contract.recommendations.map(rec => (
                  <div key={rec.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={rec.priority === 'high' ? 'destructive' : 'default'}>
                            {rec.priority} Priority
                          </Badge>
                          <Badge variant="outline">{rec.category}</Badge>
                        </div>
                        <h4 className="font-semibold">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      </div>
                      <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    </div>

                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        <strong>Expected Impact:</strong> {rec.expectedImpact}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium mb-2">Action Items:</h5>
                      <ul className="space-y-1">
                        {rec.actions.map((action, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button 
                      onClick={() => handleApplyRecommendation(rec)}
                      className="w-full"
                    >
                      Apply Recommendation
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
