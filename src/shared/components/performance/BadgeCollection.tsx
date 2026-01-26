import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Lock, Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { Badge as BadgeType, EmployeeBadge } from '@/types/performance';
import { getBadges } from '@/shared/lib/gamificationStorage';

interface BadgeCollectionProps {
  earnedBadges: EmployeeBadge[];
}

export function BadgeCollection({ earnedBadges }: BadgeCollectionProps) {
  const allBadges = getBadges();
  const earnedBadgeIds = new Set(earnedBadges.map(eb => eb.badgeId));

  const getBadgeIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />;
  };

  const getRarityColor = (rarity: BadgeType['rarity']) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'epic': return 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case 'rare': return 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'common': return 'border-gray-500 bg-gray-500/10 text-gray-700 dark:text-gray-400';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getCategoryBadges = (category: BadgeType['category']) => {
    return allBadges.filter(b => b.category === category);
  };

  const getCategoryStats = (category: BadgeType['category']) => {
    const categoryBadges = getCategoryBadges(category);
    const earned = categoryBadges.filter(b => earnedBadgeIds.has(b.id)).length;
    return { total: categoryBadges.length, earned, progress: (earned / categoryBadges.length) * 100 };
  };

  const categories: Array<{ key: BadgeType['category']; label: string; icon: keyof typeof LucideIcons }> = [
    { key: 'achievement', label: 'Achievements', icon: 'Trophy' },
    { key: 'skill', label: 'Skills', icon: 'Code' },
    { key: 'milestone', label: 'Milestones', icon: 'Flag' },
    { key: 'special', label: 'Special', icon: 'Star' }
  ];

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        {categories.map(({ key, label, icon }) => {
          const stats = getCategoryStats(key);
          const Icon = LucideIcons[icon] as any;
          
          return (
            <Card key={key}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {stats.earned}/{stats.total}
                  </span>
                </div>
                <CardTitle className="text-sm">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={stats.progress} className="h-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Badge Categories */}
      {categories.map(({ key, label }) => {
        const categoryBadges = getCategoryBadges(key);
        
        return (
          <Card key={key}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
              <CardDescription>
                {getCategoryStats(key).earned} of {getCategoryStats(key).total} badges earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryBadges.map((badge) => {
                  const isEarned = earnedBadgeIds.has(badge.id);
                  const earnedBadge = earnedBadges.find(eb => eb.badgeId === badge.id);

                  return (
                    <div
                      key={badge.id}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        isEarned
                          ? getRarityColor(badge.rarity) + ' shadow-sm'
                          : 'border-dashed border-muted bg-muted/20'
                      } ${isEarned ? 'hover:scale-105' : ''}`}
                    >
                      {!isEarned && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                          <Lock className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className={`flex flex-col items-center text-center ${!isEarned ? 'opacity-30' : ''}`}>
                        <div className={`p-3 rounded-full mb-3 ${
                          isEarned ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          {getBadgeIcon(badge.icon)}
                        </div>
                        
                        <h4 className="font-semibold text-sm mb-1">{badge.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {badge.rarity}
                          </Badge>
                          <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                            {badge.points} XP
                          </Badge>
                        </div>

                        {earnedBadge && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Earned {new Date(earnedBadge.earnedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {!isEarned && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground">
                            {badge.requirements.criteria}
                          </p>
                          {badge.requirements.type === 'streak' && earnedBadge?.progress && (
                            <Progress value={(earnedBadge.progress / badge.requirements.target) * 100} className="h-1 mt-2" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
