import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { CurrentQuestionDisplay } from './CurrentQuestionDisplay';
import { LiveTranscript } from './LiveTranscript';
import { InterviewControls } from './InterviewControls';
import { InterviewProgress } from '../common/InterviewProgress';
import { InterviewTimer } from '../common/InterviewTimer';
import type { AIInterviewSession } from '@/shared/types/aiInterview';
import { Phone, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

interface PhoneInterviewInterfaceProps {
  session: AIInterviewSession;
  onEndInterview: () => void;
}

export function PhoneInterviewInterface({ session, onEndInterview }: PhoneInterviewInterfaceProps) {
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
            <Radio className="h-3 w-3" />
            Connected
          </Badge>
          {session.startedAt && <InterviewTimer startTime={session.startedAt} />}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-12 text-center space-y-6">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="h-32 w-32 mx-auto rounded-full bg-primary/20 flex items-center justify-center"
              >
                <Phone className="h-16 w-16 text-primary" />
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Phone Interview in Progress</h3>
                <p className="text-muted-foreground">
                  Audio is being recorded and transcribed in real-time
                </p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium">Recording</span>
              </div>
            </CardContent>
          </Card>

          <InterviewControls
            onEndInterview={onEndInterview}
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
