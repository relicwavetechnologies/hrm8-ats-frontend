import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { CheckCircle, Clock, AlertCircle, Users } from 'lucide-react';
import { getRequestsByCandidateId } from '@/shared/lib/feedbackRequestService';
import { FeedbackRequest } from '@/shared/types/feedbackRequest';

interface FeedbackResponseTrackerProps {
  candidateId: string;
  candidateName: string;
}

export function FeedbackResponseTracker({ 
  candidateId,
  candidateName 
}: FeedbackResponseTrackerProps) {
  const [requests, setRequests] = useState<FeedbackRequest[]>([]);

  useEffect(() => {
    loadRequests();
  }, [candidateId]);

  const loadRequests = () => {
    const candidateRequests = getRequestsByCandidateId(candidateId);
    setRequests(candidateRequests);
  };

  const completed = requests.filter(r => r.status === 'completed').length;
  const pending = requests.filter(r => r.status === 'pending').length;
  const overdue = requests.filter(r => r.status === 'overdue').length;
  const total = requests.length;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  if (total === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No feedback requests yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Feedback Response Tracking
        </CardTitle>
        <CardDescription>
          Track who has provided feedback for {candidateName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">{completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-red-600">{overdue}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Completion</span>
            <span className="text-sm font-bold">{completionRate.toFixed(0)}%</span>
          </div>
          <Progress value={completionRate} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {completed} of {total} team members have provided feedback
          </p>
        </div>

        {/* Individual Responses */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Team Member Status</h4>
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Avatar>
                  <AvatarFallback>
                    {request.requestedToName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{request.requestedToName}</div>
                  <div className="text-xs text-muted-foreground">
                    {request.requestedToEmail}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {request.status === 'completed' ? (
                  <Badge className="bg-green-500 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Completed
                  </Badge>
                ) : request.status === 'overdue' ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Overdue
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
