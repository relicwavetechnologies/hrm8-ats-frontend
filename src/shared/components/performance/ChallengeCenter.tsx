import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Button } from '@/shared/components/ui/button';
import { Target, Calendar, Users, Trophy, Award, Clock } from 'lucide-react';
import type { Challenge } from '@/types/performance';

interface ChallengeCenterProps {
  challenges: Challenge[];
  onJoinChallenge?: (challengeId: string) => void;
  currentEmployeeId: string;
}

export function ChallengeCenter({ challenges, onJoinChallenge, currentEmployeeId }: ChallengeCenterProps) {
  const getTypeIcon = (type: Challenge['type']) => {
    switch (type) {
      case 'weekly': return <Calendar className="h-4 w-4" />;
      case 'monthly': return <Calendar className="h-4 w-4" />;
      case 'team': return <Users className="h-4 w-4" />;
      case 'skill': return <Target className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Challenge['type']) => {
    switch (type) {
      case 'weekly': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'monthly': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'team': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case 'skill': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
    }
  };

  const getStatusColor = (status: Challenge['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'completed': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'expired': return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const isParticipating = (challenge: Challenge) => {
    return challenge.participants.includes(currentEmployeeId);
  };

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Active Challenges */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Active Challenges</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {activeChallenges.map((challenge) => {
            const progress = (challenge.current / challenge.target) * 100;
            const daysLeft = getDaysRemaining(challenge.endDate);
            const participating = isParticipating(challenge);

            return (
              <Card key={challenge.id} className={participating ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(challenge.type)}
                      <CardTitle className="text-base">{challenge.title}</CardTitle>
                    </div>
                    <Badge className={getTypeColor(challenge.type)} variant="secondary">
                      {challenge.type}
                    </Badge>
                  </div>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {challenge.current} / {challenge.target}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Time Remaining */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {daysLeft > 0 ? `${daysLeft} days remaining` : 'Ending soon'}
                    </span>
                  </div>

                  {/* Participants */}
                  {challenge.type === 'team' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{challenge.participants.length} participants</span>
                    </div>
                  )}

                  {/* Rewards */}
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                      <Trophy className="h-3 w-3 mr-1" />
                      {challenge.reward.points} XP
                    </Badge>
                    {challenge.reward.badges && challenge.reward.badges.length > 0 && (
                      <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 dark:text-purple-400">
                        <Award className="h-3 w-3 mr-1" />
                        {challenge.reward.badges.length} Badge{challenge.reward.badges.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>

                  {/* Join Button */}
                  {!participating && onJoinChallenge && (
                    <Button
                      onClick={() => onJoinChallenge(challenge.id)}
                      className="w-full"
                      variant="outline"
                    >
                      Join Challenge
                    </Button>
                  )}
                  {participating && (
                    <div className="text-center text-sm text-muted-foreground py-2">
                      You're participating in this challenge
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {activeChallenges.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No active challenges at the moment</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back soon for new challenges!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Completed Challenges</h3>
          <div className="space-y-3">
            {completedChallenges.map((challenge) => (
              <Card key={challenge.id} className="bg-muted/30">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-green-500/10">
                      <Trophy className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{challenge.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Completed • Earned {challenge.reward.points} XP
                        {challenge.reward.badges && ` and ${challenge.reward.badges.length} badge${challenge.reward.badges.length > 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <Badge className={getStatusColor(challenge.status)} variant="secondary">
                      Completed
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
