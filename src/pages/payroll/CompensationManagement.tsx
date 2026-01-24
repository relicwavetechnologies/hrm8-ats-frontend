import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { DollarSign, TrendingUp, Users, Award, PieChart, Download } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

export default function CompensationManagement() {
  const salaryData = [
    { department: 'Engineering', min: 80000, avg: 125000, max: 180000 },
    { department: 'Sales', min: 60000, avg: 95000, max: 150000 },
    { department: 'Marketing', min: 55000, avg: 85000, max: 130000 },
    { department: 'HR', min: 50000, avg: 75000, max: 110000 },
    { department: 'Finance', min: 65000, avg: 105000, max: 160000 }
  ];

  const compensationTrend = [
    { month: 'Jan', base: 4200000, bonus: 250000, benefits: 450000 },
    { month: 'Feb', base: 4250000, bonus: 280000, benefits: 460000 },
    { month: 'Mar', base: 4300000, bonus: 320000, benefits: 470000 },
    { month: 'Apr', base: 4400000, bonus: 290000, benefits: 480000 },
    { month: 'May', base: 4450000, bonus: 310000, benefits: 490000 },
    { month: 'Jun', base: 4600000, bonus: 450000, benefits: 500000 }
  ];

  const equityData = [
    { name: 'Engineering', value: 45 },
    { name: 'Sales', value: 25 },
    { name: 'Marketing', value: 15 },
    { name: 'Finance', value: 10 },
    { name: 'HR', value: 5 }
  ];

  const compaRatioData = [
    { level: 'Entry', ratio: 0.95, employees: 45 },
    { level: 'Mid', ratio: 1.02, employees: 78 },
    { level: 'Senior', ratio: 1.08, employees: 52 },
    { level: 'Lead', ratio: 1.15, employees: 28 },
    { level: 'Executive', ratio: 1.25, employees: 12 }
  ];

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Compensation Management</h1>
            <p className="text-muted-foreground">Manage salary structures, bonuses, and benefits</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <DollarSign className="h-4 w-4 mr-2" />
              New Adjustment
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Payroll</p>
                  <p className="text-3xl font-bold mt-2">$5.5M</p>
                  <p className="text-xs text-muted-foreground mt-1">+8.2% vs last month</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Salary</p>
                  <p className="text-3xl font-bold mt-2">$102K</p>
                  <p className="text-xs text-muted-foreground mt-1">Across all departments</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bonus Pool</p>
                  <p className="text-3xl font-bold mt-2">$450K</p>
                  <p className="text-xs text-muted-foreground mt-1">Q4 2024 allocated</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Adjustments Due</p>
                  <p className="text-3xl font-bold mt-2">23</p>
                  <p className="text-xs text-muted-foreground mt-1">Pending this quarter</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="salary" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="salary">Salary Ranges</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="equity">Equity</TabsTrigger>
            <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          </TabsList>

          <TabsContent value="salary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Salary Ranges by Department</CardTitle>
                <CardDescription>Current compensation structure across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={salaryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="min" fill="hsl(var(--chart-1))" name="Minimum" />
                    <Bar dataKey="avg" fill="hsl(var(--chart-2))" name="Average" />
                    <Bar dataKey="max" fill="hsl(var(--chart-3))" name="Maximum" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Compensation Trends</CardTitle>
                <CardDescription>Monthly compensation breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={compensationTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="base" stroke="hsl(var(--chart-1))" name="Base Salary" strokeWidth={2} />
                    <Line type="monotone" dataKey="bonus" stroke="hsl(var(--chart-2))" name="Bonuses" strokeWidth={2} />
                    <Line type="monotone" dataKey="benefits" stroke="hsl(var(--chart-3))" name="Benefits" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Equity Distribution</CardTitle>
                <CardDescription>Stock options and equity grants by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {equityData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.value}% of total</p>
                        </div>
                        <Badge variant="secondary" className="text-lg">{item.value}%</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Total Equity Pool</h4>
                        <p className="text-3xl font-bold">2.5M shares</p>
                        <p className="text-sm text-muted-foreground mt-1">Allocated across 215 employees</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Vesting Schedule</h4>
                        <p className="text-sm text-muted-foreground">4-year vesting, 1-year cliff</p>
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Vested</span>
                            <span className="font-semibold">1.2M (48%)</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Unvested</span>
                            <span className="font-semibold">1.3M (52%)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benchmarks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Compa-Ratio Analysis</CardTitle>
                <CardDescription>Salary positioning vs market rates by level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis domain={[0.8, 1.4]} />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold">{data.level}</p>
                            <p className="text-sm">Compa-Ratio: {data.ratio}</p>
                            <p className="text-sm text-muted-foreground">{data.employees} employees</p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Legend />
                    <Scatter name="Compa-Ratio" data={compaRatioData} fill="hsl(var(--chart-1))" />
                  </ScatterChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Below Market</p>
                      <p className="text-2xl font-bold text-red-500">15%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">At Market</p>
                      <p className="text-2xl font-bold text-emerald-500">70%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Above Market</p>
                      <p className="text-2xl font-bold text-blue-500">15%</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
