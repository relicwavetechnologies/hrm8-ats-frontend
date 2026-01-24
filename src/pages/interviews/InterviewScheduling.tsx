import { useState, useEffect } from "react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Calendar, Clock, Video, Users, Plus, Calendar as CalendarIcon } from "lucide-react";
import { videoInterviewService, type VideoInterview } from "@/shared/lib/videoInterviewService";
import { format } from "date-fns";
import { useToast } from "@/shared/hooks/use-toast";
import { AutoScheduleAIInterviewDialog } from "@/modules/applications/components/AutoScheduleAIInterviewDialog";

export default function InterviewScheduling() {
  const { toast } = useToast();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("upcoming");
  const [interviews, setInterviews] = useState<VideoInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    setIsLoading(true);
    try {
      const response = await videoInterviewService.getInterviews();
      if (response.success && response.data) {
        setInterviews(response.data.interviews);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load interviews',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to load interviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load interviews',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    const now = new Date();
    const interviewDate = new Date(interview.scheduledDate);

    if (filter === "upcoming") {
      return interview.status === "SCHEDULED" && interviewDate > now;
    }
    if (filter === "completed") {
      return interview.status === "COMPLETED";
    }
    return true;
  });

  const stats = {
    total: interviews.length,
    upcoming: interviews.filter(i => i.status === "SCHEDULED" && new Date(i.scheduledDate) > new Date()).length,
    completed: interviews.filter(i => i.status === "COMPLETED").length,
    scheduled: interviews.filter(i => i.status === "SCHEDULED").length,
  };

  const getStatusColor = (status: VideoInterview["status"]) => {
    switch (status) {
      case "SCHEDULED":
        return "teal";
      case "COMPLETED":
        return "default";
      case "CANCELLED":
        return "destructive";
      case "NO_SHOW":
        return "orange";
      case "RESCHEDULED":
        return "secondary";
      case "IN_PROGRESS":
        return "blue";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type: VideoInterview["type"]) => {
    switch (type) {
      case "VIDEO":
        return <Video className="h-4 w-4" />;
      case "PHONE":
        return <Clock className="h-4 w-4" />;
      case "IN_PERSON":
        return <Users className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Interview Scheduling</h1>
            <p className="text-muted-foreground">
              Manage and coordinate candidate interviews
            </p>
          </div>
          <Button onClick={() => setScheduleDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcoming}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Interview List */}
        <Tabs defaultValue="upcoming" onValueChange={(v: any) => setFilter(v)}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-4 mt-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Loading interviews...</p>
                </CardContent>
              </Card>
            ) : filteredInterviews.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No interviews found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {filter === "upcoming"
                      ? "No upcoming interviews scheduled"
                      : filter === "completed"
                      ? "No completed interviews"
                      : "No interviews yet"}
                  </p>
                  <Button onClick={() => setScheduleDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredInterviews.map((interview) => {
                  const candidateName = interview.application?.candidateName || 
                                       (interview.candidate ? `${interview.candidate.firstName} ${interview.candidate.lastName}` : 'Unknown');
                  const jobTitle = interview.application?.jobTitle || interview.job?.title || 'Unknown Position';
                  
                  return (
                    <Card key={interview.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                            {getTypeIcon(interview.type)}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold">{candidateName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {jobTitle}
                                </p>
                              </div>
                              <Badge variant={getStatusColor(interview.status)}>
                                {interview.status.replace('_', ' ')}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Date & Time</p>
                                <p className="font-medium">
                                  {format(new Date(interview.scheduledDate), "MMM dd, yyyy")}
                                </p>
                                <p className="text-xs">
                                  {format(new Date(interview.scheduledDate), "hh:mm a")}
                                </p>
                              </div>

                              <div>
                                <p className="text-muted-foreground">Duration</p>
                                <p className="font-medium">{interview.duration} minutes</p>
                              </div>

                              <div>
                                <p className="text-muted-foreground">Type</p>
                                <p className="font-medium capitalize">{interview.type.replace('_', ' ').toLowerCase()}</p>
                              </div>

                              <div>
                                <p className="text-muted-foreground">Interviewers</p>
                                <p className="font-medium">
                                  {interview.interviewerIds.length > 0 
                                    ? `${interview.interviewerIds.length} assigned`
                                    : 'Not assigned'}
                                </p>
                              </div>
                            </div>

                            {interview.meetingLink && (
                              <div className="mt-3 pt-3 border-t">
                                <a
                                  href={interview.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline"
                                >
                                  Join Meeting →
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Note: ScheduleInterviewDialog would need to be updated to use videoInterviewService
            For now, this is a placeholder - you can create a new dialog or update the existing one */}
      </div>
    </DashboardPageLayout>
  );
}
