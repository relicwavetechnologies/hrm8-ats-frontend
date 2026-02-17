import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { Mail, Send, Loader2, Sparkles, Copy, Eye, FileText, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/shared/lib/api';
import { useToast } from '@/shared/hooks/use-toast';
import { getApplicationEmailTemplates } from '@/shared/lib/applicationEmailTemplates';

interface CandidateEmailPanelProps {
  applicationId: string;
  jobId: string;
  candidateName?: string;
  jobTitle?: string;
  candidateEmail?: string;
  onEmailSent?: () => void;
  onBack?: () => void;
}

const DYNAMIC_FIELDS = [
  { key: '{candidateName}', label: 'Candidate Name', icon: '👤' },
  { key: '{jobTitle}', label: 'Job Title', icon: '💼' },
  { key: '{companyName}', label: 'Company Name', icon: '🏢' },
  { key: '{recruiterName}', label: 'Recruiter Name', icon: '👔' },
  { key: '{currentStage}', label: 'Current Stage', icon: '📊' },
];

export function CandidateEmailPanel({
  applicationId,
  jobId,
  candidateName = 'Candidate',
  jobTitle = 'Position',
  candidateEmail = '',
  onEmailSent,
  onBack,
}: CandidateEmailPanelProps) {
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templates, setTemplates] = useState(getApplicationEmailTemplates());
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setTemplates(getApplicationEmailTemplates());
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEmailSubject(template.subject);
      setEmailBody(template.body);
      toast({
        title: "Template loaded",
        description: `"${template.name}" has been loaded`,
      });
    }
  };

  const copyFieldToClipboard = (field: string) => {
    navigator.clipboard.writeText(field);
    toast({
      title: "Copied!",
      description: `${field} copied to clipboard`,
    });
  };

  const insertFieldAtCursor = (field: string) => {
    setEmailBody(prev => prev + ' ' + field + ' ');
    toast({
      title: "Field inserted",
      description: `${field} added to email body`,
    });
  };

  const generateAIContext = async () => {
    setIsGeneratingAI(true);
    setAiContext('Generating context...');

    // Simulate AI generating contextual email content
    setTimeout(() => {
      const context = `📋 AI Context for ${candidateName}:
• Applied for: ${jobTitle}
• Profile: Strong candidate with relevant experience
• Status: Currently in the interview stage
• Next Steps: Consider scheduling final interview
• Recommendation: Excellent cultural fit, technical skills align well`;
      setAiContext(context);
      setIsGeneratingAI(false);
    }, 1500);
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast({
        title: "Content required",
        description: "Please enter both subject and body",
        variant: "destructive",
      });
      return;
    }

    if (!candidateEmail) {
      toast({
        title: "No email address",
        description: "Candidate email address is not available",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);

    try {
      // Replace dynamic fields with actual values
      let processedSubject = emailSubject;
      let processedBody = emailBody;

      const replacements: Record<string, string> = {
        '{candidateName}': candidateName,
        '{jobTitle}': jobTitle,
        '{companyName}': 'Your Company',
        '{recruiterName}': 'You',
        '{currentStage}': 'Interview',
      };

      Object.entries(replacements).forEach(([key, value]) => {
        const regex = new RegExp(key.replace(/[{}]/g, '\\$&'), 'g');
        processedSubject = processedSubject.replace(regex, value);
        processedBody = processedBody.replace(regex, value);
      });

      const response = await apiClient.post(
        `/api/applications/${applicationId}/send-email`,
        {
          to: candidateEmail,
          subject: processedSubject,
          body: processedBody,
        }
      );

      if (response.success) {
        toast({
          title: "✅ Email sent successfully!",
          description: `Email sent to ${candidateName} at ${candidateEmail}`,
        });
        setEmailSubject('');
        setEmailBody('');
        setSelectedTemplate('');
        setAiContext('');
        onEmailSent?.();
      } else {
        throw new Error(response.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : 'Please try again',
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const previewBody = () => {
    let preview = emailBody;
    const replacements: Record<string, string> = {
      '{candidateName}': candidateName,
      '{jobTitle}': jobTitle,
      '{companyName}': 'Your Company',
      '{recruiterName}': 'You',
      '{currentStage}': 'Interview',
    };

    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(key.replace(/[{}]/g, '\\$&'), 'g');
      preview = preview.replace(regex, `<strong class="text-primary">${value}</strong>`);
    });

    return preview;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-base font-semibold">Email Candidate</h2>
                <p className="text-xs text-muted-foreground">
                  Send to: {candidateEmail || 'No email available'}
                </p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <FileText className="h-3 w-3" />
            {templates.length} Templates
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Template Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Email Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="📧 Choose a template or write custom email..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <span>{template.name}</span>
                        {template.category && (
                          <Badge variant="secondary" className="text-[10px] ml-auto">
                            {template.category}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedTemplate && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900">
                  <p className="text-xs text-muted-foreground">
                    ✨ Template loaded! You can customize it before sending.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Writing Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={generateAIContext}
                disabled={isGeneratingAI}
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating context...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate AI Context & Suggestions
                  </>
                )}
              </Button>

              {aiContext && (
                <div className="p-3 bg-background rounded-md border text-sm whitespace-pre-line">
                  {aiContext}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dynamic Fields */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Dynamic Fields</CardTitle>
              <p className="text-xs text-muted-foreground">Click to copy or insert into email</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {DYNAMIC_FIELDS.map(field => (
                  <Button
                    key={field.key}
                    variant="outline"
                    className="justify-start h-auto py-2 px-3"
                    onClick={() => insertFieldAtCursor(field.key)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-base">{field.icon}</span>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-medium">{field.label}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{field.key}</p>
                      </div>
                      <Copy className="h-3 w-3 opacity-50" />
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Subject */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Subject Line</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Enter email subject..."
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="h-10"
              />
            </CardContent>
          </Card>

          {/* Email Body */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Email Body</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-3 w-3" />
                  {showPreview ? 'Edit' : 'Preview'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showPreview ? (
                <div
                  className="min-h-[300px] p-4 border rounded-md bg-muted/30"
                  dangerouslySetInnerHTML={{ __html: previewBody() }}
                />
              ) : (
                <div className="border rounded-md">
                  <RichTextEditor
                    content={emailBody}
                    onChange={setEmailBody}
                    placeholder="Write your email here... Use dynamic fields for personalization."
                    className="text-sm"
                    minHeight="min-h-[300px]"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recipient Info */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Recipient:</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">{candidateName}</p>
                  <p className="text-xs text-muted-foreground">{candidateEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t bg-muted/30 flex-shrink-0 space-y-2">
        <Button
          size="lg"
          className="w-full gap-2 h-11"
          onClick={handleSendEmail}
          disabled={isSendingEmail || !emailSubject.trim() || !emailBody.trim() || !candidateEmail}
        >
          {isSendingEmail ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Sending email...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Send Email to {candidateName}
            </>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Make sure to review your email before sending
        </p>
      </div>
    </div>
  );
}
