import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, User, Building2, Clock } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { ClearanceChecklist } from "@/modules/offboarding/components/ClearanceChecklist";
import { ExitInterviewForm } from "@/modules/offboarding/components/ExitInterviewForm";
import { OffboardingTimeline } from "@/modules/offboarding/components/OffboardingTimeline";
import { getOffboardingWorkflows } from "@/shared/lib/offboardingStorage";
import { format, differenceInDays } from "date-fns";
import type { OffboardingStatus } from "@/shared/types/offboarding";

export default function OffboardingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const workflow = useMemo(() => {
    const workflows = getOffboardingWorkflows();
    return workflows.find(w => w.id === id);
  }, [id, refreshKey]);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  if (!workflow) {
    return (
      <DashboardPageLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">Workflow Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The offboarding workflow you're looking for doesn't exist.
              </p>
              <Button onClick={() => navigate('/offboarding')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Offboarding
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardPageLayout>
    );
  }

  const getStatusBadge = (status: OffboardingStatus) => {
    const variants: Record<OffboardingStatus, { variant: any; label: string }> = {
      initiated: { variant: 'secondary', label: 'Initiated' },
      'in-progress': { variant: 'default', label: 'In Progress' },
      completed: { variant: 'outline', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    return variants[status];
  };

  const statusBadge = getStatusBadge(workflow.status);
  const completedItems = workflow.clearanceItems.filter(item => item.status === 'approved').length;
  const totalItems = workflow.clearanceItems.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const daysRemaining = differenceInDays(new Date(workflow.lastWorkingDay), new Date());

  return (
    <DashboardPageLayout>
      <Helmet>
        <title>{workflow.employeeName} - Offboarding</title>
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/offboarding')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{workflow.employeeName}</h1>
            <p className="text-muted-foreground">{workflow.jobTitle} · {workflow.department}</p>
          </div>
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Clearance Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{completedItems}/{totalItems}</div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {daysRemaining > 0 ? daysRemaining : 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Until last working day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Exit Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {workflow.exitInterviewCompleted ? 'Completed' : 'Pending'}
              </div>
              {workflow.exitInterviewScheduled && !workflow.exitInterviewCompleted && (
                <p className="text-xs text-muted-foreground mt-1">
                  Scheduled
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Rehire Eligible</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={workflow.rehireEligible ? "outline" : "secondary"}>
                {workflow.rehireEligible ? 'Yes' : 'No'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Employee Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Offboarding Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Notice Date</p>
                  <p className="text-muted-foreground">
                    {format(new Date(workflow.noticeDate), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Last Working Day</p>
                  <p className="text-muted-foreground">
                    {format(new Date(workflow.lastWorkingDay), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="text-base font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Separation Type</p>
                  <p className="text-muted-foreground capitalize">
                    {workflow.separationType.replace('-', ' ')}
                  </p>
                </div>
              </div>
            </div>
            {workflow.reason && (
              <div className="mt-4 pt-4 border-t">
                <p className="font-medium mb-1">Reason</p>
                <p className="text-sm text-muted-foreground">{workflow.reason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="clearance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="clearance">
              Clearance ({completedItems}/{totalItems})
            </TabsTrigger>
            <TabsTrigger value="exit-interview">
              Exit Interview
            </TabsTrigger>
            <TabsTrigger value="timeline">
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clearance">
            <ClearanceChecklist
              workflowId={workflow.id}
              onUpdate={handleRefresh}
            />
          </TabsContent>

          <TabsContent value="exit-interview">
            <ExitInterviewForm
              workflowId={workflow.id}
              onUpdate={handleRefresh}
            />
          </TabsContent>

          <TabsContent value="timeline">
            <OffboardingTimeline workflow={workflow} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
