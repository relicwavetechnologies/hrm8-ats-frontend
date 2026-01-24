import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { AlertTriangle, CheckCircle2, TrendingUp, Users, Clock, Target, Brain, Shield } from 'lucide-react';
import { AssessmentPrediction } from '@/shared/types/assessmentPrediction';
import {
  getPredictionColor,
  getPredictionBgColor,
  getRiskColor,
  getConfidenceColor,
} from '@/shared/lib/assessments/predictionService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

interface AssessmentPredictionCardProps {
  prediction: AssessmentPrediction;
}

export function AssessmentPredictionCard({ prediction }: AssessmentPredictionCardProps) {
  const likelihoodLabels = {
    'very-likely': 'Very Likely to Succeed',
    'likely': 'Likely to Succeed',
    'neutral': 'Uncertain Outcome',
    'unlikely': 'Unlikely to Succeed',
    'very-unlikely': 'Very Unlikely to Succeed',
  };

  const confidenceLabels = {
    'very-high': 'Very High',
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low',
    'very-low': 'Very Low',
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <div className="p-12 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-semibold">AI Success Prediction</h3>
                <p className="text-sm text-muted-foreground">
                  Based on {prediction.dataQuality.sampleSize} similar candidates
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="outline" className={getConfidenceColor(prediction.predictionConfidence)}>
              {confidenceLabels[prediction.predictionConfidence]} Confidence
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {prediction.confidenceScore}% confidence score
            </p>
          </div>
        </div>

        {/* Overall Prediction */}
        <div className={`rounded-lg p-4 ${getPredictionBgColor(prediction.overallSuccessLikelihood)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className={`h-5 w-5 ${getPredictionColor(prediction.overallSuccessLikelihood)}`} />
              <span className={`text-lg font-semibold ${getPredictionColor(prediction.overallSuccessLikelihood)}`}>
                {likelihoodLabels[prediction.overallSuccessLikelihood]}
              </span>
            </div>
            <span className="text-2xl font-bold">
              {prediction.metrics.hiringSuccessRate.toFixed(0)}%
            </span>
          </div>
          <Progress value={prediction.metrics.hiringSuccessRate} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Predicted hiring success rate based on historical performance data
          </p>
        </div>

        {/* Key Metrics */}
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
            <TabsTrigger value="indicators">Indicators</TabsTrigger>
            <TabsTrigger value="risks">Risk Factors</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Retention Probability</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{prediction.metrics.retentionProbability.toFixed(0)}%</span>
                  <span className="text-sm text-muted-foreground">
                    ~{prediction.historicalPattern.averageRetention} months
                  </span>
                </div>
                <Progress value={prediction.metrics.retentionProbability} className="h-1 mt-2" />
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Expected Performance</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{prediction.metrics.expectedPerformanceRating}</span>
                  <span className="text-sm text-muted-foreground">/ 5.0</span>
                </div>
                <Progress value={prediction.metrics.expectedPerformanceRating * 20} className="h-1 mt-2" />
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Time to Productivity</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{prediction.metrics.timeToProductivity}</span>
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Estimated time to reach full productivity
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Cultural Fit Score</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{prediction.metrics.culturalFitScore}</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
                <Progress value={prediction.metrics.culturalFitScore} className="h-1 mt-2" />
              </div>
            </div>

            {/* Comparison to Average */}
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <h4 className="text-sm font-semibold mb-3">Performance vs. Average Candidate</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Candidate Score</span>
                <span className="text-lg font-bold">{prediction.comparisonToAverage.candidateScore}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Average Score</span>
                <span className="text-sm">{prediction.comparisonToAverage.averageScore}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded bg-primary/10 text-primary">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Better than {prediction.comparisonToAverage.betterThan}% of candidates
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="indicators" className="space-y-3 mt-4">
            {prediction.successIndicators.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No significant success indicators identified
              </p>
            ) : (
              prediction.successIndicators.map((indicator) => (
                <div
                  key={indicator.id}
                  className="rounded-lg border border-border bg-green-50/50 dark:bg-green-950/20 p-4"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{indicator.description}</span>
                        <Badge variant="outline" className={getConfidenceColor(indicator.confidence)}>
                          {confidenceLabels[indicator.confidence]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{indicator.supportingData}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="risks" className="space-y-3 mt-4">
            {prediction.riskFactors.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-sm font-medium">No significant risk factors identified</p>
                <p className="text-xs text-muted-foreground">This candidate shows strong potential</p>
              </div>
            ) : (
              prediction.riskFactors.map((risk) => (
                <div
                  key={risk.id}
                  className="rounded-lg border border-border bg-orange-50/50 dark:bg-orange-950/20 p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${getRiskColor(risk.severity)}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{risk.description}</span>
                        <Badge variant="outline" className={getRiskColor(risk.severity)}>
                          {risk.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Impact:</strong> {risk.impact}
                      </p>
                      {risk.mitigation && (
                        <p className="text-sm text-primary">
                          <strong>Mitigation:</strong> {risk.mitigation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Recommendations */}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recommended Actions
          </h4>
          <ul className="space-y-2">
            {prediction.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Data Quality Info */}
        <div className="text-xs text-muted-foreground border-t border-border pt-4">
          <p>
            Prediction based on {prediction.dataQuality.sampleSize} similar candidates from {prediction.dataQuality.dataRecency}.
            Generated on {new Date(prediction.predictedAt).toLocaleDateString()}.
          </p>
        </div>
      </div>
    </Card>
  );
}
