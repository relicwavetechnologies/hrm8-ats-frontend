import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Calendar } from '@/shared/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { format, addDays } from 'date-fns';
import { CalendarIcon, Send, UserPlus, FileText } from 'lucide-react';
import { getTeamMembers, createFeedbackRequest } from '@/shared/lib/feedbackRequestService';
import { getTemplates } from '@/shared/lib/feedbackRequestTemplateService';
import { FeedbackRequestTemplate } from '@/shared/types/feedbackRequestTemplate';
import { useToast } from '@/shared/hooks/use-toast';
import { cn } from '@/shared/lib/utils';

interface FeedbackRequestDialogProps {
  candidateId: string;
  candidateName: string;
  trigger?: React.ReactNode;
}

export function FeedbackRequestDialog({ 
  candidateId, 
  candidateName,
  trigger 
}: FeedbackRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date>();
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const teamMembers = getTeamMembers();
  const templates = getTemplates();
  const currentUser = { id: 'current-user', name: 'Current User' }; // Mock current user

  useEffect(() => {
    if (selectedTemplate && selectedTemplate !== '_none_') {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setMessage(template.message);
        setDueDate(addDays(new Date(), template.dueDaysFromNow));
      }
    } else if (selectedTemplate === '_none_') {
      setMessage('');
      setDueDate(undefined);
    }
  }, [selectedTemplate, templates]);

  const handleSubmit = () => {
    if (!selectedMember || !dueDate) {
      toast({
        title: 'Missing Information',
        description: 'Please select a team member and due date.',
        variant: 'destructive',
      });
      return;
    }

    const member = teamMembers.find(m => m.id === selectedMember);
    if (!member) return;

    createFeedbackRequest({
      candidateId,
      candidateName,
      requestedBy: currentUser.id,
      requestedByName: currentUser.name,
      requestedTo: member.id,
      requestedToName: member.name,
      requestedToEmail: member.email,
      dueDate: dueDate.toISOString(),
      message: message || undefined,
    });

    toast({
      title: 'Feedback Request Sent',
      description: `Email notification sent to ${member.name}`,
    });

    // Reset form
    setSelectedMember('');
    setSelectedTemplate('');
    setDueDate(undefined);
    setMessage('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Request Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Team Feedback</DialogTitle>
          <DialogDescription>
            Send an email notification to request feedback for {candidateName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="template">Use Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none_">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>No template (custom message)</span>
                    </div>
                  </SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col">
                        <span>{template.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {template.dueDaysFromNow} day{template.dueDaysFromNow > 1 ? 's' : ''} • {template.message.substring(0, 50)}...
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="team-member">Team Member</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger id="team-member">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex flex-col">
                      <span>{member.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {member.role} • {member.email}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add any specific instructions or context..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="h-4 w-4 mr-2" />
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
