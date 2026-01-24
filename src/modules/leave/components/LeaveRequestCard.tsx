import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { LeaveStatusBadge } from "./LeaveStatusBadge";
import type { LeaveRequest } from "@/shared/types/leave";
import { format } from "date-fns";
import { Calendar, User, FileText, CheckCircle, XCircle, Clock } from "lucide-react";

interface LeaveRequestCardProps {
  request: LeaveRequest;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (id: string) => void;
  showActions?: boolean;
}

export function LeaveRequestCard({ 
  request, 
  onApprove, 
  onReject, 
  onView,
  showActions = false 
}: LeaveRequestCardProps) {
  const currentApproval = request.approvalWorkflow[request.currentApprovalLevel];
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center" 
                style={{ backgroundColor: `${request.leaveTypeColor}20` }}
              >
                <Calendar className="h-5 w-5" style={{ color: request.leaveTypeColor }} />
              </div>
              <div>
                <h3 className="font-semibold">{request.leaveTypeName}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  {request.employeeName}
                </div>
              </div>
            </div>
          </div>
          <LeaveStatusBadge status={request.status} />
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Start Date</p>
              <p className="font-medium">{format(new Date(request.startDate), "MMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">End Date</p>
              <p className="font-medium">{format(new Date(request.endDate), "MMM d, yyyy")}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Duration</p>
            <Badge variant="outline">{request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}</Badge>
          </div>

          {request.reason && (
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Reason
              </p>
              <p className="text-sm">{request.reason}</p>
            </div>
          )}

          {request.status === 'pending' && currentApproval && (
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Awaiting approval from
              </p>
              <p className="text-sm font-medium">{currentApproval.approverName} ({currentApproval.approverRole})</p>
            </div>
          )}

          {request.status === 'approved' && request.respondedBy && (
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Approved by
              </p>
              <p className="text-sm font-medium">{request.respondedBy}</p>
              {request.respondedAt && (
                <p className="text-xs text-muted-foreground">
                  on {format(new Date(request.respondedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              )}
            </div>
          )}

          {request.status === 'rejected' && request.respondedBy && (
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Rejected by
              </p>
              <p className="text-sm font-medium">{request.respondedBy}</p>
              {request.responseNotes && (
                <p className="text-sm mt-1">{request.responseNotes}</p>
              )}
            </div>
          )}
        </div>

        {showActions && request.status === 'pending' && (
          <div className="flex gap-2 mt-4 pt-4 border-t">
            {onView && (
              <Button variant="outline" size="sm" onClick={() => onView(request.id)} className="flex-1">
                View Details
              </Button>
            )}
            {onApprove && (
              <Button size="sm" onClick={() => onApprove(request.id)} className="flex-1">
                <CheckCircle className="mr-1 h-4 w-4" />
                Approve
              </Button>
            )}
            {onReject && (
              <Button variant="destructive" size="sm" onClick={() => onReject(request.id)} className="flex-1">
                <XCircle className="mr-1 h-4 w-4" />
                Reject
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
