import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { getEmployeeNotes } from "@/shared/lib/employeeStorage";
import { format } from "date-fns";
import { Plus, Lock, MessageSquare } from "lucide-react";

interface EmployeeNotesTabProps {
  employeeId: string;
}

export function EmployeeNotesTab({ employeeId }: EmployeeNotesTabProps) {
  const notes = getEmployeeNotes(employeeId);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'general': 'secondary',
      'performance': 'default',
      'disciplinary': 'destructive',
      'achievement': 'default',
      'feedback': 'outline',
    };
    return colors[category] || 'secondary';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'general': 'General',
      'performance': 'Performance',
      'disciplinary': 'Disciplinary',
      'achievement': 'Achievement',
      'feedback': 'Feedback',
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notes & Comments</h3>
          <p className="text-sm text-muted-foreground">
            Internal notes and observations about this employee
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>

      <div className="space-y-4">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{note.createdByName}</span>
                      <Badge variant={getCategoryColor(note.category) as any}>
                        {getCategoryLabel(note.category)}
                      </Badge>
                      {note.isPrivate && (
                        <Badge variant="outline" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Private
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  
                  {note.attachments && note.attachments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {note.attachments.map((attachment, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          📎 {attachment}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {notes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Notes Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add notes to track important information about this employee
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add First Note
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
