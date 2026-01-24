import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Bell, Calendar, CheckCircle, Clock, Send } from 'lucide-react';
import { getFeedbackRequests, sendReminder, completeRequest } from '@/shared/lib/feedbackRequestService';
import { FeedbackRequest } from '@/shared/types/feedbackRequest';
import { format } from 'date-fns';
import { useToast } from '@/shared/hooks/use-toast';

export function PendingFeedbackRequests() {
  const [requests, setRequests] = useState<FeedbackRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const allRequests = getFeedbackRequests();
    setRequests(allRequests);
  };

  const handleSendReminder = (request: FeedbackRequest) => {
    sendReminder(request.id);
    toast({
      title: 'Reminder Sent',
      description: `Reminder email sent to ${request.requestedToName}`,
    });
    loadRequests();
  };

  const handleMarkComplete = (requestId: string) => {
    completeRequest(requestId);
    toast({
      title: 'Request Completed',
      description: 'Feedback request marked as completed',
    });
    loadRequests();
  };

  const getStatusBadge = (status: FeedbackRequest['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const pendingRequests = requests.filter(r => r.status !== 'completed');
  const completedRequests = requests.filter(r => r.status === 'completed');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Pending Feedback Requests
          </CardTitle>
          <CardDescription>
            Team members who need to provide feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending feedback requests
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{request.requestedToName}</span>
                      {getStatusBadge(request.status)}
                      {request.reminderSent && (
                        <Badge variant="outline" className="text-xs">
                          Reminder Sent
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {request.candidateName} • Requested by {request.requestedByName}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due {format(new Date(request.dueDate), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Requested {format(new Date(request.requestedAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {request.message && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        "{request.message}"
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendReminder(request)}
                      disabled={request.reminderSent}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {request.reminderSent ? 'Reminded' : 'Remind'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkComplete(request.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {completedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Completed Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{request.requestedToName}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {request.candidateName} • Completed {format(new Date(request.completedAt!), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
