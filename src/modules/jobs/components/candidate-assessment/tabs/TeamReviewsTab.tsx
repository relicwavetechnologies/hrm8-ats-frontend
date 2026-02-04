import { Application } from "@/shared/types/application";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea"; 
import { toast } from "sonner";
import { 
  Star,
  Send,
  MoveRight,
  MessageSquare,
  User,
  History
} from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface TeamReviewsTabProps {
  application: Application;
  onUpdate?: () => void;
}

export function TeamReviewsTab({ application, onUpdate }: TeamReviewsTabProps) {
  const reviews = application.teamReviews || [];
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempNotes, setTempNotes] = useState<any[]>([]);

  // Reset temp notes when fresh application data arrives from parent
  useEffect(() => {
    setTempNotes([]);
  }, [application]);

  // Robust Date Formatter (DD/MM/YYYY, HH:mm:ss) - Deterministic
  const formatTimestamp = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return `${d}/${m}/${y}, ${h}:${min}:${s}`;
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    try {
      const { applicationService } = await import("@/modules/applications/lib/applicationService");
      
      const noteContent = newNote;
      
      // Optimistic update
      const optimisticNote = {
        id: `temp-${Date.now()}`,
        content: noteContent,
        createdAt: new Date().toISOString(),
        userName: "You",
        type: 'note',
        isOptimistic: true
      };
      setTempNotes(prev => [optimisticNote, ...prev]);
      
      // Append to existing notes using robust timestamp
      const currentNotes = application.recruiterNotes || "";
      const timestamp = formatTimestamp(new Date());
      const appendText = currentNotes 
        ? `${currentNotes}\n\n[${timestamp}]: ${noteContent}`
        : `[${timestamp}]: ${noteContent}`;

      await applicationService.updateNotes(application.id, appendText);
      if (onUpdate) {
        onUpdate();
      }
      setNewNote("");
      toast.success("Note added");
    } catch (error) {
      console.error("Failed to add note", error);
      toast.error("Failed to add note");
      setTempNotes(prev => prev.filter(n => n.content !== newNote)); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCriterionName = (id: string) => {
    const names: Record<string, string> = {
      '1': 'Technical Skills',
      '2': 'Problem Solving',
      '3': 'Communication',
      '4': 'Cultural Fit',
      '5': 'Leadership',
      '6': 'Learning Agility'
    };
    return names[id] || 'Criterion';
  };

  const getRecommendationStyle = (rec: string) => {
    switch (rec.toLowerCase()) {
      case 'strong-hire': 
      case 'approve': return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case 'hire': return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case 'maybe': 
      case 'pending': return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      case 'no-hire': 
      case 'reject':
      case 'strong-no-hire': return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  // Helper to parse the raw text blob from backend
  const parseNotes = (text: string | null | undefined) => {
    if (!text) return [];

    const items: { content: string; date: Date; type: 'note' | 'move'; userName: string }[] = [];
    
    // Split by timestamp pattern: [DD/MM/YYYY, HH:MM:SS]
    // We capture the timestamp and the content after it
    // This regex looks for the bracketed timestamp at the start of a line or after a newline
    const entryRegex = /\[(\d{1,2}[/-]\d{1,2}[/-]\d{4}.*?)\]/g;
    
    let lastIndex = 0;
    let match;
    
    // Check for content *before* the first timestamp (legacy notes)
    match = entryRegex.exec(text);
    if (match && match.index > 0) {
       const preContent = text.substring(0, match.index).trim();
       if (preContent) {
         items.push({
           content: preContent,
           date: new Date(application.createdAt),
           type: 'note',
           userName: 'Recruiter'
         });
       }
       // Reset regex to start
       entryRegex.lastIndex = 0; 
    } else if (!match && text.trim()) {
       // No timestamps at all
       return [{ 
         content: text.trim(), 
         date: new Date(application.updatedAt), 
         type: 'note', 
         userName: 'Recruiter' 
       }];
    }

    // Reset loop
    entryRegex.lastIndex = 0;

    while ((match = entryRegex.exec(text)) !== null) {
      const dateStr = match[1]; // e.g. "31/01/2026, 23:12:37"
      const startOfContent = match.index + match[0].length;
      
      // Find end of this entry (start of next timestamp or end of string)
      const nextMatch = /\[(\d{1,2}[/-]\d{1,2}[/-]\d{4}.*?)\]/g;
      nextMatch.lastIndex = startOfContent;
      const next = nextMatch.exec(text);
      const endOfContent = next ? next.index : text.length;
      
      let content = text.substring(startOfContent, endOfContent).trim();
      
      // Clean leading separators from content (like ": " or "- ")
      content = content.replace(/^[:\-\s]+/, '');
      
      // Filter out system error logs (e.g. [Auto-schedule failed: ...])
      content = content.replace(/\[Auto-schedule failed:[\s\S]*?\]/g, '').trim();

      if (!content) continue;

      // Parse Date (Simple Strategy: Try DD/MM/YYYY, fallback to JS default)
      let date = new Date(dateStr);
      
      // Manual check for DD/MM/YYYY vs MM/DD/YYYY ambiguity
      // We prioritize DD/MM/YYYY because we enforced 'en-GB' in the writer.
      const dateParts = dateStr.split(',')[0].trim().split(/[/-]/);
      if (dateParts.length === 3) {
         const day = parseInt(dateParts[0]);
         const month = parseInt(dateParts[1]);
         const year = parseInt(dateParts[2]);
         
         // If valid DD/MM/YYYY date
         if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            // Reconstruct ISO safely: YYYY-MM-DD
            // Get time part
            const timePart = dateStr.includes(',') ? dateStr.split(',')[1].trim() : '';
            if (timePart) {
               // Handle AM/PM if present
               let [t, meridian] = timePart.split(' ');
               let [h, m, s] = t.split(':').map(Number);
               
               if (meridian) {
                 if (meridian.toLowerCase() === 'pm' && h < 12) h += 12;
                 if (meridian.toLowerCase() === 'am' && h === 12) h = 0;
               }
               
               const iso = `${year}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}T${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${(s||0).toString().padStart(2,'0')}`;
               const strictDate = new Date(iso);
               if (!isNaN(strictDate.getTime())) {
                 date = strictDate;
               }
            }
         }
      }

      if (isNaN(date.getTime())) date = new Date(); // Fallback

      // Identify Type
      const lower = content.toLowerCase();
      const isMove = lower.startsWith('moved to') || lower.startsWith('moved candidate to') || (lower.includes('moved to') && lower.length < 100);

      items.push({
        content,
        date,
        type: isMove ? 'move' : 'note',
        userName: isMove ? 'System' : 'You'
      });
    }

    return items;
  };

  const parsedRecruiterNotes = parseNotes(application.recruiterNotes);

  // Process timeline items (Oldest to Newest for Chat Flow)
  const timelineItems = [
    ...reviews.map(r => ({ ...r, type: 'review' as const, date: new Date(r.submittedAt) })),
    ...parsedRecruiterNotes.map(n => ({ ...n, type: n.type === 'move' ? 'note' as const : 'note' as const, isMoveLog: n.type === 'move', isSystem: n.userName === 'System' || n.content.includes('Moved to') })),
    ...(application.notes || []).map(n => ({ ...n, type: 'note' as const, date: new Date(n.createdAt) })),
    ...(application.evaluations || []).map(e => ({ 
      ...e, 
      type: 'evaluation' as const, 
      date: new Date(e.created_at || e.createdAt),
      reviewerName: e.user?.name || 'Team Member',
      recommendation: e.decision || 'PENDING'
    })),
    ...tempNotes.map(n => ({ ...n, type: 'note' as const, date: new Date(n.createdAt) }))
  ].sort((a, b) => a.date.getTime() - b.date.getTime()); // Oldest bottom strategy fallback to maintain balance

  // Group by date
  const groupedItems: { dateLabel: string; items: typeof timelineItems }[] = [];
  
  timelineItems.forEach(item => {
    const dateLabel = format(item.date, 'MMMM d, yyyy');
    const lastGroup = groupedItems[groupedItems.length - 1];
    if (lastGroup && lastGroup.dateLabel === dateLabel) {
      lastGroup.items.push(item);
    } else {
      groupedItems.push({ dateLabel, items: [item] });
    }
  });

  return (
    <div className="max-w-2xl mx-auto py-4 flex flex-col min-h-[500px]">
      
      {/* Messages Area */}
      <div className="flex-1 space-y-8 pb-6">
        {timelineItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-50">
            <MessageSquare className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No activity yet. Start the conversation.</p>
          </div>
        )}

        {groupedItems.map((group) => (
          <div key={group.dateLabel} className="space-y-6">
            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-border flex-1" />
              <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider bg-background/50 px-2 py-1 rounded-md border border-transparent">
                {group.dateLabel}
              </span>
              <div className="h-px bg-border flex-1" />
            </div>

            <div className="space-y-6">
              {group.items.map((item) => {
                if (item.type === 'review' || item.type === 'evaluation') {
                  const review = item as any;
                  const isEvaluation = item.type === 'evaluation';
                  
                  return (
                    <div key={`${item.type}-${review.id}`} className="group relative pl-4">
                      <div className="flex gap-4">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm mt-1 ring-1 ring-border/10">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 text-indigo-700 font-bold text-xs">
                             {review.reviewerName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                           <div className="flex items-center justify-between">
                             <div className="flex items-baseline gap-2">
                               <p className="text-sm font-bold text-slate-900">{review.reviewerName}</p>
                               <span className="text-[11px] text-slate-400 font-medium">{format(item.date, 'h:mm a')}</span>
                             </div>
                             <Badge variant="outline" className={`${getRecommendationStyle(review.recommendation)} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border rounded-full shadow-sm`}>
                               {review.recommendation.replace(/-/g, ' ')}
                             </Badge>
                           </div>

                           <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-5 shadow-sm text-sm leading-relaxed text-slate-700 hover:border-slate-200 transition-all group-hover:shadow-md">
                              {isEvaluation ? (
                                <p className="whitespace-pre-wrap font-medium">{review.comment || "No detailed review provided."}</p>
                              ) : (
                                review.comments && review.comments.map((c: any) => (
                                  <p key={c.id} className="whitespace-pre-wrap">{c.content}</p>
                                ))
                              )}
                              
                              <div className="mt-4 pt-4 border-t border-slate-50 flex flex-wrap gap-2 items-center">
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50/50 px-2 py-1 rounded-md">
                                  Score: {isEvaluation ? review.score : review.overallScore}/10
                                </span>
                                {!isEvaluation && (
                                  <>
                                    <div className="h-3 w-px bg-slate-200 mx-2" />
                                    {review.ratings && review.ratings.slice(0, 3).map((r: any) => (
                                      <Badge key={r.criterionId} variant="secondary" className="text-[10px] font-medium gap-1 bg-slate-50 text-slate-600 border-0">
                                        <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                        {getCriterionName(r.criterionId)}: {r.value}
                                      </Badge>
                                    ))}
                                  </>
                                )}
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                   // Note Item
                   const note = item as any;
                   const isMoveLog = note.isMoveLog || (note.content && note.content.toLowerCase().startsWith('moved to'));
                   const isLegacy = note.isLegacy;
                   const isOptimistic = note.isOptimistic;
                   const isMe = note.userName === 'You' || note.userName === 'Just now' || note.userName === 'Me';

                   if (isMoveLog) {
                     return (
                       <div key={`move-${note.id}`} className="py-4 flex justify-center">
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                              <div className="w-full border-t border-primary/20"></div>
                            </div>
                            <div className="relative flex justify-center">
                              <Badge variant="outline" className="px-4 py-1.5 gap-2 rounded-full border-primary/30 bg-primary/5 text-primary text-xs font-semibold shadow-sm hover:bg-primary/10 transition-colors uppercase tracking-wide">
                                <MoveRight className="w-3.5 h-3.5" />
                                {note.content}
                                <span className="ml-1 opacity-50 font-normal normal-case">&middot; {format(note.date, 'h:mm a')}</span>
                              </Badge>
                            </div>
                          </div>
                       </div>
                     );
                   }

                   return (
                     <div key={`note-${note.id}`} className={`flex gap-3 group ${isOptimistic ? 'opacity-70' : ''} ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className="mt-1 flex-shrink-0">
                           <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                             <AvatarFallback className={`${isMe ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-600'} font-bold text-xs`}>
                               {note.userName ? note.userName.charAt(0) : <User className="w-4 h-4" />}
                             </AvatarFallback>
                           </Avatar>
                        </div>

                        <div className={`flex flex-col max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                           <div className="flex items-baseline gap-2 mb-1 px-1">
                             <span className="text-xs font-semibold text-foreground/80">
                               {note.userName || "System"}
                             </span>
                             <span className="text-[10px] text-muted-foreground/60">
                               {format(note.date, 'h:mm a')}
                             </span>
                           </div>
                           
                           <div className={`
                             px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap
                             ${isMe 
                               ? 'bg-blue-600 text-white rounded-tr-none' 
                               : 'bg-white dark:bg-zinc-800 border text-foreground rounded-tl-none'
                             }
                             ${isLegacy ? 'italic text-muted-foreground border-dashed bg-muted/20' : ''}
                           `}>
                             {note.content}
                           </div>
                        </div>
                     </div>
                   );
                }
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area - Fixed at Bottom Style */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur pt-2 pb-0 z-20">
         <InputArea newNote={newNote} setNewNote={setNewNote} handleAddNote={handleAddNote} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}

function InputArea({ newNote, setNewNote, handleAddNote, isSubmitting }: any) {
  return (
    <div className="bg-muted/30 border rounded-xl shadow-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all p-1.5 flex gap-2 items-end">
        <Textarea
          placeholder="Type a note..."
          value={newNote}
          onChange={(e: any) => setNewNote(e.target.value)}
          className="min-h-[44px] max-h-[150px] border-none shadow-none focus-visible:ring-0 resize-none py-2.5 px-3 text-[14px] bg-transparent placeholder:text-muted-foreground/50 leading-relaxed flex-1"
          onKeyDown={(e: any) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddNote();
            }
          }}
        />
        <Button 
             size="icon" 
             onClick={handleAddNote} 
             disabled={!newNote.trim() || isSubmitting}
             className={`h-9 w-9 mb-0.5 rounded-lg transition-all ${newNote.trim() ? 'bg-primary hover:bg-primary/90' : 'bg-muted-foreground/20 text-muted-foreground'}`}
        >
             <Send className="w-4 h-4 ml-0.5" />
        </Button>
    </div>
  );
}
