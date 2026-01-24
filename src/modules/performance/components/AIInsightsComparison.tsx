import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { TeamMemberFeedback } from '@/shared/types/collaborativeFeedback';
import { AIFeedbackAnalysis } from '@/shared/types/aiAnalysis';
import { generateMockAIAnalysis } from '@/shared/lib/mockAIAnalysis';
import { Smile, Meh, Frown, AlertTriangle, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

interface AIInsightsComparisonProps {
  feedbacks: TeamMemberFeedback[];
}

export const AIInsightsComparison = ({ feedbacks }: AIInsightsComparisonProps) => {
  const analyses = useMemo(() => 
    feedbacks.map(fb => ({
      feedback: fb,
      analysis: generateMockAIAnalysis(
        fb.comments.map(c => `[${c.type.toUpperCase()}] ${c.content}`).join('\n\n')
      ),
    })),
    [feedbacks]
  );

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <Smile className="h-4 w-4 text-green-500" />;
      case 'negative': return <Frown className="h-4 w-4 text-red-500" />;
      case 'mixed': return <Meh className="h-4 w-4 text-yellow-500" />;
      default: return <Meh className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const averageSentiment = analyses.reduce((acc, a) => acc + a.analysis.sentiment.score, 0) / analyses.length;
  const totalBiases = analyses.reduce((acc, a) => acc + a.analysis.biasDetection.length, 0);
  const averageConfidence = analyses.reduce((acc, a) => acc + a.analysis.confidenceScore, 0) / analyses.length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Team-Wide Insights Overview</CardTitle>
          <CardDescription>Aggregate AI analysis across all feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Avg Sentiment</div>
              <div className="text-2xl font-bold">
                {(averageSentiment * 100).toFixed(0)}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Potential Biases</div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {totalBiases}
                {totalBiases > 0 && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
              <div className="text-2xl font-bold">
                {(averageConfidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Individual Comparisons</CardTitle>
          <CardDescription>Side-by-side AI analysis for each team member</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {analyses.map(({ feedback, analysis }) => (
                <Card key={feedback.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {feedback.reviewerName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{feedback.reviewerName}</div>
                          <div className="text-sm text-muted-foreground">{feedback.reviewerRole}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(analysis.sentiment.overall)}
                        <Badge variant="outline">
                          {(analysis.sentiment.score * 100).toFixed(0)}% sentiment
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Sentiment Breakdown</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Confidence:</span>
                            <span>{Math.round(analysis.sentiment.emotions.confidence * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Enthusiasm:</span>
                            <span>{Math.round(analysis.sentiment.emotions.enthusiasm * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Objectivity:</span>
                            <span>{Math.round(analysis.sentiment.emotions.objectivity * 100)}%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Bias Detection</h4>
                        {analysis.biasDetection.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No biases detected</p>
                        ) : (
                          <div className="space-y-1">
                            {analysis.biasDetection.map((bias, idx) => (
                              <Badge key={idx} variant="destructive" className="mr-1">
                                {bias.type} - {bias.severity}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Key Points
                      </h4>
                      <ul className="space-y-1">
                        {analysis.keyPoints.slice(0, 3).map((point, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {analysis.suggestions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Top Suggestion</h4>
                        <p className="text-sm text-muted-foreground">
                          {analysis.suggestions[0].suggestion}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
