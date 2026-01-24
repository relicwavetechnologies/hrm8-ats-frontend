import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, MessageSquare, Send, CheckCircle, Clock, Users, TrendingUp, Link2, Copy } from "lucide-react";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Feedback360Results } from "@/components/performance/Feedback360Results";
import { getFeedback360, saveFeedback360 } from "@/shared/lib/performanceStorage";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Feedback360, FeedbackProvider } from "@/shared/types/performance";

export default function FeedbackDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const feedbacks = useMemo(() => getFeedback360(), []);
  const [feedback, setFeedback] = useState<Feedback360 | null>(
    feedbacks.find(f => f.id === id) || null
  );

  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [sendingReminder, setSendingReminder] = useState(false);

  if (!feedback) {
    return (
      <DashboardPageLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Feedback Not Found</h3>
              <p className="text-muted-foreground mb-4">The feedback request you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/performance')}>Back to Performance</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardPageLayout>
    );
  }

  const handleStatusChange = (newStatus: 'pending' | 'in-progress' | 'completed') => {
    const updatedFeedback = {
      ...feedback,
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
    };
    setFeedback(updatedFeedback);
    saveFeedback360(updatedFeedback);
    toast.success("Status updated successfully");
  };

  const handleSendReminder = (providerId: string) => {
    setSendingReminder(true);
    setTimeout(() => {
      toast.success("Reminder sent successfully");
      setSendingReminder(false);
    }, 1000);
  };

  const copyFeedbackLink = (providerId: string) => {
    const link = `${window.location.origin}/feedback/${feedback.id}/${providerId}`;
    navigator.clipboard.writeText(link);
    toast.success("Feedback link copied to clipboard!");
  };

  const completedProviders = feedback.providers.filter(p => p.status === 'submitted').length;
  const totalProviders = feedback.providers.length;
  const completionRate = Math.round((completedProviders / totalProviders) * 100);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: 'secondary', label: 'Pending', icon: Clock },
      'in-progress': { variant: 'default', label: 'In Progress', icon: Clock },
      completed: { variant: 'outline', label: 'Completed', icon: CheckCircle },
    };
    return variants[status] || variants.pending;
  };

  const getProviderStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      submitted: { variant: 'outline', label: 'Submitted' },
    };
    return variants[status] || variants.pending;
  };

  const statusBadge = getStatusBadge(feedback.status);
  const StatusIcon = statusBadge.icon;

  const groupedResponses = useMemo(() => {
    if (!feedback.responses) return {};
    return feedback.responses.reduce((acc, response) => {
      if (!acc[response.questionId]) {
        acc[response.questionId] = [];
      }
      acc[response.questionId].push(response);
      return acc;
    }, {} as Record<string, typeof feedback.responses>);
  }, [feedback.responses]);

  const calculateAverageRating = (questionId: string) => {
    const responses = groupedResponses[questionId] || [];
    if (responses.length === 0) return "0.0";
    const sum = responses.reduce((acc, r) => acc + r.rating, 0);
    return (sum / responses.length).toFixed(1);
  };

  return (
    <DashboardPageLayout>
      <Helmet>
        <title>{feedback.employeeName} - 360 Feedback Detail</title>
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-base font-semibold flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/performance')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">360 Feedback</h1>
              <p className="text-muted-foreground">{feedback.employeeName}</p>
            </div>
          </div>
          <Badge variant={statusBadge.variant} className="px-4 py-2">
            <StatusIcon className="h-4 w-4 mr-2" />
            {statusBadge.label}
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Total Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProviders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedProviders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completionRate}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProviders - completedProviders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Due Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{format(new Date(feedback.dueDate), 'MMM d')}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(feedback.dueDate), 'yyyy')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="responses" className="space-y-4">
              <TabsList>
                <TabsTrigger value="responses">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Responses
                </TabsTrigger>
                <TabsTrigger value="summary">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Summary
                </TabsTrigger>
              </TabsList>

              <TabsContent value="responses" className="space-y-4">
                {feedback.questions.map((question) => {
                  const responses = groupedResponses[question.id] || [];
                  return (
                    <Card key={question.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{question.question}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {responses.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">No responses yet</p>
                        ) : (
                          responses.map((response) => (
                            <div key={response.id} className="border-l-2 border-primary pl-4 space-y-2">
                              <div className="text-base font-semibold flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{response.providerName}</p>
                                  <p className="text-xs text-muted-foreground">{response.relationship}</p>
                                </div>
                                <div className="text-base font-semibold flex items-center gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <div
                                      key={star}
                                      className={`h-6 w-6 rounded-full border ${
                                        star <= response.rating
                                          ? 'bg-primary border-primary'
                                          : 'border-muted'
                                      }`}
                                    />
                                  ))}
                                  <span className="text-sm font-medium ml-1">{response.rating}/5</span>
                                </div>
                              </div>
                              {response.comment && (
                                <p className="text-sm bg-muted p-3 rounded">{response.comment}</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Submitted {format(new Date(response.submittedAt), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="summary" className="space-y-4">
                <Feedback360Results feedback={feedback} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Status Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Feedback Status</Label>
                  <Select
                    value={feedback.status}
                    onValueChange={(value: 'pending' | 'in-progress' | 'completed') => handleStatusChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Completion Progress</Label>
                  <Progress value={completionRate} />
                  <p className="text-xs text-muted-foreground text-right">{completionRate}%</p>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Providers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Feedback Providers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {feedback.providers.map((provider) => {
                  const providerBadge = getProviderStatusBadge(provider.status);
                  return (
                    <div key={provider.id} className="p-3 border rounded-lg space-y-2">
                      <div className="text-base font-semibold flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{provider.providerName}</p>
                          <p className="text-xs text-muted-foreground">{provider.relationship}</p>
                          {provider.submittedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Submitted {format(new Date(provider.submittedAt), 'MMM d')}
                            </p>
                          )}
                        </div>
                        <Badge variant={providerBadge.variant}>{providerBadge.label}</Badge>
                      </div>
                      {provider.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyFeedbackLink(provider.id)}
                            className="flex-1"
                          >
                            <Link2 className="h-3 w-3 mr-1" />
                            Copy Link
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSendReminder(provider.id)}
                            disabled={sendingReminder}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Remind
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Feedback Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Feedback Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Employee</Label>
                  <p className="font-medium">{feedback.employeeName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Review Cycle</Label>
                  <p>{feedback.reviewCycle}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Requested By</Label>
                  <p className="font-medium">{feedback.requestedByName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Due Date</Label>
                  <p>{format(new Date(feedback.dueDate), 'MMM d, yyyy')}</p>
                </div>
                {feedback.completedAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Completed Date</Label>
                    <p>{format(new Date(feedback.completedAt), 'MMM d, yyyy')}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">Created At</Label>
                  <p>{format(new Date(feedback.createdAt), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
