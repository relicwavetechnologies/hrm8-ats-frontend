import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { UserPlus, UserMinus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function OnboardingOffboardingDashboard() {
  const onboardingData = {
    active: 12,
    completed: 45,
    avgDuration: 14,
    completionRate: 89
  };

  const offboardingData = {
    active: 5,
    completed: 18,
    avgDuration: 7,
    completionRate: 95
  };

  const timelineData = [
    { month: 'Jan', onboarding: 8, offboarding: 3 },
    { month: 'Feb', onboarding: 12, offboarding: 4 },
    { month: 'Mar', onboarding: 15, offboarding: 2 },
    { month: 'Apr', onboarding: 10, offboarding: 5 },
    { month: 'May', onboarding: 14, offboarding: 3 },
    { month: 'Jun', onboarding: 12, offboarding: 5 }
  ];

  const activeOnboarding = [
    { 
      id: 1,
      name: 'Alice Brown',
      role: 'Senior Developer',
      startDate: '2024-01-15',
      progress: 75,
      completedTasks: 9,
      totalTasks: 12,
      daysRemaining: 3
    },
    { 
      id: 2,
      name: 'Bob Wilson',
      role: 'Product Manager',
      startDate: '2024-01-10',
      progress: 90,
      completedTasks: 11,
      totalTasks: 12,
      daysRemaining: 1
    },
    { 
      id: 3,
      name: 'Carol Davis',
      role: 'UX Designer',
      startDate: '2024-01-20',
      progress: 45,
      completedTasks: 5,
      totalTasks: 11,
      daysRemaining: 8
    }
  ];

  const activeOffboarding = [
    { 
      id: 1,
      name: 'David Martinez',
      role: 'Software Engineer',
      lastDay: '2024-02-01',
      progress: 60,
      completedTasks: 6,
      totalTasks: 10,
      daysRemaining: 5
    },
    { 
      id: 2,
      name: 'Emma Taylor',
      role: 'Marketing Manager',
      lastDay: '2024-02-05',
      progress: 30,
      completedTasks: 3,
      totalTasks: 10,
      daysRemaining: 9
    }
  ];

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Onboarding & Offboarding</h1>
            <p className="text-muted-foreground">Manage employee transitions and workflows</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <UserMinus className="h-4 w-4 mr-2" />
              Start Offboarding
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Start Onboarding
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Onboarding Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-3xl font-bold">{onboardingData.active}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed (YTD)</p>
                  <p className="text-3xl font-bold">{onboardingData.completed}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Duration</p>
                  <p className="text-3xl font-bold">{onboardingData.avgDuration}<span className="text-sm font-normal ml-1">days</span></p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-3xl font-bold">{onboardingData.completionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UserMinus className="h-5 w-5" />
                Offboarding Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-3xl font-bold">{offboardingData.active}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed (YTD)</p>
                  <p className="text-3xl font-bold">{offboardingData.completed}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Duration</p>
                  <p className="text-3xl font-bold">{offboardingData.avgDuration}<span className="text-sm font-normal ml-1">days</span></p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-3xl font-bold">{offboardingData.completionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Onboarding & Offboarding Trends</CardTitle>
            <CardDescription>Monthly activity over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="onboarding" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Onboarding" />
                <Line type="monotone" dataKey="offboarding" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Offboarding" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Tabs defaultValue="onboarding" className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="onboarding">Active Onboarding</TabsTrigger>
            <TabsTrigger value="offboarding">Active Offboarding</TabsTrigger>
          </TabsList>

          <TabsContent value="onboarding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Active Onboarding Processes</CardTitle>
                <CardDescription>Employees currently going through onboarding</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeOnboarding.map(employee => (
                    <Card key={employee.id}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-lg">{employee.name}</h4>
                              <p className="text-sm text-muted-foreground">{employee.role}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Start Date: {new Date(employee.startDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={employee.progress >= 90 ? 'default' : employee.progress >= 50 ? 'secondary' : 'outline'}>
                              {employee.completedTasks}/{employee.totalTasks} Tasks
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-semibold">{employee.progress}%</span>
                            </div>
                            <Progress value={employee.progress} />
                          </div>

                          <div className="text-base font-semibold flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{employee.daysRemaining} days remaining</span>
                            </div>
                            <Button size="sm">View Details</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offboarding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Active Offboarding Processes</CardTitle>
                <CardDescription>Employees currently going through offboarding</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeOffboarding.map(employee => (
                    <Card key={employee.id}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-lg">{employee.name}</h4>
                              <p className="text-sm text-muted-foreground">{employee.role}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Last Day: {new Date(employee.lastDay).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={employee.progress >= 90 ? 'default' : 'outline'}>
                              {employee.completedTasks}/{employee.totalTasks} Tasks
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-semibold">{employee.progress}%</span>
                            </div>
                            <Progress value={employee.progress} />
                          </div>

                          <div className="text-base font-semibold flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{employee.daysRemaining} days until last day</span>
                            </div>
                            <Button size="sm">View Details</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
