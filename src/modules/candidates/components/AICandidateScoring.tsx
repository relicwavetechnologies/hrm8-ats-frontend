import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Slider } from "@/shared/components/ui/slider";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Loader2,
} from "lucide-react";
import {
  scoreCandidateWithAI,
  getRecommendationColor,
  getRecommendationLabel,
  getScoreColor,
  CandidateScoringResult,
} from "@/shared/lib/candidateScoringService";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/lib/utils";

interface AICandidateScoringProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  candidateData?: {
    resume?: string;
    experience?: string;
    skills?: string[];
    education?: string;
    interviewFeedback?: string;
  };
  jobData: {
    title: string;
    requirements: string;
    description: string;
  };
}

export function AICandidateScoring({
  open,
  onOpenChange,
  candidateName,
  candidateData,
  jobData,
}: AICandidateScoringProps) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scoringResult, setScoringResult] = useState<CandidateScoringResult | null>(null);
  const [weights, setWeights] = useState({
    skills: 30,
    experience: 25,
    education: 15,
    interview: 20,
    culture: 10,
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setScoringResult(null);

    try {
      const result = await scoreCandidateWithAI({
        candidateName,
        resume: candidateData?.resume,
        experience: candidateData?.experience,
        skills: candidateData?.skills,
        education: candidateData?.education,
        jobRequirements: jobData.requirements,
        jobDescription: jobData.description,
        interviewFeedback: candidateData?.interviewFeedback,
        weights,
      });

      setScoringResult(result);
      toast({
        title: "Analysis Complete",
        description: `AI scoring completed for ${candidateName}`,
      });
    } catch (error) {
      console.error('Scoring error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze candidate",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Candidate Scoring
          </DialogTitle>
          <DialogDescription>
            Comprehensive AI-powered analysis for {candidateName} - {jobData.title}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="weights" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weights">Scoring Weights</TabsTrigger>
            <TabsTrigger value="results" disabled={!scoringResult}>
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customize Scoring Criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Skills Match</Label>
                      <span className="text-sm font-medium">{weights.skills}%</span>
                    </div>
                    <Slider
                      value={[weights.skills]}
                      onValueChange={(v) => setWeights({ ...weights, skills: v[0] })}
                      max={50}
                      step={5}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Experience</Label>
                      <span className="text-sm font-medium">{weights.experience}%</span>
                    </div>
                    <Slider
                      value={[weights.experience]}
                      onValueChange={(v) => setWeights({ ...weights, experience: v[0] })}
                      max={50}
                      step={5}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Education</Label>
                      <span className="text-sm font-medium">{weights.education}%</span>
                    </div>
                    <Slider
                      value={[weights.education]}
                      onValueChange={(v) => setWeights({ ...weights, education: v[0] })}
                      max={50}
                      step={5}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Interview Performance</Label>
                      <span className="text-sm font-medium">{weights.interview}%</span>
                    </div>
                    <Slider
                      value={[weights.interview]}
                      onValueChange={(v) => setWeights({ ...weights, interview: v[0] })}
                      max={50}
                      step={5}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Cultural Fit</Label>
                      <span className="text-sm font-medium">{weights.culture}%</span>
                    </div>
                    <Slider
                      value={[weights.culture]}
                      onValueChange={(v) => setWeights({ ...weights, culture: v[0] })}
                      max={50}
                      step={5}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Total Weight:</span>
                    <span className={cn(
                      "font-semibold",
                      Object.values(weights).reduce((a, b) => a + b, 0) === 100
                        ? "text-green-600"
                        : "text-orange-600"
                    )}>
                      {Object.values(weights).reduce((a, b) => a + b, 0)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || Object.values(weights).reduce((a, b) => a + b, 0) !== 100}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Candidate
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {scoringResult && (
              <>
                {/* Overall Score & Recommendation */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                        <div className="flex items-baseline gap-2">
                          <span className={cn("text-4xl font-bold", getScoreColor(scoringResult.scores.overall))}>
                            {scoringResult.scores.overall}
                          </span>
                          <span className="text-muted-foreground">/100</span>
                        </div>
                      </div>
                      <Badge
                        className={cn("text-sm px-3 py-1", getRecommendationColor(scoringResult.recommendation))}
                      >
                        {getRecommendationLabel(scoringResult.recommendation)}
                      </Badge>
                    </div>
                    <Progress value={scoringResult.scores.overall} className="h-2" />
                  </CardContent>
                </Card>

                {/* Individual Scores */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Detailed Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(scoringResult.scores)
                      .filter(([key]) => key !== 'overall')
                      .map(([key, score]) => (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm capitalize">{key}</span>
                            <span className={cn("font-semibold", getScoreColor(score))}>
                              {score}
                            </span>
                          </div>
                          <Progress value={score} className="h-1.5" />
                        </div>
                      ))}
                  </CardContent>
                </Card>

                {/* Strengths */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {scoringResult.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Concerns */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="h-4 w-4" />
                      Concerns & Gaps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {scoringResult.concerns.map((concern, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-orange-600 mt-0.5">!</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Justification */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Recommendation Justification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{scoringResult.justification}</p>
                  </CardContent>
                </Card>

                {/* Improvement Areas */}
                {scoringResult.improvementAreas.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Areas for Exploration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {scoringResult.improvementAreas.map((area, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
