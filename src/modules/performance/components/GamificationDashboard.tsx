import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';
import { Trophy, Flame, Star, TrendingUp, Award, Target } from 'lucide-react';
import type { GamificationProfile, Challenge } from '@/shared/types/performance';

interface GamificationDashboardProps {
  profile: GamificationProfile;
  activeChallenges: Challenge[];
}

export function GamificationDashboard({ profile, activeChallenges }: GamificationDashboardProps) {
  const pointsToNextLevel = (profile.level * 500) - profile.totalPoints;
  const levelProgress = (profile.totalPoints / (profile.level * 500)) * 100;

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Master': return 'text-yellow-600 dark:text-yellow-400';
      case 'Expert': return 'text-purple-600 dark:text-purple-400';
      case 'Scholar': return 'text-blue-600 dark:text-blue-400';
      case 'Learner': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.totalPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {pointsToNextLevel} to next level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Level {profile.level}</div>
            <p className={`text-xs font-medium ${getRankColor(profile.rank)}`}>
              {profile.rank}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.streak} days</div>
            <p className="text-xs text-muted-foreground">
              Best: {profile.longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.badges.length}</div>
            <p className="text-xs text-muted-foreground">
              {profile.achievements.length} achievements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Level Progress
          </CardTitle>
          <CardDescription>
            {pointsToNextLevel} points until Level {profile.level + 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={levelProgress} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Level {profile.level}</span>
              <span>{profile.totalPoints.toLocaleString()} XP</span>
              <span>Level {profile.level + 1}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Challenges
          </CardTitle>
          <CardDescription>
            Complete challenges to earn extra points and badges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeChallenges.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active challenges at the moment
            </p>
          ) : (
            activeChallenges.map((challenge) => {
              const progress = (challenge.current / challenge.target) * 100;
              const daysLeft = Math.ceil(
                (new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div key={challenge.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{challenge.title}</h4>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {challenge.type}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{challenge.current} / {challenge.target}</span>
                      <span>{daysLeft} days left</span>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                      +{challenge.reward.points} XP
                    </Badge>
                    {challenge.reward.badges && challenge.reward.badges.length > 0 && (
                      <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 dark:text-purple-400">
                        +{challenge.reward.badges.length} Badge{challenge.reward.badges.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Achievements</CardTitle>
          <CardDescription>Your latest accomplishments</CardDescription>
        </CardHeader>
        <CardContent>
          {profile.achievements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No achievements yet. Start learning to unlock achievements!
            </p>
          ) : (
            <div className="space-y-3">
              {profile.achievements.slice(-5).reverse().map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Trophy className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(achievement.unlockedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                    +{achievement.points} XP
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
