import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { EmailLog } from '@/shared/types/emailTracking';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { format } from 'date-fns';
import { Mail, Users, Calendar, Clock, Eye, MousePointerClick, AlertCircle } from 'lucide-react';
import { EmailEventTimeline } from './EmailEventTimeline';
import { getEmailEvents } from '@/shared/lib/emailTrackingStorage';

interface EmailDetailDialogProps {
  email: EmailLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailDetailDialog({ email, open, onOpenChange }: EmailDetailDialogProps) {
  if (!email) return null;

  const events = getEmailEvents(email.id);

  const getStatusBadge = (status: EmailLog['status']) => {
    const variants: Record<EmailLog['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      sent: { variant: 'default', label: 'Sent' },
      scheduled: { variant: 'secondary', label: 'Scheduled' },
      sending: { variant: 'outline', label: 'Sending' },
      draft: { variant: 'outline', label: 'Draft' },
      failed: { variant: 'destructive', label: 'Failed' },
    };
    
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex-1">{email.subject}</DialogTitle>
            {getStatusBadge(email.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Recipients:</span>
              <span className="font-medium">{email.recipientEmails.length}</span>
            </div>

            {email.sentAt && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Sent:</span>
                <span className="font-medium">{format(new Date(email.sentAt), 'MMM d, yyyy h:mm a')}</span>
              </div>
            )}

            {email.scheduledFor && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Scheduled:</span>
                <span className="font-medium">{format(new Date(email.scheduledFor), 'MMM d, yyyy h:mm a')}</span>
              </div>
            )}

            {email.status === 'sent' && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Opens:</span>
                  <span className="font-medium">{email.opens}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Clicks:</span>
                  <span className="font-medium">{email.clicks}</span>
                </div>

                {email.bounces.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-muted-foreground">Bounces:</span>
                    <span className="font-medium text-destructive">{email.bounces.length}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <Separator />

          {/* Recipients List */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Recipients
            </h3>
            <div className="flex flex-wrap gap-2">
              {email.recipientEmails.map((recipient, index) => (
                <Badge key={index} variant="outline">{recipient}</Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Email Body */}
          <div>
            <h3 className="font-semibold mb-2">Message</h3>
            <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm">
              {email.body}
            </div>
          </div>

          {/* Events Timeline */}
          {events.length > 0 && (
            <>
              <Separator />
              <EmailEventTimeline events={events} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
