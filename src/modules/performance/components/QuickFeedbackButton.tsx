import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { CollaborativeFeedbackForm } from './CollaborativeFeedbackForm';
import { MessageSquare } from 'lucide-react';

interface QuickFeedbackButtonProps {
  candidateId: string;
  candidateName: string;
  applicationId?: string;
  interviewId?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function QuickFeedbackButton({
  candidateId,
  candidateName,
  applicationId,
  interviewId,
  variant = 'outline',
  size = 'sm',
}: QuickFeedbackButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Provide Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Provide Feedback for {candidateName}</DialogTitle>
          <DialogDescription>
            Rate the candidate on multiple criteria and provide structured feedback
          </DialogDescription>
        </DialogHeader>
        <CollaborativeFeedbackForm
          candidateId={candidateId}
          candidateName={candidateName}
          applicationId={applicationId}
          interviewId={interviewId}
          onSubmitSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
