import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { MessageSquare, Send, AtSign, Loader2, Mail, Sparkles, FileText, Phone, Calendar, CheckSquare } from 'lucide-react';
import { apiClient } from '@/shared/lib/api';
import { useToast } from '@/shared/hooks/use-toast';
import { getApplicationEmailTemplates } from '@/shared/lib/applicationEmailTemplates';
import { Application } from '@/shared/types/application';
import { SendSmsTab } from './tabs/SendSmsTab';
import { ScheduleMeetingTab } from './tabs/ScheduleMeetingTab';
import { CreateTaskTab } from './tabs/CreateTaskTab';
import { getCaretCoordinates } from '@/shared/lib/textareaUtils';

interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  mentions: string[];
}

interface HiringTeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface CandidateNotesPanelProps {
  applicationId: string;
  jobId?: string;
  candidateName?: string;
  jobTitle?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  application?: Application;
  onNoteAdded?: () => void;
  onEmailSent?: () => void;
  onSmsSent?: () => void;
  onMeetingScheduled?: () => void;
  onTaskCreated?: () => void;
}

// Mock hiring team
const MOCK_HIRING_TEAM: HiringTeamMember[] = [
  { id: '1', name: 'John Smith', role: 'Hiring Manager' },
  { id: '2', name: 'Sarah Johnson', role: 'Technical Lead' },
  { id: '3', name: 'Mike Davis', role: 'Recruiter' },
  { id: '4', name: 'Emily Brown', role: 'HR Manager' },
];

export function CandidateNotesPanelEnhanced({
  applicationId,
  jobId,
  candidateName = 'Candidate',
  jobTitle = 'Position',
  candidateEmail = '',
  candidatePhone = '',
  application,
  onNoteAdded,
  onEmailSent,
  onSmsSent: _onSmsSent,
  onMeetingScheduled: _onMeetingScheduled,
  onTaskCreated: _onTaskCreated,
}: CandidateNotesPanelProps) {
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteContent, setNoteContent] = useState('');
  const [hiringTeam] = useState<HiringTeamMember[]>(MOCK_HIRING_TEAM);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Email state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templates] = useState(getApplicationEmailTemplates());
  const [aiContext, setAiContext] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Build a minimal Application object for new tabs (use provided or construct from props)
  const applicationObj: Application = application || {
    id: applicationId,
    candidateId: '',
    jobId: jobId || '',
    jobTitle,
    status: 'applied',
    stage: 'New Application',
    appliedDate: new Date().toISOString(),
    isRead: true,
    isNew: false,
    tags: [],
    shortlisted: false,
    manuallyAdded: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [],
    interviews: [],
    candidateName,
    candidateEmail,
    candidatePhone,
    employerName: '',
  };

  // Fetch notes from API
  useEffect(() => {
    const fetchNotes = async () => {
      if (!applicationId) return;
      try {
        const response = await apiClient.get<{ notes: any[] }>(
          `/api/applications/${applicationId}/notes`
        );
        if (response.success && response.data?.notes) {
          const mappedNotes = response.data.notes.map((note: any) => ({
            id: note.id,
            content: note.content,
            authorId: note.author?.id || 'unknown',
            authorName: note.author?.name || 'Unknown',
            authorAvatar: note.author?.avatar,
            createdAt: note.createdAt,
            mentions: note.mentions || [],
          }));
          setNotes(mappedNotes);
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        const storedNotes = localStorage.getItem(`candidate_notes_${applicationId}`);
        if (storedNotes) {
          try {
            setNotes(JSON.parse(storedNotes));
          } catch {
            setNotes([]);
          }
        }
      }
    };

    fetchNotes();
  }, [applicationId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNoteContent(value);

    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1 && (lastAtIndex === 0 || textBeforeCursor[lastAtIndex - 1] === ' ')) {
      const searchText = textBeforeCursor.substring(lastAtIndex + 1);
      if (!searchText.includes(' ')) {
        setShowMentions(true);
        setMentionSearch(searchText.toLowerCase());

        // Calculate caret position for dropdown
        if (textareaRef.current) {
          const coords = getCaretCoordinates(textareaRef.current, cursorPosition);
          // Add offset for the dropdown to appear below the line
          setMentionPosition({
            top: coords.top + coords.height,
            left: coords.left,
          });
        }
        return;
      }
    }
    setShowMentions(false);
    setMentionSearch('');
    setMentionPosition(null);
  };

  const insertMention = (member: HiringTeamMember) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = noteContent.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const textAfterCursor = noteContent.substring(cursorPosition);

    const newContent =
      noteContent.substring(0, lastAtIndex) +
      `@${member.name} ` +
      textAfterCursor;

    setNoteContent(newContent);
    setShowMentions(false);
    setMentionSearch('');
    setMentionPosition(null);
    textareaRef.current?.focus();
  };

  const handleSubmitNote = async () => {
    if (!noteContent.trim() || isSubmitting) return;

    const mentionRegex = /@(\w+\s?\w*)/g;
    const mentions: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = mentionRegex.exec(noteContent)) !== null) {
      mentions.push(match[1]);
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post<{ note: any }>(
        `/api/applications/${applicationId}/notes`,
        {
          content: noteContent.trim(),
          mentions,
        }
      );

      if (response.success && response.data?.note) {
        const newNote: Note = {
          id: response.data.note.id,
          content: response.data.note.content,
          authorId: response.data.note.author?.id || 'current-user',
          authorName: response.data.note.author?.name || 'You',
          authorAvatar: response.data.note.author?.avatar,
          createdAt: response.data.note.createdAt,
          mentions: response.data.note.mentions || [],
        };
        setNotes(prev => [newNote, ...prev]);
        setNoteContent('');
        onNoteAdded?.();
      }
    } catch (error) {
      console.error('Failed to submit note:', error);
      const mentionRegex2 = /@(\w+\s?\w*)/g;
      const mentions2: string[] = [];
      let match2: RegExpExecArray | null;
      while ((match2 = mentionRegex2.exec(noteContent)) !== null) {
        mentions2.push(match2[1]);
      }
      const newNote: Note = {
        id: Date.now().toString(),
        content: noteContent.trim(),
        authorId: 'current-user',
        authorName: 'You',
        createdAt: new Date().toISOString(),
        mentions: mentions2,
      };
      setNotes(prev => [newNote, ...prev]);
      localStorage.setItem(`candidate_notes_${applicationId}`, JSON.stringify([newNote, ...notes]));
      setNoteContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmitNote();
    }
  };

  const filteredTeam = hiringTeam.filter(member =>
    member.name.toLowerCase().includes(mentionSearch)
  );

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

  const handleGenerateWithAI = async () => {
    if (!aiContext.trim()) {
      toast({
        title: "Context required",
        description: "Please provide context for AI to generate email",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAI(true);

    try {
      setTimeout(() => {
        const generatedSubject = `Follow-up: ${jobTitle} Position`;
        const generatedBody = `Dear ${candidateName},

Thank you for your interest in the ${jobTitle} position at our company.

${aiContext}

We appreciate your time and look forward to continuing the conversation.

Best regards,
Hiring Team`;

        setEmailSubject(generatedSubject);
        setEmailBody(generatedBody);
        setIsGeneratingAI(false);

        toast({
          title: "Email generated",
          description: "AI has generated the email content",
        });
      }, 1500);
    } catch (error) {
      console.error('Failed to generate email:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate email with AI",
        variant: "destructive",
      });
      setIsGeneratingAI(false);
    }
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
      const response = await apiClient.post(
        `/api/applications/${applicationId}/send-email`,
        {
          to: candidateEmail,
          subject: emailSubject,
          body: emailBody,
        }
      );

      if (response.success) {
        toast({
          title: "Email sent!",
          description: `Email sent to ${candidateName}`,
        });
        setEmailSubject('');
        setEmailBody('');
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

  return (
    <Card className="h-full flex flex-col border-0 shadow-none overflow-hidden">
      <CardContent className="flex-1 flex flex-col p-3 min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          {/* Tabs Header - 5 tabs */}
          <TabsList className="grid w-full grid-cols-5 h-8 mb-1 flex-shrink-0">
            <TabsTrigger value="notes" className="text-xs gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Note</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="text-xs gap-1">
              <Mail className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="sms" className="text-xs gap-1">
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">SMS</span>
            </TabsTrigger>
            <TabsTrigger value="meeting" className="text-xs gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Meet</span>
            </TabsTrigger>
            <TabsTrigger value="task" className="text-xs gap-1">
              <CheckSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Task</span>
            </TabsTrigger>
          </TabsList>

          {/* Notes Tab Content */}
          <TabsContent value="notes" className="m-0 data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col min-h-0 space-y-3">
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                placeholder="Add a note... Use @ to mention team members"
                value={noteContent}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="h-full pr-10 text-sm resize-none"
                disabled={isSubmitting}
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute bottom-2 right-2 h-7 w-7"
                onClick={handleSubmitNote}
                disabled={!noteContent.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>

              {showMentions && filteredTeam.length > 0 && mentionPosition && (
                <div
                  className="absolute z-50 bg-popover border rounded-md shadow-lg max-h-[120px] overflow-auto min-w-[180px]"
                  style={{
                    top: `${mentionPosition.top}px`,
                    left: `${mentionPosition.left}px`,
                  }}
                >
                  {filteredTeam.slice(0, 4).map((member) => (
                    <button
                      key={member.id}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-left text-sm"
                      onClick={() => insertMention(member)}
                    >
                      <Avatar className="h-5 w-5 flex-shrink-0">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-xs">{member.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-2 px-1.5 py-0.5 bg-muted rounded-md">{member.role}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground flex-shrink-0">
              <AtSign className="h-2.5 w-2.5 inline mr-0.5" />
              Mention team members with @ • Press Cmd+Enter to submit
            </p>
          </TabsContent>

          {/* Email Tab Content */}
          <TabsContent value="email" className="m-0 data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col min-h-0 overflow-hidden">
            <div className="flex flex-col h-full space-y-2 py-2">
              {/* Header: To & Send */}
              <div className="flex items-center justify-between px-1 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex-shrink-0">To:</span>
                  <div className="bg-muted px-2 py-0.5 rounded-full border border-muted-foreground/10 truncate">
                    <span className="text-[10px] font-medium text-foreground">{candidateEmail || "No Email"}</span>
                  </div>
                </div>
                <Button
                  onClick={handleSendEmail}
                  disabled={!emailSubject.trim() || !emailBody.trim() || isSendingEmail || !candidateEmail}
                  className="h-7 px-3 text-[11px] font-bold shadow-sm"
                  size="sm"
                >
                  {isSendingEmail ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Send className="h-3 w-3" />
                      <span>Send</span>
                    </div>
                  )}
                </Button>
              </div>

              {/* Subject Bar */}
              <div className="px-1">
                <Input
                  placeholder="Subject Line..."
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="text-xs h-8 border-none bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary/30"
                  disabled={isSendingEmail}
                />
              </div>

              {/* Toolbar: Templates & AI */}
              <div className="flex items-center gap-2 px-1 pb-1 border-b border-muted">
                {/* Templates Dropdown */}
                <div className="flex-1 max-w-[180px]">
                  <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger className="text-[11px] h-7 bg-transparent border-none hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <SelectValue placeholder="Use Template..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          <span className="text-[11px]">{template.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-4 w-px bg-muted-foreground/20" />

                {/* AI Assistant Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2 gap-1.5 text-[11px] text-primary hover:text-primary hover:bg-primary/5">
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                      AI Assistant
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-3 shadow-xl border-primary/20" side="bottom" align="end">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-primary/10 rounded">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">AI Writing Assistant</h4>
                      </div>
                      <div className="space-y-2">
                        <Textarea
                          placeholder="What should this email be about? (e.g., 'Schedule a follow-up interview for Tuesday morning')"
                          value={aiContext}
                          onChange={(e) => setAiContext(e.target.value)}
                          className="text-xs min-h-[80px] resize-none focus-visible:ring-primary/30"
                          disabled={isGeneratingAI}
                        />
                        <Button
                          onClick={handleGenerateWithAI}
                          disabled={isGeneratingAI || !aiContext.trim()}
                          className="w-full h-8 bg-primary hover:bg-primary/90"
                          size="sm"
                        >
                          {isGeneratingAI ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-3.5 w-3.5" />
                              <span className="text-xs font-semibold">Generate Content</span>
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="flex-1" />
                <span className="text-[10px] text-muted-foreground/50 italic mr-1">Markdown support</span>
              </div>

              {/* Editor area - flex-1 to fill all remaining space */}
              <div className="flex-1 min-h-0 overflow-hidden px-1">
                <div className="h-full border rounded-md overflow-hidden bg-background shadow-inner flex flex-col">
                  <RichTextEditor
                    content={emailBody}
                    onChange={setEmailBody}
                    placeholder="Start typing your email here..."
                    className="text-xs border-0 h-full [&_.ProseMirror]:min-h-full [&_.ProseMirror]:p-3 [&_.ProseMirror]:focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* SMS Tab Content */}
          <TabsContent value="sms" className="m-0 data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col min-h-0 overflow-hidden">
            <SendSmsTab application={applicationObj} />
          </TabsContent>

          {/* Schedule Meeting Tab Content */}
          <TabsContent value="meeting" className="m-0 data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col min-h-0 overflow-hidden">
            <ScheduleMeetingTab application={applicationObj} />
          </TabsContent>

          {/* Create Task Tab Content */}
          <TabsContent value="task" className="m-0 data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col min-h-0 overflow-hidden">
            <CreateTaskTab application={applicationObj} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
