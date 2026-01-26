import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
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
  Radar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  DollarSign,
  Target,
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useState } from 'react';

interface DepartmentStats {
  department: string;
  totalEmployees: number;
  enrolledEmployees: number;
  completedCourses: number;
  inProgressCourses: number;
  averageProgress: number;
  totalLearningHours: number;
  certificationsEarned: number;
  skillsGapScore: number;
  investmentAmount: number;
  estimatedROI: number;
}

interface SkillGapData {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  departmentsAffected: string[];
}

interface TeamLearningAnalyticsProps {
  departmentStats: DepartmentStats[];
  skillGaps: SkillGapData[];
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange: (range: 'week' | 'month' | 'quarter' | 'year') => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function TeamLearningAnalytics({
  departmentStats,
  skillGaps,
  timeRange,
  onTimeRangeChange,
}: TeamLearningAnalyticsProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Calculate overall metrics
  const totalEmployees = departmentStats.reduce((sum, dept) => sum + dept.totalEmployees, 0);
  const totalEnrolled = departmentStats.reduce((sum, dept) => sum + dept.enrolledEmployees, 0);
  const totalCompleted = departmentStats.reduce((sum, dept) => sum + dept.completedCourses, 0);
  const totalInProgress = departmentStats.reduce((sum, dept) => sum + dept.inProgressCourses, 0);
  const totalLearningHours = departmentStats.reduce((sum, dept) => sum + dept.totalLearningHours, 0);
  const totalCertifications = departmentStats.reduce((sum, dept) => sum + dept.certificationsEarned, 0);
  const totalInvestment = departmentStats.reduce((sum, dept) => sum + dept.investmentAmount, 0);
  const averageROI = departmentStats.reduce((sum, dept) => sum + dept.estimatedROI, 0) / departmentStats.length;
  const overallProgress = departmentStats.reduce((sum, dept) => sum + dept.averageProgress, 0) / departmentStats.length;

  const enrollmentRate = (totalEnrolled / totalEmployees) * 100;
  const completionRate = totalCompleted > 0 ? (totalCompleted / (totalCompleted + totalInProgress)) * 100 : 0;

  // Filter data by selected department
  const filteredStats = selectedDepartment === 'all' 
    ? departmentStats 
    : departmentStats.filter(d => d.department === selectedDepartment);

  // Prepare chart data
  const departmentComparisonData = departmentStats.map(dept => ({
    name: dept.department,
    progress: dept.averageProgress,
    completion: (dept.completedCourses / (dept.completedCourses + dept.inProgressCourses)) * 100 || 0,
    enrollment: (dept.enrolledEmployees / dept.totalEmployees) * 100,
    hours: dept.totalLearningHours,
  }));

  const skillGapChartData = skillGaps.slice(0, 10).map(skill => ({
    name: skill.skill,
    current: skill.currentLevel,
    required: skill.requiredLevel,
    gap: skill.gap,
  }));

  const roiData = departmentStats.map(dept => ({
    name: dept.department,
    investment: dept.investmentAmount,
    roi: dept.estimatedROI,
  }));

  const completionTrendData = [
    { month: 'Jan', completed: 45, enrolled: 120 },
    { month: 'Feb', completed: 62, enrolled: 135 },
    { month: 'Mar', completed: 78, enrolled: 148 },
    { month: 'Apr', completed: 95, enrolled: 162 },
    { month: 'May', completed: 112, enrolled: 178 },
    { month: 'Jun', completed: 134, enrolled: 195 },
  ];

  const topPerformersData = departmentStats
    .sort((a, b) => b.averageProgress - a.averageProgress)
    .slice(0, 5);

  const criticalSkillGaps = skillGaps
    .filter(gap => gap.gap > 2)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Learning Analytics</h2>
          <p className="text-muted-foreground">Track learning progress and performance across your organization</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departmentStats.map(dept => (
                <SelectItem key={dept.department} value={dept.department}>
                  {dept.department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={(value: any) => onTimeRangeChange(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrollment Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollmentRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              {totalEnrolled} of {totalEmployees} employees
            </p>
            <Progress value={enrollmentRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              {totalCompleted} courses completed
            </p>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLearningHours.toLocaleString()}h</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              {(totalLearningHours / totalEmployees).toFixed(1)}h per employee
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageROI.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              ${totalInvestment.toLocaleString()} invested
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="departments">
            <Users className="h-4 w-4 mr-2" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Target className="h-4 w-4 mr-2" />
            Skills Gaps
          </TabsTrigger>
          <TabsTrigger value="roi">
            <DollarSign className="h-4 w-4 mr-2" />
            ROI Analysis
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Completion Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Completion Trends</CardTitle>
                <CardDescription>Course enrollments vs completions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={completionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="enrolled" stroke="#8884d8" name="Enrolled" />
                    <Line type="monotone" dataKey="completed" stroke="#82ca9d" name="Completed" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Departments</CardTitle>
                <CardDescription>Highest average progress by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformersData.map((dept, index) => (
                    <div key={dept.department} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="font-medium">{dept.department}</span>
                        </div>
                        <span className="text-sm font-bold">{dept.averageProgress.toFixed(0)}%</span>
                      </div>
                      <Progress value={dept.averageProgress} />
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{dept.completedCourses} completed</span>
                        <span>{dept.certificationsEarned} certifications</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Skills Gaps Alert */}
          {criticalSkillGaps.length > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-orange-900 dark:text-orange-200">Critical Skills Gaps</CardTitle>
                </div>
                <CardDescription className="text-orange-700 dark:text-orange-300">
                  These skills require immediate attention across multiple departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {criticalSkillGaps.map(gap => (
                    <div key={gap.skill} className="p-4 rounded-lg bg-background border">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{gap.skill}</h4>
                        <Badge variant="destructive">{gap.gap.toFixed(1)} gap</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current:</span>
                          <span>{gap.currentLevel.toFixed(1)}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Required:</span>
                          <span>{gap.requiredLevel.toFixed(1)}/5</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Affects: {gap.departmentsAffected.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Comparison</CardTitle>
              <CardDescription>Compare learning metrics across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={departmentComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="progress" fill="#8884d8" name="Avg Progress %" />
                  <Bar dataKey="completion" fill="#82ca9d" name="Completion %" />
                  <Bar dataKey="enrollment" fill="#ffc658" name="Enrollment %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department Details</CardTitle>
              <CardDescription>Detailed statistics for each department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStats.map(dept => (
                  <div key={dept.department} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{dept.department}</h3>
                      <Badge>{dept.enrolledEmployees}/{dept.totalEmployees} enrolled</Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Progress</div>
                        <div className="text-2xl font-bold">{dept.averageProgress.toFixed(0)}%</div>
                        <Progress value={dept.averageProgress} className="mt-2" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                        <div className="text-2xl font-bold">{dept.completedCourses}</div>
                        <p className="text-xs text-muted-foreground mt-1">courses</p>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Learning Hours</div>
                        <div className="text-2xl font-bold">{dept.totalLearningHours}h</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(dept.totalLearningHours / dept.totalEmployees).toFixed(1)}h per person
                        </p>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Certifications</div>
                        <div className="text-2xl font-bold">{dept.certificationsEarned}</div>
                        <p className="text-xs text-muted-foreground mt-1">earned</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Gaps Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills Gap Analysis</CardTitle>
              <CardDescription>Current skill levels vs required levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={skillGapChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="#8884d8" name="Current Level" />
                  <Bar dataKey="required" fill="#82ca9d" name="Required Level" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills Distribution</CardTitle>
              <CardDescription>Skill level breakdown across organization</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Beginner', value: 120 },
                      { name: 'Intermediate', value: 250 },
                      { name: 'Advanced', value: 180 },
                      { name: 'Expert', value: 85 },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROI Analysis Tab */}
        <TabsContent value="roi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Return on Investment by Department</CardTitle>
              <CardDescription>Training investment vs estimated ROI</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={roiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="investment" fill="#8884d8" name="Investment ($)" />
                  <Bar yAxisId="right" dataKey="roi" fill="#82ca9d" name="ROI (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Investment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${totalInvestment.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Across all learning initiatives
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estimated ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{averageROI.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Average return on investment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cost per Employee</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${(totalInvestment / totalEmployees).toFixed(0)}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Average training cost
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
