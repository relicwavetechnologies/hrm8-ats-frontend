import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target,
  Award,
  Search,
  Filter,
  ArrowUpDown,
  FileDown,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useState } from 'react';
import { useToast } from '@/shared/hooks/use-toast';
import { exportToPDF, exportToExcel } from '@/shared/lib/consultantPerformanceExport';

interface ConsultantPerformance {
  id: string;
  name: string;
  avatar?: string;
  specialization: string;
  totalPlacements: number;
  successRate: number;
  clientSatisfaction: number;
  avgTimeToFill: number;
  activePositions: number;
  revenue: number;
  rating: number;
  trend: 'up' | 'down' | 'stable';
}

export function RPOConsultantPerformanceDashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContract, setSelectedContract] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('last-month');
  const [sortBy, setSortBy] = useState('rating');
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeRankings: true,
    includeMetrics: true,
    includeTrends: true
  });

  // Mock consultant performance data
  const consultants: ConsultantPerformance[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      specialization: 'Tech & IT',
      totalPlacements: 24,
      successRate: 96,
      clientSatisfaction: 4.9,
      avgTimeToFill: 18,
      activePositions: 8,
      revenue: 450000,
      rating: 98,
      trend: 'up'
    },
    {
      id: '2',
      name: 'Michael Chen',
      specialization: 'Executive Search',
      totalPlacements: 18,
      successRate: 94,
      clientSatisfaction: 4.8,
      avgTimeToFill: 22,
      activePositions: 6,
      revenue: 420000,
      rating: 96,
      trend: 'up'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      specialization: 'Healthcare',
      totalPlacements: 22,
      successRate: 92,
      clientSatisfaction: 4.7,
      avgTimeToFill: 20,
      activePositions: 7,
      revenue: 380000,
      rating: 94,
      trend: 'stable'
    },
    {
      id: '4',
      name: 'David Kim',
      specialization: 'Finance',
      totalPlacements: 16,
      successRate: 88,
      clientSatisfaction: 4.5,
      avgTimeToFill: 25,
      activePositions: 5,
      revenue: 340000,
      rating: 89,
      trend: 'down'
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      specialization: 'Sales & Marketing',
      totalPlacements: 20,
      successRate: 90,
      clientSatisfaction: 4.6,
      avgTimeToFill: 21,
      activePositions: 9,
      revenue: 360000,
      rating: 91,
      trend: 'up'
    },
    {
      id: '6',
      name: 'James Wilson',
      specialization: 'Engineering',
      totalPlacements: 15,
      successRate: 85,
      clientSatisfaction: 4.3,
      avgTimeToFill: 28,
      activePositions: 4,
      revenue: 310000,
      rating: 85,
      trend: 'stable'
    }
  ];

  // Performance comparison data
  const performanceComparison = [
    { month: 'Jan', placements: 85, satisfaction: 4.5 },
    { month: 'Feb', placements: 92, satisfaction: 4.6 },
    { month: 'Mar', placements: 88, satisfaction: 4.7 },
    { month: 'Apr', placements: 95, satisfaction: 4.6 },
    { month: 'May', placements: 102, satisfaction: 4.8 },
    { month: 'Jun', placements: 115, satisfaction: 4.7 },
  ];

  // Top performer radar data
  const topPerformerRadar = [
    { metric: 'Success Rate', value: 96 },
    { metric: 'Satisfaction', value: 98 },
    { metric: 'Speed', value: 92 },
    { metric: 'Quality', value: 95 },
    { metric: 'Revenue', value: 94 },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <div className="h-4 w-4" />;
  };

  const getPerformanceBadge = (rating: number) => {
    if (rating >= 95) return { label: 'Exceptional', variant: 'default' as const, className: 'bg-green-600' };
    if (rating >= 90) return { label: 'Excellent', variant: 'default' as const, className: 'bg-blue-600' };
    if (rating >= 85) return { label: 'Good', variant: 'secondary' as const, className: '' };
    return { label: 'Needs Improvement', variant: 'outline' as const, className: '' };
  };

  const filteredConsultants = consultants
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'placements') return b.totalPlacements - a.totalPlacements;
      if (sortBy === 'satisfaction') return b.clientSatisfaction - a.clientSatisfaction;
      return 0;
    });

  const topPerformer = consultants[0];
  const avgSuccessRate = consultants.reduce((acc, c) => acc + c.successRate, 0) / consultants.length;
  const avgSatisfaction = consultants.reduce((acc, c) => acc + c.clientSatisfaction, 0) / consultants.length;
  const totalPlacements = consultants.reduce((acc, c) => acc + c.totalPlacements, 0);

  const handleExport = () => {
    try {
      const filename = `consultant-performance-${selectedPeriod}-${new Date().toISOString().split('T')[0]}`;
      
      if (exportFormat === 'pdf') {
        exportToPDF(filteredConsultants, exportOptions, filename);
        toast({
          title: 'PDF Generated',
          description: 'Performance report has been exported as PDF',
        });
      } else {
        exportToExcel(filteredConsultants, exportOptions, filename);
        toast({
          title: 'Excel Generated',
          description: 'Performance report has been exported as Excel',
        });
      }
      
      setExportDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'There was an error generating the report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Consultant Performance</h2>
          <p className="text-muted-foreground">Track and analyze individual consultant metrics</p>
        </div>
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FileDown className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Export Performance Report</DialogTitle>
              <DialogDescription>
                Choose format and content to include in the report
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Format Selection */}
              <div className="space-y-3">
                <Label>Export Format</Label>
                <div className="grid gap-3">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      exportFormat === 'pdf'
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setExportFormat('pdf')}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">PDF Report</div>
                        <div className="text-sm text-muted-foreground">
                          Professional formatted report with tables
                        </div>
                      </div>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        exportFormat === 'pdf'
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {exportFormat === 'pdf' && (
                          <div className="h-2 w-2 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      exportFormat === 'excel'
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setExportFormat('excel')}
                  >
                    <div className="flex items-start gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">Excel Spreadsheet</div>
                        <div className="text-sm text-muted-foreground">
                          Data export for analysis and custom reporting
                        </div>
                      </div>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        exportFormat === 'excel'
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {exportFormat === 'excel' && (
                          <div className="h-2 w-2 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Options */}
              <div className="space-y-3">
                <Label>Include in Report</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rankings"
                      checked={exportOptions.includeRankings}
                      onCheckedChange={(checked) =>
                        setExportOptions({ ...exportOptions, includeRankings: checked as boolean })
                      }
                    />
                    <Label
                      htmlFor="rankings"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Consultant Rankings
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="metrics"
                      checked={exportOptions.includeMetrics}
                      onCheckedChange={(checked) =>
                        setExportOptions({ ...exportOptions, includeMetrics: checked as boolean })
                      }
                    />
                    <Label
                      htmlFor="metrics"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Detailed Metrics
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="charts"
                      checked={exportOptions.includeCharts}
                      onCheckedChange={(checked) =>
                        setExportOptions({ ...exportOptions, includeCharts: checked as boolean })
                      }
                    />
                    <Label
                      htmlFor="charts"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Performance Charts
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trends"
                      checked={exportOptions.includeTrends}
                      onCheckedChange={(checked) =>
                        setExportOptions({ ...exportOptions, includeTrends: checked as boolean })
                      }
                    />
                    <Label
                      htmlFor="trends"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Performance Analysis
                    </Label>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <Button onClick={handleExport} className="w-full" size="lg">
                <FileDown className="h-4 w-4 mr-2" />
                Generate {exportFormat === 'pdf' ? 'PDF' : 'Excel'} Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Placements</p>
                <p className="text-2xl font-bold">{totalPlacements}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <p className="text-xs text-green-600 mt-2">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Success Rate</p>
                <p className="text-2xl font-bold">{avgSuccessRate.toFixed(0)}%</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-xs text-green-600 mt-2">+3% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Satisfaction</p>
                <p className="text-2xl font-bold">{avgSatisfaction.toFixed(1)}/5.0</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">Excellent rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Consultants</p>
                <p className="text-2xl font-bold">{consultants.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">All performing well</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rankings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="top-performer">Top Performer</TabsTrigger>
        </TabsList>

        {/* Rankings Tab */}
        <TabsContent value="rankings" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search consultants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={selectedContract} onValueChange={setSelectedContract}>
                  <SelectTrigger>
                    <SelectValue placeholder="Contract" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contracts</SelectItem>
                    <SelectItem value="tech">TechCorp</SelectItem>
                    <SelectItem value="global">Global Dynamics</SelectItem>
                    <SelectItem value="innovate">Innovate Solutions</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-week">Last Week</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-quarter">Last Quarter</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Overall Rating</SelectItem>
                    <SelectItem value="placements">Total Placements</SelectItem>
                    <SelectItem value="satisfaction">Client Satisfaction</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Performance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="exceptional">Exceptional (95+)</SelectItem>
                    <SelectItem value="excellent">Excellent (90-94)</SelectItem>
                    <SelectItem value="good">Good (85-89)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Consultant Rankings */}
          <div className="space-y-4">
            {filteredConsultants.map((consultant, index) => {
              const badge = getPerformanceBadge(consultant.rating);
              return (
                <Card key={consultant.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-700 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          #{index + 1}
                        </div>
                      </div>

                      {/* Consultant Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={consultant.avatar} />
                              <AvatarFallback>{consultant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-lg">{consultant.name}</h4>
                              <p className="text-sm text-muted-foreground">{consultant.specialization}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={badge.variant} className={badge.className}>
                              {badge.label}
                            </Badge>
                            {getTrendIcon(consultant.trend)}
                          </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Placements</p>
                            <p className="text-lg font-semibold">{consultant.totalPlacements}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Success Rate</p>
                            <p className="text-lg font-semibold">{consultant.successRate}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Satisfaction</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <p className="text-lg font-semibold">{consultant.clientSatisfaction}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Avg Fill Time</p>
                            <p className="text-lg font-semibold">{consultant.avgTimeToFill}d</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Active</p>
                            <p className="text-lg font-semibold">{consultant.activePositions}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Revenue</p>
                            <p className="text-lg font-semibold">${(consultant.revenue / 1000).toFixed(0)}K</p>
                          </div>
                        </div>

                        {/* Performance Bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Overall Performance</span>
                            <span className="font-medium">{consultant.rating}/100</span>
                          </div>
                          <Progress value={consultant.rating} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance Trends</CardTitle>
                <CardDescription>Placements and satisfaction over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceComparison}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" domain={[0, 5]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium mb-1">{data.month}</p>
                            <p className="text-sm text-primary">
                              Placements: {data.placements}
                            </p>
                            <p className="text-sm text-yellow-600">
                              Satisfaction: {data.satisfaction}/5.0
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="placements" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Placements"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="satisfaction" 
                      stroke="hsl(48, 96%, 53%)" 
                      strokeWidth={2}
                      name="Satisfaction"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers by Metric</CardTitle>
                <CardDescription>Leading consultants in each category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={consultants.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={100} />
                    <YAxis className="text-xs" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium mb-1">{data.name}</p>
                            <p className="text-sm">Rating: {data.rating}/100</p>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Bar dataKey="rating" fill="hsl(var(--primary))" name="Performance Rating" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Performer Tab */}
        <TabsContent value="top-performer" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    <Trophy className="inline h-6 w-6 text-yellow-500 mr-2" />
                    Top Performer of the Month
                  </CardTitle>
                  <CardDescription>Outstanding performance across all metrics</CardDescription>
                </div>
                <Badge className="bg-yellow-500 text-lg px-4 py-2">
                  #{1}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6 mb-8">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={topPerformer.avatar} />
                  <AvatarFallback className="text-2xl">
                    {topPerformer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-2">{topPerformer.name}</h3>
                  <p className="text-lg text-muted-foreground mb-4">{topPerformer.specialization}</p>
                  <div className="flex gap-3">
                    <Badge className="bg-green-600">Exceptional Performance</Badge>
                    <Badge variant="outline">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending Up
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4">Key Metrics</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Success Rate</span>
                        <span className="font-semibold">{topPerformer.successRate}%</span>
                      </div>
                      <Progress value={topPerformer.successRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Client Satisfaction</span>
                        <span className="font-semibold">{topPerformer.clientSatisfaction}/5.0</span>
                      </div>
                      <Progress value={(topPerformer.clientSatisfaction / 5) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Overall Rating</span>
                        <span className="font-semibold">{topPerformer.rating}/100</span>
                      </div>
                      <Progress value={topPerformer.rating} className="h-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Placements</p>
                      <p className="text-2xl font-bold">{topPerformer.totalPlacements}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Revenue Generated</p>
                      <p className="text-2xl font-bold">${(topPerformer.revenue / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Performance Profile</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={topPerformerRadar}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" className="text-xs" />
                      <PolarRadiusAxis domain={[0, 100]} className="text-xs" />
                      <Radar 
                        name="Performance" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
