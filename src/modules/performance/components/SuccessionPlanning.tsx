import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Progress } from '@/shared/components/ui/progress';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Target,
  Award,
  BookOpen,
  ArrowUpRight,
  ArrowRight,
  Building2,
  Zap
} from 'lucide-react';
import { SuccessionPlan, NineBoxPosition, LeadershipPipeline, ReadinessLevel, PotentialLevel, PerformanceLevel, RiskOfLoss } from '@/shared/types/performance';
import { cn } from '@/shared/lib/utils';

interface SuccessionPlanningProps {
  successionPlans: SuccessionPlan[];
  nineBoxData: NineBoxPosition[];
  leadershipPipeline: LeadershipPipeline[];
}

const getReadinessColor = (readiness: ReadinessLevel) => {
  switch (readiness) {
    case 'ready-now': return 'text-green-600 bg-green-50 border-green-200';
    case 'ready-1-2-years': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'ready-3-5-years': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'not-ready': return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getRiskColor = (risk: RiskOfLoss) => {
  switch (risk) {
    case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'low': return 'text-green-600 bg-green-50 border-green-200';
  }
};

const NineBoxGrid = ({ data }: { data: NineBoxPosition[] }) => {
  const performanceLevels: PerformanceLevel[] = ['exceptional', 'high', 'medium', 'low'];
  const potentialLevels: PotentialLevel[] = ['exceptional', 'high', 'medium', 'low'];

  const getEmployeesInCell = (performance: PerformanceLevel, potential: PotentialLevel) => {
    return data.filter(emp => emp.performance === performance && emp.potential === potential);
  };

  const getCellColor = (performance: PerformanceLevel, potential: PotentialLevel) => {
    const score = (performanceLevels.indexOf(performance) + 1) + (potentialLevels.indexOf(potential) + 1);
    if (score <= 3) return 'bg-red-50 border-red-200';
    if (score <= 5) return 'bg-amber-50 border-amber-200';
    if (score <= 7) return 'bg-blue-50 border-blue-200';
    return 'bg-green-50 border-green-200';
  };

  const getCellLabel = (performance: PerformanceLevel, potential: PotentialLevel) => {
    if (performance === 'exceptional' && potential === 'exceptional') return 'Top Talent';
    if (performance === 'exceptional' && potential === 'high') return 'High Performers';
    if (performance === 'high' && potential === 'exceptional') return 'High Potential';
    if (performance === 'high' && potential === 'high') return 'Core Talent';
    if (performance === 'medium' || potential === 'medium') return 'Solid Performers';
    return 'Needs Development';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-1" />
        {potentialLevels.map(potential => (
          <div key={potential} className="text-center font-medium text-sm capitalize">
            {potential}
          </div>
        ))}
        
        {performanceLevels.map(performance => (
          <>
            <div key={`label-${performance}`} className="flex items-center justify-end pr-2 font-medium text-sm capitalize">
              {performance}
            </div>
            {potentialLevels.map(potential => {
              const employees = getEmployeesInCell(performance, potential);
              return (
                <Dialog key={`${performance}-${potential}`}>
                  <DialogTrigger asChild>
                    <Card className={cn(
                      "cursor-pointer hover:shadow-md transition-shadow",
                      getCellColor(performance, potential)
                    )}>
                      <CardContent className="p-3">
                        <div className="text-xs font-medium mb-2">
                          {getCellLabel(performance, potential)}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {employees.slice(0, 3).map(emp => (
                            <Avatar key={emp.employeeId} className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {emp.employeeName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {employees.length > 3 && (
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                              +{employees.length - 3}
                            </div>
                          )}
                        </div>
                        {employees.length === 0 && (
                          <div className="text-xs text-muted-foreground">No employees</div>
                        )}
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{getCellLabel(performance, potential)}</DialogTitle>
                      <DialogDescription>
                        Performance: {performance} | Potential: {potential}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                      {employees.map(emp => (
                        <Card key={emp.employeeId}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {emp.employeeName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{emp.employeeName}</div>
                                  <div className="text-sm text-muted-foreground">{emp.currentRole}</div>
                                  <div className="text-xs text-muted-foreground">{emp.department}</div>
                                </div>
                              </div>
                              <Badge variant="outline" className={getRiskColor(emp.riskOfLoss)}>
                                {emp.riskOfLoss} flight risk
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </>
        ))}
      </div>
      
      <div className="flex items-center justify-center text-sm font-medium">
        <ArrowUpRight className="h-4 w-4 mr-1" />
        Potential
      </div>
      <div className="flex items-center justify-end text-sm font-medium">
        Performance
        <ArrowRight className="h-4 w-4 ml-1" />
      </div>
    </div>
  );
};

const LeadershipPipelineView = ({ pipeline }: { pipeline: LeadershipPipeline[] }) => {
  return (
    <div className="space-y-6">
      {pipeline.map(level => (
        <Card key={level.level}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {level.level}
                </CardTitle>
                <CardDescription>
                  {level.totalPositions} positions • {level.coverageRate}% succession coverage
                </CardDescription>
              </div>
              <Progress value={level.coverageRate} className="w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {level.positions.map(position => (
                <div key={position.positionId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{position.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {position.incumbentName ? (
                        <span>Current: {position.incumbentName}</span>
                      ) : (
                        <span className="text-amber-600">Vacant Position</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getRiskColor(position.vacancyRisk)}>
                      {position.vacancyRisk} risk
                    </Badge>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {position.successorCount} successors
                      </div>
                      {position.readyNowCount > 0 && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          {position.readyNowCount} ready now
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export function SuccessionPlanning({ successionPlans, nineBoxData, leadershipPipeline }: SuccessionPlanningProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<SuccessionPlan | null>(null);

  const departments = ['all', ...Array.from(new Set(successionPlans.map(p => p.department)))];
  const filteredPlans = selectedDepartment === 'all' 
    ? successionPlans 
    : successionPlans.filter(p => p.department === selectedDepartment);

  const highPotentialCount = nineBoxData.filter(e => 
    e.potential === 'exceptional' || e.potential === 'high'
  ).length;

  const readyNowCount = successionPlans.reduce((acc, plan) => 
    acc + plan.successors.filter(s => s.readinessLevel === 'ready-now').length, 0
  );

  const criticalRiskCount = successionPlans.filter(p => 
    p.criticality === 'critical' && p.vacancyRisk === 'high'
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High-Potential Talent</p>
                <h3 className="text-2xl font-bold mt-2">{highPotentialCount}</h3>
              </div>
              <Zap className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ready Now</p>
                <h3 className="text-2xl font-bold mt-2">{readyNowCount}</h3>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Positions</p>
                <h3 className="text-2xl font-bold mt-2">{successionPlans.filter(p => p.criticality === 'critical').length}</h3>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">At Risk</p>
                <h3 className="text-2xl font-bold mt-2">{criticalRiskCount}</h3>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Succession Plans</TabsTrigger>
          <TabsTrigger value="ninebox">9-Box Grid</TabsTrigger>
          <TabsTrigger value="pipeline">Leadership Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[200px]">
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

          <div className="grid gap-4">
            {filteredPlans.map(plan => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {plan.positionTitle}
                        <Badge variant="outline" className={
                          plan.criticality === 'critical' ? 'border-red-200 text-red-600 bg-red-50' :
                          plan.criticality === 'high' ? 'border-orange-200 text-orange-600 bg-orange-50' :
                          'border-blue-200 text-blue-600 bg-blue-50'
                        }>
                          {plan.criticality}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {plan.department} • {plan.level}
                        {plan.incumbentName && ` • Current: ${plan.incumbentName}`}
                      </CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedPlan(plan)}>
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{plan.positionTitle}</DialogTitle>
                          <DialogDescription>
                            Succession plan details and development paths
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Department</div>
                              <div className="mt-1">{plan.department}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Level</div>
                              <div className="mt-1">{plan.level}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Vacancy Risk</div>
                              <Badge variant="outline" className={getRiskColor(plan.vacancyRisk)}>
                                {plan.vacancyRisk}
                              </Badge>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">Last Review</div>
                              <div className="mt-1">{new Date(plan.lastReviewDate).toLocaleDateString()}</div>
                            </div>
                          </div>

                          {plan.notes && (
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-2">Notes</div>
                              <p className="text-sm">{plan.notes}</p>
                            </div>
                          )}

                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Successors ({plan.successors.length})
                            </h4>
                            <div className="space-y-3">
                              {plan.successors.map(successor => (
                                <Card key={successor.id}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-start gap-3">
                                        <Avatar>
                                          <AvatarFallback>
                                            {successor.employeeName.split(' ').map(n => n[0]).join('')}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="font-medium">{successor.employeeName}</div>
                                          <div className="text-sm text-muted-foreground">{successor.currentRole}</div>
                                          <div className="text-xs text-muted-foreground">{successor.department}</div>
                                        </div>
                                      </div>
                                      <Badge className="bg-primary">Priority {successor.priority}</Badge>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Readiness: </span>
                                        <Badge variant="outline" className={getReadinessColor(successor.readinessLevel)}>
                                          {successor.readinessLevel}
                                        </Badge>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Performance: </span>
                                        <Badge variant="outline">{successor.performanceLevel}</Badge>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Potential: </span>
                                        <Badge variant="outline">{successor.potentialLevel}</Badge>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Flight Risk: </span>
                                        <Badge variant="outline" className={getRiskColor(successor.riskOfLoss)}>
                                          {successor.riskOfLoss}
                                        </Badge>
                                      </div>
                                    </div>

                                    <div className="mt-3 space-y-2">
                                      <div>
                                        <div className="text-xs font-medium text-muted-foreground mb-1">Strengths</div>
                                        <div className="flex flex-wrap gap-1">
                                          {successor.strengths.map((strength, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                              {strength}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-xs font-medium text-muted-foreground mb-1">Development Needs</div>
                                        <div className="flex flex-wrap gap-1">
                                          {successor.developmentNeeds.map((need, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs">
                                              {need}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>

                          {plan.developmentPrograms.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Development Programs
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {plan.developmentPrograms.map((program, idx) => (
                                  <Badge key={idx} variant="outline">
                                    {program}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Vacancy Risk:</span>
                      <Badge variant="outline" className={getRiskColor(plan.vacancyRisk)}>
                        {plan.vacancyRisk}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Successors:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{plan.successors.length}</span>
                        {plan.successors.filter(s => s.readinessLevel === 'ready-now').length > 0 && (
                          <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                            {plan.successors.filter(s => s.readinessLevel === 'ready-now').length} ready now
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Next Review:</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(plan.nextReviewDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ninebox" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>9-Box Performance-Potential Matrix</CardTitle>
              <CardDescription>
                Visual representation of employee performance and potential for succession planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NineBoxGrid data={nineBoxData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <LeadershipPipelineView pipeline={leadershipPipeline} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
