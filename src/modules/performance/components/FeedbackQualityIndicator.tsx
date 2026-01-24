import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { FeedbackQualityScore } from '@/shared/lib/mockFeedbackQuality';

interface FeedbackQualityIndicatorProps {
  quality: FeedbackQualityScore;
  compact?: boolean;
}

export const FeedbackQualityIndicator = ({ quality, compact }: FeedbackQualityIndicatorProps) => {
  const getQualityColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium">Quality:</div>
        <Badge variant={quality.overall >= 70 ? 'default' : 'secondary'}>
          {quality.overall}%
        </Badge>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Feedback Quality Score</CardTitle>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{quality.overall}</div>
            <Badge variant={quality.overall >= 70 ? 'default' : 'secondary'}>
              {getQualityLabel(quality.overall)}
            </Badge>
          </div>
        </div>
        <CardDescription>AI-powered assessment of feedback completeness and usefulness</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {Object.entries(quality.dimensions).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{key}</span>
                <span className="font-medium">{value}%</span>
              </div>
              <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 ${getQualityColor(value)} transition-all`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {quality.strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Strengths
            </h4>
            <ul className="space-y-1">
              {quality.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {quality.suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Suggestions for Improvement
            </h4>
            <ul className="space-y-1">
              {quality.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-yellow-500">→</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
