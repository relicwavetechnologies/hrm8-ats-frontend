import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { CurrentQuestionDisplay } from './CurrentQuestionDisplay';
import { LiveTranscript } from './LiveTranscript';
import { InterviewControls } from './InterviewControls';
import { InterviewProgress } from '../common/InterviewProgress';
import { InterviewTimer } from '../common/InterviewTimer';
import type { AIInterviewSession } from '@/shared/types/aiInterview';
import { Video, Wifi } from 'lucide-react';

interface VideoInterviewInterfaceProps {
  session: AIInterviewSession;
  onEndInterview: () => void;
}

export function VideoInterviewInterface({ session, onEndInterview }: VideoInterviewInterfaceProps) {
  const currentQuestion = session.questions[session.currentQuestionIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <InterviewProgress
          current={session.currentQuestionIndex + 1}
          total={session.questions.length}
        />
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <Wifi className="h-3 w-3" />
            Connected
          </Badge>
          {session.startedAt && <InterviewTimer startTime={session.startedAt} />}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="bg-black/95 overflow-hidden">
            <CardContent className="p-0 aspect-video relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="h-24 w-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                    <Video className="h-12 w-12 text-primary" />
                  </div>
                  <p className="text-white/70">Video feed placeholder</p>
                  <p className="text-xs text-white/50">
                    In production, this would show the candidate's camera feed
                  </p>
                </div>
              </div>

              <div className="absolute top-4 left-4">
                <Badge variant="destructive" className="gap-1">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  Recording
                </Badge>
              </div>
            </CardContent>
          </Card>

          <InterviewControls
            onEndInterview={onEndInterview}
            showVideoControls
            showAudioControls
          />
        </div>

        <div className="space-y-6">
          <CurrentQuestionDisplay question={currentQuestion} isAISpeaking />
          <LiveTranscript transcript={session.transcript} />
        </div>
      </div>
    </div>
  );
}
