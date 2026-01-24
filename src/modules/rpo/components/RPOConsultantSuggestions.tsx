import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Progress } from '@/shared/components/ui/progress';
import { Sparkles, TrendingUp, Users, Star } from 'lucide-react';
import { toast } from '@/shared/hooks/use-toast';

interface ConsultantSuggestion {
  id: string;
  name: string;
  avatar?: string;
  matchScore: number;
  specialization: string[];
  currentCapacity: number;
  successRate: number;
  relevantExperience: string[];
  reason: string;
}

interface RPOConsultantSuggestionsProps {
  contractId: string;
  requiredSkills: string[];
  onAssign: (consultantId: string) => void;
}

export function RPOConsultantSuggestions({ contractId, requiredSkills, onAssign }: RPOConsultantSuggestionsProps) {
  // Mock data - will be replaced with real data later
  const suggestions: ConsultantSuggestion[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: undefined,
      matchScore: 95,
      specialization: ['Technology', 'Healthcare', 'Executive Search'],
      currentCapacity: 65,
      successRate: 92,
      relevantExperience: ['5 similar contracts', '3 placements this quarter'],
      reason: 'Perfect match for technology sector with proven track record'
    },
    {
      id: '2',
      name: 'Michael Chen',
      avatar: undefined,
      matchScore: 88,
      specialization: ['Finance', 'Technology', 'Mid-Level'],
      currentCapacity: 45,
      successRate: 87,
      relevantExperience: ['2 similar contracts', '7 placements this quarter'],
      reason: 'High availability and strong performance in similar industries'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      avatar: undefined,
      matchScore: 82,
      specialization: ['Healthcare', 'Technology', 'Senior Level'],
      currentCapacity: 78,
      successRate: 90,
      relevantExperience: ['3 similar contracts', '5 placements this quarter'],
      reason: 'Excellent success rate with relevant industry experience'
    }
  ];

  const handleAssign = (consultant: ConsultantSuggestion) => {
    onAssign(consultant.id);
    toast({
      title: 'Consultant Assigned',
      description: `${consultant.name} has been assigned to this contract.`,
    });
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    return 'text-yellow-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>AI-Powered Consultant Suggestions</CardTitle>
        </div>
        <CardDescription>
          Based on contract requirements, consultant availability, and performance history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((consultant, index) => (
          <Card key={consultant.id} className="relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge variant={index === 0 ? 'default' : 'secondary'} className="font-bold">
                {consultant.matchScore}% Match
              </Badge>
            </div>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={consultant.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {consultant.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="font-semibold text-lg">{consultant.name}</h4>
                    <p className="text-sm text-muted-foreground">{consultant.reason}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {consultant.specialization.map(spec => (
                      <Badge key={spec} variant="outline">
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Users className="h-3 w-3" />
                        <span>Capacity</span>
                      </div>
                      <Progress value={consultant.currentCapacity} className="h-2" />
                      <span className="text-xs text-muted-foreground">{consultant.currentCapacity}%</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Star className="h-3 w-3" />
                        <span>Success Rate</span>
                      </div>
                      <div className={`font-semibold ${getMatchColor(consultant.successRate)}`}>
                        {consultant.successRate}%
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Performance</span>
                      </div>
                      <div className="text-xs space-y-0.5">
                        {consultant.relevantExperience.map((exp, i) => (
                          <div key={i}>{exp}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleAssign(consultant)}
                    variant={index === 0 ? 'default' : 'outline'}
                    className="w-full"
                  >
                    Assign to Contract
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
