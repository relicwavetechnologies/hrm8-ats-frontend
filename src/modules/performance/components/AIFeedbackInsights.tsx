import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  Brain, 
  AlertTriangle, 
  Lightbulb, 
  FileText, 
  TrendingUp,
  Smile,
  Meh,
  Frown,
  Sparkles
} from 'lucide-react';
import { AIFeedbackAnalysis } from '@/shared/types/aiAnalysis';
import { generateMockAIAnalysis } from '@/shared/lib/mockAIAnalysis';
import { useMemo } from 'react';

interface AIFeedbackInsightsProps {
  feedbackText: string;
  onAnalysisComplete?: (analysis: AIFeedbackAnalysis) => void;
}

export const AIFeedbackInsights = ({ 
  feedbackText,
  onAnalysisComplete 
}: AIFeedbackInsightsProps) => {
  const analysis = useMemo(() => {
    const result = generateMockAIAnalysis(feedbackText);
    onAnalysisComplete?.(result);
    return result;
  }, [feedbackText, onAnalysisComplete]);

  const getSentimentIcon = () => {
    switch (analysis.sentiment.overall) {
      case 'positive': return <Smile className="h-5 w-5 text-green-500" />;
      case 'negative': return <Frown className="h-5 w-5 text-red-500" />;
      case 'mixed': return <Meh className="h-5 w-5 text-yellow-500" />;
      default: return <Meh className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Insights</CardTitle>
          </div>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {Math.round(analysis.confidenceScore * 100)}% Confidence
          </Badge>
        </div>
        <CardDescription>
          Powered by AI analysis - Connect backend to enable real-time processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="bias">
              Bias Detection
              {analysis.biasDetection.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {analysis.biasDetection.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Auto-Generated Summary
              </h4>
              <p className="text-sm text-muted-foreground">{analysis.summary}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Key Points
              </h4>
              <ul className="space-y-2">
                {analysis.keyPoints.map((point, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="bias" className="space-y-3">
            {analysis.biasDetection.length === 0 ? (
              <Alert>
                <AlertDescription className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  No potential bias detected in this feedback.
                </AlertDescription>
              </Alert>
            ) : (
              analysis.biasDetection.map((bias, idx) => (
                <Alert key={idx} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold capitalize">{bias.type} Bias</span>
                      <Badge variant={getSeverityColor(bias.severity)}>
                        {bias.severity}
                      </Badge>
                    </div>
                    <p className="text-sm italic">"{bias.excerpt}"</p>
                    <p className="text-sm">{bias.suggestion}</p>
                  </AlertDescription>
                </Alert>
              ))
            )}
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSentimentIcon()}
                <span className="text-sm font-semibold capitalize">
                  {analysis.sentiment.overall} Sentiment
                </span>
              </div>
              <Badge variant="outline">
                Score: {(analysis.sentiment.score * 100).toFixed(0)}
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Confidence</span>
                  <span>{Math.round(analysis.sentiment.emotions.confidence * 100)}%</span>
                </div>
                <Progress value={analysis.sentiment.emotions.confidence * 100} />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Enthusiasm</span>
                  <span>{Math.round(analysis.sentiment.emotions.enthusiasm * 100)}%</span>
                </div>
                <Progress value={analysis.sentiment.emotions.enthusiasm * 100} />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Concern</span>
                  <span>{Math.round(analysis.sentiment.emotions.concern * 100)}%</span>
                </div>
                <Progress value={analysis.sentiment.emotions.concern * 100} />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Objectivity</span>
                  <span>{Math.round(analysis.sentiment.emotions.objectivity * 100)}%</span>
                </div>
                <Progress value={analysis.sentiment.emotions.objectivity * 100} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-3">
            {analysis.suggestions.map((suggestion, idx) => (
              <Alert key={idx}>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {suggestion.type}
                    </Badge>
                    <span className="font-semibold text-sm">{suggestion.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{suggestion.suggestion}</p>
                </AlertDescription>
              </Alert>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
