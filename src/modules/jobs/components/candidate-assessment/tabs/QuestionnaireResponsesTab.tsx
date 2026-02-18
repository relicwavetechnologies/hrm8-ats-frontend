import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { jobService } from '@/modules/jobs/lib/jobService';
import { Loader2 } from 'lucide-react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/shared/components/ui/resizable";
import { NotesTab } from './NotesTab';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  FileText,
  Target,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import type { Application } from '@/shared/types/application';
import { cn } from '@/shared/lib/utils';

interface QuestionnaireResponsesTabProps {
  application: Application;
  jobId?: string;
}

export function QuestionnaireResponsesTab({ application, jobId }: QuestionnaireResponsesTabProps) {
  const { questionnaireData, customAnswers } = application;
  const [questions, setQuestions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchQuestions = async () => {
      if (!jobId) return;
      setLoading(true);
      try {
        const response = await jobService.getApplicationForm(jobId);
        if (response.success && response.data?.form?.questions) {
          setQuestions(response.data.form.questions);
        }
      } catch (error) {
        console.error('Failed to fetch application form questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Helper to find answer for a question
  const getAnswerForQuestion = (questionId: string) => {
    // Check in questionnaireData first (if populated)
    if (questionnaireData?.responses) {
      const response = questionnaireData.responses.find((r: any) => r.questionId === questionId);
      if (response) return response;
    }

    // Fallback to customAnswers
    if (customAnswers && Array.isArray(customAnswers)) {
      const answer = customAnswers.find((a: any) => a.questionId === questionId);
      if (answer) return { answer: answer.answer };
    }

    // Check if customAnswers is an object (legacy format maybe?)
    if (customAnswers && typeof customAnswers === 'object' && !Array.isArray(customAnswers)) {
      return { answer: customAnswers[questionId] };
    }

    return null;
  };

  if ((!questionnaireData || questionnaireData.responses.length === 0) && (!questions || questions.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center h-full">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Questionnaire Data</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          This application does not include questionnaire responses.
        </p>
      </div>
    );
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="h-[calc(100vh-14rem)]">
      <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
        {/* Questionnaire Panel (60%) */}
        <ResizablePanel defaultSize={60} minSize={30}>
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {/* Summary Section (Only show if we have scored data) */}
              {questionnaireData?.overallScore !== undefined && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Overall Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-2">
                        <span className={cn("text-3xl font-bold", getScoreColor(questionnaireData.overallScore || 0))}>
                          {questionnaireData.overallScore || 0}
                        </span>
                        <span className="text-sm text-muted-foreground mb-1">/100</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getScoreLabel(questionnaireData.overallScore || 0)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Completion Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold">
                          {questionnaireData.completionRate}%
                        </span>
                      </div>
                      <Progress value={questionnaireData.completionRate} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Time Spent
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold">
                          {questionnaireData.timeSpent || 0}
                        </span>
                        <span className="text-sm text-muted-foreground mb-1">min</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Average: {Math.round((questionnaireData.timeSpent || 0) / (questions.length || 1))} min/question
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Responses Section */}
              <div className="space-y-4">
                {questions.length > 0 ? (
                  questions.map((question, index) => {
                    const response = getAnswerForQuestion(question.id);
                    // Use response data if available, otherwise fallback to basic question info
                    const hasAnalysis = response && response.aiAnalysis;

                    return (
                      <Card key={question.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/30">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  Q{index + 1}
                                </Badge>
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {question.type.replace('_', ' ')}
                                </Badge>
                              </div>
                              <CardTitle className="text-base font-semibold">
                                {question.label}
                              </CardTitle>
                            </div>
                            {hasAnalysis && (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Star className={cn("h-4 w-4", getScoreColor(response.aiAnalysis.qualityScore))} />
                                  <span className={cn("text-sm font-semibold", getScoreColor(response.aiAnalysis.qualityScore))}>
                                    {response.aiAnalysis.qualityScore}
                                  </span>
                                </div>
                                <Badge variant="outline" className={cn("border", getSentimentColor(response.aiAnalysis.sentiment))}>
                                  <span className="flex items-center gap-1">
                                    {getSentimentIcon(response.aiAnalysis.sentiment)}
                                    <span className="capitalize text-xs">{response.aiAnalysis.sentiment}</span>
                                  </span>
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          {/* Candidate's Answer */}
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Candidate's Response
                            </h4>
                            <div className="bg-muted/50 rounded-lg p-4">
                              <p className="text-sm whitespace-pre-wrap">
                                {response ? (typeof response.answer === 'string' ? response.answer : JSON.stringify(response.answer)) : <span className="text-muted-foreground italic">No response provided</span>}
                              </p>
                            </div>
                          </div>

                          {/* AI Analysis (Existing Logic) */}
                          {hasAnalysis && (
                            <div className="space-y-4">
                              <Separator />

                              {/* Key Insights */}
                              {response.aiAnalysis.keyInsights && response.aiAnalysis.keyInsights.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 text-primary" />
                                    Key Insights
                                  </h4>
                                  <ul className="space-y-1.5">
                                    {response.aiAnalysis.keyInsights.map((insight: string, idx: number) => (
                                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span>{insight}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Strengths */}
                              {response.aiAnalysis.strengths && response.aiAnalysis.strengths.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-green-600">
                                    <TrendingUp className="h-4 w-4" />
                                    Strengths
                                  </h4>
                                  <ul className="space-y-1.5">
                                    {response.aiAnalysis.strengths.map((strength: string, idx: number) => (
                                      <li key={idx} className="text-sm flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">✓</span>
                                        <span>{strength}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Concerns */}
                              {response.aiAnalysis.concerns && response.aiAnalysis.concerns.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-amber-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    Areas of Concern
                                  </h4>
                                  <ul className="space-y-1.5">
                                    {response.aiAnalysis.concerns.map((concern: string, idx: number) => (
                                      <li key={idx} className="text-sm flex items-start gap-2">
                                        <span className="text-amber-600 mt-0.5">!</span>
                                        <span>{concern}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  // Fallback to existing display if no questions fetched but we have questionnaireData
                  questionnaireData?.responses?.map((response: any, index: number) => (
                    <Card key={response.questionId} className="overflow-hidden">
                      {/* ... (Keep existing rendering logic for fallback if needed, or simply render nothing) ... */}
                      <CardHeader className="bg-muted/30">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                Q{index + 1}
                              </Badge>
                              <Badge variant="secondary" className="text-xs capitalize">
                                {response.type.replace('-', ' ')}
                              </Badge>
                            </div>
                            <CardTitle className="text-base font-semibold">
                              {response.question}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Candidate's Response
                          </h4>
                          <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-sm whitespace-pre-wrap">{response.answer}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Notes Panel (40%) */}
        <ResizablePanel defaultSize={40} minSize={20}>
          <div className="h-full flex flex-col p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Notes
              </h3>
              <p className="text-sm text-muted-foreground">Add notes while reviewing the questionnaire.</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <NotesTab application={application} />
              </ScrollArea>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
