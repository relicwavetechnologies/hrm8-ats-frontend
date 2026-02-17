import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  Building2,
  Users,
  Star,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlayCircle,
  MessageSquare,
  Send,
  Trash2,
  Loader2,
} from 'lucide-react';
import type { Application, Interview } from '@/shared/types/application';
import { cn } from '@/shared/lib/utils';
import { format, isPast, isFuture, isToday } from 'date-fns';
import { apiClient } from '@/shared/lib/api';
import { useToast } from '@/shared/hooks/use-toast';

interface InterviewNote {
  id: string;
  interview_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface InterviewsTabProps {
  application: Application;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function InterviewsTab({ application }: InterviewsTabProps) {
  const [scheduledInterviews, setScheduledInterviews] = useState<any[]>([]);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false);
  const [notesMap, setNotesMap] = useState<Record<string, InterviewNote[]>>({});
  const [loadingNotesFor, setLoadingNotesFor] = useState<Record<string, boolean>>({});
  const [addingNoteFor, setAddingNoteFor] = useState<Record<string, boolean>>({});
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Use interviews from application prop if available, otherwise fetch
  const { interviews: applicationInterviews } = application;
  const hasApplicationInterviews = applicationInterviews && applicationInterviews.length > 0;

  // Fetch scheduled interviews from the dedicated endpoint
  useEffect(() => {
    const fetchInterviews = async () => {
      if (!application.id) return;
      setIsLoadingInterviews(true);
      try {
        const response = await apiClient.get<{ interviews: any[] }>(
          `/api/applications/${application.id}/interviews`
        );
        if (response.success && response.data?.interviews) {
          setScheduledInterviews(response.data.interviews);
        }
      } catch (error) {
        console.error('Failed to fetch interviews:', error);
      } finally {
        setIsLoadingInterviews(false);
      }
    };

    fetchInterviews();
  }, [application.id]);

  const fetchNotesForInterview = useCallback(async (interviewId: string) => {
    if (notesMap[interviewId] !== undefined) return; // already loaded
    setLoadingNotesFor((prev) => ({ ...prev, [interviewId]: true }));
    try {
      const response = await apiClient.get<{ notes: InterviewNote[] }>(
        `/api/applications/${application.id}/interviews/${interviewId}/notes`
      );
      if (response.success && response.data?.notes) {
        setNotesMap((prev) => ({ ...prev, [interviewId]: response.data.notes }));
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoadingNotesFor((prev) => ({ ...prev, [interviewId]: false }));
    }
  }, [application.id, notesMap]);

  const toggleNotes = (interviewId: string) => {
    const willExpand = !expandedNotes[interviewId];
    setExpandedNotes((prev) => ({ ...prev, [interviewId]: willExpand }));
    if (willExpand) {
      fetchNotesForInterview(interviewId);
    }
  };

  const handleAddNote = async (interviewId: string) => {
    const content = (noteInputs[interviewId] || '').trim();
    if (!content) return;

    setAddingNoteFor((prev) => ({ ...prev, [interviewId]: true }));
    try {
      const response = await apiClient.post<{ note: InterviewNote }>(
        `/api/applications/${application.id}/interviews/${interviewId}/notes`,
        { content }
      );
      if (response.success && response.data?.note) {
        setNotesMap((prev) => ({
          ...prev,
          [interviewId]: [response.data.note, ...(prev[interviewId] || [])],
        }));
        setNoteInputs((prev) => ({ ...prev, [interviewId]: '' }));
        toast({ title: 'Note added' });
      }
    } catch (error) {
      toast({ title: 'Failed to add note', variant: 'destructive' });
    } finally {
      setAddingNoteFor((prev) => ({ ...prev, [interviewId]: false }));
    }
  };

  const handleDeleteNote = async (interviewId: string, noteId: string) => {
    try {
      await apiClient.delete(`/api/applications/${application.id}/interviews/${interviewId}/notes/${noteId}`);
      setNotesMap((prev) => ({
        ...prev,
        [interviewId]: (prev[interviewId] || []).filter((n) => n.id !== noteId),
      }));
      toast({ title: 'Note deleted' });
    } catch {
      toast({ title: 'Failed to delete note', variant: 'destructive' });
    }
  };

  // Normalize scheduled interviews to a common shape
  const normalizeInterview = (i: any) => {
    if (i.scheduledDate !== undefined) {
      // Application-prop style interview
      return {
        id: i.id,
        type: i.type || 'video',
        status: i.status || 'scheduled',
        scheduledDate: new Date(i.scheduledDate),
        duration: i.duration,
        location: i.location,
        meetingLink: i.meetingLink,
        recordingUrl: i.recordingUrl,
        interviewers: i.interviewers || [],
        feedback: i.feedback,
        notes: i.notes,
        rating: i.rating,
      };
    }
    // API-fetched style (snake_case)
    return {
      id: i.id,
      type: i.type || 'VIDEO',
      status: i.status || 'SCHEDULED',
      scheduledDate: new Date(i.scheduled_date),
      duration: i.duration,
      location: undefined,
      meetingLink: i.meeting_link,
      recordingUrl: i.recording_url,
      interviewers: Array.isArray(i.interviewer_ids) ? i.interviewer_ids : [],
      feedback: i.feedback,
      notes: i.notes,
      rating: i.overall_score,
    };
  };

  // Prefer fetched interviews; fall back to application prop
  const rawInterviews = scheduledInterviews.length > 0 ? scheduledInterviews : (applicationInterviews || []);
  const interviews = rawInterviews.map(normalizeInterview);

  if (isLoadingInterviews) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Interviews Scheduled</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Interview schedules will appear here once they are set up for this candidate.
        </p>
      </div>
    );
  }

  // Categorize interviews
  const upcomingInterviews = interviews.filter(
    (i) => (i.status === 'scheduled' || i.status === 'SCHEDULED') && isFuture(i.scheduledDate)
  );
  const todayInterviews = interviews.filter(
    (i) => (i.status === 'scheduled' || i.status === 'SCHEDULED') && isToday(i.scheduledDate)
  );
  const completedInterviews = interviews.filter(
    (i) => i.status === 'completed' || i.status === 'COMPLETED'
  );
  const cancelledInterviews = interviews.filter(
    (i) => i.status === 'cancelled' || i.status === 'CANCELLED' || i.status === 'no_show' || i.status === 'NO_SHOW'
  );

  const getInterviewIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'phone') return <Phone className="h-4 w-4" />;
    if (t === 'video') return <Video className="h-4 w-4" />;
    if (t === 'onsite' || t === 'in_person') return <Building2 className="h-4 w-4" />;
    if (t === 'panel') return <Users className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'scheduled') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s === 'completed') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'cancelled') return 'bg-gray-100 text-gray-700 border-gray-200';
    if (s === 'no_show') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-muted text-muted-foreground';
  };

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed') return <CheckCircle2 className="h-4 w-4" />;
    if (s === 'cancelled') return <XCircle className="h-4 w-4" />;
    if (s === 'no_show') return <AlertCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-4 w-4',
            star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );

  const renderNotesSection = (interviewId: string, legacyNotes?: string) => {
    const isExpanded = expandedNotes[interviewId];
    const isLoadingNotes = loadingNotesFor[interviewId];
    const notes = notesMap[interviewId] || [];
    const isAddingNote = addingNoteFor[interviewId];
    const noteInput = noteInputs[interviewId] || '';

    return (
      <>
        <Separator />
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Interview Notes
              {notes.length > 0 && (
                <Badge variant="secondary" className="text-xs">{notes.length}</Badge>
              )}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => toggleNotes(interviewId)}
            >
              {isExpanded ? 'Hide' : 'Show Notes'}
            </Button>
          </div>

          {/* Legacy notes field */}
          {legacyNotes && !isExpanded && (
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-sm whitespace-pre-wrap">{legacyNotes}</p>
            </div>
          )}

          {isExpanded && (
            <div className="space-y-3">
              {/* Add Note Form */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note..."
                  value={noteInput}
                  onChange={(e) =>
                    setNoteInputs((prev) => ({ ...prev, [interviewId]: e.target.value }))
                  }
                  className="flex-1 min-h-[60px] text-sm resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleAddNote(interviewId);
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="self-end h-8"
                  onClick={() => handleAddNote(interviewId)}
                  disabled={!noteInput.trim() || isAddingNote}
                >
                  {isAddingNote ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              {/* Notes Thread */}
              {isLoadingNotes ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : notes.length === 0 && !legacyNotes ? (
                <p className="text-sm text-muted-foreground text-center py-2">No notes yet</p>
              ) : (
                <div className="space-y-2">
                  {/* Show legacy note if present */}
                  {legacyNotes && (
                    <div className="flex gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-muted-foreground">SC</span>
                      </div>
                      <div className="flex-1 bg-muted/30 rounded-lg p-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold">System Note</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{legacyNotes}</p>
                      </div>
                    </div>
                  )}

                  {notes.map((note) => (
                    <div key={note.id} className="flex gap-2.5 group">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-primary">
                          {getInitials(note.author_name)}
                        </span>
                      </div>
                      <div className="flex-1 bg-muted/20 rounded-lg p-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">{note.author_name}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {format(new Date(note.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteNote(interviewId, note.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </>
    );
  };

  const renderInterviewCard = (interview: ReturnType<typeof normalizeInterview>, showFeedback = false) => (
    <Card key={interview.id} className="overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-2 rounded-lg',
                  interview.status === 'completed' || interview.status === 'COMPLETED'
                    ? 'bg-green-100'
                    : interview.status === 'cancelled' ||
                      interview.status === 'CANCELLED' ||
                      interview.status === 'no_show' ||
                      interview.status === 'NO_SHOW'
                    ? 'bg-red-100'
                    : 'bg-blue-100'
                )}
              >
                {getInterviewIcon(interview.type)}
              </div>
              <div>
                <CardTitle className="text-base capitalize">
                  {interview.type.replace('_', ' ')} Interview
                </CardTitle>
                <CardDescription className="text-sm">
                  {format(interview.scheduledDate, 'EEEE, MMMM dd, yyyy')}
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {format(interview.scheduledDate, 'h:mm a')} ({interview.duration} min)
              </span>

              {interview.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {interview.location}
                </span>
              )}

              {interview.interviewers.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {interview.interviewers.length} interviewer
                  {interview.interviewers.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={cn('border', getStatusColor(interview.status))}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(interview.status)}
                  <span className="capitalize text-xs">
                    {interview.status.toLowerCase().replace('_', ' ')}
                  </span>
                </span>
              </Badge>

              {interview.rating != null && (
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-md">
                  {renderStars(interview.rating)}
                </div>
              )}
            </div>
          </div>

          {(interview.meetingLink || interview.recordingUrl) && (
            <div className="flex gap-2">
              {interview.meetingLink &&
                (interview.status === 'scheduled' || interview.status === 'SCHEDULED') && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4 mr-2" />
                      Join
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}
              {interview.recordingUrl &&
                (interview.status === 'completed' || interview.status === 'COMPLETED') && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={interview.recordingUrl} target="_blank" rel="noopener noreferrer">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Recording
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Interviewers */}
          {interview.interviewers.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Interviewers</h4>
              <div className="flex flex-wrap gap-2">
                {interview.interviewers.map((interviewer: any, idx: number) => (
                  <Badge key={idx} variant="secondary">
                    {typeof interviewer === 'string' ? interviewer : interviewer.name || interviewer}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Section */}
          {showFeedback && interview.feedback && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Interview Feedback
                </h4>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">
                    {typeof interview.feedback === 'string'
                      ? interview.feedback
                      : JSON.stringify(interview.feedback, null, 2)}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Notes with attribution (new) */}
          {renderNotesSection(interview.id, interview.notes)}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ScrollArea className="h-[calc(100vh-20rem)]">
      <div className="space-y-6 pr-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interviews.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All interviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-600">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingInterviews.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedInterviews.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-amber-600">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{todayInterviews.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Happening today</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Interviews */}
        {todayInterviews.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold">Today's Interviews</h3>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {todayInterviews.length}
              </Badge>
            </div>
            {todayInterviews.map((interview) => renderInterviewCard(interview))}
          </div>
        )}

        {/* Upcoming Interviews */}
        {upcomingInterviews.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Upcoming Interviews</h3>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {upcomingInterviews.length}
              </Badge>
            </div>
            {upcomingInterviews.map((interview) => renderInterviewCard(interview))}
          </div>
        )}

        {/* Completed Interviews */}
        {completedInterviews.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Completed Interviews</h3>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {completedInterviews.length}
              </Badge>
            </div>
            {completedInterviews.map((interview) => renderInterviewCard(interview, true))}
          </div>
        )}

        {/* Cancelled/No Show Interviews */}
        {cancelledInterviews.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Cancelled & No-Shows</h3>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                {cancelledInterviews.length}
              </Badge>
            </div>
            {cancelledInterviews.map((interview) => renderInterviewCard(interview))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
