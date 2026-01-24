import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import {
  PlayCircle,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronLeft,
  Clock,
  Award,
  AlertCircle,
  BookOpen,
  Video,
  FileText,
  ListChecks,
} from 'lucide-react';
import { Course, CourseModule, Lesson, CourseEnrollment } from '@/shared/types/performance';
import { toast } from 'sonner';

interface CourseContentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  enrollment: CourseEnrollment;
  onProgressUpdate: (lessonId: string, progress: number) => void;
  onCompleteLesson: (lessonId: string) => void;
  onCompleteAssessment: (assessmentId: string, score: number) => void;
}

interface QuizState {
  answers: Record<string, string>;
  submitted: boolean;
  score?: number;
}

export function CourseContentViewer({
  open,
  onOpenChange,
  course,
  enrollment,
  onProgressUpdate,
  onCompleteLesson,
  onCompleteAssessment,
}: CourseContentViewerProps) {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [quizState, setQuizState] = useState<QuizState>({ answers: {}, submitted: false });
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const currentModule = course.modules[currentModuleIndex];
  const currentLesson = currentModule?.lessons[currentLessonIndex];

  useEffect(() => {
    // Initialize completed lessons from enrollment (for demo, we'll use local state)
    // In a real app, this would be loaded from the backend
    const completed = enrollment.completedModules || [];
    setCompletedLessons(new Set(completed));
  }, [enrollment]);

  const isLessonComplete = (lessonId: string) => completedLessons.has(lessonId);

  const canAccessLesson = (moduleIndex: number, lessonIndex: number) => {
    // First lesson is always accessible
    if (moduleIndex === 0 && lessonIndex === 0) return true;

    // Check if previous lesson is completed
    if (lessonIndex > 0) {
      const prevLesson = course.modules[moduleIndex].lessons[lessonIndex - 1];
      return isLessonComplete(prevLesson.id);
    }

    // Check if previous module is completed
    if (moduleIndex > 0) {
      const prevModule = course.modules[moduleIndex - 1];
      return prevModule.lessons.every(l => isLessonComplete(l.id));
    }

    return false;
  };

  const handleNextLesson = () => {
    const nextLessonIndex = currentLessonIndex + 1;
    if (nextLessonIndex < currentModule.lessons.length) {
      setCurrentLessonIndex(nextLessonIndex);
      setVideoProgress(0);
      setQuizState({ answers: {}, submitted: false });
    } else {
      // Move to next module
      const nextModuleIndex = currentModuleIndex + 1;
      if (nextModuleIndex < course.modules.length) {
        setCurrentModuleIndex(nextModuleIndex);
        setCurrentLessonIndex(0);
        setVideoProgress(0);
        setQuizState({ answers: {}, submitted: false });
      }
    }
  };

  const handlePreviousLesson = () => {
    const prevLessonIndex = currentLessonIndex - 1;
    if (prevLessonIndex >= 0) {
      setCurrentLessonIndex(prevLessonIndex);
      setVideoProgress(0);
      setQuizState({ answers: {}, submitted: false });
    } else {
      // Move to previous module
      const prevModuleIndex = currentModuleIndex - 1;
      if (prevModuleIndex >= 0) {
        const prevModule = course.modules[prevModuleIndex];
        setCurrentModuleIndex(prevModuleIndex);
        setCurrentLessonIndex(prevModule.lessons.length - 1);
        setVideoProgress(0);
        setQuizState({ answers: {}, submitted: false });
      }
    }
  };

  const handleCompleteLesson = () => {
    if (!currentLesson) return;
    
    const newCompleted = new Set(completedLessons);
    newCompleted.add(currentLesson.id);
    setCompletedLessons(newCompleted);
    onCompleteLesson(currentLesson.id);
    
    // Award points for lesson completion
    const points = 50;
    toast.success(`Lesson completed! +${points} XP`);
    
    // Auto-advance to next lesson
    setTimeout(handleNextLesson, 1000);
  };

  const handleSubmitQuiz = () => {
    if (!currentModule.assessment) return;

    const questions = currentModule.assessment.questions;
    let correctCount = 0;

    questions.forEach(q => {
      const userAnswer = quizState.answers[q.id];
      if (userAnswer === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = (correctCount / questions.length) * 100;
    setQuizState({ ...quizState, submitted: true, score });

    if (score >= currentModule.assessment.passingScore) {
      const points = score === 100 ? 100 : 75;
      const bonus = score === 100 ? ' + 50 bonus!' : '';
      toast.success(`Quiz passed with ${score.toFixed(0)}%! +${points} XP${bonus}`);
      onCompleteAssessment(currentModule.assessment.id, score);
    } else {
      toast.error(`Score: ${score.toFixed(0)}%. Passing score is ${currentModule.assessment.passingScore}%`);
    }
  };

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedCount = completedLessons.size;
  const overallProgress = (completedCount / totalLessons) * 100;

  const hasPrevious = currentModuleIndex > 0 || currentLessonIndex > 0;
  const hasNext = 
    currentModuleIndex < course.modules.length - 1 || 
    currentLessonIndex < currentModule?.lessons.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <div className="flex h-full">
          {/* Sidebar - Course Navigation */}
          <div className="w-80 border-r bg-muted/30">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="text-lg">{course.title}</DialogTitle>
              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{completedCount}/{totalLessons} lessons</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            </DialogHeader>

            <ScrollArea className="h-[calc(100%-140px)]">
              <div className="p-6 pt-2 space-y-6">
                {course.modules.map((module, mIdx) => (
                  <div key={module.id}>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Module {mIdx + 1}: {module.title}
                    </h4>
                    <div className="space-y-2">
                      {module.lessons.map((lesson, lIdx) => {
                        const isComplete = isLessonComplete(lesson.id);
                        const canAccess = canAccessLesson(mIdx, lIdx);
                        const isCurrent = mIdx === currentModuleIndex && lIdx === currentLessonIndex;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              if (canAccess) {
                                setCurrentModuleIndex(mIdx);
                                setCurrentLessonIndex(lIdx);
                                setVideoProgress(0);
                                setQuizState({ answers: {}, submitted: false });
                              }
                            }}
                            disabled={!canAccess}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              isCurrent
                                ? 'bg-primary text-primary-foreground border-primary'
                                : canAccess
                                ? 'bg-background hover:bg-muted border-border'
                                : 'bg-muted/50 border-muted cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {isComplete ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : canAccess ? (
                                  lesson.contentType === 'video' ? (
                                    <Video className="h-4 w-4" />
                                  ) : (
                                    <FileText className="h-4 w-4" />
                                  )
                                ) : (
                                  <Lock className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{lesson.title}</div>
                                <div className="text-xs opacity-80 flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  {lesson.duration} min
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      {module.assessment && (
                        <div className="mt-2 p-3 rounded-lg border border-dashed bg-muted/30">
                          <div className="flex items-start gap-3">
                            <ListChecks className="h-4 w-4 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium">{module.assessment.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Passing: {module.assessment.passingScore}%
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{currentLesson?.title}</h2>
                  <p className="text-muted-foreground mt-1">{currentLesson?.description}</p>
                </div>
                <Badge variant={isLessonComplete(currentLesson?.id || '') ? 'default' : 'outline'}>
                  {isLessonComplete(currentLesson?.id || '') ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <Tabs defaultValue="content" className="w-full">
                  <TabsList>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    {currentModule?.assessment && (
                      <TabsTrigger value="quiz">Quiz</TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="content" className="space-y-6">
                    {currentLesson?.contentType === 'video' && (
                      <Card>
                        <CardContent className="p-6">
                          {/* Video Player Placeholder */}
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <PlayCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground mb-4">Video Player</p>
                              <div className="space-y-4 max-w-md mx-auto">
                                <Progress value={videoProgress} />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => {
                                      setVideoProgress(Math.min(100, videoProgress + 25));
                                      if (videoProgress >= 75) {
                                        toast.success('Video watched!');
                                      }
                                    }}
                                    size="sm"
                                  >
                                    Simulate Watch
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {videoProgress >= 80 && !isLessonComplete(currentLesson.id) && (
                            <div className="mt-4 flex justify-center">
                              <Button onClick={handleCompleteLesson}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark as Complete
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {currentLesson?.contentType === 'interactive' && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Interactive Exercise</CardTitle>
                          <CardDescription>
                            Complete the hands-on exercise to practice what you've learned.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground mb-4">Interactive Content</p>
                              {!isLessonComplete(currentLesson.id) && (
                                <Button onClick={handleCompleteLesson}>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Mark as Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {currentLesson?.contentType === 'document' && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Reading Material</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none">
                          <p className="text-muted-foreground">
                            Document content would be displayed here with proper formatting.
                          </p>
                          {!isLessonComplete(currentLesson.id) && (
                            <div className="mt-6 flex justify-center">
                              <Button onClick={handleCompleteLesson}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark as Complete
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="notes">
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Notes</CardTitle>
                        <CardDescription>
                          Take notes while learning. They'll be saved automatically.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <textarea
                          className="w-full min-h-[300px] p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Start taking notes..."
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {currentModule?.assessment && (
                    <TabsContent value="quiz" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            {currentModule.assessment.title}
                          </CardTitle>
                          <CardDescription>
                            {currentModule.assessment.questions.length} questions · 
                            {currentModule.assessment.timeLimit && ` ${currentModule.assessment.timeLimit} min time limit · `}
                            Passing score: {currentModule.assessment.passingScore}%
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {!quizState.submitted ? (
                            <>
                              {currentModule.assessment.questions.map((question, idx) => (
                                <div key={question.id} className="space-y-3">
                                  <div className="flex gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                      {idx + 1}
                                    </span>
                                    <div className="flex-1">
                                      <p className="font-medium">{question.question}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {question.points} {question.points === 1 ? 'point' : 'points'}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {question.type === 'multiple-choice' && question.options && (
                                    <RadioGroup
                                      value={quizState.answers[question.id]}
                                      onValueChange={(value) => {
                                        setQuizState({
                                          ...quizState,
                                          answers: { ...quizState.answers, [question.id]: value },
                                        });
                                      }}
                                      className="ml-9 space-y-2"
                                    >
                                      {question.options.map((option, optIdx) => (
                                        <div key={optIdx} className="flex items-center space-x-2">
                                          <RadioGroupItem value={option} id={`q${idx}-opt${optIdx}`} />
                                          <Label htmlFor={`q${idx}-opt${optIdx}`} className="cursor-pointer">
                                            {option}
                                          </Label>
                                        </div>
                                      ))}
                                    </RadioGroup>
                                  )}

                                  {question.type === 'true-false' && (
                                    <RadioGroup
                                      value={quizState.answers[question.id]}
                                      onValueChange={(value) => {
                                        setQuizState({
                                          ...quizState,
                                          answers: { ...quizState.answers, [question.id]: value },
                                        });
                                      }}
                                      className="ml-9 space-y-2"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="true" id={`q${idx}-true`} />
                                        <Label htmlFor={`q${idx}-true`} className="cursor-pointer">True</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="false" id={`q${idx}-false`} />
                                        <Label htmlFor={`q${idx}-false`} className="cursor-pointer">False</Label>
                                      </div>
                                    </RadioGroup>
                                  )}
                                  
                                  {idx < currentModule.assessment.questions.length - 1 && (
                                    <Separator className="mt-6" />
                                  )}
                                </div>
                              ))}

                              <div className="flex justify-end pt-4">
                                <Button
                                  onClick={handleSubmitQuiz}
                                  disabled={
                                    Object.keys(quizState.answers).length !==
                                    currentModule.assessment.questions.length
                                  }
                                >
                                  Submit Quiz
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="space-y-6">
                              <div className={`p-6 rounded-lg border-2 ${
                                (quizState.score ?? 0) >= currentModule.assessment.passingScore
                                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                                  : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                              }`}>
                                <div className="flex items-start gap-4">
                                  {(quizState.score ?? 0) >= currentModule.assessment.passingScore ? (
                                    <Award className="h-8 w-8 text-green-600 dark:text-green-500" />
                                  ) : (
                                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
                                  )}
                                  <div>
                                    <h3 className="text-xl font-bold mb-2">
                                      {(quizState.score ?? 0) >= currentModule.assessment.passingScore
                                        ? 'Congratulations!'
                                        : 'Keep Trying!'}
                                    </h3>
                                    <p className="text-lg mb-2">
                                      Your Score: <strong>{quizState.score?.toFixed(0)}%</strong>
                                    </p>
                                    <p className="text-sm opacity-80">
                                      {(quizState.score ?? 0) >= currentModule.assessment.passingScore
                                        ? `You've passed the quiz! Great job on completing this module.`
                                        : `You need ${currentModule.assessment.passingScore}% to pass. Review the material and try again.`}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <Button
                                  onClick={() => setQuizState({ answers: {}, submitted: false })}
                                  variant="outline"
                                >
                                  Retry Quiz
                                </Button>
                                {(quizState.score ?? 0) >= currentModule.assessment.passingScore && hasNext && (
                                  <Button onClick={handleNextLesson}>
                                    Continue to Next Lesson
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </ScrollArea>

            {/* Navigation Footer */}
            <div className="p-4 border-t flex items-center justify-between bg-muted/30">
              <Button
                onClick={handlePreviousLesson}
                disabled={!hasPrevious}
                variant="outline"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Lesson {currentLessonIndex + 1} of {currentModule?.lessons.length} · 
                Module {currentModuleIndex + 1} of {course.modules.length}
              </div>

              <Button
                onClick={handleNextLesson}
                disabled={!hasNext}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
