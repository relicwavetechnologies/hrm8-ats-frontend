import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { EmailLog } from '@/shared/types/emailTracking';
import { toast } from 'sonner';

interface ScheduleEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (email: Omit<EmailLog, 'id' | 'createdAt'>) => void;
  initialData?: Partial<EmailLog>;
}

export function ScheduleEmailDialog({ open, onOpenChange, onSchedule, initialData }: ScheduleEmailDialogProps) {
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [recipients, setRecipients] = useState(initialData?.recipientEmails?.join(', ') || '');
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(
    initialData?.scheduledFor ? new Date(initialData.scheduledFor) : undefined
  );
  const [scheduleTime, setScheduleTime] = useState('09:00');

  const handleSchedule = () => {
    if (!subject.trim() || !body.trim() || !recipients.trim() || !scheduleDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const recipientEmails = recipients.split(',').map(email => email.trim()).filter(Boolean);
    
    if (recipientEmails.length === 0) {
      toast.error('Please enter at least one recipient email');
      return;
    }

    const [hours, minutes] = scheduleTime.split(':').map(Number);
    const scheduledDateTime = new Date(scheduleDate);
    scheduledDateTime.setHours(hours, minutes);

    const emailData: Omit<EmailLog, 'id' | 'createdAt'> = {
      subject,
      body,
      recipientIds: [],
      recipientEmails,
      status: 'scheduled',
      scheduledFor: scheduledDateTime.toISOString(),
      opens: 0,
      clicks: 0,
      bounces: [],
      createdBy: 'admin',
    };

    onSchedule(emailData);
    toast.success('Email scheduled successfully');
    onOpenChange(false);
    
    // Reset form
    setSubject('');
    setBody('');
    setRecipients('');
    setScheduleDate(undefined);
    setScheduleTime('09:00');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule Email</DialogTitle>
          <DialogDescription>
            Schedule an email to be sent at a specific date and time
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
            <Input
              id="recipients"
              placeholder="john@example.com, jane@example.com"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              placeholder="Enter email body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Schedule Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduleDate ? format(scheduleDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduleDate}
                    onSelect={setScheduleDate}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Schedule Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule}>
            Schedule Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
