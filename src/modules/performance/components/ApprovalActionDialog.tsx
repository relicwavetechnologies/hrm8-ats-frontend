import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ApprovalActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: 'approve' | 'reject';
  stageName: string;
  reviewTitle: string;
  onConfirm: (comments: string) => void;
}

export function ApprovalActionDialog({
  open,
  onOpenChange,
  action,
  stageName,
  reviewTitle,
  onConfirm
}: ApprovalActionDialogProps) {
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (action === 'reject' && !comments.trim()) {
      toast.error("Please provide comments for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(comments);
      toast.success(`Review ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setComments("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to process approval action");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setComments("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {action === 'approve' ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <DialogTitle>
              {action === 'approve' ? 'Approve Review' : 'Reject Review'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {action === 'approve' 
              ? `You are about to approve this review at the ${stageName} stage.`
              : `You are about to reject this review at the ${stageName} stage.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">{reviewTitle}</p>
            <p className="text-xs text-muted-foreground mt-1">Stage: {stageName}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">
              Comments {action === 'reject' && <span className="text-red-600">*</span>}
            </Label>
            <Textarea
              id="comments"
              placeholder={
                action === 'approve'
                  ? "Add any comments or feedback (optional)"
                  : "Please explain why you are rejecting this review"
              }
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="resize-none"
            />
            {action === 'reject' && (
              <p className="text-xs text-muted-foreground">
                Comments are required when rejecting a review
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant={action === 'approve' ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Processing..."
            ) : (
              <>
                {action === 'approve' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
