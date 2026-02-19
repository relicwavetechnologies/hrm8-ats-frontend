import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { getAIInterviewSessions } from '@/shared/lib/aiInterview/aiInterviewStorage';
import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function InterviewComparisonTool() {
  const navigate = useNavigate();
  const sessions = getAIInterviewSessions().filter(s => s.status === 'completed' && s.analysis);
  
  const [interview1Id, setInterview1Id] = useState<string>('');
  const [interview2Id, setInterview2Id] = useState<string>('');

  const interview1 = sessions.find(s => s.id === interview1Id);
  const interview2 = sessions.find(s => s.id === interview2Id);

  const getComparison = (score1?: number, score2?: number) => {
    if (!score1 || !score2) return null;
    const diff = score1 - score2;
    return {
      diff: Math.abs(diff),
      winner: diff > 0 ? 1 : diff < 0 ? 2 : 0,
    };
  };

  const categories = [
    { key: 'overallScore', label: 'Overall Score' },
    { key: 'technical', label: 'Technical' },
    { key: 'communication', label: 'Communication' },
    { key: 'culturalFit', label: 'Cultural Fit' },
    { key: 'experience', label: 'Experience' },
    { key: 'problemSolving', label: 'Problem Solving' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5" />
          Interview Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Interview 1</Label>
            <Select value={interview1Id} onValueChange={setInterview1Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select interview" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map(session => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.candidateName} - {format(new Date(session.scheduledDate), 'MMM d')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Interview 2</Label>
            <Select value={interview2Id} onValueChange={setInterview2Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select interview" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map(session => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.candidateName} - {format(new Date(session.scheduledDate), 'MMM d')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {interview1 && interview2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-1">{interview1.candidateName}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{interview1.jobTitle}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/ai-interviews/${interview1.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-1">{interview2.candidateName}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{interview2.jobTitle}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/ai-interviews/${interview2.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              {categories.map(({ key, label }) => {
                const score1 = key === 'overallScore' 
                  ? interview1.analysis?.overallScore 
                  : interview1.analysis?.categoryScores[key as keyof typeof interview1.analysis.categoryScores];
                const score2 = key === 'overallScore'
                  ? interview2.analysis?.overallScore
                  : interview2.analysis?.categoryScores[key as keyof typeof interview2.analysis.categoryScores];
                
                const comparison = getComparison(score1, score2);

                return (
                  <div key={key} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{label}</span>
                      {comparison && comparison.winner !== 0 && (
                        <Badge variant={comparison.diff > 10 ? 'default' : 'secondary'}>
                          {comparison.diff} points difference
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${
                          comparison?.winner === 1 ? 'text-green-600' : 
                          comparison?.winner === 2 ? 'text-muted-foreground' : ''
                        }`}>
                          {score1 || 0}
                        </span>
                        {comparison?.winner === 1 && <TrendingUp className="h-4 w-4 text-green-600" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${
                          comparison?.winner === 2 ? 'text-green-600' : 
                          comparison?.winner === 1 ? 'text-muted-foreground' : ''
                        }`}>
                          {score2 || 0}
                        </span>
                        {comparison?.winner === 2 && <TrendingUp className="h-4 w-4 text-green-600" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h4 className="text-sm font-medium mb-2">Recommendation</h4>
                <Badge className="capitalize">
                  {interview1.analysis?.recommendation.replace('-', ' ')}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Recommendation</h4>
                <Badge className="capitalize">
                  {interview2.analysis?.recommendation.replace('-', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {(!interview1 || !interview2) && (
          <div className="text-center py-8 text-muted-foreground">
            Select two interviews to compare their performance
          </div>
        )}
      </CardContent>
    </Card>
  );
}
