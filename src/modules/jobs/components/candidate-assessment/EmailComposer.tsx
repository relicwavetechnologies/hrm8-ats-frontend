import { useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Sparkles, Loader2, Send } from "lucide-react";
import { apiClient } from "@/shared/lib/api";
import { GmailMessage, GmailThread, gmailThreadService } from "@/shared/lib/gmailThreadService";
import { useToast } from "@/shared/hooks/use-toast";
import { getApplicationEmailTemplates } from "@/shared/lib/applicationEmailTemplates";

type ComposerMode = "new" | "reply";
type Tone = "professional" | "friendly" | "formal";

interface EmailComposerProps {
  mode: ComposerMode;
  applicationId: string;
  candidateName: string;
  candidateEmail?: string;
  jobTitle: string;
  thread?: GmailThread | null;
  replyingToMessage?: GmailMessage | null;
  onSent: (needsReconnect?: boolean) => void;
  onCancel: () => void;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function EmailComposer({
  mode,
  applicationId,
  candidateName,
  candidateEmail,
  jobTitle,
  thread,
  replyingToMessage,
  onSent,
  onCancel,
}: EmailComposerProps) {
  const templates = useMemo(() => getApplicationEmailTemplates(), []);
  const { toast } = useToast();

  const defaultSubject = useMemo(() => {
    if (mode === "reply") {
      const source = thread?.subject || replyingToMessage?.subject || "";
      return source.startsWith("Re:") ? source : `Re: ${source}`;
    }
    return "";
  }, [mode, thread?.subject, replyingToMessage?.subject]);

  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [aiPrompt, setAiPrompt] = useState(
    mode === "reply"
      ? "Reply clearly, acknowledge candidate context, and provide next steps."
      : `Write a concise update email for ${candidateName} about ${jobTitle}.`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    if (mode === "new") {
      setSubject(template.subject || subject);
    }
    setBody(template.body || "");
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      if (mode === "reply") {
        if (!replyingToMessage) throw new Error("Reply context missing");
        const original = stripHtml(replyingToMessage.body);
        const result = await gmailThreadService.rewriteEmailReply(applicationId, {
          originalMessage: `${original}\n\nInstruction: ${aiPrompt}`,
          tone,
        });
        setSubject((prev) => prev || result.subject || defaultSubject);
        setBody(result.body || "");
      } else {
        const response = await apiClient.post<any>(`/api/applications/${applicationId}/emails/generate`, {
          purpose: aiPrompt,
          tone,
        });
        if (!response.success || !response.data) throw new Error(response.error || "Failed to generate email");

        const payload = response.data as any;
        const generated = payload.email || payload;
        setSubject(generated.subject || subject || `Update for ${candidateName}`);
        setBody(generated.body || "");
      }

      toast({
        title: "AI draft generated",
        description: "Review and send",
      });
    } catch (error) {
      toast({
        title: "AI generation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({
        title: "Missing fields",
        description: "Subject and body are required",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      let needsReconnect: boolean | undefined;
      if (mode === "reply") {
        if (!thread?.threadId || !replyingToMessage?.id) {
          throw new Error("Reply thread context missing");
        }
        await gmailThreadService.sendEmailReply(applicationId, {
          threadId: thread.threadId,
          messageId: replyingToMessage.id,
          subject,
          body,
          to: replyingToMessage.from,
        });
      } else {
        const response = await apiClient.post<any>(`/api/applications/${applicationId}/emails`, {
          subject,
          body,
          templateId: selectedTemplate || undefined,
        });
        if (!response.success) throw new Error(response.error || "Failed to send email");
        needsReconnect = (response.data as any)?.needsReconnect ?? false;
      }

      toast({
        title: "Email sent",
      });
      onSent(needsReconnect);
    } catch (error) {
      toast({
        title: "Send failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{mode === "reply" ? "Reply Email" : "Compose Email"}</p>
            <p className="text-xs text-muted-foreground">
              {mode === "reply" ? replyingToMessage?.from : candidateEmail || "Candidate email unavailable"}
            </p>
          </div>
          <Badge variant="outline" className="h-5 text-[10px]">
            {mode === "reply" ? "Thread Reply" : "New Message"}
          </Badge>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <div className="grid gap-2 sm:grid-cols-[1fr_150px_auto]">
          <Input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Tell AI what to write..."
            className="h-8 text-xs"
          />
          <Select value={tone} onValueChange={(value) => setTone(value as Tone)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={handleGenerateAI} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            AI Draft
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_220px]">
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="h-8 text-xs"
          />
          <Select value={selectedTemplate} onValueChange={applyTemplate}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Apply template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write email..."
          className="min-h-[240px] resize-y text-sm leading-5"
        />

        {mode === "reply" && replyingToMessage?.body ? (
          <div className="rounded-md border bg-muted/20 p-2 text-[11px] text-muted-foreground">
            <p className="mb-1 font-medium">Replying to</p>
            <p className="line-clamp-3">{stripHtml(replyingToMessage.body)}</p>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={handleSend} disabled={isSending}>
          {isSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Send
        </Button>
      </div>
    </div>
  );
}
