import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAIInterview } from '@/shared/hooks/useAIInterview';
import { getAIInterviewByToken } from '@/shared/lib/aiInterview/aiInterviewStorage';
import { TextInterviewInterface } from '@/modules/ai-interviews/components/interface/TextInterviewInterface';
import { VideoInterviewInterface } from '@/modules/ai-interviews/components/interface/VideoInterviewInterface';
import { PhoneInterviewInterface } from '@/modules/ai-interviews/components/interface/PhoneInterviewInterface';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from '@/shared/hooks/use-toast';

export default function AIInterviewSession() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const session = getAIInterviewByToken(token);
      if (session) {
        setSessionId(session.id);
      }
    }
  }, [token]);

  const { session, isProcessing, startInterview, addTranscriptEntry, nextQuestion, completeInterview } = useAIInterview(sessionId || '');

  if (!session) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (session.status === 'completed') {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold">Interview Completed!</h2>
            <p className="text-muted-foreground">Thank you for completing the AI interview. Your responses are being analyzed.</p>
            <Button onClick={() => navigate('/ai-interviews')}>View All Interviews</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmitAnswer = async (answer: string) => {
    addTranscriptEntry({ speaker: 'candidate', content: answer, duration: 10 });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (session.currentQuestionIndex < session.questions.length - 1) {
      const nextQ = session.questions[session.currentQuestionIndex + 1];
      addTranscriptEntry({ speaker: 'ai', content: nextQ.question, duration: 3 });
      nextQuestion();
    } else {
      await completeInterview();
      toast({ title: 'Interview completed', description: 'Analyzing your responses...' });
    }
  };

  const handleEndInterview = async () => {
    await completeInterview();
    toast({ title: 'Interview ended', description: 'Your responses have been saved.' });
  };

  if (session.status === 'scheduled') {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-2xl font-bold">Ready to Start?</h2>
            <p className="text-muted-foreground">Click below to begin your AI interview.</p>
            <Button onClick={startInterview} size="lg">Start Interview</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {session.interviewMode === 'text' && (
        <TextInterviewInterface session={session} onSubmitAnswer={handleSubmitAnswer} onEndInterview={handleEndInterview} isProcessing={isProcessing} />
      )}
      {session.interviewMode === 'video' && (
        <VideoInterviewInterface session={session} onEndInterview={handleEndInterview} />
      )}
      {session.interviewMode === 'phone' && (
        <PhoneInterviewInterface session={session} onEndInterview={handleEndInterview} />
      )}
    </div>
  );
}
