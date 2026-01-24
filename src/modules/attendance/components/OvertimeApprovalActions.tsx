import { Button } from "@/shared/components/ui/button";
import { Check, X } from "lucide-react";
import { updateOvertimeRequest } from "@/shared/lib/attendanceStorage";
import { useToast } from "@/shared/hooks/use-toast";

interface OvertimeApprovalActionsProps {
  requestId: string;
  onUpdate: () => void;
}

export function OvertimeApprovalActions({ requestId, onUpdate }: OvertimeApprovalActionsProps) {
  const { toast } = useToast();

  const handleApprove = async () => {
    try {
      updateOvertimeRequest(requestId, {
        status: 'approved',
        respondedAt: new Date().toISOString(),
        respondedBy: 'Current Manager',
      });

      toast({
        title: "Overtime Approved",
        description: "The overtime request has been approved",
      });

      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve overtime request",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    try {
      updateOvertimeRequest(requestId, {
        status: 'rejected',
        respondedAt: new Date().toISOString(),
        respondedBy: 'Current Manager',
      });

      toast({
        title: "Overtime Rejected",
        description: "The overtime request has been rejected",
        variant: "destructive",
      });

      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject overtime request",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="default" onClick={handleApprove}>
        <Check className="h-4 w-4 mr-1" />
        Approve
      </Button>
      <Button size="sm" variant="destructive" onClick={handleReject}>
        <X className="h-4 w-4 mr-1" />
        Reject
      </Button>
    </div>
  );
}
