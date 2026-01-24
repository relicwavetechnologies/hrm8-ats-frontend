import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { PerformanceGoal, PerformanceReview } from "@/shared/types/performance";
import { Employee } from "@/shared/types/employee";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Minus, Users, Building2, User } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface PerformanceBenchmarkingProps {
  goals: PerformanceGoal[];
  reviews: PerformanceReview[];
  employees: Employee[];
}

interface BenchmarkMetrics {
  employeeId: string;
  employeeName: string;
  department: string;
  goalCompletionRate: number;
  averageRating: number;
  goalsCompleted: number;
  totalGoals: number;
  avgProgress: number;
}

export function PerformanceBenchmarking({ goals, reviews, employees }: PerformanceBenchmarkingProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>(employees[0]?.id || '');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Calculate metrics for each employee
  const employeeMetrics = useMemo(() => {
    return employees.map(emp => {
      const empGoals = goals.filter(g => g.employeeId === emp.id);
      const empReviews = reviews.filter(r => r.employeeId === emp.id);
      
      const completed = empGoals.filter(g => g.status === 'completed').length;
      const total = empGoals.length;
      const avgProgress = total > 0 
        ? empGoals.reduce((sum, g) => sum + g.progress, 0) / total 
        : 0;
      
      const reviewsWithRating = empReviews.filter(r => r.overallRating !== undefined);
      const avgRating = reviewsWithRating.length > 0
        ? reviewsWithRating.reduce((sum, r) => sum + (r.overallRating || 0), 0) / reviewsWithRating.length
        : 0;

      return {
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        goalCompletionRate: total > 0 ? (completed / total) * 100 : 0,
        averageRating: avgRating,
        goalsCompleted: completed,
        totalGoals: total,
        avgProgress
      };
    });
  }, [goals, reviews, employees]);

  // Get unique departments
  const departments = useMemo(() => {
    return ['all', ...new Set(employees.map(e => e.department))];
  }, [employees]);

  // Filter metrics by department
  const filteredMetrics = useMemo(() => {
    if (selectedDepartment === 'all') return employeeMetrics;
    return employeeMetrics.filter(m => m.department === selectedDepartment);
  }, [employeeMetrics, selectedDepartment]);

  // Calculate department averages
  const departmentAverages = useMemo(() => {
    const deptMap = new Map<string, BenchmarkMetrics[]>();
    
    employeeMetrics.forEach(metric => {
      if (!deptMap.has(metric.department)) {
        deptMap.set(metric.department, []);
      }
      deptMap.get(metric.department)!.push(metric);
    });

    return Array.from(deptMap.entries()).map(([dept, metrics]) => {
      const count = metrics.length;
      return {
        department: dept,
        goalCompletionRate: metrics.reduce((sum, m) => sum + m.goalCompletionRate, 0) / count,
        averageRating: metrics.reduce((sum, m) => sum + m.averageRating, 0) / count,
        avgProgress: metrics.reduce((sum, m) => sum + m.avgProgress, 0) / count,
        employeeCount: count
      };
    });
  }, [employeeMetrics]);

  // Calculate company-wide averages
  const companyAverages = useMemo(() => {
    const count = employeeMetrics.length;
    if (count === 0) return null;

    return {
      goalCompletionRate: employeeMetrics.reduce((sum, m) => sum + m.goalCompletionRate, 0) / count,
      averageRating: employeeMetrics.reduce((sum, m) => sum + m.averageRating, 0) / count,
      avgProgress: employeeMetrics.reduce((sum, m) => sum + m.avgProgress, 0) / count
    };
  }, [employeeMetrics]);

  // Get selected employee metrics
  const selectedEmployeeMetrics = employeeMetrics.find(m => m.employeeId === selectedEmployee);
  
  // Get department average for selected employee's department
  const selectedDeptAverage = selectedEmployeeMetrics 
    ? departmentAverages.find(d => d.department === selectedEmployeeMetrics.department)
    : null;

  // Prepare comparison data for charts
  const comparisonData = useMemo(() => {
    if (!selectedEmployeeMetrics || !companyAverages) return [];

    return [
      {
        metric: 'Goal Completion',
        employee: Math.round(selectedEmployeeMetrics.goalCompletionRate),
        department: Math.round(selectedDeptAverage?.goalCompletionRate || 0),
        company: Math.round(companyAverages.goalCompletionRate)
      },
      {
        metric: 'Avg Rating',
        employee: parseFloat(selectedEmployeeMetrics.averageRating.toFixed(1)),
        department: parseFloat((selectedDeptAverage?.averageRating || 0).toFixed(1)),
        company: parseFloat(companyAverages.averageRating.toFixed(1))
      },
      {
        metric: 'Avg Progress',
        employee: Math.round(selectedEmployeeMetrics.avgProgress),
        department: Math.round(selectedDeptAverage?.avgProgress || 0),
        company: Math.round(companyAverages.avgProgress)
      }
    ];
  }, [selectedEmployeeMetrics, selectedDeptAverage, companyAverages]);

  // Prepare radar chart data
  const radarData = useMemo(() => {
    if (!selectedEmployeeMetrics || !companyAverages) return [];

    return [
      {
        category: 'Goals',
        employee: selectedEmployeeMetrics.goalCompletionRate,
        company: companyAverages.goalCompletionRate
      },
      {
        category: 'Rating',
        employee: selectedEmployeeMetrics.averageRating * 20, // Scale to 100
        company: companyAverages.averageRating * 20
      },
      {
        category: 'Progress',
        employee: selectedEmployeeMetrics.avgProgress,
        company: companyAverages.avgProgress
      }
    ];
  }, [selectedEmployeeMetrics, companyAverages]);

  // Calculate performance indicator
  const getPerformanceIndicator = (employeeVal: number, companyVal: number) => {
    const diff = employeeVal - companyVal;
    const percentDiff = companyVal > 0 ? (diff / companyVal) * 100 : 0;

    if (Math.abs(percentDiff) < 5) {
      return { icon: Minus, color: 'text-muted-foreground', label: 'On Par', variant: 'secondary' as const };
    } else if (percentDiff > 0) {
      return { icon: TrendingUp, color: 'text-green-600', label: 'Above Average', variant: 'default' as const };
    } else {
      return { icon: TrendingDown, color: 'text-orange-600', label: 'Below Average', variant: 'outline' as const };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Benchmarking</h2>
          <p className="text-muted-foreground">Compare individual performance against team and company averages</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} - {emp.department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-64">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedEmployeeMetrics && companyAverages && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Goal Completion Rate</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-2xl font-bold">{Math.round(selectedEmployeeMetrics.goalCompletionRate)}%</div>
                  {(() => {
                    const indicator = getPerformanceIndicator(
                      selectedEmployeeMetrics.goalCompletionRate,
                      companyAverages.goalCompletionRate
                    );
                    const Icon = indicator.icon;
                    return (
                      <Badge variant={indicator.variant} className="gap-1">
                        <Icon className="h-3 w-3" />
                        {indicator.label}
                      </Badge>
                    );
                  })()}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Dept: {Math.round(selectedDeptAverage?.goalCompletionRate || 0)}%
                  </p>
                  <p className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Company: {Math.round(companyAverages.goalCompletionRate)}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-2xl font-bold">{selectedEmployeeMetrics.averageRating.toFixed(1)}</div>
                  {(() => {
                    const indicator = getPerformanceIndicator(
                      selectedEmployeeMetrics.averageRating,
                      companyAverages.averageRating
                    );
                    const Icon = indicator.icon;
                    return (
                      <Badge variant={indicator.variant} className="gap-1">
                        <Icon className="h-3 w-3" />
                        {indicator.label}
                      </Badge>
                    );
                  })()}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Dept: {(selectedDeptAverage?.averageRating || 0).toFixed(1)}
                  </p>
                  <p className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Company: {companyAverages.averageRating.toFixed(1)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-2xl font-bold">{Math.round(selectedEmployeeMetrics.avgProgress)}%</div>
                  {(() => {
                    const indicator = getPerformanceIndicator(
                      selectedEmployeeMetrics.avgProgress,
                      companyAverages.avgProgress
                    );
                    const Icon = indicator.icon;
                    return (
                      <Badge variant={indicator.variant} className="gap-1">
                        <Icon className="h-3 w-3" />
                        {indicator.label}
                      </Badge>
                    );
                  })()}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Dept: {Math.round(selectedDeptAverage?.avgProgress || 0)}%
                  </p>
                  <p className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Company: {Math.round(companyAverages.avgProgress)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="comparison" className="w-full">
            <TabsList>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
              <TabsTrigger value="radar">Performance Profile</TabsTrigger>
              <TabsTrigger value="department">Department Rankings</TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Individual vs Team vs Company</CardTitle>
                  <CardDescription>Compare key performance metrics across all levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="employee" fill="hsl(var(--primary))" name="Employee" />
                      <Bar dataKey="department" fill="hsl(var(--chart-2))" name="Department Avg" />
                      <Bar dataKey="company" fill="hsl(var(--chart-3))" name="Company Avg" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="radar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Profile</CardTitle>
                  <CardDescription>Multi-dimensional performance comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Employee"
                        dataKey="employee"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Company Average"
                        dataKey="company"
                        stroke="hsl(var(--chart-3))"
                        fill="hsl(var(--chart-3))"
                        fillOpacity={0.3}
                      />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="department" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Department Performance Rankings</CardTitle>
                  <CardDescription>Average metrics across all departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentAverages
                      .sort((a, b) => b.goalCompletionRate - a.goalCompletionRate)
                      .map((dept, index) => (
                        <div
                          key={dept.department}
                          className={cn(
                            "p-4 rounded-lg border",
                            dept.department === selectedEmployeeMetrics.department && "border-primary bg-primary/5"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{index + 1}</Badge>
                              <h4 className="font-semibold">{dept.department}</h4>
                              <span className="text-sm text-muted-foreground">
                                ({dept.employeeCount} employees)
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Goal Completion</p>
                              <p className="font-semibold">{Math.round(dept.goalCompletionRate)}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Avg Rating</p>
                              <p className="font-semibold">{dept.averageRating.toFixed(1)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Avg Progress</p>
                              <p className="font-semibold">{Math.round(dept.avgProgress)}%</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
