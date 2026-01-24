import { useParams, useNavigate } from 'react-router-dom';
import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Progress } from '@/shared/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Users, 
  CheckSquare, 
  TrendingUp,
  Edit,
  UserPlus,
  RefreshCw,
  AlertCircle,
  Building2,
  MapPin
} from 'lucide-react';
import { getRPOContractSummary, getRPODashboardMetrics } from '@/shared/lib/rpoTrackingUtils';
import { getTasksByContract, getTaskStats } from '@/shared/lib/rpoTaskStorage';
import { getServiceProjectById } from '@/shared/lib/recruitmentServiceStorage';
import { format, differenceInDays } from 'date-fns';
import { useState } from 'react';
import { RPOConsultantAssignmentDialog } from '@/components/rpo/RPOConsultantAssignmentDialog';
import { RPOTaskDialog } from '@/components/rpo/RPOTaskDialog';
import { RPOConsultantSuggestions } from '@/components/rpo/RPOConsultantSuggestions';
import { RPORenewalAnalytics } from '@/components/rpo/RPORenewalAnalytics';
import { RPOSLATracker } from '@/components/rpo/RPOSLATracker';
import { RPOPlacementPipeline } from '@/components/rpo/RPOPlacementPipeline';
import type { RPOTask } from '@/shared/types/rpoTask';
import { toast } from '@/shared/hooks/use-toast';

export default function RPOContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<RPOTask | null>(null);

  const metrics = getRPODashboardMetrics();
  const contract = metrics.contracts.find(c => c.id === id);
  const serviceProject = id ? getServiceProjectById(id) : null;
  const tasks = contract ? getTasksByContract(contract.id) : [];
  const taskStats = contract ? getTaskStats(contract.id) : null;

  if (!contract) {
    return (
      <DashboardPageLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Contract Not Found</h2>
            <p className="text-muted-foreground mb-4">The RPO contract you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/rpo/contracts')}>
              Back to Contracts
            </Button>
          </div>
        </div>
      </DashboardPageLayout>
    );
  }

  const statusColors = {
    'active': 'bg-green-500',
    'on-hold': 'bg-yellow-500',
    'completed': 'bg-blue-500',
    'cancelled': 'bg-destructive'
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/rpo/contracts')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contracts
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {contract.clientLogo && (
                <Avatar className="h-16 w-16">
                  <AvatarImage src={contract.clientLogo} alt={contract.clientName} />
                  <AvatarFallback>{getInitials(contract.clientName)}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{contract.name}</h1>
                  <Badge className={statusColors[contract.status]}>
                    {contract.status.toUpperCase()}
                  </Badge>
                  {contract.isExpiring && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Expiring Soon
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{contract.clientName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{contract.country}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {serviceProject && (
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Consultant
                </Button>
              )}
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Contract
              </Button>
              <Button>
                <RefreshCw className="h-4 w-4 mr-2" />
                Renew Contract
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Contract Duration</CardDescription>
              <CardTitle className="text-2xl">{contract.duration} months</CardTitle>
            </CardHeader>
            <CardContent>
              {contract.daysRemaining !== undefined && (
                <p className="text-sm text-muted-foreground">
                  {contract.daysRemaining} days remaining
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Monthly Retainer</CardDescription>
              <CardTitle className="text-2xl">
                ${contract.monthlyRetainer.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Total: ${contract.totalContractValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Assigned Consultants</CardDescription>
              <CardTitle className="text-2xl">{contract.numberOfConsultants}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {contract.assignedConsultants.length} total assignments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Progress</CardDescription>
              <CardTitle className="text-2xl">{contract.progress}%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={contract.progress} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="consultants">Consultants</TabsTrigger>
            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="sla">SLA</TabsTrigger>
            <TabsTrigger value="renewals">Renewal</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Contract Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Start Date</p>
                    <p className="text-muted-foreground">
                      {format(new Date(contract.startDate), 'PPP')}
                    </p>
                  </div>
                  {contract.endDate && (
                    <div>
                      <p className="text-sm font-medium mb-1">End Date</p>
                      <p className="text-muted-foreground">
                        {format(new Date(contract.endDate), 'PPP')}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium mb-1">Duration</p>
                    <p className="text-muted-foreground">{contract.duration} months</p>
                  </div>
                  {contract.daysRemaining !== undefined && (
                    <div>
                      <p className="text-sm font-medium mb-1">Time Remaining</p>
                      <p className={contract.isExpiring ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                        {contract.daysRemaining} days
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Placement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contract.targetPlacements && (
                    <div>
                      <p className="text-sm font-medium mb-1">Target Placements</p>
                      <p className="text-muted-foreground">{contract.targetPlacements}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium mb-1">Current Placements</p>
                    <p className="text-muted-foreground">{contract.currentPlacements}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Success Rate</p>
                    <div className="text-base font-semibold flex items-center gap-2">
                      <Progress value={contract.progress} className="flex-1" />
                      <span className="text-sm font-medium">{contract.progress}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fee Structures */}
            {contract.feeStructures.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Fee Structure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {contract.feeStructures.map((fee, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{fee.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {fee.type.replace('-', ' ')} {fee.frequency && `• ${fee.frequency}`}
                          </p>
                        </div>
                        <p className="font-semibold">${fee.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Consultants Tab */}
          <TabsContent value="consultants" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Assigned Consultants</h3>
              {serviceProject && (
                <Button onClick={() => setIsAssignDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Consultant
                </Button>
              )}
            </div>

            {/* Timeline Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Consultant Timeline</CardTitle>
                <CardDescription>Visual representation of consultant allocations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contract.assignedConsultants.map((assignment) => {
                    const startDate = new Date(assignment.startDate);
                    const endDate = assignment.endDate ? new Date(assignment.endDate) : null;
                    const contractStart = new Date(contract.startDate);
                    const contractEnd = contract.endDate ? new Date(contract.endDate) : new Date();
                    
                    const totalDays = differenceInDays(contractEnd, contractStart);
                    const assignmentStart = differenceInDays(startDate, contractStart);
                    const assignmentDuration = endDate 
                      ? differenceInDays(endDate, startDate)
                      : differenceInDays(contractEnd, startDate);
                    
                    const startPercent = (assignmentStart / totalDays) * 100;
                    const widthPercent = (assignmentDuration / totalDays) * 100;

                    return (
                      <div key={assignment.id} className="space-y-2">
                        <div className="text-base font-semibold flex items-center justify-between">
                          <div className="text-base font-semibold flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {assignment.avatar && <AvatarImage src={assignment.avatar} />}
                              <AvatarFallback>{getInitials(assignment.consultantName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{assignment.consultantName}</p>
                              <p className="text-sm text-muted-foreground">
                                ${assignment.monthlyRate.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/month
                              </p>
                            </div>
                          </div>
                          <Badge variant={assignment.isActive ? "default" : "secondary"}>
                            {assignment.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="relative h-8 bg-muted rounded">
                          <div 
                            className="absolute h-full bg-primary rounded transition-all"
                            style={{
                              left: `${Math.max(0, startPercent)}%`,
                              width: `${Math.min(100 - Math.max(0, startPercent), widthPercent)}%`
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            {format(startDate, 'MMM yyyy')} - {endDate ? format(endDate, 'MMM yyyy') : 'Ongoing'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Consultant Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {contract.assignedConsultants.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="text-base font-semibold flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          {assignment.avatar && <AvatarImage src={assignment.avatar} />}
                          <AvatarFallback>{getInitials(assignment.consultantName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{assignment.consultantName}</CardTitle>
                          <CardDescription>
                            ${assignment.monthlyRate.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/month
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={assignment.isActive ? "default" : "secondary"}>
                        {assignment.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Start Date</span>
                      <span className="font-medium">{format(new Date(assignment.startDate), 'PP')}</span>
                    </div>
                    {assignment.endDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">End Date</span>
                        <span className="font-medium">{format(new Date(assignment.endDate), 'PP')}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Cost</span>
                      <span className="font-semibold">
                        ${(assignment.monthlyRate * (assignment.endDate 
                          ? differenceInDays(new Date(assignment.endDate), new Date(assignment.startDate)) / 30
                          : contract.duration
                        )).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Contract Tasks</h3>
              <Button onClick={() => {
                setSelectedTask(null);
                setIsTaskDialogOpen(true);
              }}>
                <CheckSquare className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>

            {/* Task Stats */}
            {taskStats && (
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Tasks</CardDescription>
                    <CardTitle className="text-2xl">{taskStats.total}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>In Progress</CardDescription>
                    <CardTitle className="text-2xl text-blue-600">{taskStats.inProgress}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Completed</CardDescription>
                    <CardTitle className="text-2xl text-green-600">{taskStats.completed}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Overdue</CardDescription>
                    <CardTitle className="text-2xl text-destructive">{taskStats.overdue}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            )}

            {/* Task List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">All Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No tasks yet. Create your first task to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500' :
                            task.status === 'in-progress' ? 'bg-blue-500' :
                            task.status === 'blocked' ? 'bg-destructive' :
                            'bg-muted'
                          }`} />
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Assigned to {task.assignedConsultantName} • Due {format(new Date(task.dueDate), 'PP')}
                            </p>
                          </div>
                        </div>
                        <div className="text-base font-semibold flex items-center gap-2">
                          <Badge variant={
                            task.priority === 'high' ? 'destructive' :
                            task.priority === 'medium' ? 'default' :
                            'secondary'
                          }>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {task.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Placement Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{contract.progress}%</div>
                  <Progress value={contract.progress} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {contract.currentPlacements} of {contract.targetPlacements || 0} placements
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Task Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {taskStats?.total ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
                  </div>
                  <Progress value={taskStats?.total ? (taskStats.completed / taskStats.total) * 100 : 0} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {taskStats?.completed || 0} of {taskStats?.total || 0} tasks completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Consultant Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{contract.numberOfConsultants}</div>
                  <p className="text-sm text-muted-foreground">
                    {contract.assignedConsultants.length} total assignments
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials" className="space-y-4">
            {/* Cost by Consultant */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Cost Analysis by Consultant</CardTitle>
                <CardDescription>Monthly rates and projected costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contract.assignedConsultants.map((assignment) => {
                    const months = assignment.endDate 
                      ? differenceInDays(new Date(assignment.endDate), new Date(assignment.startDate)) / 30
                      : contract.duration;
                    const totalCost = assignment.monthlyRate * months;

                    return (
                      <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {assignment.avatar && <AvatarImage src={assignment.avatar} />}
                            <AvatarFallback>{getInitials(assignment.consultantName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{assignment.consultantName}</p>
                            <p className="text-sm text-muted-foreground">
                              ${assignment.monthlyRate.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/month × {Math.round(months)} months
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">${totalCost.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Total cost</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Total Consultant Costs</p>
                  <p className="text-xl font-bold">
                    ${contract.assignedConsultants.reduce((sum, a) => {
                      const months = a.endDate 
                        ? differenceInDays(new Date(a.endDate), new Date(a.startDate)) / 30
                        : contract.duration;
                      return sum + (a.monthlyRate * months);
                    }, 0).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contract Value Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Contract Value Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Retainer</span>
                  <span className="font-semibold">${contract.monthlyRetainer.toLocaleString()}</span>
                </div>
                {contract.perVacancyFee && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per Vacancy Fee</span>
                    <span className="font-semibold">${contract.perVacancyFee.toLocaleString()}</span>
                  </div>
                )}
                {contract.estimatedVacancies && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Vacancies</span>
                    <span className="font-semibold">{contract.estimatedVacancies}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total Contract Value</span>
                  <span className="text-xl font-bold">${contract.totalContractValue.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Consultant Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            <RPOConsultantSuggestions
              contractId={contract.id}
              requiredSkills={[contract.clientName, 'RPO Services']}
              onAssign={(consultantId) => {
                console.log('Assigning consultant:', consultantId);
                toast({
                  title: 'Consultant Assigned',
                  description: 'The consultant has been successfully assigned to this contract.',
                });
              }}
            />
          </TabsContent>

          {/* Placement Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-4">
            <RPOPlacementPipeline contractId={contract.id} />
          </TabsContent>

          {/* SLA Tracking Tab */}
          <TabsContent value="sla" className="space-y-4">
            <RPOSLATracker contractId={contract.id} />
          </TabsContent>

          {/* Renewal Analytics Tab */}
          <TabsContent value="renewals" className="space-y-4">
            <RPORenewalAnalytics
              contractId={contract.id}
              onTakeAction={(action) => {
                toast({
                  title: 'Action Scheduled',
                  description: `${action} has been added to your task list.`,
                });
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {serviceProject && (
        <RPOConsultantAssignmentDialog
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          contract={serviceProject}
          onAssignmentComplete={() => {
            setIsAssignDialogOpen(false);
            window.location.reload();
          }}
        />
      )}

      <RPOTaskDialog
        task={selectedTask}
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        onClose={() => {
          setIsTaskDialogOpen(false);
          setSelectedTask(null);
          window.location.reload();
        }}
      />
    </DashboardPageLayout>
  );
}
