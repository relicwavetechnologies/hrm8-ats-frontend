import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
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
import { QuestionBankItem } from '@/shared/types/questionBank';
import { getQuestionBankItems } from '@/shared/lib/assessments/mockQuestionBankStorage';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export default function AssessmentPreview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const questionIds = searchParams.get('questions')?.split(',') || [];
  
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [startTime] = useState(Date.now());

  // Load questions
  useEffect(() => {
    const allQuestions = getQuestionBankItems();
    const selectedQuestions = allQuestions.filter((q) =>
      questionIds.includes(q.id)
    );
    setQuestions(selectedQuestions);
    
    // Calculate total time
    const totalTime = selectedQuestions.reduce(
      (sum, q) => sum + (q.timeLimit || 120),
      0
    );
    setTimeRemaining(totalTime);
  }, [questionIds]);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || timeRemaining <= 0) return;

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
  }, [isSubmitted, timeRemaining]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
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

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const calculateScore = useMemo(() => {
    if (!isSubmitted) return null;

    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((q) => {
      totalPoints += q.points;
      const answer = answers[q.id];

      if (!answer) return;

      if (q.type === 'single-choice') {
        const correct = q.options?.find((opt) => opt.isCorrect);
        if (answer === correct?.id) {
          earnedPoints += q.points;
        }
      } else if (q.type === 'multiple-choice') {
        const correctIds = q.options?.filter((opt) => opt.isCorrect).map((opt) => opt.id) || [];
        const selectedIds = answer as string[];
        const allCorrect = correctIds.every((id) => selectedIds.includes(id)) &&
          selectedIds.every((id) => correctIds.includes(id));
        if (allCorrect) {
          earnedPoints += q.points;
        }
      } else if (q.type === 'true-false') {
        const correct = q.options?.find((opt) => opt.isCorrect);
        if (answer === correct?.id) {
          earnedPoints += q.points;
        }
      }
    });

    return {
      totalPoints,
      earnedPoints,
      percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0,
      timeTaken: Math.floor((Date.now() - startTime) / 1000),
    };
  }, [isSubmitted, answers, questions, startTime]);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Questions Selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select questions from the question bank to preview.
          </p>
          <Button onClick={() => navigate('/question-bank')}>
            Go to Question Bank
          </Button>
        </Card>
      </div>
    );
  }

  if (isSubmitted && calculateScore) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Assessment Complete!</h1>
              <p className="text-muted-foreground">
                Here's how you performed in this preview
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {calculateScore.percentage}%
                </div>
                <div className="text-sm text-muted-foreground">Score</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {calculateScore.earnedPoints}/{calculateScore.totalPoints}
                </div>
                <div className="text-sm text-muted-foreground">Points</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {questions.length}
                </div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {formatTime(calculateScore.timeTaken)}
                </div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
              </Card>
            </div>

            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold">Question Review</h2>
              {questions.map((q, index) => {
                const answer = answers[q.id];
                const isAnswered = answer !== undefined && answer !== null && answer !== '';
                
                let isCorrect = false;
                if (q.type === 'single-choice' || q.type === 'true-false') {
                  const correct = q.options?.find((opt) => opt.isCorrect);
                  isCorrect = answer === correct?.id;
                } else if (q.type === 'multiple-choice') {
                  const correctIds = q.options?.filter((opt) => opt.isCorrect).map((opt) => opt.id) || [];
                  const selectedIds = answer as string[];
                  isCorrect = selectedIds && correctIds.every((id) => selectedIds.includes(id)) &&
                    selectedIds.every((id) => correctIds.includes(id));
                }

                return (
                  <Card key={q.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Question {index + 1}</Badge>
                          <Badge variant="secondary">{q.points} points</Badge>
                          {(q.type === 'single-choice' || q.type === 'multiple-choice' || q.type === 'true-false') && (
                            isAnswered ? (
                              isCorrect ? (
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              ) : (
                                <XCircle className="h-4 w-4 text-destructive" />
                              )
                            ) : (
                              <AlertCircle className="h-4 w-4 text-warning" />
                            )
                          )}
                        </div>
                        <p className="font-medium">{q.text}</p>
                      </div>
                    </div>
                    {!isAnswered && (
                      <p className="text-sm text-muted-foreground">Not answered</p>
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-4">
              <Button onClick={() => navigate('/question-bank')} className="flex-1">
                Back to Question Bank
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false);
                  setAnswers({});
                  setCurrentIndex(0);
                  setFlaggedQuestions(new Set());
                  const totalTime = questions.reduce(
                    (sum, q) => sum + (q.timeLimit || 120),
                    0
                  );
                  setTimeRemaining(totalTime);
                }}
                className="flex-1"
              >
                Retake Preview
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="text-base font-semibold flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <div>
                <h1 className="text-lg font-semibold">Assessment Preview Mode</h1>
                <p className="text-sm text-muted-foreground">
                  Question {currentIndex + 1} of {questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className={cn(
                  "font-mono font-semibold",
                  timeRemaining < 60 && "text-destructive"
                )}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Button variant="outline" onClick={() => setShowExitDialog(true)}>
                Exit Preview
              </Button>
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
                <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
                <Badge>{currentQuestion.points} points</Badge>
                {currentQuestion.timeLimit && (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {Math.floor(currentQuestion.timeLimit / 60)} min
                  </Badge>
                )}
              </div>
              <h2 className="text-xl font-semibold mb-2">{currentQuestion.text}</h2>
              {currentQuestion.instructions && (
                <p className="text-sm text-muted-foreground mb-4">
                  {currentQuestion.instructions}
                </p>
              )}
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
                {currentQuestion.options?.map((option) => (
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
                {currentQuestion.options?.map((option) => (
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
                {currentQuestion.options?.map((option) => (
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
              <div>
                <Textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Write your code here..."
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Note: This is a preview mode. Actual coding assessments may include syntax highlighting and code execution.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            {Object.keys(answers).length} of {questions.length} answered
          </div>
          {currentIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit}>
              Submit Preview
              <CheckCircle2 className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Question Navigator</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((q, index) => {
              const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '';
              const isFlagged = flaggedQuestions.has(q.id);
              const isCurrent = index === currentIndex;

              return (
                <Button
                  key={q.id}
                  variant={isCurrent ? "default" : isAnswered ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => goToQuestion(index)}
                  className={cn(
                    "relative",
                    isCurrent && "ring-2 ring-primary"
                  )}
                >
                  {index + 1}
                  {isFlagged && (
                    <Flag className="h-3 w-3 absolute -top-1 -right-1 text-warning" />
                  )}
                </Button>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="text-base font-semibold flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded" />
              <span>Current</span>
            </div>
            <div className="text-base font-semibold flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary rounded" />
              <span>Answered</span>
            </div>
            <div className="text-base font-semibold flex items-center gap-2">
              <Flag className="h-3 w-3 text-warning" />
              <span>Flagged</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Exit Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Preview Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will not be saved. Are you sure you want to exit this preview?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Preview</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/question-bank')}>
              Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
