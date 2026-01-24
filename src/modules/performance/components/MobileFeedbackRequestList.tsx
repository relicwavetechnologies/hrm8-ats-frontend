import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { TouchTarget } from '@/shared/components/ui/touch-target';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import { Calendar, Clock, Send, CheckCircle, ChevronDown, Mail } from 'lucide-react';
import { FeedbackRequest } from '@/shared/types/feedbackRequest';
import { format } from 'date-fns';

interface MobileFeedbackRequestListProps {
  requests: FeedbackRequest[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSendReminder: (request: FeedbackRequest) => void;
  onMarkComplete: (requestId: string) => void;
}

export function MobileFeedbackRequestList({
  requests,
  selectedIds,
  onToggleSelect,
  onSendReminder,
  onMarkComplete,
}: MobileFeedbackRequestListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusBadge = (status: FeedbackRequest['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const isExpanded = expandedId === request.id;
        const isSelected = selectedIds.includes(request.id);

        return (
          <Collapsible
            key={request.id}
            open={isExpanded}
            onOpenChange={(open) => setExpandedId(open ? request.id : null)}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <TouchTarget size="md" className="mt-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(request.id)}
                    />
                  </TouchTarget>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base mb-2">
                      {request.candidateName}
                    </CardTitle>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{request.requestedToName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {format(new Date(request.dueDate), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                  <CollapsibleTrigger asChild>
                    <TouchTarget size="md">
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </TouchTarget>
                  </CollapsibleTrigger>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requested to:</span>
                      <span className="font-medium">{request.requestedToEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requested by:</span>
                      <span className="font-medium">{request.requestedByName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Requested:</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(request.requestedAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    {request.message && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm">{request.message}</p>
                      </div>
                    )}
                  </div>

                  {request.status !== 'completed' && (
                    <div className="flex gap-2 pt-2">
                      <TouchTarget size="lg" className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSendReminder(request)}
                          disabled={request.reminderSent}
                          className="w-full"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {request.reminderSent ? 'Reminder Sent' : 'Send Reminder'}
                        </Button>
                      </TouchTarget>
                      <TouchTarget size="lg" className="flex-1">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onMarkComplete(request.id)}
                          className="w-full"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      </TouchTarget>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}

      {requests.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No feedback requests found
          </CardContent>
        </Card>
      )}
    </div>
  );
}
