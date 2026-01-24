import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Check, X, Clock, ArrowRight } from "lucide-react";
import type { LeaveApproval } from "@/shared/types/leave";
import { format } from "date-fns";

interface LeaveApprovalWorkflowProps {
  approvals: LeaveApproval[];
  currentLevel: number;
}

export function LeaveApprovalWorkflow({ approvals, currentLevel }: LeaveApprovalWorkflowProps) {
  const getStatusIcon = (status: LeaveApproval['status'], level: number) => {
    if (level < currentLevel) {
      return status === 'approved' ? (
        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="h-4 w-4 text-green-600" />
        </div>
      ) : status === 'rejected' ? (
        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
          <X className="h-4 w-4 text-red-600" />
        </div>
      ) : (
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Clock className="h-4 w-4 text-gray-600" />
        </div>
      );
    } else if (level === currentLevel) {
      return (
        <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center animate-pulse">
          <Clock className="h-4 w-4 text-yellow-600" />
        </div>
      );
    } else {
      return (
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Clock className="h-4 w-4 text-gray-400" />
        </div>
      );
    }
  };

  const getStatusBadge = (status: LeaveApproval['status'], level: number) => {
    if (level < currentLevel) {
      if (status === 'approved') {
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      } else if (status === 'rejected') {
        return <Badge variant="destructive">Rejected</Badge>;
      }
    } else if (level === currentLevel) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pending</Badge>;
    }
    return <Badge variant="secondary">Awaiting</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Approval Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approvals.map((approval, index) => (
            <div key={approval.id}>
              <div className="flex items-start gap-4">
                {getStatusIcon(approval.status, index)}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="font-medium">{approval.approverName}</p>
                      <p className="text-sm text-muted-foreground">{approval.approverRole}</p>
                    </div>
                    {getStatusBadge(approval.status, index)}
                  </div>
                  
                  {approval.respondedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Responded on {format(new Date(approval.respondedAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  )}
                  
                  {approval.notes && (
                    <div className="mt-2 p-2 bg-accent/50 rounded-md">
                      <p className="text-sm">{approval.notes}</p>
                    </div>
                  )}
                  
                  {!approval.isRequired && (
                    <Badge variant="outline" className="mt-2 text-xs">Optional</Badge>
                  )}
                </div>
              </div>
              
              {index < approvals.length - 1 && (
                <div className="ml-4 my-2 flex items-center text-muted-foreground">
                  <div className="h-8 border-l-2 border-dashed" />
                  <ArrowRight className="h-3 w-3 ml-2" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
