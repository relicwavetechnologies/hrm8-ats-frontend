import { useState, useEffect } from "react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { AtsPageHeader } from "@/app/layouts/AtsPageHeader";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Calendar as CalendarIcon, Video, Phone, Users, Plus, LayoutGrid, List, CalendarDays, BarChart3, FileText } from "lucide-react";
import { getInterviews, saveInterview, updateInterview } from "@/shared/lib/mockInterviewStorage";
import { Interview } from "@/shared/types/interview";
import { Badge } from "@/shared/components/ui/badge";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { InterviewScheduler } from "@/modules/interviews/components/InterviewScheduler";
import { getTemplateById } from "@/shared/lib/mockTemplateStorage";
import { InterviewKanbanBoard } from "@/modules/interviews/components/InterviewKanbanBoard";
import { InterviewDetailPanel } from "@/modules/interviews/components/InterviewDetailPanel";
import { InterviewCalendarView } from "@/modules/interviews/components/InterviewCalendarViewNew";
import { InterviewAnalyticsDashboard } from "@/modules/interviews/components/InterviewAnalyticsDashboard";
import { InterviewTemplateManager } from "@/modules/interviews/components/InterviewTemplateManager";
import { InterviewCalibrationReport } from "@/modules/interviews/components/InterviewCalibrationReport";
import { CalibrationSessionManager } from "@/modules/interviews/components/CalibrationSessionManager";

import { toast } from "@/shared/hooks/use-toast";

export default function Interviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "calendar" | "analytics" | "templates" | "calibration" | "sessions">("kanban");
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = () => {
    setInterviews(getInterviews());
  };

  const handleScheduleInterview = (data: any) => {
    const template = data.templateId ? getTemplateById(data.templateId) : null;
    
    const newInterview: Interview = {
      id: `int-${Date.now()}`,
      applicationId: 'app-temp',
      candidateId: 'cand-temp',
      candidateName: 'Sample Candidate',
      jobId: 'job-temp',
      jobTitle: 'Sample Position',
      templateId: data.templateId,
      questions: template?.questions,
      ratingCriteria: template?.ratingCriteria,
      interviewers: data.interviewers.split(',').map((email: string) => ({
        userId: `user-${Date.now()}`,
        name: email.trim(),
        email: email.trim(),
        role: 'interviewer',
        responseStatus: 'pending',
      })),
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      duration: data.duration,
      type: data.type,
      location: data.location,
      meetingLink: data.meetingLink,
      status: 'scheduled',
      agenda: data.agenda,
      feedback: [],
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveInterview(newInterview);
    loadInterviews();
    setIsSchedulerOpen(false);
    toast({
      title: "Interview Scheduled",
      description: template 
        ? `Interview scheduled with ${template.name} template`
        : "The interview has been scheduled successfully.",
    });
  };

  const getTypeIcon = (type: Interview['type']) => {
    const icons = {
      phone: <Phone className="h-4 w-4" />,
      video: <Video className="h-4 w-4" />,
      'in-person': <Users className="h-4 w-4" />,
      panel: <Users className="h-4 w-4" />,
    };
    return icons[type];
  };

  const getStatusBadge = (status: Interview['status']) => {
    const variants: Record<Interview['status'], any> = {
      scheduled: "secondary",
      completed: "default",
      cancelled: "outline",
      'no-show': "destructive",
    };
    // Neutralize badge hover color shift visually
    return <Badge variant={variants[status]} className="hover:bg-transparent">{status}</Badge>;
  };

  const handleViewDetails = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsDetailPanelOpen(true);
  };

  const handleUpdateInterview = (updatedInterview: Interview) => {
    updateInterview(updatedInterview.id, updatedInterview);
    loadInterviews();
    toast({
      title: "Interview Updated",
      description: "The interview has been updated successfully.",
    });
  };

  const handleReschedule = (interview: Interview, newDate: Date, newTime: string) => {
    updateInterview(interview.id, {
      scheduledDate: newDate.toISOString().split('T')[0],
      scheduledTime: newTime,
    });
    loadInterviews();
    toast({
      title: "Interview Rescheduled",
      description: `Interview with ${interview.candidateName} has been rescheduled`,
    });
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <AtsPageHeader title="Interviews" subtitle={`Schedule and manage ${interviews.length} candidate interviews`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-lg p-1 gap-1 overflow-x-auto max-w-full">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="flex-shrink-0"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Board
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="flex-shrink-0"
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-shrink-0"
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'analytics' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('analytics')}
                className="flex-shrink-0"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button
                variant={viewMode === 'templates' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('templates')}
                className="flex-shrink-0"
              >
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button
                variant={viewMode === 'calibration' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calibration')}
                className="flex-shrink-0"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Reports
              </Button>
              <Button
                variant={viewMode === 'sessions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('sessions')}
                className="flex-shrink-0"
              >
                <Users className="h-4 w-4 mr-2" />
                Sessions
              </Button>
            </div>
            <Button onClick={() => setIsSchedulerOpen(true)}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </div>
        </AtsPageHeader>

        {viewMode === "kanban" ? (
          <div className="overflow-x-auto -mx-1 px-1 min-w-0">
            <InterviewKanbanBoard onRefresh={loadInterviews} onViewDetails={handleViewDetails} />
          </div>
        ) : viewMode === "calendar" ? (
          <div className="overflow-x-auto -mx-1 px-1">
            <InterviewCalendarView
              onInterviewClick={handleViewDetails}
              onReschedule={(interview, newDate) => {
                // Handle reschedule - you may need to adjust this based on your API
                handleReschedule(interview, newDate, format(newDate, 'HH:mm'));
              }}
            />
          </div>
        ) : viewMode === "analytics" ? (
          <InterviewAnalyticsDashboard interviews={interviews} />
        ) : viewMode === "templates" ? (
          <InterviewTemplateManager />
        ) : viewMode === "calibration" ? (
          <InterviewCalibrationReport interviews={interviews} />
        ) : viewMode === "sessions" ? (
          <CalibrationSessionManager interviews={interviews} />
        ) : (
          <div className="grid gap-4">
            {interviews.map((interview) => (
              <Card 
                key={interview.id} 
                className="cursor-pointer shadow-sm"
                onClick={() => handleViewDetails(interview)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">{interview.candidateName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{interview.jobTitle}</p>
                    </div>
                    {getStatusBadge(interview.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-base font-semibold flex items-center gap-2">
                      {getTypeIcon(interview.type)}
                      <span className="capitalize">{interview.type}</span>
                    </div>
                    <div className="text-base font-semibold flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {format(new Date(interview.scheduledDate), "PPP")} at {interview.scheduledTime}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {interview.duration} minutes
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {interviews.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No Scheduled Interviews</p>
                  <p className="text-sm text-muted-foreground">
                    Schedule interviews from candidate applications
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Dialog open={isSchedulerOpen} onOpenChange={setIsSchedulerOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
            </DialogHeader>
            <InterviewScheduler
              candidateName="Sample Candidate"
              jobTitle="Sample Position"
              onSubmit={handleScheduleInterview}
              onCancel={() => setIsSchedulerOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <InterviewDetailPanel
          interview={selectedInterview}
          open={isDetailPanelOpen}
          onOpenChange={setIsDetailPanelOpen}
          onUpdateInterview={handleUpdateInterview}
        />
      </div>
    </DashboardPageLayout>
  );
}
