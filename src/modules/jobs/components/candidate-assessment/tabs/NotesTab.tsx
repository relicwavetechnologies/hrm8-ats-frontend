import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Loader2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { apiClient } from '@/shared/lib/api';
import { Application } from '@/shared/types/application';

interface NotesTabProps {
  application: Application;
}

interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  mentions: string[];
}

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

export function NotesTab({ application }: NotesTabProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!application.id) return;
      setIsLoading(true);
      try {
        const response = await apiClient.get<{ notes: any[] }>(
          `/api/applications/${application.id}/notes`
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
        const storedNotes = localStorage.getItem(`candidate_notes_${application.id}`);
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
  }, [application.id]);

  const highlightMentions = (content: string) => {
    return content.replace(
      /@(\w+\s?\w*)/g,
      '<span class="text-primary font-medium">@$1</span>'
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No notes yet</p>
          <p className="text-sm">Add a note using the input area above</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <Card key={note.id}>
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={note.authorAvatar} />
                <AvatarFallback className="text-xs">
                  {note.authorName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{note.authorName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTimeAgo(note.createdAt)}
                </p>
              </div>
            </div>
            <p
              className="text-sm text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightMentions(note.content) }}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
