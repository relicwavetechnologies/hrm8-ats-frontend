import { Button } from "@/shared/components/ui/button";
import { Check, X } from "lucide-react";
import { updateCompensationReview } from "@/lib/compensationStorage";
import { useToast } from "@/hooks/use-toast";

interface CompensationApprovalActionsProps {
  reviewId: string;
  onUpdate: () => void;
}

export function CompensationApprovalActions({ reviewId, onUpdate }: CompensationApprovalActionsProps) {
  const { toast } = useToast();

  const handleApprove = async () => {
    try {
      updateCompensationReview(reviewId, {
        status: 'approved',
      });

      toast({
        title: "Compensation Approved",
        description: "The compensation change has been approved",
      });

      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve compensation change",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    try {
      updateCompensationReview(reviewId, {
        status: 'rejected',
      });

      toast({
        title: "Compensation Rejected",
        description: "The compensation change has been rejected",
        variant: "destructive",
      });

      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject compensation change",
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
