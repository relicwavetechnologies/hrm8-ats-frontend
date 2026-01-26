import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Badge } from "@/shared/components/ui/badge";
import { PerformanceReview } from "@/types/performance";
import { ApprovalWorkflowCard } from "./ApprovalWorkflowCard";
import { ApprovalActionDialog } from "./ApprovalActionDialog";
import { format } from "date-fns";
import { FileText, Star, ClipboardCheck, CheckSquare } from "lucide-react";
import { toast } from "sonner";

interface ReviewDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: PerformanceReview;
  currentUserRole?: 'manager' | 'hr' | 'senior-manager' | 'executive';
  onApprovalUpdate?: (reviewId: string, stageId: string, action: 'approve' | 'reject', comments: string) => void;
}

export function ReviewDetailDialog({
  open,
  onOpenChange,
  review,
  currentUserRole,
  onApprovalUpdate
}: ReviewDetailDialogProps) {
  const [approvalActionOpen, setApprovalActionOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');

  const handleApprovalAction = (stageId: string, action: 'approve' | 'reject') => {
    setSelectedStageId(stageId);
    setApprovalAction(action);
    setApprovalActionOpen(true);
  };

  const handleConfirmApproval = async (comments: string) => {
    if (onApprovalUpdate) {
      try {
        await onApprovalUpdate(review.id, selectedStageId, approvalAction, comments);
      } catch (error) {
        console.error('Failed to process approval:', error);
        throw error;
      }
    }
  };

  const selectedStage = review.approvalWorkflow?.stages.find(s => s.id === selectedStageId);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {review.templateName}
            </DialogTitle>
            <DialogDescription>
              Review for {review.employeeName} • {format(new Date(review.reviewPeriodStart), "MMM d")} - {format(new Date(review.reviewPeriodEnd), "MMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="responses">
                <CheckSquare className="h-4 w-4 mr-2" />
                Responses
              </TabsTrigger>
              <TabsTrigger value="approvals">
                <Star className="h-4 w-4 mr-2" />
                Approvals
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[500px] mt-4">
              <TabsContent value="details" className="space-y-4 px-1">
                {/* Review Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Employee</p>
                    <p className="font-medium">{review.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reviewer</p>
                    <p className="font-medium">{review.reviewerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">{format(new Date(review.dueDate), "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge>{review.status}</Badge>
                  </div>
                </div>

                {/* Overall Rating */}
                {review.overallRating && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Overall Rating</p>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold">{review.overallRating.toFixed(1)}</span>
                      <span className="text-muted-foreground">/ 5.0</span>
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {review.strengths && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Strengths</p>
                    <p className="text-sm text-muted-foreground">{review.strengths}</p>
                  </div>
                )}

                {/* Areas for Improvement */}
                {review.areasForImprovement && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Areas for Improvement</p>
                    <p className="text-sm text-muted-foreground">{review.areasForImprovement}</p>
                  </div>
                )}

                {/* Goals */}
                {review.goals && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Goals for Next Period</p>
                    <p className="text-sm text-muted-foreground">{review.goals}</p>
                  </div>
                )}

                {/* Manager Comments */}
                {review.managerComments && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Manager Comments</p>
                    <p className="text-sm text-muted-foreground">{review.managerComments}</p>
                  </div>
                )}

                {/* Employee Comments */}
                {review.employeeComments && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Employee Comments</p>
                    <p className="text-sm text-muted-foreground">{review.employeeComments}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="responses" className="space-y-4 px-1">
                {review.responses.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No responses recorded yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {review.responses.map((response, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <p className="text-sm font-medium mb-2">Question {index + 1}</p>
                        {response.rating && (
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{response.rating}</span>
                          </div>
                        )}
                        {response.textResponse && (
                          <p className="text-sm text-muted-foreground">{response.textResponse}</p>
                        )}
                        {response.selectedOptions && (
                          <div className="flex gap-2 flex-wrap">
                            {response.selectedOptions.map((option, i) => (
                              <Badge key={i} variant="outline">{option}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approvals" className="px-1">
                {review.approvalWorkflow ? (
                  <ApprovalWorkflowCard
                    workflow={review.approvalWorkflow}
                    currentUserRole={currentUserRole}
                    onApprovalAction={handleApprovalAction}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No approval workflow configured for this review
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      {selectedStage && (
        <ApprovalActionDialog
          open={approvalActionOpen}
          onOpenChange={setApprovalActionOpen}
          action={approvalAction}
          stageName={selectedStage.name}
          reviewTitle={`${review.templateName} - ${review.employeeName}`}
          onConfirm={handleConfirmApproval}
        />
      )}
    </>
  );
}
