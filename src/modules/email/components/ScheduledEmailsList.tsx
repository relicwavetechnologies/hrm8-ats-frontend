import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { EmailLog } from '@/shared/types/emailTracking';
import { format } from 'date-fns';
import { Clock, Pencil, Trash2 } from 'lucide-react';

interface ScheduledEmailsListProps {
  emails: EmailLog[];
  onEdit?: (email: EmailLog) => void;
  onCancel?: (email: EmailLog) => void;
}

export function ScheduledEmailsList({ emails, onEdit, onCancel }: ScheduledEmailsListProps) {
  return (
    <div className="space-y-4">
      {emails.map((email) => (
        <Card key={email.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">{email.subject}</h3>
                  <Badge variant="secondary">Scheduled</Badge>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>To: {email.recipientEmails.length} recipients</span>
                  {email.scheduledFor && (
                    <span className="font-medium text-foreground">
                      Sending: {format(new Date(email.scheduledFor), 'MMM d, yyyy h:mm a')}
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {email.body.substring(0, 150)}...
                </p>
              </div>

              <div className="flex gap-2 ml-4">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(email)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onCancel && (
                  <Button variant="outline" size="sm" onClick={() => onCancel(email)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {emails.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No scheduled emails</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
