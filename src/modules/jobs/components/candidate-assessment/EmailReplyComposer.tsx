import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { ArrowLeft, Send, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { GmailThread, GmailMessage, gmailThreadService } from '@/shared/lib/gmailThreadService';
import { useToast } from '@/shared/hooks/use-toast';
import { getApplicationEmailTemplates } from '@/shared/lib/applicationEmailTemplates';

interface EmailReplyComposerProps {
  applicationId: string;
  thread: GmailThread;
  replyingToMessage: GmailMessage;
  candidateName: string;
  jobTitle: string;
  onBack: () => void;
  onEmailSent: () => void;
}

export function EmailReplyComposer({
  applicationId,
  thread,
  replyingToMessage,
  candidateName,
  jobTitle,
  onBack,
  onEmailSent,
}: EmailReplyComposerProps) {
  const [replyBody, setReplyBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'professional' | 'friendly' | 'formal'>('professional');
  const [showQuoted, setShowQuoted] = useState(false);
  const [templates] = useState(getApplicationEmailTemplates());
  const { toast } = useToast();

  const handleGenerateRewrite = async () => {
    setIsGeneratingAI(true);
    try {
      const result = await gmailThreadService.rewriteEmailReply(applicationId, {
        originalMessage: replyingToMessage.body,
        tone: selectedTone,
      });
      setReplyBody(result.body);
      toast({
        title: 'AI Rewrite Generated',
        description: 'Review and customize as needed',
      });
    } catch (error) {
      toast({
        title: 'Failed to generate rewrite',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyBody.trim()) {
      toast({
        title: 'Reply cannot be empty',
        description: 'Please write a message before sending',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const subject = thread.subject.startsWith('Re:')
        ? thread.subject
        : `Re: ${thread.subject}`;

      await gmailThreadService.sendEmailReply(applicationId, {
        threadId: thread.threadId,
        messageId: replyingToMessage.id,
        subject,
        body: replyBody,
        to: replyingToMessage.from,
      });

      toast({
        title: 'Reply sent successfully!',
        description: 'Your email has been sent',
      });

      setReplyBody('');
      onEmailSent();
    } catch (error) {
      toast({
        title: 'Failed to send reply',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setReplyBody(template.body);
      toast({
        title: 'Template applied',
        description: `"${template.name}" has been loaded`,
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-base font-semibold">Reply to Email</h2>
        </div>
        <p className="text-xs text-muted-foreground pl-10">
          Re: {thread.subject}
        </p>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Quoted Message */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowQuoted(!showQuoted)}
              >
                <CardTitle className="text-xs">Original Message</CardTitle>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showQuoted ? 'rotate-180' : ''}`}
                />
              </div>
            </CardHeader>
            {showQuoted && (
              <CardContent className="text-xs text-muted-foreground">
                <div className="border-l-2 border-muted-foreground/30 pl-3 py-2 space-y-1">
                  <p>
                    <strong>From:</strong> {replyingToMessage.from}
                  </p>
                  <p>
                    <strong>Subject:</strong> {replyingToMessage.subject}
                  </p>
                  <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                    <div
                      className="text-xs text-muted-foreground line-clamp-4"
                      dangerouslySetInnerHTML={{ __html: replyingToMessage.body }}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Template Quick-Apply */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleApplyTemplate}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* AI Rewrite Section */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Rewrite Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Select value={selectedTone} onValueChange={(v) => setSelectedTone(v as any)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleGenerateRewrite}
                  disabled={isGeneratingAI}
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Rewrite
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reply Body */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Your Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <RichTextEditor
                  content={replyBody}
                  onChange={setReplyBody}
                  placeholder="Write your reply here..."
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recipient Info */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Replying to:</span>
                </div>
                <div className="text-right">
                  <p className="font-medium truncate">{replyingToMessage.from}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30 flex-shrink-0 space-y-2">
        <Button
          size="lg"
          className="w-full gap-2 h-11"
          onClick={handleSendReply}
          disabled={isSending || !replyBody.trim()}
        >
          {isSending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Sending reply...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Send Reply
            </>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Review your reply before sending
        </p>
      </div>
    </div>
  );
}
