import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { ArrowLeft, Reply, Mail } from 'lucide-react';
import { GmailThread, GmailMessage } from '@/shared/lib/gmailThreadService';
import { formatDistanceToNow } from 'date-fns';

interface EmailThreadDetailViewProps {
  thread: GmailThread;
  onBack: () => void;
  onReply: (message: GmailMessage) => void;
  showReplyButton?: boolean;
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export function EmailThreadDetailView({
  thread,
  onBack,
  onReply,
  showReplyButton = true,
}: EmailThreadDetailViewProps) {
  // Find the last outbound message (sent to candidate)
  const lastOutboundMessage = thread.messages
    .filter(msg => !msg.isInbound)
    .pop();

  // Find the last inbound message (from candidate) to reply to
  const lastInboundMessage = thread.messages
    .filter(msg => msg.isInbound)
    .pop();

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold truncate">{thread.subject}</h2>
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {thread.messageCount}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Messages - Only show outbound (sent to candidate) messages */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {thread.messages
            .filter(msg => !msg.isInbound)
            .map((message) => (
              <Card
                key={message.id}
                className="p-4 bg-primary/10 border-primary/20 ml-8"
              >
                <div className="flex items-start justify-between mb-2 flex-row-reverse">
                  <div>
                    <p className="text-sm font-medium text-foreground">{message.from}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.date), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="default" className="text-[10px]">
                    Sent
                  </Badge>
                </div>

                <div
                  className="mt-2 text-sm text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: message.body }}
                />
              </Card>
            ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      {showReplyButton && lastInboundMessage && (
        <div className="p-4 border-t bg-muted/30 flex-shrink-0">
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={() => onReply(lastInboundMessage)}
          >
            <Reply className="h-4 w-4" />
            Reply to Last Message
          </Button>
        </div>
      )}
      {!lastOutboundMessage && (
        <div className="p-4 border-t bg-muted/30 flex-shrink-0 text-center text-xs text-muted-foreground">
          No emails sent to candidate yet
        </div>
      )}
    </div>
  );
}
