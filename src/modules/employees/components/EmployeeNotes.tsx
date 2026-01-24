import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Plus, StickyNote, Trash2, Lock } from "lucide-react";
import { EmployeeNote } from "@/shared/types/employee";
import { getEmployeeNotes, addEmployeeNote, deleteEmployeeNote } from "@/shared/lib/employeeStorage";
import { format } from "date-fns";
import { toast } from "sonner";
import { Switch } from "@/shared/components/ui/switch";

interface EmployeeNotesProps {
  employeeId: string;
}

const NOTE_CATEGORIES: { value: EmployeeNote['category']; label: string; color: string }[] = [
  { value: "general", label: "General", color: "default" },
  { value: "performance", label: "Performance", color: "default" },
  { value: "disciplinary", label: "Disciplinary", color: "destructive" },
  { value: "achievement", label: "Achievement", color: "default" },
  { value: "feedback", label: "Feedback", color: "secondary" },
];

export function EmployeeNotes({ employeeId }: EmployeeNotesProps) {
  const [notes, setNotes] = useState<EmployeeNote[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    content: "",
    category: "general" as EmployeeNote['category'],
    isPrivate: false,
  });

  useEffect(() => {
    loadNotes();
  }, [employeeId]);

  const loadNotes = () => {
    const employeeNotes = getEmployeeNotes(employeeId);
    setNotes(employeeNotes);
  };

  const handleAdd = async () => {
    if (!formData.content.trim()) {
      toast.error("Please enter note content");
      return;
    }

    setSaving(true);
    try {
      const newNote: EmployeeNote = {
        id: `note-${Date.now()}`,
        employeeId,
        content: formData.content,
        category: formData.category,
        isPrivate: formData.isPrivate,
        createdBy: "current-user-id",
        createdByName: "Current User",
        createdAt: new Date().toISOString(),
      };

      addEmployeeNote(newNote);
      loadNotes();
      setAddDialogOpen(false);
      setFormData({ content: "", category: "general", isPrivate: false });
      toast.success("Note added successfully");
    } catch (error) {
      toast.error("Failed to add note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteEmployeeNote(noteId);
      loadNotes();
      toast.success("Note deleted successfully");
    }
  };

  const getCategoryBadge = (category: EmployeeNote['category']) => {
    const categoryData = NOTE_CATEGORIES.find(c => c.value === category);
    return (
      <Badge variant={categoryData?.color as any || "default"}>
        {categoryData?.label || category}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Keep track of important information</CardDescription>
            </div>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <StickyNote className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No notes added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 border rounded-lg space-y-2 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getCategoryBadge(note.category)}
                      {note.isPrivate && (
                        <Badge variant="outline" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Private
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{note.createdByName}</span>
                    <span>•</span>
                    <span>{format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>Add a new note for this employee</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="note-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as EmployeeNote['category'] })}
              >
                <SelectTrigger id="note-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="note-content">Note Content</Label>
              <Textarea
                id="note-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter your note here..."
                rows={5}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="note-private">Private Note</Label>
              <Switch
                id="note-private"
                checked={formData.isPrivate}
                onCheckedChange={(checked) => setFormData({ ...formData, isPrivate: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? "Saving..." : "Add Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
