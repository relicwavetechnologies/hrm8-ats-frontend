import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import type { InterviewAnalysis } from '@/shared/types/aiInterview';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface InterviewScorecardProps {
  analysis: InterviewAnalysis;
}

const CATEGORY_LABELS = {
  technical: 'Technical Skills',
  communication: 'Communication',
  culturalFit: 'Cultural Fit',
  experience: 'Experience',
  problemSolving: 'Problem Solving'
};

function getScoreColor(score: number): string {
  if (score >= 85) return 'text-green-600 dark:text-green-400';
  if (score >= 70) return 'text-blue-600 dark:text-blue-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

function getRecommendationBadge(recommendation: InterviewAnalysis['recommendation']) {
  const config = {
    'strongly-recommend': { label: 'Strongly Recommend', variant: 'default' as const, icon: TrendingUp },
    'recommend': { label: 'Recommend', variant: 'secondary' as const, icon: TrendingUp },
    'maybe': { label: 'Maybe', variant: 'outline' as const, icon: Minus },
    'not-recommend': { label: 'Not Recommend', variant: 'destructive' as const, icon: TrendingDown }
  };
  
  const { label, variant, icon: Icon } = config[recommendation];
  
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

export function InterviewScorecard({ analysis }: InterviewScorecardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Interview Scorecard</CardTitle>
          {getRecommendationBadge(analysis.recommendation)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Overall Score</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}
              </span>
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Confidence:</span>
              <span className="font-medium">{analysis.confidenceScore}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Category Scores</h4>
          {Object.entries(analysis.categoryScores).map(([category, score]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                </span>
                <span className={`font-semibold ${getScoreColor(score)}`}>
                  {score}
                </span>
              </div>
              <Progress value={score} className="h-2" />
            </div>
          ))}
        </div>

        {analysis.strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Strengths
            </h4>
            <ul className="space-y-1 text-sm">
              {analysis.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.concerns.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-yellow-600" />
              Areas of Concern
            </h4>
            <ul className="space-y-1 text-sm">
              {analysis.concerns.map((concern, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">⚠</span>
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.redFlags.length > 0 && (
          <div className="space-y-2 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <h4 className="font-semibold text-sm flex items-center gap-2 text-destructive">
              <TrendingDown className="h-4 w-4" />
              Red Flags
            </h4>
            <ul className="space-y-1 text-sm">
              {analysis.redFlags.map((flag, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">🚩</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
