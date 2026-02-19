import { useState, useEffect } from 'react';
import { DashboardPageLayout } from '@/app/layouts/DashboardPageLayout';
import { AtsPageHeader } from '@/app/layouts/AtsPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Label } from '@/shared/components/ui/label';
import { Calendar } from '@/shared/components/ui/calendar';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Lightbulb, Activity, AlertTriangle, CalendarIcon, Filter, X, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { getPredictiveMetrics, getDepartmentComparisons, getSkillGaps, getWorkforceInsights } from '@/shared/lib/advancedAnalyticsStorage';
import type { PredictiveMetric, DepartmentComparison, SkillGapAnalysis, WorkforceInsight } from '@/shared/types/advancedAnalytics';
import { ScheduleReportDialog } from '@/modules/analytics/components/reports/ScheduleReportDialog';

export default function AdvancedAnalytics() {
  const [predictiveMetrics, setPredictiveMetrics] = useState<PredictiveMetric[]>([]);
  const [departments, setDepartments] = useState<DepartmentComparison[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGapAnalysis[]>([]);
  const [insights, setInsights] = useState<WorkforceInsight[]>([]);

  // Filter states
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    to: new Date(),
  });
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedMetricTypes, setSelectedMetricTypes] = useState<string[]>(['turnover', 'performance', 'engagement']);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  useEffect(() => {
    setPredictiveMetrics(getPredictiveMetrics());
    setDepartments(getDepartmentComparisons());
    setSkillGaps(getSkillGaps());
    setInsights(getWorkforceInsights());
  }, []);

  // Apply filters to data
  const filteredDepartments = departments.filter(dept =>
    selectedDepartments.length === 0 || selectedDepartments.includes(dept.department)
  );

  const filteredMetrics = predictiveMetrics.filter(metric =>
    selectedMetricTypes.length === 0 || selectedMetricTypes.includes(metric.category)
  );

  const filteredSkillGaps = skillGaps.filter(gap =>
    selectedPriority === 'all' || gap.priority === selectedPriority
  );

  const filteredInsights = insights.filter(insight =>
    selectedPriority === 'all' ||
    (selectedPriority === 'high' && insight.impact === 'high') ||
    (selectedPriority === 'medium' && insight.impact === 'medium') ||
    (selectedPriority === 'low' && insight.impact === 'low')
  );

  const allDepartments = [...new Set(departments.map(d => d.department))];
  const activeFilterCount =
    (selectedDepartments.length > 0 ? 1 : 0) +
    (selectedMetricTypes.length < 3 ? 1 : 0) +
    (selectedPriority !== 'all' ? 1 : 0) +
    (dateRange.from || dateRange.to ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedDepartments([]);
    setSelectedMetricTypes(['turnover', 'performance', 'engagement']);
    setSelectedPriority('all');
    setDateRange({ from: new Date(new Date().setMonth(new Date().getMonth() - 6)), to: new Date() });
  };

  const toggleDepartment = (dept: string) => {
    setSelectedDepartments(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const toggleMetricType = (type: string) => {
    setSelectedMetricTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'opportunity': return <Lightbulb className="h-5 w-5 text-success" />;
      case 'trend': return <Activity className="h-5 w-5 text-primary" />;
      default: return <AlertCircle className="h-5 w-5 text-warning" />;
    }
  };

  // Chart colors
  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  // Prepare workforce distribution data
  const workforceDistribution = filteredDepartments.map(dept => ({
    name: dept.department,
    value: dept.headcount
  }));

  // Prepare skill gap data for area chart
  const skillGapTrendData = filteredSkillGaps.map((gap, index) => ({
    name: gap.skillName,
    currentLevel: gap.currentLevel,
    requiredLevel: gap.requiredLevel,
    gap: gap.gap,
    employees: gap.affectedEmployees
  }));

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <AtsPageHeader
          title="Advanced Analytics"
          subtitle="Predictive insights, workforce intelligence, and strategic recommendations"
        >
          <div className="flex gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScheduleDialogOpen(true)}
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              Schedule Report
            </Button>
          </div>
        </AtsPageHeader>

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Filters</CardTitle>
              <CardDescription className="text-sm">Refine data visualization and analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={{ from: dateRange.from, to: dateRange.to }}
                        onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                        numberOfMonths={2}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Department Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Departments</Label>
                  <Select
                    value={selectedDepartments.length === 0 ? "all" : selectedDepartments[0]}
                    onValueChange={(value) => {
                      if (value === "all") {
                        setSelectedDepartments([]);
                      } else {
                        toggleDepartment(value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {allDepartments.map(dept => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                          {selectedDepartments.includes(dept) && " ✓"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDepartments.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedDepartments.map(dept => (
                        <Badge key={dept} variant="secondary" className="gap-1">
                          {dept}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => toggleDepartment(dept)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Metric Type Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Metric Types</Label>
                  <div className="space-y-2">
                    {['turnover', 'performance', 'engagement', 'productivity', 'cost'].map(type => (
                      <Label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          id={`metric-${type}`}
                          checked={selectedMetricTypes.includes(type)}
                          onCheckedChange={() => toggleMetricType(type)}
                        />
                        <span className="capitalize">{type}</span>
                      </Label>
                    ))}
                  </div>
                </div>

                {/* Priority Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Priority Level</Label>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Summary */}
        {activeFilterCount > 0 && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Filtered Results</p>
                  <p className="text-xs text-muted-foreground">
                    Showing {filteredDepartments.length} departments, {filteredMetrics.length} metrics, {filteredSkillGaps.length} skill gaps
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Predictive Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Predictive Trends</CardTitle>
            <CardDescription className="text-sm">Forecasted vs. current metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filteredMetrics.map(m => ({
                  name: m.metricName.split(' ').slice(0, 2).join(' '),
                  current: m.currentValue,
                  predicted: m.predictedValue,
                  confidence: m.confidence
                }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={false}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="current" stroke="hsl(var(--primary))" strokeWidth={3} name="Current Value" dot={false} activeDot={false} />
                  <Line type="monotone" dataKey="predicted" stroke="hsl(var(--chart-2))" strokeWidth={2} strokeDasharray="5 5" name="Predicted Value" dot={false} activeDot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Predictive Metrics Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Predictive Metrics</CardTitle>
            <CardDescription className="text-sm">AI-powered forecasts for key workforce indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMetrics.map((metric) => (
                <div key={metric.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold">{metric.metricName}</h4>
                      <p className="text-xs text-muted-foreground">
                        Predicted for {new Date(metric.predictedDate).toLocaleDateString()}
                      </p>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="text-base font-semibold">{metric.currentValue}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Predicted</p>
                      <p className="text-base font-semibold">{metric.predictedValue}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Confidence</p>
                      <p className="text-base font-semibold">{metric.confidence}%</p>
                    </div>
                  </div>
                  <Progress value={metric.confidence} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Workforce Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Workforce Insights</CardTitle>
            <CardDescription className="text-sm">Actionable intelligence and strategic recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInsights.map((insight) => (
                <div key={insight.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-semibold">{insight.title}</h4>
                        <Badge variant="outline" className="h-6 px-2 text-xs rounded-full">
                          {insight.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                      {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-2">Suggested Actions:</p>
                          <ul className="space-y-1">
                            {insight.suggestedActions.map((action, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Department Metrics</CardTitle>
              <CardDescription className="text-sm">Performance and engagement scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredDepartments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="department"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="performanceScore" fill="hsl(var(--chart-1))" name="Performance" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="engagementScore" fill="hsl(var(--chart-2))" name="Engagement" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Department Radar</CardTitle>
              <CardDescription className="text-sm">Multi-dimensional performance view</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={filteredDepartments}>
                  <PolarGrid strokeOpacity={0.2} />
                  <PolarAngleAxis dataKey="department" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} strokeOpacity={0.2} />
                  <Radar name="Performance" dataKey="performanceScore" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.4} />
                  <Radar name="Engagement" dataKey="engagementScore" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Department Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Department Performance Comparison</CardTitle>
            <CardDescription className="text-sm">Detailed benchmarking across organizational units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Department</th>
                    <th className="text-right py-3 px-2 font-medium">Headcount</th>
                    <th className="text-right py-3 px-2 font-medium">Avg Salary</th>
                    <th className="text-right py-3 px-2 font-medium">Avg Tenure</th>
                    <th className="text-right py-3 px-2 font-medium">Turnover</th>
                    <th className="text-right py-3 px-2 font-medium">Performance</th>
                    <th className="text-right py-3 px-2 font-medium">Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.map((dept, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-3 px-2 font-medium">{dept.department}</td>
                      <td className="text-right py-3 px-2">{dept.headcount}</td>
                      <td className="text-right py-3 px-2">${(dept.avgSalary / 1000).toFixed(0)}k</td>
                      <td className="text-right py-3 px-2">{dept.avgTenure.toFixed(1)} yrs</td>
                      <td className="text-right py-3 px-2">{dept.turnoverRate.toFixed(1)}%</td>
                      <td className="text-right py-3 px-2">{dept.performanceScore.toFixed(1)}/5</td>
                      <td className="text-right py-3 px-2">{dept.engagementScore.toFixed(1)}/10</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Workforce Distribution & Skill Gaps Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Workforce Distribution</CardTitle>
              <CardDescription className="text-sm">Headcount by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={workforceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    labelLine={false}
                    label={false}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {workforceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Skill Gap Analysis</CardTitle>
              <CardDescription className="text-sm">Current vs. required skill levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={skillGapTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    domain={[0, 5]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="currentLevel" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.6} name="Current Level" strokeWidth={3} />
                  <Area type="monotone" dataKey="gap" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.6} name="Skill Gap" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Skill Gap Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Critical Skill Gaps</CardTitle>
            <CardDescription className="text-sm">Areas requiring immediate attention and development</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSkillGaps.map((gap) => (
                <div key={gap.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold">{gap.skillName}</h4>
                      <p className="text-xs text-muted-foreground">
                        {gap.affectedEmployees} employees • {gap.departmentsAffected.join(', ')}
                      </p>
                    </div>
                    <Badge variant="outline" className="h-6 px-2 text-xs rounded-full">
                      {gap.priority}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Level</p>
                      <p className="text-base font-semibold">{gap.currentLevel}/5</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Required Level</p>
                      <p className="text-base font-semibold">{gap.requiredLevel}/5</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gap</p>
                      <p className="text-base font-semibold text-destructive">{gap.gap}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-2">Recommended Actions:</p>
                    <ul className="space-y-1">
                      {gap.recommendedActions.map((action, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <ScheduleReportDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        reportName="Advanced Analytics Report"
        reportType="advanced-analytics"
      />
    </DashboardPageLayout>
  );
}
