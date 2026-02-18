import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { X } from 'lucide-react';
import { EmailReplyComposer } from './EmailReplyComposer';
import { GmailThread, GmailMessage } from '@/shared/lib/gmailThreadService';

interface EmailReplyDrawerProps {
  open: boolean;
  thread: GmailThread | null;
  replyingToMessage: GmailMessage | null;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  onClose: () => void;
  onEmailSent: () => void;
}

export function EmailReplyDrawer({
  open,
  thread,
  replyingToMessage,
  applicationId,
  candidateName,
  jobTitle,
  onClose,
  onEmailSent,
}: EmailReplyDrawerProps) {
  if (!thread || !replyingToMessage) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b sticky top-0 bg-background">
          <div className="flex items-center justify-between">
            <SheetTitle>Reply to Email</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <EmailReplyComposer
            applicationId={applicationId}
            thread={thread}
            replyingToMessage={replyingToMessage}
            candidateName={candidateName}
            jobTitle={jobTitle}
            onBack={onClose}
            onEmailSent={() => {
              onEmailSent();
              onClose();
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
