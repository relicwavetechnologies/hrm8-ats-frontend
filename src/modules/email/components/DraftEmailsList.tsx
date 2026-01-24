import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { EmailLog } from '@/shared/types/emailTracking';
import { format } from 'date-fns';
import { FileText, Pencil, Trash2, Send } from 'lucide-react';

interface DraftEmailsListProps {
  emails: EmailLog[];
  onEdit?: (email: EmailLog) => void;
  onDelete?: (email: EmailLog) => void;
  onSend?: (email: EmailLog) => void;
}

export function DraftEmailsList({ emails, onEdit, onDelete, onSend }: DraftEmailsListProps) {
  return (
    <div className="space-y-4">
      {emails.map((email) => (
        <Card key={email.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">{email.subject || 'Untitled Draft'}</h3>
                  <Badge variant="outline">Draft</Badge>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>To: {email.recipientEmails.length} recipients</span>
                  <span>
                    Last modified: {format(new Date(email.createdAt), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>

                {email.body && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {email.body.substring(0, 150)}...
                  </p>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                {onSend && (
                  <Button variant="default" size="sm" onClick={() => onSend(email)}>
                    <Send className="h-4 w-4" />
                  </Button>
                )}
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(email)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button variant="outline" size="sm" onClick={() => onDelete(email)}>
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
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No draft emails</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
