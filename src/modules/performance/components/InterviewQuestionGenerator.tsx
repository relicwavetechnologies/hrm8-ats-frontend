import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { MessageSquare, Copy, Download } from 'lucide-react';
import { InterviewQuestion, generateInterviewQuestions } from '@/shared/lib/mockInterviewQuestions';
import { AIFeedbackAnalysis } from '@/shared/types/aiAnalysis';
import { useState } from 'react';
import { useToast } from '@/shared/hooks/use-toast';

interface InterviewQuestionGeneratorProps {
  analysis: AIFeedbackAnalysis;
  candidateName: string;
}

export const InterviewQuestionGenerator = ({ 
  analysis, 
  candidateName 
}: InterviewQuestionGeneratorProps) => {
  const { toast } = useToast();
  const [questions] = useState<InterviewQuestion[]>(() => 
    generateInterviewQuestions(
      analysis.biasDetection.map(b => b.type || ''),
      analysis.keyPoints.filter(p => p.toLowerCase().includes('concern')),
      analysis.keyPoints.filter(p => !p.toLowerCase().includes('concern'))
    )
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'behavioral': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'situational': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cultural': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const copyQuestion = (question: string) => {
    navigator.clipboard.writeText(question);
    toast({
      title: 'Copied to clipboard',
      description: 'Question copied successfully',
    });
  };

  const exportQuestions = () => {
    const text = `Interview Questions for ${candidateName}\n\n` +
      questions.map((q, idx) => 
        `${idx + 1}. ${q.question}\n   Category: ${q.category}\n   Focus: ${q.focusArea}\n   Rationale: ${q.rationale}\n`
      ).join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-questions-${candidateName.replace(' ', '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Questions exported',
      description: 'Interview questions downloaded as text file',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI-Generated Interview Questions
            </CardTitle>
            <CardDescription>
              Suggested questions based on feedback analysis and identified gaps
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportQuestions}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((question, idx) => (
          <div key={question.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-primary">Q{idx + 1}</span>
                  <Badge className={getCategoryColor(question.category)}>
                    {question.category}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{question.question}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyQuestion(question.question)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground font-medium">Focus:</span>
                <span>{question.focusArea}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground font-medium">Rationale:</span>
                <span className="text-muted-foreground">{question.rationale}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
