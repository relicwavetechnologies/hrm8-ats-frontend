import { useState, useRef, useMemo } from 'react';
import { useResumeAnnotations } from '@/shared/hooks/useResumeAnnotations';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { MessageSquare, Highlighter, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';

interface ResumeAnnotatorProps {
  resumeId: string;
  content: string;
  currentUserId: string;
  currentUserName: string;
}

export function ResumeAnnotator({
  resumeId,
  content,
  currentUserId,
  currentUserName,
}: ResumeAnnotatorProps) {
  const {
    annotations,
    addAnnotation,
    removeAnnotation,
    isLoading
  } = useResumeAnnotations({
    documentId: resumeId,
    currentUserId,
    currentUserName,
  });

  const [selection, setSelection] = useState<{ start: number; end: number; text: string } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  // Handle text selection
  const handleMouseUp = () => {
    const windowSelection = window.getSelection();
    if (!windowSelection || windowSelection.rangeCount === 0 || windowSelection.isCollapsed) {
      setSelection(null);
      return;
    }

    const range = windowSelection.getRangeAt(0);
    const container = textRef.current;
    
    if (!container || !container.contains(range.commonAncestorContainer)) {
      setSelection(null);
      return;
    }

    // Calculate absolute offsets relative to the container
    // This is a simplified approach and might need refinement for complex DOM structures
    // For a single text node or simple structure, this works.
    // If content is rendered as a single string, we can rely on string indices.
    
    // However, since we are rendering segments (spans), finding the exact index in the original string is tricky.
    // A robust way is to store the original text and mapping, or just rely on the fact that we render the text sequentially.
    
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(container);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + range.toString().length;
    const text = range.toString();

    setSelection({ start, end, text });
  };

  const handleAddHighlight = async () => {
    if (!selection) return;
    await addAnnotation('highlight', selection.text, { start: selection.start, end: selection.end });
    setSelection(null);
    // Clear selection
    window.getSelection()?.removeAllRanges();
  };

  const handleAddComment = async () => {
    if (!selection || !commentText.trim()) return;
    await addAnnotation('comment', selection.text, { start: selection.start, end: selection.end }, commentText);
    setCommentText('');
    setPopoverOpen(false);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  // Render text with highlights
  const renderText = useMemo(() => {
    if (!content) return null;

    // Sort annotations by start position
    const sortedAnnotations = [...annotations].sort((a, b) => a.position.start - b.position.start);
    
    const segments = [];
    let lastIndex = 0;

    sortedAnnotations.forEach((annotation) => {
      // Handle non-overlapping annotations only for simplicity in this MVP
      // If start is before lastIndex, it's an overlap/nested, skipping or truncating would be needed
      const start = Math.max(annotation.position.start, lastIndex);
      const end = annotation.position.end;

      if (start > lastIndex) {
        segments.push({
          text: content.slice(lastIndex, start),
          type: 'text',
        });
      }

      if (end > start) {
        segments.push({
          text: content.slice(start, end),
          type: 'annotation',
          data: annotation,
        });
        lastIndex = end;
      }
    });

    if (lastIndex < content.length) {
      segments.push({
        text: content.slice(lastIndex),
        type: 'text',
      });
    }

    return (
      <div 
        ref={textRef} 
        onMouseUp={handleMouseUp}
        className="whitespace-pre-wrap font-mono text-sm leading-relaxed"
      >
        {segments.map((segment, index) => {
          if (segment.type === 'annotation' && segment.data) {
            const isHighlight = segment.data.type === 'highlight';
            return (
              <span
                key={segment.data.id}
                className={cn(
                  "cursor-pointer rounded px-0.5 transition-colors",
                  isHighlight ? "bg-yellow-200 dark:bg-yellow-900/50" : "bg-blue-200 dark:bg-blue-900/50 border-b-2 border-blue-500"
                )}
                title={segment.data.comment || "Highlight"}
              >
                {segment.text}
              </span>
            );
          }
          return <span key={index}>{segment.text}</span>;
        })}
      </div>
    );
  }, [content, annotations]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Document View */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardHeader className="py-3 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Document Viewer</CardTitle>
            <div className="flex items-center gap-2">
              {selection && (
                <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                  <Button size="sm" variant="secondary" onClick={handleAddHighlight} className="h-8 gap-2">
                    <Highlighter className="h-3.5 w-3.5" />
                    Highlight
                  </Button>
                  
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button size="sm" variant="secondary" className="h-8 gap-2">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Comment
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-3">
                        <h4 className="font-medium leading-none">Add Comment</h4>
                        <Textarea
                          placeholder="Type your comment here..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <div className="flex justify-end">
                          <Button size="sm" onClick={handleAddComment}>Save</Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 p-6 bg-white dark:bg-slate-950">
            {isLoading ? (
               <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
            ) : content ? (
              renderText
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No text content available.
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>

      {/* Annotations Sidebar */}
      <div className="flex flex-col gap-4">
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Annotations ({annotations.length})
            </CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {annotations.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  No annotations yet. Select text to add highlights or comments.
                </div>
              ) : (
                annotations.map((annotation) => (
                  <div key={annotation.id} className="p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback style={{ backgroundColor: annotation.userColor }} className="text-[10px] text-white">
                            {annotation.userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium leading-none">{annotation.userName}</span>
                          <span className="text-[10px] text-muted-foreground">{format(annotation.timestamp, 'MMM d, h:mm a')}</span>
                        </div>
                      </div>
                      {annotation.userId === currentUserId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeAnnotation(annotation.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="mb-2 p-2 bg-muted/50 rounded text-xs font-mono border-l-2 border-primary/20">
                      "{annotation.text}"
                    </div>

                    {annotation.comment && (
                      <p className="text-sm">{annotation.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
