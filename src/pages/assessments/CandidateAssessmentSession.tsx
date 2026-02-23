import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { apiClient } from '@/shared/lib/api';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  ClipboardCheck,
  FileQuestion,
  Cloud,
  CloudOff,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface AssessmentQuestion {
  id: string;
  text: string;
  type: string; // 'single-choice' | 'multiple-choice' | 'text-short' | 'text-long' | 'coding'
  points: number;
  timeLimit?: number;
  options?: Array<{ id: string; text: string }>;
  order: number;
}

interface AssessmentData {
  id: string;
  status: string;
  invite_token: string;
  expiry_date?: string;
  started_at?: string;
  assessment_question: AssessmentQuestion[];
  assessment_response?: { question_id: string; response: any }[];
}

export default function CandidateAssessmentSession() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasStarted, setHasStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (value: any) => {
    const qId = questions[currentIndex]?.id;
    if (!qId) return;
    setAnswers((prev) => ({
      ...prev,
      [qId]: value,
    }));
  };

  const toggleFlag = () => {
    const qId = questions[currentIndex]?.id;
    if (!qId) return;
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(qId)) {
        newSet.delete(qId);
      } else {
        newSet.add(qId);
      }
      return newSet;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        responses: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          response: value
        }))
      };

      const res = await apiClient.post(`/api/assessments/${token}/submit`, payload);
      if (res.success) {
        setIsSubmitted(true);
        toast.success("Assessment submitted successfully!");
      } else {
        toast.error("Failed to submit assessment");
        setIsSubmitting(false);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error submitting assessment");
      setIsSubmitting(false);
    }
  };
  // Load Assessment from Token
  useEffect(() => {
    if (!token) return;
    
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<{ assessment: AssessmentData }>(`/api/assessments/${token}`);
        if (response.success && response.data?.assessment) {
          const data = response.data.assessment;
          setAssessment(data);
          
          if (data.status === 'COMPLETED') {
             setIsSubmitted(true);
             setLoading(false);
             return;
          }

          // Parse questions and options
          const parsedQuestions = data.assessment_question.map(q => {
             return {
                ...q,
                text: (q as any).question_text || (q as any).text,
                type: normalizeQuestionType((q as any).question_type || (q as any).type),
                options: normalizeQuestionOptions((q as any).options)
             };
          });
          
          setQuestions(parsedQuestions);
          
          // Calculate total time
          const totalTime = parsedQuestions.reduce(
            (sum, q) => sum + ((q as any).timeLimit || 120),
            0
          );

          // Resume logic: Calculate remaining time
          if (data.started_at) {
             const startTs = new Date(data.started_at).getTime();
             const elapsedSeconds = Math.floor((Date.now() - startTs) / 1000);
             const remaining = totalTime - elapsedSeconds;
             
             if (remaining <= 0) {
                // Auto-submit if time's up during refresh
                setIsSubmitted(true);
                setLoading(false);
                return;
             }
             
             setTimeRemaining(remaining);
             setHasStarted(true); 
             setStartTime(startTs);
             
             // Populate answers
             if (data.assessment_response) {
                const existingAnswers: Record<string, any> = {};
                data.assessment_response.forEach((r: any) => {
                   existingAnswers[r.question_id] = r.response;
                });
                setAnswers(existingAnswers);
             }
          } else {
             setTimeRemaining(totalTime > 0 ? totalTime : 1800);
          }
        } else {
          setError('Assessment not found or invalid token');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load assessment. The link might be expired or invalid.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [token]);

  // Start Assessment Signal
  useEffect(() => {
    if (assessment && hasStarted && !isSubmitted && !assessment.started_at) {
       apiClient.post(`/api/assessments/${token}/start`).catch(console.error);
    }
  }, [assessment, hasStarted, isSubmitted, token]);

  // Auto-Save Effect (Debounced)
  useEffect(() => {
    const qId = questions[currentIndex]?.id;
    const answer = qId ? answers[qId] : undefined;
    
    if (!hasStarted || isSubmitted || !qId || answer === undefined) return;

    setSaveStatus('saving');
    const timeoutId = setTimeout(async () => {
      try {
        const res = await apiClient.post(`/api/assessments/${token}/save`, {
          questionId: qId,
          response: answer
        });
        if (res.success) {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(p => p === 'saved' ? 'idle' : p), 2000);
        } else {
          setSaveStatus('error');
        }
      } catch (e) {
        setSaveStatus('error');
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [answers, currentIndex, questions, hasStarted, isSubmitted, token]);

  const handleStart = () => {
    setHasStarted(true);
    setStartTime(Date.now());
  };

  // Timer countdown
  useEffect(() => {
    if (loading || isSubmitted || timeRemaining <= 0 || !assessment) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isSubmitted, timeRemaining, assessment]);

  const currentQuestion = questions[currentIndex];
  // Safe progress
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Helper functions moved to top of component

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="p-8 text-center max-w-lg w-full">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Assessment Submitted</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for completing the assessment. Your responses have been recorded.
            Our team will review them shortly.
          </p>
          <div className="p-4 bg-muted rounded-lg mb-6">
             <p className="text-sm font-medium">You can close this window now.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <ClipboardCheck className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Ready to Start?</h1>
            <p className="text-muted-foreground">
              You are invited to complete this assessment. Please read the instructions below before starting.
            </p>
          </div>
          
          <div className="space-y-4 mb-8">
             <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                   <p className="font-semibold text-sm text-foreground">Time Limit</p>
                   <p className="text-xs text-muted-foreground">This assessment has a time limit of {formatTime(timeRemaining)}. Once you start, the timer cannot be paused.</p>
                </div>
             </div>
             <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <FileQuestion className="h-5 w-5 text-primary mt-0.5" />
                <div>
                   <p className="font-semibold text-sm text-foreground">Questions</p>
                   <p className="text-xs text-muted-foreground">There are {questions.length} questions in total. You can navigate between them and flag those you want to review later.</p>
                </div>
             </div>
          </div>

          <Button className="w-full h-12 text-lg" onClick={handleStart}>
            Start Assessment
          </Button>
        </Card>
      </div>
    );
  }
  
  // Safe check for current question
  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="text-base font-semibold flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <div>
                <h1 className="text-lg font-semibold">Assessment</h1>
                <p className="text-sm text-muted-foreground">
                  Question {currentIndex + 1} of {questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {saveStatus !== 'idle' && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
                  {saveStatus === 'saving' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : saveStatus === 'saved' ? (
                    <Cloud className="h-3 w-3 text-success" />
                  ) : (
                    <CloudOff className="h-3 w-3 text-destructive" />
                  )}
                  <span className="hidden sm:inline">
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save Error'}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className={cn(
                  "font-mono font-semibold",
                  timeRemaining < 300 && "text-destructive"
                )}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-2 mt-4" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">Question {currentIndex + 1}</Badge>
                <Badge>{currentQuestion.points} points</Badge>
                {currentQuestion.timeLimit && (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {Math.floor(currentQuestion.timeLimit / 60)} min
                  </Badge>
                )}
              </div>
              <h2 className="text-xl font-semibold mb-2 whitespace-pre-wrap">{currentQuestion.text}</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFlag}
              className={cn(
                flaggedQuestions.has(currentQuestion.id) && "text-warning"
              )}
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>

          {/* Question Input */}
          <div className="space-y-4">
            {currentQuestion.type === 'single-choice' && (
              <RadioGroup
                value={answers[currentQuestion.id]}
                onValueChange={handleAnswer}
              >
                {(currentQuestion.options || []).map((option: any) => (
                  <div key={option.id} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'multiple-choice' && (
              <div className="space-y-2">
                {(currentQuestion.options || []).map((option: any) => (
                  <div key={option.id} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent">
                    <Checkbox
                      id={option.id}
                      checked={(answers[currentQuestion.id] || []).includes(option.id)}
                      onCheckedChange={(checked) => {
                        const current = answers[currentQuestion.id] || [];
                        handleAnswer(
                          checked
                            ? [...current, option.id]
                            : current.filter((id: string) => id !== option.id)
                        );
                      }}
                    />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.type === 'true-false' && (
              <RadioGroup
                value={answers[currentQuestion.id]}
                onValueChange={handleAnswer}
              >
                {(currentQuestion.options || []).map((option: any) => (
                  <div key={option.id} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'text-short' && (
              <Input
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="text-base"
              />
            )}

            {currentQuestion.type === 'text-long' && (
              <Textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer..."
                rows={6}
                className="text-base"
              />
            )}
            
            {currentQuestion.type === 'coding' && (
               <Textarea
                 value={answers[currentQuestion.id] || ''}
                 onChange={(e) => handleAnswer(e.target.value)}
                 placeholder="Write your code here..."
                 rows={15}
                 className="font-mono text-sm"
               />
            )}

            {!['single-choice', 'multiple-choice', 'true-false', 'text-short', 'text-long', 'coding'].includes(currentQuestion.type) && (
              <Textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer..."
                rows={6}
                className="text-base"
              />
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0 || isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            {Object.keys(answers).length} of {questions.length} answered
          </div>
          {currentIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Assessment
              {!isSubmitting && <CheckCircle2 className="h-4 w-4 ml-2" />}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={isSubmitting}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
  const normalizeQuestionType = (rawType: unknown): string => {
    const normalized = String(rawType || '').trim().toUpperCase().replace(/-/g, '_');
    if (normalized === 'MULTIPLE_CHOICE' || normalized === 'SINGLE_CHOICE' || normalized === 'SINGLE_SELECT') return 'single-choice';
    if (normalized === 'MULTIPLE_SELECT') return 'multiple-choice';
    if (normalized === 'LONG_ANSWER') return 'text-long';
    if (normalized === 'SHORT_ANSWER') return 'text-short';
    if (normalized === 'CODE') return 'coding';
    if (normalized === 'TRUE_FALSE') return 'true-false';
    return 'text-short';
  };

  const normalizeQuestionOptions = (rawOptions: unknown): Array<{ id: string; text: string }> => {
    const toOptionList = (arr: unknown[]): Array<{ id: string; text: string }> =>
      arr
        .map((item, idx) => {
          if (item && typeof item === 'object') {
            const obj = item as any;
            const id = String(obj.id ?? obj.value ?? `opt-${idx}`);
            const text = String(obj.text ?? obj.label ?? obj.value ?? '').trim();
            return text ? { id, text } : null;
          }
          const text = String(item ?? '').trim();
          return text ? { id: `opt-${idx}`, text } : null;
        })
        .filter((opt): opt is { id: string; text: string } => Boolean(opt));

    if (Array.isArray(rawOptions)) return toOptionList(rawOptions);

    if (rawOptions && typeof rawOptions === 'object') {
      const nested = (rawOptions as any).options;
      if (Array.isArray(nested)) return toOptionList(nested);
      return [];
    }

    if (typeof rawOptions === 'string') {
      const trimmed = rawOptions.trim();
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return toOptionList(parsed);
      } catch {
        // continue to CSV fallback
      }
      return toOptionList(trimmed.split(',').map((part) => part.trim()).filter(Boolean));
    }

    return [];
  };
