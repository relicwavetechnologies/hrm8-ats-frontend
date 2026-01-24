import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import type { InterviewAnalysis } from '@/shared/types/aiInterview';
import { MessageSquare, Sparkles } from 'lucide-react';

interface AIInterviewAnalysisProps {
  analysis: InterviewAnalysis;
}

export function AIInterviewAnalysis({ analysis }: AIInterviewAnalysisProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {analysis.summary}
          </p>
        </CardContent>
      </Card>

      {analysis.keyHighlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Key Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.keyHighlights.map((highlight, idx) => (
              <div
                key={idx}
                className="p-4 bg-secondary/30 rounded-lg space-y-2"
              >
                <div className="flex items-start gap-2">
                  <Badge
                    variant={
                      highlight.sentiment === 'positive'
                        ? 'default'
                        : highlight.sentiment === 'negative'
                        ? 'destructive'
                        : 'outline'
                    }
                    className="mt-1"
                  >
                    {highlight.sentiment}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm italic text-muted-foreground mb-1">
                      "{highlight.quote}"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {highlight.context}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
