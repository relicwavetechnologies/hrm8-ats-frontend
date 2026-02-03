import { useState } from "react";
import { Application } from "@/shared/types/application";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, CalendarClock, MoveRight, User, Hash } from "lucide-react";
import { Separator } from "@/shared/components/ui/separator";

interface TeamReviewsTabProps {
  application: Application;
  onAddNote: (note: string) => Promise<void>;
}

interface TimelineEvent {
  id: string;
  type: 'activity' | 'note';
  content: string;
  createdAt: string | Date;
  userName?: string;
  userAvatar?: string;
  metadata?: any;
}

export function TeamReviewsTab({ application, onAddNote }: TeamReviewsTabProps) {
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Merge and sort activities and notes
  const events: TimelineEvent[] = [
    ...(application.activities?.map(a => ({
      id: a.id,
      type: 'activity' as const,
      content: a.description,
      createdAt: a.createdAt,
      userName: a.userName,
      metadata: a.metadata,
    })) || []),
    ...(application.notes?.map(n => ({
      id: n.id,
      type: 'note' as const,
      content: n.content,
      createdAt: n.createdAt,
      userName: n.userName,
      userAvatar: n.userAvatar,
    })) || [])
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddNote(newNote);
      setNewNote("");
    } catch (error) {
      console.error("Failed to add note", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name?: string) => {
    return (name || "Unknown").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Input Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Add Team Review / Note
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Textarea
              placeholder="Write a review, interview feedback, or note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <div className="flex justify-end mt-2">
            <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim() || isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Review"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Timeline Feed */}
      <div className="space-y-6 px-1">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Activity Timeline</h3>
        
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarClock className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No activity yet</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-muted ml-4 space-y-8 pb-4">
            {events.map((event) => (
              <div key={event.id} className="relative pl-6">
                {/* Timeline Dot */}
                <div className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background ${
                  event.type === 'note' ? 'bg-primary' : 'bg-muted-foreground'
                }`} />
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{event.userName || "System"}</span>
                      {event.type === 'activity' ? "updated" : "commented"}
                    </span>
                    <span>{formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}</span>
                  </div>

                  {event.type === 'note' ? (
                    <Card className="mt-1 bg-muted/30">
                      <CardContent className="p-3 text-sm">
                        {event.content}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="mt-0.5 text-sm flex items-center gap-2">
                      {event.content.includes("Moved to") ? (
                        <MoveRight className="h-3.5 w-3.5 text-primary" />
                      ) : (
                         <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span>{event.content}</span>
                    </div>
                  )}
                  
                  {/* Show metadata comment if activity has one (e.g., move reason) */}
                  {event.type === 'activity' && event.metadata?.comment && (
                    <Card className="mt-2 bg-muted/40 border-l-4 border-l-primary/50">
                       <CardContent className="p-2.5 text-xs italic text-muted-foreground">
                        "{event.metadata.comment}"
                       </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
