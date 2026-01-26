import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Progress } from "@/shared/components/ui/progress";
import { PerformanceGoal, CompanyOKR, TeamObjective } from "@/types/performance";
import { Target, Users, Building2, ChevronRight, ChevronDown, Eye } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface GoalAlignmentViewProps {
  goals: PerformanceGoal[];
  companyOKRs: CompanyOKR[];
  teamObjectives: TeamObjective[];
  onViewGoal?: (goal: PerformanceGoal) => void;
}

interface AlignmentNode {
  id: string;
  type: 'okr' | 'team-objective' | 'individual-goal';
  title: string;
  description: string;
  progress: number;
  status: string;
  owner?: string;
  children: AlignmentNode[];
  metadata?: any;
}

export function GoalAlignmentView({ 
  goals, 
  companyOKRs, 
  teamObjectives,
  onViewGoal 
}: GoalAlignmentViewProps) {
  const [selectedOKR, setSelectedOKR] = useState<string>(companyOKRs[0]?.id || 'all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['all']));

  // Build alignment hierarchy
  const alignmentTree = useMemo(() => {
    const tree: AlignmentNode[] = [];

    // Filter OKRs
    const filteredOKRs = selectedOKR === 'all' 
      ? companyOKRs 
      : companyOKRs.filter(okr => okr.id === selectedOKR);

    filteredOKRs.forEach(okr => {
      const okrNode: AlignmentNode = {
        id: okr.id,
        type: 'okr',
        title: okr.title,
        description: okr.description,
        progress: okr.progress,
        status: okr.status,
        owner: okr.ownerName,
        metadata: okr,
        children: []
      };

      // Find team objectives aligned with this OKR
      const alignedTeamObjectives = teamObjectives.filter(
        obj => obj.alignedWithOKR === okr.id
      );

      alignedTeamObjectives.forEach(teamObj => {
        const teamNode: AlignmentNode = {
          id: teamObj.id,
          type: 'team-objective',
          title: teamObj.title,
          description: teamObj.description,
          progress: teamObj.progress,
          status: teamObj.status,
          owner: teamObj.ownerName,
          metadata: teamObj,
          children: []
        };

        // Find individual goals aligned with this team objective
        const alignedGoals = goals.filter(
          goal => goal.alignedWith === teamObj.id
        );

        alignedGoals.forEach(goal => {
          teamNode.children.push({
            id: goal.id,
            type: 'individual-goal',
            title: goal.title,
            description: goal.description,
            progress: goal.progress,
            status: goal.status,
            owner: goal.employeeName,
            metadata: goal,
            children: []
          });
        });

        okrNode.children.push(teamNode);
      });

      // Also find individual goals directly aligned with OKR
      const directlyAlignedGoals = goals.filter(
        goal => goal.alignedWith === okr.id
      );

      directlyAlignedGoals.forEach(goal => {
        okrNode.children.push({
          id: goal.id,
          type: 'individual-goal',
          title: goal.title,
          description: goal.description,
          progress: goal.progress,
          status: goal.status,
          owner: goal.employeeName,
          metadata: goal,
          children: []
        });
      });

      tree.push(okrNode);
    });

    return tree;
  }, [companyOKRs, teamObjectives, goals, selectedOKR]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'okr':
        return Building2;
      case 'team-objective':
        return Users;
      case 'individual-goal':
        return Target;
      default:
        return Target;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'okr':
        return 'bg-purple-100 border-purple-300 text-purple-700';
      case 'team-objective':
        return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'individual-goal':
        return 'bg-green-100 border-green-300 text-green-700';
      default:
        return 'bg-muted border-border text-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'on-hold':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderNode = (node: AlignmentNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const Icon = getNodeIcon(node.type);

    return (
      <div key={node.id} className="mb-3">
        <Card 
          className={cn(
            "transition-all hover:shadow-md",
            getNodeColor(node.type)
          )}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Expand/Collapse Button */}
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0"
                  onClick={() => toggleNode(node.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {!hasChildren && <div className="w-6" />}

              {/* Node Icon */}
              <div className="mt-0.5 flex-shrink-0">
                <Icon className="h-5 w-5" />
              </div>

              {/* Node Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm line-clamp-1">{node.title}</h4>
                      <Badge variant="outline" className="text-xs capitalize flex-shrink-0">
                        {node.type.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {node.description}
                    </p>
                    {node.owner && (
                      <p className="text-xs text-muted-foreground">
                        Owner: <span className="font-medium">{node.owner}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {node.type === 'individual-goal' && onViewGoal && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewGoal(node.metadata as PerformanceGoal)}
                      className="flex-shrink-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{node.progress}%</span>
                  </div>
                  <Progress value={node.progress} className="h-2" />
                </div>

                {/* Children Count */}
                {hasChildren && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {node.children.length} {node.children.length === 1 ? 'item' : 'items'} aligned
                    </Badge>
                    {isExpanded && (
                      <span className="text-xs text-muted-foreground">
                        Avg progress: {Math.round(node.children.reduce((sum, c) => sum + c.progress, 0) / node.children.length)}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Render Children */}
        {hasChildren && isExpanded && (
          <div className="mt-2">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalGoals = goals.length;
    const alignedGoals = goals.filter(g => g.alignedWith).length;
    const avgProgress = goals.length > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 0;
    
    return {
      totalOKRs: companyOKRs.length,
      totalTeamObjectives: teamObjectives.length,
      totalGoals,
      alignedGoals,
      alignmentRate: totalGoals > 0 ? Math.round((alignedGoals / totalGoals) * 100) : 0,
      avgProgress
    };
  }, [companyOKRs, teamObjectives, goals]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Goal Alignment</h2>
          <p className="text-muted-foreground">Visualize how goals connect to company objectives</p>
        </div>
        <div className="w-80">
          <Select value={selectedOKR} onValueChange={setSelectedOKR}>
            <SelectTrigger>
              <SelectValue placeholder="Select OKR" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All OKRs</SelectItem>
              {companyOKRs.map(okr => (
                <SelectItem key={okr.id} value={okr.id}>
                  {okr.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Company OKRs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOKRs}</div>
            <p className="text-xs text-muted-foreground">Active objectives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Objectives</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeamObjectives}</div>
            <p className="text-xs text-muted-foreground">Supporting goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Individual Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGoals}</div>
            <p className="text-xs text-muted-foreground">{stats.alignedGoals} aligned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alignment Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.alignmentRate}%</div>
            <p className="text-xs text-muted-foreground">Goals connected to OKRs</p>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-purple-300 bg-purple-100" />
              <span className="text-sm text-muted-foreground">Company OKR</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-blue-300 bg-blue-100" />
              <span className="text-sm text-muted-foreground">Team Objective</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-green-300 bg-green-100" />
              <span className="text-sm text-muted-foreground">Individual Goal</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alignment Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Alignment Hierarchy</CardTitle>
          <CardDescription>
            Expand nodes to see how individual goals support team objectives and company OKRs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {alignmentTree.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  No alignment data available for the selected OKR
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {alignmentTree.map(node => renderNode(node, 0))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
