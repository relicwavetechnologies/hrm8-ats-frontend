import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { RichTextNoteEditor } from './RichTextNoteEditor';
import { getCandidateNotes, addCandidateNote, deleteCandidateNote } from '@/shared/lib/mockCandidateStorage';
import { CandidateNote } from '@/shared/types/entities';
import { StickyNote, Plus, Search, Trash2, Lock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';

const NOTE_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'interview_feedback', label: 'Interview Feedback' },
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'reference_check', label: 'Reference Check' },
  { value: 'other', label: 'Other' },
];

interface NotesTabProps {
  candidateId: string;
}

export function NotesTab({ candidateId }: NotesTabProps) {
  const [notes, setNotes] = useState(getCandidateNotes(candidateId));
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  // New note form state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<CandidateNote['noteType']>('general');
  const [newNoteIsPrivate, setNewNoteIsPrivate] = useState(false);

  const handleAddNote = () => {
    if (!newNoteContent.trim()) {
      toast.error('Note content is required');
      return;
    }

    addCandidateNote({
      candidateId,
      userId: 'current-user',
      userName: 'Current User',
      noteType: newNoteType,
      content: newNoteContent,
      isPrivate: newNoteIsPrivate,
    });

    setNotes(getCandidateNotes(candidateId));
    setNewNoteContent('');
    setNewNoteType('general');
    setNewNoteIsPrivate(false);
    setIsAdding(false);
    toast.success('Note added successfully');
  };

  const handleDeleteNote = (noteId: string) => {
    deleteCandidateNote(noteId);
    setNotes(getCandidateNotes(candidateId));
    setDeleteNoteId(null);
    toast.success('Note deleted');
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || note.noteType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {NOTE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <Card className="p-6 space-y-4">
          <h4 className="font-semibold">New Note</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Note Type</Label>
              <Select value={newNoteType} onValueChange={(value: any) => setNewNoteType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  id="private-note"
                  checked={newNoteIsPrivate}
                  onCheckedChange={setNewNoteIsPrivate}
                />
                <Label htmlFor="private-note" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Private Note
                </Label>
              </div>
            </div>
          </div>

          <RichTextNoteEditor
            content={newNoteContent}
            onChange={setNewNoteContent}
            placeholder="Write your note here..."
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote}>
              Save Note
            </Button>
          </div>
        </Card>
      )}

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title={searchQuery || filterType !== 'all' ? 'No notes found' : 'No Notes Yet'}
          description={
            searchQuery || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Add your first note to keep track of important information'
          }
          action={
            !searchQuery && filterType === 'all'
              ? { label: 'Add Note', onClick: () => setIsAdding(true) }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      {NOTE_TYPES.find((t) => t.value === note.noteType)?.label}
                    </Badge>
                    {note.isPrivate && (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Private
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    By {note.userName} • {format(note.createdAt, 'MMM dd, yyyy h:mm a')}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteNoteId(note.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteNoteId} onOpenChange={() => setDeleteNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This note will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteNoteId && handleDeleteNote(deleteNoteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}