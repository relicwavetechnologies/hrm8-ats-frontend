import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { MessageSquare, Send, AtSign, Loader2 } from 'lucide-react';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { apiClient } from '@/shared/lib/api';

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
  jobId: string;
  candidateName?: string;
  jobTitle?: string;
  onNoteAdded?: () => void;
}

// Mock hiring team for now
const MOCK_HIRING_TEAM: HiringTeamMember[] = [
  { id: '1', name: 'John Smith', role: 'Hiring Manager' },
  { id: '2', name: 'Sarah Johnson', role: 'Technical Lead' },
  { id: '3', name: 'Mike Davis', role: 'Recruiter' },
  { id: '4', name: 'Emily Brown', role: 'HR Manager' },
];

// Helper to safely format dates
function formatTimeAgo(dateInput: string | undefined): string {
  if (!dateInput) return 'Just now';
  try {
    const date = parseISO(dateInput);
    if (isValid(date)) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  } catch {
    // Ignore errors
  }
  return 'Just now';
}

export function CandidateNotesPanel({
  applicationId,
  jobId,
  candidateName,
  jobTitle,
  onNoteAdded,
}: CandidateNotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteContent, setNoteContent] = useState('');
  const [hiringTeam] = useState<HiringTeamMember[]>(MOCK_HIRING_TEAM);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch notes from API on mount
  useEffect(() => {
    const fetchNotes = async () => {
      if (!applicationId) return;
      setIsLoading(true);
      try {
        const response = await apiClient.get<{ notes: any[] }>(
          `/api/applications/${applicationId}/notes`
        );
        if (response.success && response.data?.notes) {
          // Map the note structure from backend to frontend format
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
        // Fall back to localStorage if API fails
        const storedNotes = localStorage.getItem(`candidate_notes_${applicationId}`);
        if (storedNotes) {
          try {
            setNotes(JSON.parse(storedNotes));
          } catch {
            setNotes([]);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [applicationId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNoteContent(value);

    // Detect @ mentions
    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1 && (lastAtIndex === 0 || textBeforeCursor[lastAtIndex - 1] === ' ')) {
      const searchText = textBeforeCursor.substring(lastAtIndex + 1);
      if (!searchText.includes(' ')) {
        setShowMentions(true);
        setMentionSearch(searchText.toLowerCase());
        return;
      }
    }
    setShowMentions(false);
    setMentionSearch('');
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
    textareaRef.current?.focus();
  };

  const handleSubmit = async () => {
    if (!noteContent.trim() || isSubmitting) return;

    // Extract mentions
    const mentionRegex = /@(\w+\s?\w*)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(noteContent)) !== null) {
      mentions.push(match[1]);
    }

    setIsSubmitting(true);

    try {
      // Submit note to backend API
      const response = await apiClient.post<{ note: any }>(
        `/api/applications/${applicationId}/notes`,
        {
          content: noteContent.trim(),
          mentions,
        }
      );

      if (response.success && response.data?.note) {
        // Map the note structure from backend to frontend format
        const newNote: Note = {
          id: response.data.note.id,
          content: response.data.note.content,
          authorId: response.data.note.author?.id || 'current-user',
          authorName: response.data.note.author?.name || 'You',
          authorAvatar: response.data.note.author?.avatar,
          createdAt: response.data.note.createdAt,
          mentions: response.data.note.mentions || [],
        };
        // Add new note to state
        setNotes(prev => [newNote, ...prev]);
        setNoteContent('');
        onNoteAdded?.();
      } else {
        console.error('Failed to add note:', response.error);
      }
    } catch (error) {
      console.error('Failed to submit note:', error);
      // Fall back to local storage only if API fails
      const newNote: Note = {
        id: Date.now().toString(),
        content: noteContent.trim(),
        authorId: 'current-user',
        authorName: 'You',
        createdAt: new Date().toISOString(),
        mentions,
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
      handleSubmit();
    }
  };

  const filteredTeam = hiringTeam.filter(member =>
    member.name.toLowerCase().includes(mentionSearch)
  );

  const highlightMentions = (content: string) => {
    return content.replace(
      /@(\w+\s?\w*)/g,
      '<span class="text-primary font-medium">@$1</span>'
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-2 px-3 flex-shrink-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Notes
          {notes.length > 0 && (
            <span className="text-xs text-muted-foreground">({notes.length})</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-3 pt-0 min-h-0">
        {/* Note Input */}
        <div className="relative mb-2 flex-shrink-0">
          <Textarea
            ref={textareaRef}
            placeholder="Add a note... Use @ to mention team members"
            value={noteContent}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] max-h-[80px] pr-10 text-sm resize-none"
            rows={2}
            disabled={isSubmitting}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute bottom-2 right-2 h-6 w-6"
            onClick={handleSubmit}
            disabled={!noteContent.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>

          {/* Mentions Dropdown */}
          {showMentions && filteredTeam.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-[120px] overflow-auto">
              {filteredTeam.slice(0, 4).map((member) => (
                <button
                  key={member.id}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-left text-sm"
                  onClick={() => insertMention(member)}
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-[10px]">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-xs">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground">{member.role}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground mb-2 flex-shrink-0">
          <AtSign className="h-2.5 w-2.5 inline mr-0.5" />
          mention team (sends email) • ⌘+Enter
        </p>

        {/* Notes List */}
        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : notes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No notes yet. Add a note to get started.
              </p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="p-2 bg-muted/30 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={note.authorAvatar} />
                      <AvatarFallback className="text-[10px]">
                        {note.authorName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{note.authorName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTimeAgo(note.createdAt)}
                    </span>
                  </div>
                  <p
                    className="text-xs text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: highlightMentions(note.content) }}
                  />
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
