import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Application } from "@/shared/types/application";
import { Mail, Send, Sparkles, Clock, User, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { apiClient } from "@/shared/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface EmailTabProps {
  application: Application;
}

interface EmailLog {
  id: string;
  to_email: string;
  subject: string;
  body: string;
  status: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  template?: {
    id: string;
    name: string;
    type: string;
  };
}

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  variables: string[];
}

export function EmailTab({ application }: EmailTabProps) {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  const [email, setEmail] = useState({
    subject: "",
    body: "",
    templateId: "",
  });

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState<"professional" | "friendly" | "formal">("professional");

  useEffect(() => {
    fetchData();
  }, [application.id]);

  const fetchData = async () => {
    try {
      const [logsRes, templatesRes] = await Promise.all([
        apiClient.get(`/api/applications/${application.id}/emails`),
        apiClient.get(`/api/email-templates`),
      ]);
      setEmailLogs(logsRes.data?.emailLogs || []);
      setTemplates(templatesRes.data?.templates || []);
    } catch (error) {
      console.error("Error fetching email data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      let subject = template.subject;
      let body = template.body;

      // Replace common variables
      const variables: Record<string, string> = {
        "{candidate_name}": application.candidateName || "Candidate",
        "{first_name}": application.candidateName?.split(" ")[0] || "Candidate",
        "{job_title}": application.jobTitle || "the position",
        "{company_name}": "Our Company",
      };

      Object.entries(variables).forEach(([key, value]) => {
        subject = subject.replace(new RegExp(key, "g"), value);
        body = body.replace(new RegExp(key, "g"), value);
      });

      setEmail({
        subject,
        body,
        templateId,
      });
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt) {
      toast.error("Please enter a purpose for the email");
      return;
    }

    setGeneratingAI(true);
    try {
      const response = await apiClient.post(`/api/applications/${application.id}/emails/generate`, {
        purpose: aiPrompt,
        tone: aiTone,
      });

      if (response.data?.email) {
        setEmail({
          subject: response.data.email.subject || "",
          body: response.data.email.body || "",
          templateId: "",
        });
        toast.success("Email generated with AI");
      }
    } catch (error) {
      console.error("Error generating email:", error);
      toast.error("Failed to generate email");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.subject || !email.body) {
      toast.error("Subject and body are required");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post(`/api/applications/${application.id}/emails`, {
        subject: email.subject,
        body: email.body,
        templateId: email.templateId || undefined,
      });

      toast.success("Email sent successfully");
      setIsComposing(false);
      setEmail({ subject: "", body: "", templateId: "" });
      fetchData();
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      SENT: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
      DELIVERED: { color: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
      OPENED: { color: "bg-purple-100 text-purple-800", icon: Mail },
      FAILED: { color: "bg-red-100 text-red-800", icon: XCircle },
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Emails</h3>
        {!isComposing && (
          <Button onClick={() => setIsComposing(true)} size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Compose Email
          </Button>
        )}
      </div>

      {isComposing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compose Email</CardTitle>
          </CardHeader>
          <CardContent>
            {/* AI Generation */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm">Generate with AI</span>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Schedule interview for next week"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1"
                />
                <Select value={aiTone} onValueChange={(v: any) => setAiTone(v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGenerateAI}
                  disabled={generatingAI}
                >
                  {generatingAI ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              {templates.length > 0 && (
                <div className="space-y-2">
                  <Label>Use Template (optional)</Label>
                  <Select onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {template.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={email.subject}
                  onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                  placeholder="Email subject..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea
                  value={email.body}
                  onChange={(e) => setEmail({ ...email, body: e.target.value })}
                  placeholder="Write your email..."
                  rows={8}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsComposing(false);
                    setEmail({ subject: "", body: "", templateId: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Email
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {emailLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No emails sent yet</p>
            <p className="text-sm">Compose your first email to this candidate</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {emailLogs.map((emailLog) => (
            <Card key={emailLog.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{emailLog.subject}</h4>
                  {getStatusBadge(emailLog.status)}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {emailLog.body}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(emailLog.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {emailLog.user.name}
                  </span>
                  {emailLog.template && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {emailLog.template.name}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
