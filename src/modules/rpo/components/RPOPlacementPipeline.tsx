import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Users, Briefcase, FileCheck, Trophy, Clock } from 'lucide-react';

interface PipelineStage {
  name: string;
  count: number;
  candidates: PipelineCandidate[];
  icon: React.ReactNode;
  color: string;
}

interface PipelineCandidate {
  id: string;
  name: string;
  position: string;
  consultant: string;
  daysInStage: number;
  priority: 'high' | 'medium' | 'low';
}

interface RPOPlacementPipelineProps {
  contractId: string;
}

export function RPOPlacementPipeline({ contractId }: RPOPlacementPipelineProps) {
  // Mock data - will be replaced with real data later
  const stages: PipelineStage[] = [
    {
      name: 'Sourcing',
      count: 12,
      icon: <Users className="h-5 w-5" />,
      color: 'bg-blue-500',
      candidates: [
        { id: '1', name: 'John Smith', position: 'Senior Developer', consultant: 'Sarah Johnson', daysInStage: 2, priority: 'high' },
        { id: '2', name: 'Emily Davis', position: 'Product Manager', consultant: 'Michael Chen', daysInStage: 5, priority: 'medium' }
      ]
    },
    {
      name: 'Screening',
      count: 8,
      icon: <FileCheck className="h-5 w-5" />,
      color: 'bg-purple-500',
      candidates: [
        { id: '3', name: 'Robert Brown', position: 'Data Analyst', consultant: 'Sarah Johnson', daysInStage: 3, priority: 'high' },
        { id: '4', name: 'Lisa Anderson', position: 'UX Designer', consultant: 'Emily Rodriguez', daysInStage: 1, priority: 'low' }
      ]
    },
    {
      name: 'Interview',
      count: 5,
      icon: <Briefcase className="h-5 w-5" />,
      color: 'bg-yellow-500',
      candidates: [
        { id: '5', name: 'David Wilson', position: 'DevOps Engineer', consultant: 'Michael Chen', daysInStage: 7, priority: 'high' },
        { id: '6', name: 'Maria Garcia', position: 'Marketing Manager', consultant: 'Sarah Johnson', daysInStage: 4, priority: 'medium' }
      ]
    },
    {
      name: 'Offer',
      count: 3,
      icon: <Trophy className="h-5 w-5" />,
      color: 'bg-green-500',
      candidates: [
        { id: '7', name: 'James Lee', position: 'Tech Lead', consultant: 'Emily Rodriguez', daysInStage: 2, priority: 'high' }
      ]
    }
  ];

  const totalCandidates = stages.reduce((sum, stage) => sum + stage.count, 0);

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'destructive';
    if (priority === 'medium') return 'default';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Placement Pipeline</CardTitle>
              <CardDescription>Track candidates through each stage of the placement process</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{totalCandidates}</div>
              <div className="text-sm text-muted-foreground">Active Candidates</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {stages.map((stage, index) => (
              <div key={index} className="text-center p-4 bg-muted/50 rounded-lg">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stage.color} text-white mb-2`}>
                  {stage.icon}
                </div>
                <div className="font-semibold">{stage.name}</div>
                <div className="text-2xl font-bold text-primary">{stage.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Stages Detail */}
      <div className="grid md:grid-cols-2 gap-6">
        {stages.map((stage, stageIndex) => (
          <Card key={stageIndex}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${stage.color} text-white`}>
                  {stage.icon}
                </div>
                <div>
                  <CardTitle>{stage.name}</CardTitle>
                  <CardDescription>{stage.count} candidates</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stage.candidates.map((candidate) => (
                  <Card key={candidate.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{candidate.name}</div>
                            <div className="text-sm text-muted-foreground">{candidate.position}</div>
                          </div>
                        </div>
                        <Badge variant={getPriorityColor(candidate.priority)}>
                          {candidate.priority}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{candidate.consultant}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{candidate.daysInStage} days</span>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                
                {stage.candidates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No candidates in this stage
                  </div>
                )}
                
                {stage.count > stage.candidates.length && (
                  <Button variant="ghost" className="w-full" size="sm">
                    View {stage.count - stage.candidates.length} more
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
