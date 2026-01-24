import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Trophy, TrendingUp, TrendingDown, Minus, Medal, Award, Star } from 'lucide-react';
import type { LeaderboardEntry } from '@/shared/types/performance';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentEmployeeId?: string;
}

export function Leaderboard({ entries, currentEmployeeId }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-orange-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Leaderboard
        </CardTitle>
        <CardDescription>Top performers this period</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.slice(0, 10).map((entry, index) => {
            const isCurrentUser = entry.employeeId === currentEmployeeId;
            
            return (
              <div
                key={entry.employeeId}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  isCurrentUser
                    ? 'bg-primary/5 border-primary/50'
                    : 'bg-card hover:bg-muted/50'
                } ${index < 3 ? 'border-2' : ''}`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-10 h-10">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(entry.employeeName)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{entry.employeeName}</p>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{entry.department}</span>
                    <span>•</span>
                    <span>Level {entry.level}</span>
                    <span>•</span>
                    <span>{entry.badges} badges</span>
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="font-bold text-lg">{entry.points.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>

                {/* Change */}
                <div className="flex items-center gap-1">
                  {getChangeIcon(entry.change)}
                  {entry.change !== 0 && (
                    <span className={`text-xs font-medium ${
                      entry.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(entry.change)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {currentEmployeeId && !entries.slice(0, 10).find(e => e.employeeId === currentEmployeeId) && (
          <>
            <div className="my-4 text-center text-sm text-muted-foreground">• • •</div>
            {entries.find(e => e.employeeId === currentEmployeeId) && (
              <div className="p-4 rounded-lg border-2 border-primary/50 bg-primary/5">
                {entries.map((entry) => {
                  if (entry.employeeId !== currentEmployeeId) return null;
                  
                  return (
                    <div key={entry.employeeId} className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10">
                        <span className="text-sm font-bold">#{entry.rank}</span>
                      </div>

                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(entry.employeeName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{entry.employeeName}</p>
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{entry.department}</span>
                          <span>•</span>
                          <span>Level {entry.level}</span>
                          <span>•</span>
                          <span>{entry.badges} badges</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg">{entry.points.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">XP</p>
                      </div>

                      <div className="flex items-center gap-1">
                        {getChangeIcon(entry.change)}
                        {entry.change !== 0 && (
                          <span className={`text-xs font-medium ${
                            entry.change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {Math.abs(entry.change)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
