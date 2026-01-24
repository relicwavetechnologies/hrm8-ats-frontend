import { useState, useEffect } from 'react';
import { DashboardPageLayout } from '@/components/layouts/DashboardPageLayout';
import { AtsPageHeader } from '@/components/layouts/AtsPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { UserPlus, CheckCircle2, Clock, FileText, Package, BookOpen, Users } from 'lucide-react';
import { getCandidatesToEmployees, getHiringPipelines, getRecruitmentROI } from '@/shared/lib/recruitmentIntegrationStorage';
import type { CandidateToEmployee, HiringPipeline, RecruitmentROI } from '@/shared/types/recruitmentIntegration';

export default function RecruitmentIntegration() {
  const [candidates, setCandidates] = useState<CandidateToEmployee[]>([]);
  const [pipelines, setPipelines] = useState<HiringPipeline[]>([]);
  const [roiData, setRoiData] = useState<RecruitmentROI[]>([]);

  useEffect(() => {
    setCandidates(getCandidatesToEmployees());
    setPipelines(getHiringPipelines());
    setRoiData(getRecruitmentROI());
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'offer-accepted': 'default',
      'onboarding': 'secondary',
      'hired': 'default',
      'declined': 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status.replace('-', ' ')}</Badge>;
  };

  const getTaskIcon = (category: string) => {
    switch (category) {
      case 'documentation': return <FileText className="h-4 w-4" />;
      case 'equipment': return <Package className="h-4 w-4" />;
      case 'training': return <BookOpen className="h-4 w-4" />;
      case 'access': return <Users className="h-4 w-4" />;
      default: return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <AtsPageHeader
          title="Recruitment Integration"
          subtitle="Track candidates from offer to onboarding and measure recruitment effectiveness"
        />

        <Tabs defaultValue="candidates" className="space-y-6">
          <div className="overflow-x-auto -mx-1 px-1">
            <TabsList className="inline-flex w-auto gap-1 rounded-full border bg-muted/40 px-1 py-1 shadow-sm">
              <TabsTrigger 
                value="candidates"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Candidates & Onboarding
              </TabsTrigger>
              <TabsTrigger 
                value="pipeline"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Hiring Pipeline
              </TabsTrigger>
              <TabsTrigger 
                value="roi"
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Recruitment ROI
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="candidates" className="space-y-4 mt-6">
            {candidates.map((candidate) => (
              <Card key={candidate.candidateId}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        {candidate.candidateName}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {candidate.jobTitle} • Start Date: {new Date(candidate.startDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(candidate.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Onboarding Progress</span>
                        <span className="text-sm text-muted-foreground">{candidate.onboardingProgress}%</span>
                      </div>
                      <Progress value={candidate.onboardingProgress} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold mb-2">Onboarding Tasks</h4>
                      {candidate.onboardingTasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-3 border rounded-lg p-3">
                          <div className="mt-0.5">{getTaskIcon(task.category)}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm">{task.title}</p>
                              <Badge variant="outline" className="h-6 px-2 text-xs rounded-full">
                                {task.status === 'completed' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                                {task.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{task.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                              {task.assignedTo && <span>Assigned: {task.assignedTo}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Hiring Pipeline Overview</CardTitle>
                <CardDescription className="text-sm">Track candidates through each stage of recruitment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipelines.map((pipeline) => (
                    <div key={pipeline.jobId} className="border rounded-lg p-4">
                      <h4 className="text-sm font-semibold mb-3">{pipeline.jobTitle} - {pipeline.department}</h4>
                      <div className="grid grid-cols-5 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{pipeline.candidatesApplied}</p>
                          <p className="text-xs text-muted-foreground">Applied</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{pipeline.candidatesScreened}</p>
                          <p className="text-xs text-muted-foreground">Screened</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{pipeline.candidatesInterviewed}</p>
                          <p className="text-xs text-muted-foreground">Interviewed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{pipeline.candidatesOffered}</p>
                          <p className="text-xs text-muted-foreground">Offered</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-success">{pipeline.candidatesHired}</p>
                          <p className="text-xs text-muted-foreground">Hired</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Avg Time to Hire</p>
                          <p className="text-base font-semibold">{pipeline.avgTimeToHire} days</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Cost per Hire</p>
                          <p className="text-base font-semibold">${pipeline.costPerHire.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roi" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Recruitment Service ROI</CardTitle>
                <CardDescription className="text-sm">Measure effectiveness of recruitment investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roiData.map((roi) => (
                    <div key={roi.serviceProjectId} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-semibold">{roi.projectName}</h4>
                          <p className="text-xs text-muted-foreground">
                            {roi.serviceType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </p>
                        </div>
                        <Badge variant="outline" className="h-6 px-2 text-xs rounded-full">
                          {roi.roi}% ROI
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Service Fee</p>
                          <p className="text-base font-semibold">${roi.serviceFee.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Placements</p>
                          <p className="text-base font-semibold">{roi.candidatesPlaced}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Time to Fill</p>
                          <p className="text-base font-semibold">{roi.timeToFill} days</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Satisfaction</p>
                          <p className="text-base font-semibold">{roi.clientSatisfaction}/5</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-base font-semibold flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Cost per Placement</span>
                          <span className="font-semibold">${roi.costPerPlacement.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-muted-foreground">Avg Retention</span>
                          <span className="font-semibold">{roi.averageRetention} months</span>
                        </div>
                      </div>
                    </div>
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
