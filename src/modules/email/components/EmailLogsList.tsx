import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Mail, Clock, Check, XCircle, Eye, MousePointerClick } from 'lucide-react';
import { EmailLog } from '@/shared/types/emailTracking';
import { format } from 'date-fns';

interface EmailLogsListProps {
  emails: EmailLog[];
  onViewDetails?: (email: EmailLog) => void;
}

export function EmailLogsList({ emails, onViewDetails }: EmailLogsListProps) {
  const getStatusBadge = (status: EmailLog['status']) => {
    const variants: Record<EmailLog['status'], { variant: any; icon: any }> = {
      sent: { variant: 'default', icon: Check },
      scheduled: { variant: 'secondary', icon: Clock },
      sending: { variant: 'secondary', icon: Mail },
      draft: { variant: 'outline', icon: Mail },
      failed: { variant: 'destructive', icon: XCircle },
    };
    
    const { variant, icon: StatusIcon } = variants[status];
    
    return (
      <Badge variant={variant} className="gap-1">
        <StatusIcon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {emails.map((email) => (
        <Card key={email.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{email.subject}</h3>
                  {getStatusBadge(email.status)}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>To: {email.recipientEmails.length} recipients</span>
                  {email.sentAt && (
                    <span>Sent: {format(new Date(email.sentAt), 'MMM d, yyyy h:mm a')}</span>
                  )}
                  {email.scheduledFor && email.status === 'scheduled' && (
                    <span>Scheduled: {format(new Date(email.scheduledFor), 'MMM d, yyyy h:mm a')}</span>
                  )}
                </div>

                {email.status === 'sent' && (
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>{email.opens} opens</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                      <span>{email.clicks} clicks</span>
                    </div>
                    {email.bounces.length > 0 && (
                      <div className="flex items-center gap-1 text-destructive">
                        <XCircle className="h-4 w-4" />
                        <span>{email.bounces.length} bounces</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {onViewDetails && (
                <Button variant="ghost" size="sm" onClick={() => onViewDetails(email)}>
                  View Details
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {emails.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No emails found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
