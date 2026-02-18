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
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  // Handle text selection
  const handleMouseUp = () => {
    const windowSelection = window.getSelection();
    if (!windowSelection || windowSelection.rangeCount === 0 || windowSelection.isCollapsed) {
      setSelection(null);
      setToolbarPosition(null);
      return;
    }

    const range = windowSelection.getRangeAt(0);
    const container = textRef.current;

    if (!container || !container.contains(range.commonAncestorContainer)) {
      setSelection(null);
      setToolbarPosition(null);
      return;
    }

    // Calculate position for floating toolbar
    const rangeRect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setToolbarPosition({
      top: rangeRect.top - containerRect.top - 40, // Position above the selection
      left: rangeRect.left - containerRect.left + (rangeRect.width / 2), // Center horizontally
    });

    // Calculate absolute offsets relative to the container
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
    setToolbarPosition(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleAddComment = async () => {
    if (!selection || !commentText.trim()) return;
    await addAnnotation('comment', selection.text, { start: selection.start, end: selection.end }, commentText);
    setCommentText('');
    setPopoverOpen(false);
    setSelection(null);
    setToolbarPosition(null);
    window.getSelection()?.removeAllRanges();
  };

  const scrollToAnnotation = (id: string) => {
    // This is a simple implementation. For a more robust one, we'd need to forward refs or use IDs on spans.
    // Assuming we add IDs to the spans.
    const element = textRef.current?.querySelector(`[data-annotation-id="${id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a temporary highlight flash class if desired
      element.classList.add('ring-2', 'ring-primary', 'ring-offset-1');
      setTimeout(() => element.classList.remove('ring-2', 'ring-primary', 'ring-offset-1'), 2000);
    }
  };

  // Render text with highlights
  const renderText = useMemo(() => {
    if (!content) return null;

    // Sort annotations by start position
    const sortedAnnotations = [...annotations].sort((a, b) => a.position.start - b.position.start);

    const segments = [];
    let lastIndex = 0;

    sortedAnnotations.forEach((annotation) => {
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
        className="whitespace-pre-wrap font-serif text-base leading-7 text-foreground/90 max-w-none relative"
      >
        {segments.map((segment, index) => {
          if (segment.type === 'annotation' && segment.data) {
            const isHighlight = segment.data.type === 'highlight';
            return (
              <span
                key={segment.data.id}
                data-annotation-id={segment.data.id}
                className={cn(
                  "cursor-pointer rounded transition-colors duration-200",
                  isHighlight
                    ? "bg-yellow-200/50 dark:bg-yellow-900/30 hover:bg-yellow-200/70"
                    : "bg-blue-100/50 dark:bg-blue-900/30 border-b-2 border-blue-400/50 hover:bg-blue-100/70"
                )}
                title={segment.data.comment || "Highlight"}
              >
                {segment.text}
              </span>
            );
          }
          return <span key={index}>{segment.text}</span>;
        })}

        {/* Floating Toolbar */}
        {selection && toolbarPosition && (
          <div
            className="absolute z-50 flex items-center gap-1 p-1 bg-slate-900 text-slate-50 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 transform -translate-x-1/2"
            style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
            onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
          >
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAddHighlight}
              className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md"
              title="Highlight"
            >
              <Highlighter className="h-4 w-4" />
            </Button>

            <div className="w-px h-4 bg-slate-700 mx-1" />

            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md"
                  title="Comment"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0 border-none shadow-xl" align="center" sideOffset={8}>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 shadow-xl">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[80px] bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-slate-500 resize-none mb-2"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-slate-400 hover:text-white hover:bg-slate-800"
                      onClick={() => setPopoverOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddComment} className="h-7 bg-indigo-600 hover:bg-indigo-500 text-white">Save</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    );
  }, [content, annotations, selection, toolbarPosition, popoverOpen, commentText]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Document View - Takes up more space now */}
      <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full">
        <Card className="flex-1 overflow-hidden flex flex-col border-none shadow-none bg-transparent">
          <div className="pb-4 px-1">
            <h3 className="text-lg font-semibold tracking-tight">Resume Preview</h3>
            <p className="text-sm text-muted-foreground">Select text to add annotations.</p>
          </div>
          <ScrollArea className="flex-1 rounded-xl border bg-slate-50/50 dark:bg-slate-900/20 shadow-inner">
            <div className="p-8 min-h-full flex justify-center">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
              ) : content ? (
                <div className="w-full max-w-3xl bg-white dark:bg-slate-950 shadow-sm border rounded-sm min-h-[800px] p-12 relative text-foreground">
                  {renderText}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No text content available.
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Annotations Sidebar - Compact and Clean */}
      <div className="lg:col-span-4 xl:col-span-3 flex flex-col h-full border-l pl-6 -ml-6 bg-slate-50/50 dark:bg-slate-900/10">
        <div className="flex items-center justify-between pb-4 px-1 pt-1">
          <h3 className="font-semibold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
            Annotations
            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-xs font-bold">{annotations.length}</span>
          </h3>
        </div>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-3 pb-4">
            {annotations.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-lg border-2 border-dashed border-muted text-muted-foreground/50">
                <HighlightPlaceholder />
                <p className="text-sm font-medium mt-2">No annotations</p>
                <p className="text-xs mt-1">Select text on the resume to start annotating.</p>
              </div>
            ) : (
              annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  onClick={() => scrollToAnnotation(annotation.id)}
                  className="group relative p-3 rounded-lg border bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-6 w-6 mt-0.5 ring-2 ring-background">
                      <AvatarFallback style={{ backgroundColor: annotation.user_color }} className="text-[9px] text-white">
                        {annotation.user_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold truncate">{annotation.user_name}</span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{format(annotation.timestamp, 'MMM d')}</span>
                      </div>

                      <div className="text-xs text-muted-foreground font-mono bg-muted/40 p-1.5 rounded border border-transparent group-hover:bg-muted group-hover:border-border/50 transition-colors mb-1.5 line-clamp-2">
                        "{annotation.text}"
                      </div>

                      {annotation.comment && (
                        <p className="text-sm text-foreground/90 leading-snug">{annotation.comment}</p>
                      )}
                    </div>
                  </div>

                  {annotation.user_id === currentUserId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAnnotation(annotation.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function HighlightPlaceholder() {
  return (
    <svg className="mx-auto h-8 w-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  )
}
