import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import { CurrentQuestionDisplay } from './CurrentQuestionDisplay';
import { LiveTranscript } from './LiveTranscript';
import { InterviewProgress } from '../common/InterviewProgress';
import { InterviewTimer } from '../common/InterviewTimer';
import type { AIInterviewSession } from '@/shared/types/aiInterview';

interface TextInterviewInterfaceProps {
  session: AIInterviewSession;
  onSubmitAnswer: (answer: string) => void;
  onEndInterview: () => void;
  isProcessing?: boolean;
}

export function TextInterviewInterface({
  session,
  onSubmitAnswer,
  onEndInterview,
  isProcessing = false
}: TextInterviewInterfaceProps) {
  const [answer, setAnswer] = useState('');

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const isLastQuestion = session.currentQuestionIndex === session.questions.length - 1;

  const handleSubmit = () => {
    if (!answer.trim()) return;
    onSubmitAnswer(answer);
    setAnswer('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <InterviewProgress
          current={session.currentQuestionIndex + 1}
          total={session.questions.length}
        />
        {session.startedAt && <InterviewTimer startTime={session.startedAt} />}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <CurrentQuestionDisplay question={currentQuestion} />

          <Card>
            <CardContent className="p-4 space-y-4">
              <Textarea
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={6}
                className="resize-none"
                disabled={isProcessing}
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {isLastQuestion ? 'Submit Final Answer' : 'Submit Answer'}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={onEndInterview}
                  disabled={isProcessing}
                >
                  End Interview
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Press Ctrl+Enter to submit
              </p>
            </CardContent>
          </Card>
        </div>

        <LiveTranscript transcript={session.transcript} />
      </div>
    </div>
  );
}
