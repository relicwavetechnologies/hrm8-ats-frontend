import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { LeaveStatusBadge } from "./LeaveStatusBadge";
import { LeaveApprovalWorkflow } from "./LeaveApprovalWorkflow";
import { Calendar, User, FileText, CheckCircle, XCircle } from "lucide-react";
import type { LeaveRequest } from "@/shared/types/leave";
import { format } from "date-fns";
import { useState } from "react";

interface LeaveRequestDetailDialogProps {
  request: LeaveRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canApprove?: boolean;
  onApprove?: (id: string, notes: string) => void;
  onReject?: (id: string, notes: string) => void;
}

export function LeaveRequestDetailDialog({
  request,
  open,
  onOpenChange,
  canApprove = false,
  onApprove,
  onReject,
}: LeaveRequestDetailDialogProps) {
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsProcessing(true);
    try {
      await onApprove(request.id, notes);
      onOpenChange(false);
      setNotes("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    setIsProcessing(true);
    try {
      await onReject(request.id, notes);
      onOpenChange(false);
      setNotes("");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Leave Request Details</DialogTitle>
            <LeaveStatusBadge status={request.status} />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Leave Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${request.leaveTypeColor}20` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="h-5 w-5" style={{ color: request.leaveTypeColor }} />
                  <div>
                    <h3 className="font-semibold">{request.leaveTypeName}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      {request.employeeName}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">{format(new Date(request.startDate), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Date:</span>
                    <span className="font-medium">{format(new Date(request.endDate), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <Badge>{request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}</Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-sm text-muted-foreground mb-2 block">Submitted</Label>
                <p className="text-sm">{format(new Date(request.submittedAt), "MMM d, yyyy 'at' h:mm a")}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Reason</Label>
              <div className="p-4 bg-accent/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{request.reason}</p>
              </div>

              {request.responseNotes && (
                <div className="mt-4">
                  <Label className="text-sm text-muted-foreground mb-2 block">Response Notes</Label>
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{request.responseNotes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Approval Workflow */}
          <LeaveApprovalWorkflow
            approvals={request.approvalWorkflow}
            currentLevel={request.currentApprovalLevel}
          />

          {/* Approval Actions */}
          {canApprove && request.status === 'pending' && (
            <div className="space-y-4 p-4 border rounded-lg bg-accent/30">
              <div>
                <Label htmlFor="approval-notes">Notes (Optional)</Label>
                <Textarea
                  id="approval-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any comments or feedback..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
