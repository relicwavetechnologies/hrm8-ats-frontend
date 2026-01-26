import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ApprovalWorkflow, ApprovalStage } from "@/types/performance";
import { CheckCircle2, XCircle, Clock, User, ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/shared/lib/utils";

interface ApprovalWorkflowCardProps {
  workflow: ApprovalWorkflow;
  onApprovalAction?: (stageId: string, action: 'approve' | 'reject') => void;
  currentUserRole?: 'manager' | 'hr' | 'senior-manager' | 'executive';
  readOnly?: boolean;
}

export function ApprovalWorkflowCard({ 
  workflow, 
  onApprovalAction,
  currentUserRole,
  readOnly = false 
}: ApprovalWorkflowCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-muted-foreground bg-muted/50 border-border';
    }
  };

  const getOverallStatusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'in-progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const canUserApprove = (stage: ApprovalStage) => {
    if (readOnly) return false;
    if (stage.status !== 'pending') return false;
    if (workflow.currentStageIndex !== workflow.stages.findIndex(s => s.id === stage.id)) return false;
    return stage.role === currentUserRole;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Approval Workflow</CardTitle>
            <CardDescription>Multi-stage review approval process</CardDescription>
          </div>
          <Badge variant={getOverallStatusVariant(workflow.overallStatus)}>
            {workflow.overallStatus.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflow.stages.map((stage, index) => {
            const isCurrentStage = index === workflow.currentStageIndex;
            const isPastStage = index < workflow.currentStageIndex;
            const canApprove = canUserApprove(stage);

            return (
              <div key={stage.id}>
                <Card className={cn(
                  "transition-all",
                  isCurrentStage && "border-2 border-primary shadow-sm",
                  isPastStage && stage.status === 'approved' && "bg-green-50/50",
                  isPastStage && stage.status === 'rejected' && "bg-red-50/50"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Stage Number and Status Icon */}
                      <div className="flex flex-col items-center gap-2 flex-shrink-0">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold",
                          getStatusColor(stage.status)
                        )}>
                          {index + 1}
                        </div>
                        {index < workflow.stages.length - 1 && (
                          <div className="h-8 w-0.5 bg-border" />
                        )}
                      </div>

                      {/* Stage Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{stage.name}</h4>
                              {stage.required && (
                                <Badge variant="outline" className="text-xs">Required</Badge>
                              )}
                              {isCurrentStage && (
                                <Badge variant="secondary" className="text-xs">Current</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">
                              {stage.role.replace('-', ' ')} Review
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(stage.status)}
                          </div>
                        </div>

                        {/* Approver Info */}
                        {stage.approverName && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{stage.approverName}</span>
                          </div>
                        )}

                        {/* Action Date */}
                        {stage.actionDate && (
                          <p className="text-xs text-muted-foreground">
                            {stage.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                            {format(parseISO(stage.actionDate), 'MMM dd, yyyy')}
                          </p>
                        )}

                        {/* Comments */}
                        {stage.comments && (
                          <div className="mt-2 p-3 bg-muted/50 rounded-md">
                            <p className="text-sm">{stage.comments}</p>
                          </div>
                        )}

                        {/* Approval Actions */}
                        {canApprove && onApprovalAction && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => onApprovalAction(stage.id, 'approve')}
                              className="gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onApprovalAction(stage.id, 'reject')}
                              className="gap-2"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Connector Arrow */}
                {index < workflow.stages.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Workflow Summary */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {workflow.stages.filter(s => s.status === 'approved').length}
              </p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {workflow.stages.filter(s => s.status === 'pending').length}
              </p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {workflow.stages.filter(s => s.status === 'rejected').length}
              </p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
