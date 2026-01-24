import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Bot, User } from 'lucide-react';
import type { TranscriptEntry } from '@/shared/types/aiInterview';
import { format } from 'date-fns';

interface LiveTranscriptProps {
  transcript: TranscriptEntry[];
}

export function LiveTranscript({ transcript }: LiveTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Live Transcript</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]" ref={scrollRef}>
          <div className="space-y-4 pr-4">
            {transcript.map((entry) => (
              <div
                key={entry.id}
                className={`flex gap-3 ${
                  entry.speaker === 'candidate' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      entry.speaker === 'ai'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {entry.speaker === 'ai' ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <div
                  className={`flex-1 space-y-1 ${
                    entry.speaker === 'candidate' ? 'text-right' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.timestamp), 'h:mm:ss a')}
                    </span>
                    {entry.duration && (
                      <span className="text-xs text-muted-foreground">
                        ({entry.duration}s)
                      </span>
                    )}
                  </div>
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      entry.speaker === 'ai'
                        ? 'bg-primary/5 text-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{entry.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {transcript.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Transcript will appear here as the interview progresses</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
