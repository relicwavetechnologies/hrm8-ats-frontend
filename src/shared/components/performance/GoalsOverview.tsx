import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Plus, Search, Filter, CheckCircle2, Clock, Circle, Pause } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { getPerformanceGoals } from "@/shared/lib/performanceStorage";
import { format } from "date-fns";
import type { GoalStatus, GoalPriority } from "@/types/performance";

export function GoalsOverview() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const goals = useMemo(() => getPerformanceGoals(), []);

  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          goal.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || goal.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || goal.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [goals, searchQuery, statusFilter, priorityFilter]);

  const getStatusBadge = (status: GoalStatus) => {
    const variants: Record<GoalStatus, { variant: any; label: string; icon: any }> = {
      'not-started': { variant: 'secondary', label: 'Not Started', icon: Circle },
      'in-progress': { variant: 'default', label: 'In Progress', icon: Clock },
      'completed': { variant: 'outline', label: 'Completed', icon: CheckCircle2 },
      'on-hold': { variant: 'secondary', label: 'On Hold', icon: Pause },
      'cancelled': { variant: 'destructive', label: 'Cancelled', icon: Circle },
    };
    return variants[status];
  };

  const getPriorityBadge = (priority: GoalPriority) => {
    const variants: Record<GoalPriority, { variant: any; label: string }> = {
      low: { variant: 'secondary', label: 'Low' },
      medium: { variant: 'default', label: 'Medium' },
      high: { variant: 'default', label: 'High' },
      critical: { variant: 'destructive', label: 'Critical' },
    };
    return variants[priority];
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search goals or employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => navigate('/performance/goals/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {filteredGoals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Goals Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first performance goal to get started"
                }
              </p>
              {!searchQuery && statusFilter === "all" && priorityFilter === "all" && (
                <Button onClick={() => navigate('/performance/goals/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredGoals.map((goal) => {
            const statusBadge = getStatusBadge(goal.status);
            const priorityBadge = getPriorityBadge(goal.priority);
            const StatusIcon = statusBadge.icon;

            return (
              <Card 
                key={goal.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/performance/goals/${goal.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <StatusIcon className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">{goal.title}</h3>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        <Badge variant={priorityBadge.variant}>{priorityBadge.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {goal.description}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">{goal.employeeName}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{goal.category}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Due: {format(new Date(goal.targetDate), 'MMM d, yyyy')}</span>
                        {goal.alignedWith && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span>Aligned with {goal.alignmentType === 'company-okr' ? 'Company OKR' : goal.alignmentType === 'team-objective' ? 'Team Objective' : 'Goal'}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 min-w-[120px]">
                      <div className="text-2xl font-bold">{goal.progress}%</div>
                      <Progress value={goal.progress} className="w-full" />
                      <span className="text-xs text-muted-foreground">Progress</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
